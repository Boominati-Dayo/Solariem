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
 * FOUR LAYERS, bottom to top:
 *   1. the photograph, at full strength
 *   2. .photo-tint   — a low-alpha brand cast, so the image reads as OUR
 *                      texture rather than a stock picture in a template
 *   3. .photo-scrim  — a directional gradient, near-opaque at the copy edge
 *                      and near-clear at the far end
 *   4. the copy
 *
 * WHY THE IMAGE IS AT FULL STRENGTH AND THE SCRIM DOES THE WORK.
 * The first version dialled the image down to 15% *and* ran a scrim that never
 * got below 30%, so the photo landed at about 8% visible and the section looked
 * like a flat fill. Two low-contrast values multiplied hide the image twice
 * over. Now the image is opaque and the scrim alone shapes it, which means the
 * visible strength of the photo is set in one place — the gradient stops —
 * instead of being the product of two fudged numbers.
 *
 * STACKING IS POSITIVE, NOT NEGATIVE. The original used -z-30/-z-20/-z-10 so the
 * copy could sit at z-auto. That is fragile: a negative z-index descendant can
 * slip behind an ancestor's background, and it breaks the moment someone drops
 * the `isolate`. The section is `isolate` with an opaque background of its own,
 * the layers are 0/1/2, and the copy is 3. The section background also gives the
 * tint's `mix-blend-mode` a real backdrop to multiply against; against
 * transparency, blend modes do nothing useful.
 *
 * ACCESSIBILITY. `alt` defaults to empty, which is the correct value for an
 * image that carries no information the surrounding text does not already
 * state. If you pass a meaningful alt, the image is doing communicative work
 * and should be described. Do not write alt text that duplicates the heading
 * for the sake of it; that makes a screen reader announce the same thing twice.
 *
 * `scrim` picks which edge the copy is on. `bottom` (the default) suits a photo
 * band above text. `left` suits a hero, where the copy runs down the left and
 * the photo shows through on the right — and reverts to the vertical ramp below
 * `lg`, where the layout stacks and the copy is at the bottom again.
 *
 * `photo` is the one honest lever left. It exists for when the photograph is
 * genuinely busy and the section should read as texture rather than as a
 * picture. Do not reach for it to fix a scrim that is too heavy — lighten the
 * gradient instead.
 */
export default function PhotoBackdrop({
  image,
  alt = '',
  children,
  className = '',
  photo = 'full',
  position = 'center',
  priority = false,
  scrim = 'bottom',
}: {
  image: StaticImageData | string;
  alt?: string;
  children: React.ReactNode;
  className?: string;
  /** How present the photograph is. `full` lets it be the section. */
  photo?: 'full' | 'muted' | 'faint';
  position?: string;
  priority?: boolean;
  scrim?: 'bottom' | 'left';
}) {
  const photoOpacity =
    photo === 'full' ? 'opacity-100' : photo === 'muted' ? 'opacity-55' : 'opacity-28';

  return (
    <section className={`relative isolate overflow-hidden bg-background ${className}`}>
      {/* 1. the photograph */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src={image}
          alt={alt}
          fill
          priority={priority}
          sizes="100vw"
          className={`object-cover ${photoOpacity}`}
          style={{ objectPosition: position }}
        />
      </div>

      {/* 2 + 3. brand cast, then the legibility scrim */}
      <div aria-hidden className="photo-tint absolute inset-0 z-[1]" />
      <div
        aria-hidden
        className={`absolute inset-0 z-[2] ${scrim === 'left' ? 'photo-scrim-left' : 'photo-scrim'}`}
      />

      {/* 4. the copy, which is what the gradient above is protecting */}
      <div className="relative z-[3]">{children}</div>
    </section>
  );
}
