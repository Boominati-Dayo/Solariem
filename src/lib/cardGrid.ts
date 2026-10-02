/**
 * How many columns the final card of a grid has to span to fill its row.
 *
 * THE PROBLEM THIS SOLVES. A grid of N cards in C columns leaves an empty cell
 * whenever the last card cannot complete its row. In a `gap-px border
 * bg-border` card block that hole is worse than blank space, because the
 * hairline rules run straight across it — the block reads as a table with a
 * deliberately empty square in it, and on the homepage it sat exactly where the
 * eye lands last, next to "Follow your case".
 *
 * WHY THIS IS JAVASCRIPT AND NOT CSS. It needs the count modulo the column
 * count, and CSS has no modulo. There was a `:last-child:nth-child(odd)` rule
 * here first, which is correct only when the column count is even. It made a
 * 3-card list in a 3-column grid span its own last card — the single case that
 * was already fine — and it could not know that `.card-grid` is 2-up at `sm` but
 * 3-up at `lg`, so one of those two breakpoints would always keep a hole.
 *
 * WHY EVERY CLASS BELOW IS A WRITTEN-OUT STRING. This is the part that will
 * bite someone who "tidies" it into a template literal. Tailwind compiles by
 * scanning source text for class-name-shaped strings; it cannot evaluate
 * `` `${bp}:col-span-${span}` ``, so anything built by interpolation is simply
 * never generated. That failure is quiet — no error, no missing class in the
 * markup, the markup contains a class name that resolves to nothing, and the
 * spanning card quietly loses the reading measure and runs a 900px line. It
 * already happened once here. Every value in SPANS is therefore a literal, and
 * a new breakpoint or column count means adding a literal, not a template.
 *
 * ARITHMETIC. Place the first `total - 1` cards in full rows of `columns`; the
 * remainder of that division is how many columns the final card already
 * occupies, so it reaches across the rest of its row.
 *
 *   total 3, cols 2 -> (2 % 2) = 0 -> span 2   alone in row 2, fills it
 *   total 3, cols 3 -> (2 % 3) = 2 -> span 1   already flush, nothing to do
 *   total 5, cols 2 -> (4 % 2) = 0 -> span 2   alone after two full rows
 *   total 5, cols 3 -> (4 % 3) = 1 -> span 2   two of three, reaches across
 *   total 4, cols 2 -> (3 % 2) = 1 -> span 1   already flush
 *   total 6, cols 2 -> (5 % 2) = 1 -> span 1   already flush
 *
 * Note the `total - 1`. Computing this from `total % columns` instead is off by
 * one and gets 3-in-2 wrong, which is the homepage.
 */
type Breakpoint = 'sm' | 'md' | 'lg';

/** span -> class string. Every entry is a literal; see the note above. */
const SPANS: Record<Breakpoint, Record<number, string>> = {
  // `.card-grid` is 2-up from `sm`.
  sm: {
    1: '',
    2: 'sm:col-span-2 sm:[&>p]:max-w-measure',
  },
  // `.card-grid-2` is 2-up from `md`.
  md: {
    1: '',
    2: 'md:col-span-2 md:[&>p]:max-w-measure',
  },
  // `<CardRail>` and `.card-grid` are 3-up from `lg`, and rails can be 4-up.
  lg: {
    1: '',
    2: 'lg:col-span-2 lg:[&>p]:max-w-measure',
    3: 'lg:col-span-3 lg:[&>p]:max-w-measure',
  },
};

/**
 * The classes the last card of a `total`-card grid needs so the row ends flush,
 * at the breakpoint where that grid has `columns` columns. Empty string when the
 * row is already full.
 *
 * The `[&>p]:max-w-measure` half re-imposes the reading measure on the child
 * paragraph. A card spanning two columns is twice as wide, and the same text
 * would otherwise run to roughly 900px, past the upper end of the readable
 * range. Applied to direct-child `<p>` only, so it does not cap a heading.
 */
export function lastCardSpan(
  total: number,
  columns: number,
  from: Breakpoint,
): string {
  const span = columns - ((total - 1) % columns);
  // A span of 1 means the card already completes its row; `span <= 1` also
  // catches total = 0, where the modulo would otherwise yield a nonsense span.
  if (span <= 1) return '';
  return SPANS[from][span] ?? '';
}
