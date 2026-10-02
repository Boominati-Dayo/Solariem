'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import usePrefersReducedMotion, { REDUCED_MOTION } from '@/lib/useReducedMotion';

export type ProgressStep = {
  /** 0..1 — the point in the pinned run at which this layer becomes visible. */
  at: number;
  /** The text announced to a screen reader, and the step's name in the UI. */
  label: string;
  /**
   * Background for this layer. A colour, or any CSS `background` value. Layers
   * stack in array order, so later steps paint over earlier ones.
   */
  background: string;
  /** 0..1. Multiplies the layer's contribution to `--progress`. */
  strength?: number;
};

/**
 * A section that pins itself while the reader scrolls past it, with a
 * background that progressively fills in as they go.
 *
 * WHY THIS AND NOT A STICKY HEADER. The pattern described — content scrolling up
 * over a pinned panel while the panel's background fills — is the standard
 * scroll-scrubbed section. It works because the reader owns the timeline: they
 * can stop halfway and read, and nothing moves until they move.
 *
 * HOW PROGRESS IS MEASURED. Not a window scroll listener computing a magic
 * offset. The section measures its own `getBoundingClientRect()` against the
 * viewport, giving a true 0..1 for how far through the pinned run it is, with no
 * header-height constant to get wrong:
 *
 *   0.0  the section's top reaches the top of the viewport   -> just pinned
 *   1.0  the section's bottom reaches the bottom of it        -> about to unpin
 *
 * Outside that range the section is off-screen at one end, so it clamps. That
 * clamp is the whole bug story: a pinned section that keeps darkening after it
 * has scrolled past is the classic failure here.
 *
 * WHY A CSS CUSTOM PROPERTY AND NOT REACT STATE. Every frame would otherwise
 * re-render the whole subtree and re-diff the section's children. Instead one
 * property is written on the wrapper and the browser does the rest, so scroll
 * costs one `requestAnimationFrame` read and one style write. Reads are
 * batched inside the frame and the listener is passive, so it cannot block
 * scrolling.
 *
 * MOTION AND ACCESSIBILITY. `prefers-reduced-motion: reduce` disables the effect
 * outright — no pin, no scrub, nothing that moves on its own. A pinned section
 * is exactly what that setting exists to suppress, and pinning is also how text
 * gets stranded under a fixed overlay for someone tabbing through it. The
 * reduced-motion case renders the layers at full strength as a normal static
 * block, so the content is fully readable and nothing is hidden. See
 * `.scroll-progress` in globals.css, which holds the clamp. The query is
 * subscribed to rather than read once, so switching it on mid-page tears the
 * scrub down without a reload.
 *
 * The step labels are rendered into a `sr-only` list rather than dropped, so the
 * sequence is available to a screen reader as an ordered list.
 */
export default function ScrollProgress({
  steps,
  children,
  className = '',
  panelClassName = '',
}: {
  steps: ProgressStep[];
  children: ReactNode;
  className?: string;
  panelClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = wrapRef.current;
    if (!el) return;

    // Re-checked inside the effect as well as via the subscription. On the very
    // first hydration pass React may run effects using the server snapshot
    // before it has re-read the store, and a reader who has reduced motion on
    // should never get a scroll listener installed, even for one frame.
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const travelled = (vh - rect.top) / (rect.height || 1);
      el.style.setProperty('--progress', Math.min(1, Math.max(0, travelled)).toFixed(4));
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reducedMotion]);

  const ordered = [...steps].sort((a, b) => a.at - b.at);

  return (
    <div ref={wrapRef} className={`scroll-progress ${className}`}>
      <div className={`scroll-progress-panel ${panelClassName}`}>
        {/* The layers paint before the copy, and are decorative: the same
            information is in the content itself, so they are hidden from
            assistive tech rather than described twice. */}
        {ordered.map((s, i) => (
          <div
            key={s.label + i}
            aria-hidden="true"
            className="sp-layer"
            style={
              {
                background: s.background,
                '--at': s.at,
                '--strength': s.strength ?? 1,
                zIndex: ordered.length - i,
              } as CSSProperties
            }
          />
        ))}
        <div className="relative" style={{ zIndex: ordered.length + 1 }}>
          {children}
        </div>
      </div>

      <ol className="sr-only">
        {ordered.map((s, i) => (
          <li key={s.label + i}>{s.label}</li>
        ))}
      </ol>
    </div>
  );
}
