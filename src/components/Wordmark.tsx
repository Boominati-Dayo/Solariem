import { cn } from '@/lib/utils';

type WordmarkProps = {
  className?: string;
  /** `mark` renders the monogram tile only; `full` renders mark + wordmark. */
  variant?: 'full' | 'mark';
  /** Force light text for use on dark surfaces. */
  onDark?: boolean;
};

/**
 * The Solariem identity, drawn in code rather than shipped as a raster logo.
 *
 * A thin ring stands for custody and for a zero-sum that has been reversed.
 * The vertical stroke through it is the ledger rule. No shield, no padlock —
 * restraint reads as confidence.
 */
export default function Wordmark({ className, variant = 'full', onDark = false }: WordmarkProps) {
  const ink = onDark ? 'text-background' : 'text-foreground';

  if (variant === 'mark') {
    return (
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-8 w-8 shrink-0 items-center justify-center border border-current',
          ink,
          className,
        )}
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.25" />
          <path d="M10 1.5V18.5" stroke="currentColor" strokeWidth="1.25" />
        </svg>
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex h-7 w-7 shrink-0 items-center justify-center border border-current',
          ink,
        )}
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10 1.5V18.5" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
      <span
        className={cn(
          'font-sans text-[15px] font-semibold uppercase leading-none',
          ink,
        )}
        style={{ letterSpacing: '0.18em' }}
      >
        Solariem
      </span>
    </span>
  );
}
