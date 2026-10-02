import Link from 'next/link';
import { SERVICES } from '@/lib/site';
import { lastCardSpan } from '@/lib/cardGrid';

/**
 * The service lines, as cards rather than hairline-divided rows. Three of them,
 * so the grid needs a hand: `lastCardSpan` works out that the third card has to
 * span both columns of `card-grid-2`, which is the difference between a block
 * that ends flush and one with a ruled empty square in it.
 */
export default function ServiceSplit() {
  const last = SERVICES.length - 1;
  const span = lastCardSpan(SERVICES.length, 2, 'md');
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">{SERVICES.length} services. One set of records.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            Because we both hold accounts and pursue claims, the people tracing your money already
            understand how it moved.
          </p>
        </header>

        {/* Three cards, two columns, so the third spans. The heading read "Two
            services" while this list held three: `SERVICES` grew a case-tracking
            entry and the sentence did not follow. Both are now derived from the
            same array, so the count cannot drift from the copy again.

            Three cards, not a ruled list. This is the section that says what the
            company actually does, and it sits directly under the hero — a
            visitor deciding whether to stay should be able to take in all three
            services at a glance rather than read down a column of rules. */}
        <ul className="card-grid-2 mt-16">
          {SERVICES.map((s, i) => (
            <li key={s.name} className={`flex flex-col ${i === last ? span : ''}`}>
              <span className="card-index" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-h3 text-foreground">{s.headline}</h3>
              <p className="mt-4 flex-1 text-body text-muted-foreground">{s.body}</p>
              <Link
                href={s.url}
                className="mt-6 inline-block self-start text-body-sm font-medium text-accent underline decoration-1 underline-offset-[5px] transition-colors hover:decoration-accent"
              >
                {s.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
