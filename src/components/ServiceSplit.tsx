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

        <dl className="mt-16 divide-y divide-border border-y border-border">
          {SERVICES.map((s) => (
            <div
              key={s.name}
              className="grid grid-cols-1 gap-x-8 gap-y-4 py-10 md:grid-cols-12"
            >
              <dt className="md:col-span-4">
                <h3 className="text-h3 text-foreground">{s.headline}</h3>
                <Link
                  href={s.url}
                  className="mt-4 inline-block text-body-sm font-medium text-accent underline decoration-1 underline-offset-[5px] transition-colors hover:decoration-accent"
                >
                  {s.name}
                </Link>
              </dt>
              <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                {s.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
