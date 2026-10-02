/**
 * Depth for the nth of `total` parallax items, as a multiplier on the wrapper's
 * offset.
 *
 * This is deliberately NOT exported from `components/Parallax`. That module is a
 * client component, and a server component cannot call a function that lives in
 * one — the build fails at prerender with "Attempted to call parallaxDepth() from
 * the server". It is a plain arithmetic helper with no hooks and no JSX, so it
 * belongs here where both sides can import it.
 *
 * WHY DEPTHS AT ALL. A block that drifts as one unit is parallax but it is flat:
 * every pixel of it moves at the same rate, so nothing separates into layers.
 * Giving successive items slightly different depths is what turns a slide into
 * depth — the run fans out as it passes. Depths descend so the drift runs one way
 * down the list, which reads as the list receding rather than shuffling.
 *
 * WHY DESCENDING FROM 1 AND NEVER ABOVE IT. The first item is the reference and
 * moves least relative to its neighbours. Nothing is scaled above 1, because that
 * would make one item outrun the wrapper and drift up into the heading above it.
 * The whole 0..1 range is spent spreading the items apart.
 *
 * The result is written to CSS as `--depth`, where it multiplies the length in
 * `--parallax-y`. Rounded to four places so the inline style string is stable and
 * does not churn the DOM on every render.
 */
export function parallaxDepth(index: number, total: number, spread = 0.5): number {
  if (total < 2) return 1;
  const t = index / (total - 1);
  return Number((1 - t * spread).toFixed(4));
}

export default parallaxDepth;