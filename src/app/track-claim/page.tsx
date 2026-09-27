import type { Metadata } from 'next';
import Link from 'next/link';
import CaseTracker from '@/components/CaseTracker';
import { FAQS, TIMELINE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Check your recovery case',
  description:
    'Use the reference from your confirmation email to see where your case has got to and what we are waiting on.',
  alternates: { canonical: '/track-claim' },
  openGraph: {
    title: 'Check your recovery case | Solariem',
    description: 'See where your case has got to and what we are waiting on.',
    url: '/track-claim',
  },
  robots: { index: false, follow: true },
};

export default function TrackClaimPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-measure">
            <h1 className="font-display text-display-1 sm:text-display-2">Where your case has got to.</h1>
            <p className="mt-7 text-lead text-muted-foreground">
              Enter the reference from your confirmation email and the address you gave us. You will
              see the stage the case has reached, everything we have posted, and anything that is
              holding it up.
            </p>
          </div>
        </div>
      </section>

      {/* Tracker */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <CaseTracker />
            </div>

            <div className="space-y-12 lg:col-span-5">
              <div>
                <h2 className="text-h4 text-foreground">The stages a case goes through</h2>
                <p className="mt-3 text-body-sm text-muted-foreground">
                  Every case follows the same path. How far it gets depends on who received the
                  money and how quickly.
                </p>
                <ol className="mt-6 border-t border-border">
                  {TIMELINE.map((t, i) => (
                    <li key={t.step} className="border-b border-border py-4">
                      <p className="text-body-sm text-foreground">
                        <span className="mr-3 font-mono text-data tabular-nums text-muted-foreground">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        {t.step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h2 className="text-h4 text-foreground">Common questions</h2>
                <dl className="mt-6 border-t border-border">
                  {FAQS.filter((f) => /take long|guarantee|cost|crypto/i.test(f.q)).map((f) => (
                    <div key={f.q} className="border-b border-border py-5">
                      <dt className="text-body-sm font-medium text-foreground">{f.q}</dt>
                      <dd className="mt-2 text-body-sm text-muted-foreground">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border border-border p-6">
                <h2 className="text-h4 text-foreground">No case to hand?</h2>
                <p className="mt-3 text-body-sm text-muted-foreground">
                  If money has been taken from you and you have not started a case with us, start with
                  your own bank first, then tell us what happened.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/contact" className="btn-ink">
                    Start a case
                  </Link>
                  <Link href="/asset-recovery" className="btn-quiet">
                    How it works
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
