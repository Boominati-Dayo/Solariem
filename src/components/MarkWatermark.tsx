/**
 * The logo, used as a watermark.
 *
 * Oversized, anchored to one edge of its section so that a third of the mark
 * hangs outside and `overflow-hidden` on the section cuts it. A complete logo
 * sitting in the middle of a section reads as a badge or a sticker; a partial
 * one reads as texture, which is the only job it has here.
 *
 * Three things this has to get right, all of them decided in globals.css rather
 * than at each call site:
 *
 *   - It sits BEHIND the content, so the type and the figures in the section
 *     stay the darkest thing on the surface. The host needs `isolate`, and this
 *     needs `z-index: -1`. Without `isolate` on the host, a negative z-index
 *     descendant drops behind the section's own background and disappears —
 *     the same trap `PhotoBackdrop` documents for its layers.
 *   - It is tinted into the surface rather than laid on top of it. `multiply` on
 *     a bone section and `screen` on an ink panel mean the mark reads as a warm
 *     shift in the paper, not as a coloured shape with a hard edge over it. On
 *     an ink panel `multiply` would multiply against near-black and vanish, so
 *     the caller has to say which surface it is on; the component will not guess
 *     from an ancestor class, because these panels set `text-background`
 *     directly and carry no `.dark`.
 *   - It is decorative and says so: `alt=""` plus `aria-hidden`, so screen
 *     readers skip it, and `pointer-events: none`, so it can never intercept a
 *     click meant for the copy above it.
 *
 * Payload: `/solariem_logo_icon.png` is a 436 KB PNG, so this genuinely needs an
 * image where the neighbouring washes in globals.css are gradients precisely so
 * they cost nothing. It goes through `next/image`, which is the whole reason
 * that is affordable — the optimiser serves a 640 px WebP for a mark that is
 * never displayed wider than 488 px, rather than the 705 px PNG at full size.
 * Lazy, and shared by every watermark on the page through the cache.
 *
 * The section has to supply the clipping and the stacking context:
 *
 *   <section className="relative isolate overflow-hidden">
 *     <MarkWatermark edge="left" surface="light" />
 *     ...
 *   </section>
 */

import Image from 'next/image';

/* Written out in full, and deliberately not interpolated. Tailwind scans source
 * text and only compiles a rule in `@layer components` when it finds the class
 * name literally, so `mark-wash-${edge}` would render an element with three
 * classes of which one does not exist in the stylesheet — the mark would sit
 * flush against the edge, uncropped, with no blend mode. Every variant this
 * component can produce therefore has to be spelled out here. */
const BY_EDGE = {
  left: 'mark-wash mark-wash-left',
  right: 'mark-wash mark-wash-right',
} as const;

const BY_SURFACE = {
  light: 'mark-wash-light',
  dark: 'mark-wash-dark',
} as const;

export default function MarkWatermark({
  edge,
  surface,
}: {
  /** Which edge the mark is centred on, and so which edge cuts it. */
  edge: 'left' | 'right';
  /** Which surface it sits on. Light is bone, where it multiplies; dark is an
   *  ink panel, where a multiply would be invisible. */
  surface: 'light' | 'dark';
}) {
  return (
    <Image
      src="/solariem_logo_icon.png"
      alt=""
      aria-hidden="true"
      draggable={false}
      loading="lazy"
      decoding="async"
      /* Intrinsic size, so the ratio is known before the bytes land. The CSS
         then overrides both, so nothing on screen moves — the mark is absolutely
         positioned — but a wrong ratio would still force a repaint. */
      width={705}
      height={693}
      /* What the browser is told it is about to draw: the mark's width is its
         height from the stylesheet, and that height is capped at 30rem. The
         phone figure is the same mark at the 15rem floor, which is roughly what
         it renders at there. Without this the optimiser would hand every device
         a full-width candidate for a 488 px decoration. */
      sizes="(max-width: 640px) 340px, 490px"
      className={`${BY_EDGE[edge]} ${BY_SURFACE[surface]}`}
    />
  );
}