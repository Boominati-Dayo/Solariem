import Image from 'next/image';
import type { StaticImageData } from 'next/image';

/**
 * A full-bleed photographic section.
 *
 * The brief was "areas that use a background image, not just a separate image
 * by the side". The old pattern was a hairline frame with a photo beside the
 * words, which is fine but leaves the section feeling like a slide deck. This
 * lets a photograph carry the whole section instead.
 *
 * Three layers, bottom to top:
 *   1. the photograph, at a controlled opacity
 *   2. .photo-tint   — brand wash, so the image reads as OUR texture and not
 *                      a stock picture dropped into a template
 *   3. .photo-scrim  — directional gradient, opaque at the copy end and
 *                      transparent at the far end
 *
 * The scrim is the reason this is safe to use anywhere. Body copy must never
 * sit on a raw photograph, and a scrim that is uniform cannot guarantee that
 * against an image we have not seen. A gradient anchored to the copy end can:
 * the text always lands on the solid part whatever is in the picture.
 *
 * `scrim` picks which edge the copy is on. `bottom` (default) suits a section
 * with a photo band above and text below. `left` suits a hero, where the copy
 * runs down the left and the picture shows through on the right — the
 * horizontal scrim protects copy that spans the full height of the section,
 * which a bottom-anchored gradient would leave sitting over the middle of the
 * photo. `left` reverts to the vertical gradient below `lg`, where the layout
 * stacks and the copy is at the bottom again.
 *
 * ACCESSIBILITY. `alt` defaults to empty, which is the correct value for an
 * image that carries no information the surrounding text does not already
 * state. If you pass a meaningful alt, the image is doing communicative work
 * and should be described. Do not write alt text that duplicates the heading
 * for the sake of it; that makes a screen reader announce the same thing
 * twice.
 *
 * The scrim is also why the `strength` prop exists. If copy ever becomes hard
 * to read, drop the strength before you touch the gradient stops — the stops
 * are tuned so that even at `full` the copy band stays legible.
 */
export default function PhotoBackdrop({
  image,
  alt = '',
  children,
  className = '',
  strength = 'light',
  position = 'center',
  priority = false,
  scrim = 'bottom',
}: {
  image: StaticImageData | string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  strength?: 'light' | 'medium' | 'full';
  position?: string;
  priority?: boolean;
  scrim?: 'bottom' | 'left';
}) {
  const opacity =
    strength === 'full' ? 'opacity-45' : strength === 'medium' ? 'opacity-25' : 'opacity-15';

  return (
    <section className={`relative isolate overflow-hidden ${className}`}>
      {/* 1. photograph */}
      <div className="absolute inset-0 -z-30 overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover ${opacity}`}
          style={{ objectPosition: position }}
        />
      </div>

      {/* 2 + 3. brand wash, then the legibility scrim */}
      <div aria-hidden className="photo-tint absolute inset-0 -z-20" />
      <div
        aria-hidden
        className={`absolute inset-0 -z-10 ${scrim === 'left' ? 'photo-scrim-left' : 'photo-scrim'}`}
      />

      {/* the copy, which is what the gradient above is protecting */}
      <div className="relative">{children}</div>
    </section>
  );
}
