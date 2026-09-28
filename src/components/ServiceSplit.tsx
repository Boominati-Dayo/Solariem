import Link from 'next/link';
import { SERVICES } from '@/lib/site';

/**
 * The two service lines, stacked as hairline-divided rows rather than a grid
 * of icon tiles. Each row: title on the left, explanation on the right.
 */
export default function ServiceSplit() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">Two services. One set of records.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            Because we both hold accounts and pursue claims, the people tracing your money already
            understand how it moved.
          </p>
        </header>

        {/* Two cards, not a ruled list. This is the section that says what the
            company actually does, and it sits directly under the hero — a
            visitor deciding whether to stay should be able to take in both
            services at a glance rather than read down a column of rules. */}
        <ul className="card-grid-2 mt-16">
          {SERVICES.map((s, i) => (
            <li key={s.name} className="flex flex-col">
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
