import Link from 'next/link';
import { ORG, ACCOUNT_FEES, RECOVERY_FEES } from '@/lib/site';

/**
 * What the homepage panel shows: one row from each schedule.
 *
 * The homepage has to cover both businesses, so it needs an account fee and a
 * recovery fee side by side. Taking the *first* row of each list rather than
 * writing new ones keeps the homepage inside the same source of truth — if
 * "To open an account" is renamed or repriced in site.ts, the homepage follows.
 * A hand-written homepage copy of these numbers is precisely how the three
 * surfaces drifted apart in the first place.
 */
const HERO_PANEL_FEES = [...ACCOUNT_FEES.slice(0, 1), ...RECOVERY_FEES.slice(0, 3)];

/** The one place on the homepage allowed a full-bleed accent panel. */
export default function FinalCTA() {
  return (
    <section className="section section-rule">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        {/* The dark panel is where the gold second voice earns its keep. Gold on
            ink is 10.98:1, so it can carry real text here in a way it never can
            on bone (3.08:1 — borders and fills only). The wash keeps the panel
            from being a flat black rectangle. */}
        <div className="wash-brand-dark relative border border-border bg-foreground px-6 py-14 text-background sm:px-12 lg:py-20">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h2 className="font-display text-display-1">Every asset, accounted for.</h2>
              <p className="mt-6 max-w-measure text-lead text-background/70">
                Open an account and start moving money, or send us a fraud case and find out whether
                there is anything to trace. Either way, you will not be charged unless money comes
                back to you.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                {/* Gold, not white. The primary action on the page should be the
                    one button that is not the neutral ink, and ink-on-gold is
                    7.85:1 so the label stays fully legible. */}
                <Link href="/signup" className="btn-gold">
                  Open an account
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center justify-center border border-background/40 px-6 text-body-sm font-medium text-background transition-colors duration-150 hover:border-background hover:bg-background hover:text-foreground"
                >
                  Talk to us first
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <dl className="border-t border-background/20">
                {HERO_PANEL_FEES.map((f) => (
                  <div key={f.label} className="border-b border-background/20 py-5">
                    <dt className="text-caption text-background/50">{f.label}</dt>
                    <dd className="mt-1 text-body tabular-nums text-gold-bright">{f.amount}</dd>
                  </div>
                ))}
                <div className="py-5">
                  <dt className="text-caption text-background/50">Ask us</dt>
                  <dd className="mt-1 text-body">
                    <a
                      href={`mailto:${ORG.email}`}
                      className="text-background underline decoration-1 underline-offset-[5px] hover:decoration-background"
                    >
                      {ORG.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
