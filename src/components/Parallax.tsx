'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import usePrefersReducedMotion, { REDUCED_MOTION } from '@/lib/useReducedMotion';

/**
 * Drift a run of items past the reader at slightly different rates as they scroll.
 *
 * WHAT IT IS NOT. This is not scroll-jacking, and it does not move anything until
 * the reader moves. It reads the scroll position and offsets content by it, so
 * the reader keeps the scrollbar, the keyboard, find-in-page, back/forward and
 * every anchor link exactly as the browser implements them. Only the paint
 * offset changes.
 *
 * WHY A CSS VARIABLE AND NOT REACT STATE. Writing a number to state on every
 * scroll event would re-render the subtree and re-diff it sixty times a second,
 * for what is a single composited transform. Instead one length is written on the
 * wrapper and each `.parallax-item` reads it with its own `--depth`, so the
 * browser does the arithmetic. Cost per frame is one `getBoundingClientRect`
 * read and one style write, inside a `requestAnimationFrame`, from a passive
 * listener — none of which can block scrolling.
 *
 * WHY NOTHING MOVES UNLESS IT ASKS. The transform is on `.parallax-item`, not
 * on `.parallax > *`. A wrapper that shifted its own children by default would
 * silently drag anything dropped inside it, including a ruler, a border, or a
 * list whose rows have to stay aligned with each other. Opting in per item means
 * an unmarked child is always exactly where the markup put it.
 *
 * WHY ONLY MARKED ITEMS MAY DRIFT RELATIVE TO EACH OTHER. Two items drifting at
 * different rates move relative to one another, which is the effect. But if
 * something static sits between them — a full-width rule, a row separator — the
 * two drifting items slide out from under it and the rule tears. So a `.parallax`
 * run belongs on a list where each item carries its own edges (a connector, a
 * marker, a box) and nothing full-width and static runs across the gaps between
 * them. See `.timeline-step` in globals.css.
 *
 * REDUCED MOTION. Under `prefers-reduced-motion: reduce` the transform rule does
 * not exist at all, so no element is given a transform to animate away from and
 * the list renders at rest. No listener is installed either, so the page does not
 * pay for a scroll handler whose output is thrown away. The setting is
 * subscribed to rather than read once, so turning it on mid-page tears the effect
 * down without a reload.
 *
 * The offset is a length in px and is clamped to its own run: past either end of
 * the viewport the content is off-screen, and letting the number keep climbing
 * there would mean a reader who scrolls back up watches the list spring from a
 * position they never saw it in.
 */
export default function Parallax({
  children,
  className = '',
  /** Peak-to-peak travel in px for a depth of 1. */
  travel = 40,
}: {
  children: ReactNode;
  className?: string;
  travel?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const el = wrapRef.current;
    if (!el) return;

    // Re-checked inside the effect as well as through the subscription. On the
    // first hydration pass React can run effects against the server snapshot
    // before it has re-read the store, and a reader who has reduced motion on
    // should never get a scroll listener installed, not even for one frame.
    if (window.matchMedia(REDUCED_MOTION).matches) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const h = rect.height || 1;

      // 0 when the block's top reaches the bottom of the viewport, 1 when its
      // bottom reaches the top. Same definition ScrollProgress uses: it is the
      // fraction of the block that has crossed the viewport, so it needs no
      // header-height constant and no magic offset to drift out of step with.
      const crossed = (vh - rect.top) / (vh + h);
      const progress = Math.min(1, Math.max(0, crossed));

      // Centred on zero so the block passes through its natural position rather
      // than sitting offset for the whole run.
      const y = (progress - 0.5) * travel;
      el.style.setProperty('--parallax-y', `${y.toFixed(2)}px`);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(measure);
    };
    // A backgrounded tab has no frames to schedule into, so a scroll that happens
    // while it is hidden — a keyboard, a programmatic scroll, the browser
    // restoring a position on back — leaves the offset stale when the reader comes
    // back. The distance is small enough to be invisible, but it is free to close:
    // re-measuring on the way back in costs one frame.
    const onVisible = () => {
      if (document.visibilityState === 'visible') onScroll();
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisible);
      if (el.style.getPropertyValue('--parallax-y')) {
        el.style.removeProperty('--parallax-y');
      }
    };
  }, [reducedMotion, travel]);

  return (
    <div ref={wrapRef} className={`parallax ${className}`}>
      {children}
    </div>
  );
}