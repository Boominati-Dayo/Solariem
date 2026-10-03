import Image from 'next/image';
import { cn } from '@/lib/utils';

type WordmarkProps = {
  className?: string;
  /** `mark` renders the monogram only; `full` renders monogram + wordmark. */
  variant?: 'full' | 'mark';
  /** One-colour silhouette, for dark surfaces. See `logo-reverse` in globals.css. */
  onDark?: boolean;
  /** Height of the artwork in px. The lockup is sized by height, never width. */
  height?: number;
};

/**
 * The Solariem identity, as supplied: `solariem_logo.png` is the monogram plus
 * the word, and `solariem_logo_icon.png` is the monogram on its own. This used
 * to draw a ring and a ledger rule in code instead, which was a different logo
 * rather than a plainer version of this one.
 *
 * Both files carry more canvas than artwork, and the wordmark's slack is
 * lopsided: 1205x315 with the drawing inside x 6..1084, y 4..306. So the right
 * 120px is empty and the top and bottom hold ~4px each. Sizing the element to
 * the canvas ratio therefore reserved about a tenth of the lockup's width as
 * blank space between the logo and whatever sat next to it, and made the mark
 * read smaller than the height it was given. Hence the wrapper below: the box
 * is the CONTENT box, and the image is scaled up by the vertical slack and hung
 * off the top so the artwork lands on the requested height exactly.
 *
 * `sizes` is fixed at the lockup's widest use. At 28px tall the whole thing is
 * ~104px wide, so the optimiser serves a 256w variant — a few KB — instead of
 * re-encoding the 236KB source.
 */
const LOCKUP = {
  /** Intrinsic size of the file, which is what `next/image` needs. */
  canvas: { width: 1205, height: 315 },
  /** The box the drawing actually occupies, measured off the alpha channel. */
  content: { width: 1079, height: 303 },
} as const;

/** `solariem_logo_icon.png`, the monogram on its own. */
const ICON = { width: 705, height: 693 } as const;

/** 3.561 — the lockup's real proportions, free of the dead strip. */
const CONTENT_RATIO = LOCKUP.content.width / LOCKUP.content.height;
/** 1.0396 — how much taller the canvas is than the drawing, so the clip box can cut it back down. */
const VERTICAL_SLACK = LOCKUP.canvas.height / LOCKUP.content.height;

export default function Wordmark({
  className,
  variant = 'full',
  onDark = false,
  height = 28,
}: WordmarkProps) {
  if (variant === 'mark') {
    return (
      <Image
        src="/solariem_logo_icon.png"
        alt=""
        width={ICON.width}
        height={ICON.height}
        sizes="64px"
        className={cn('block shrink-0 max-w-none', onDark && 'logo-reverse', className)}
        style={{ height: `${height}px`, width: 'auto' }}
      />
    );
  }

  return (
    <span
      className={cn('relative inline-block overflow-hidden align-middle', onDark && 'logo-reverse', className)}
      style={{ height: `${height}px`, width: `${height * CONTENT_RATIO}px` }}
    >
      <Image
        src="/solariem_logo.png"
        alt=""
        width={LOCKUP.canvas.width}
        height={LOCKUP.canvas.height}
        sizes="120px"
        className="absolute left-0 max-w-none"
        style={{
          height: `${VERTICAL_SLACK * 100}%`,
          width: 'auto',
          // Pulls the drawing up by the slack it just gained, so the artwork —
          // not the canvas — is what ends up `height` tall.
          top: `${-((VERTICAL_SLACK - 1) / 2) * 100}%`,
        }}
      />
    </span>
  );
}