import { TIMELINE } from '@/lib/site';

/**
 * The recovery process as numbered hairline rows. The 3px verdigris progress
 * rule on the active row is the only place the accent appears in this section.
 */
export default function ProcessSteps() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <header className="section-head">
          <h2 className="text-h2 text-foreground">How a recovery case moves.</h2>
          <p className="mt-5 text-lead text-muted-foreground">
            Five stages. You can check where yours has reached at any point using the reference we
            give you.
          </p>
        </header>

        <ol className="mt-16 border-t border-border">
          {TIMELINE.map((t, i) => (
            <li
              key={t.step}
              className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-border py-8 md:grid-cols-12 md:gap-6"
            >
              <div className="flex items-start gap-4 md:col-span-4">
                <span
                  aria-hidden="true"
                  className="mt-1 inline-flex h-6 w-6 shrink-0 items-center justify-center border-t-[3px] border-accent text-data tabular-nums text-muted-foreground"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-h4 text-foreground">{t.step}</h3>
              </div>
              <p className="max-w-measure text-body text-muted-foreground md:col-span-8">
                {t.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
