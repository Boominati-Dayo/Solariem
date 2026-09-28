import type { ReactNode } from 'react';

/**
 * A horizontally scrolling row of cards.
 *
 * WHY ONLY SOME SECTIONS USE THIS. A rail is a good fit for a list of short,
 * uniform, self-contained items — a currency, a document to gather. It is a bad
 * fit for anything else, and using it everywhere would undo the card work. The
 * tell is item length: a rail card is roughly 20rem wide, so an item over about
 * 120 characters becomes a narrow column of 8-word lines that is harder to read
 * than the same text in a grid. That is why the fee schedule, the privacy
 * columns, the four rules on /about and the FAQ stay as tables — they are long
 * or genuinely comparative, and a rail would make them worse. If you are adding
 * a section and reaching for this, count the characters first.
 *
 * SCROLL SNAP, AND WHY IT IS `mandatory` RATHER THAN `PROximity`. With
 * mandatory, a card always comes to rest flush. The usual objection is that it
 * fights the user, and that is true when a card is wider than the viewport —
 * mandatory would then refuse to let them scroll past it. Cards here are
 * `min(20rem, 82%)`, which cannot exceed the container, so the objection does
 * not apply and the payoff is real: the peeked card at the edge is never left
 * half-scrolled and looking broken. If you raise the card width, re-check that
 * it still fits.
 *
 * `overscroll-behavior-x: contain` is not decoration. Without it, a horizontal
 * swipe near the edge of this list triggers the browser's back gesture on mobile
 * and throws the reader out of the page. This is the single most common bug in
 * a horizontal list.
 *
 * KEYBOARD AND SCREEN READERS — the part most horizontal-scroll implementations
 * get wrong. `tabIndex={0}` is required: Firefox makes a scrollable region
 * focusable on its own, Chrome and Safari do not, so without it the list is
 * completely unreachable by keyboard in two of the three major engines.
 * `role="group"` plus a label gives that focusable element an accessible name,
 * so a screen reader announces "Currencies you can hold, group" rather than an
 * unlabelled list box. The list stays a real `<ul>`, so it is announced as a
 * list with a count, and the visual row and the semantic list are the same
 * element — there is no separate decorative track to fall out of sync.
 *
 * NO SCROLL BUTTONS, DELIBERATELY. Prev/next arrows are the obvious addition and
 * they are not free: they need a client component, they need their disabled
 * state wired to the real scroll position, and below `lg` this is a grid, so
 * they would have to appear and disappear with a media query. The peek already
 * tells a touch user there is more, the native scrollbar tells a mouse user,
 * and arrow keys work because of the tabIndex. A control that lies about whether
 * there is anything left to scroll to is worse than no control.
 *
 * AT `lg` IT STOPS BEING A RAIL AND BECOMES A GRID. Forcing a horizontal scroll
 * onto a 1200px screen is a downgrade: the reader can already see everything, so
 * the interaction adds a step and hides content behind a gesture. Same markup,
 * no JavaScript, no duplicate component — the grid is just what this degrades to.
 * That is also why there is no `useState` and no `'use client'` here: scroll
 * position is never read, only styled.
 */
export default function CardRail({
  label,
  columns = 3,
  children,
  className = '',
}: {
  /** Accessible name for the scrollable group. Say what the list *is*. */
  label: string;
  /** Columns in the grid this falls back to at `lg`. */
  columns?: 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={`rail rail-cols-${columns} ${className}`}
      tabIndex={0}
      role="group"
      aria-label={label}
    >
      {children}
    </ul>
  );
}
