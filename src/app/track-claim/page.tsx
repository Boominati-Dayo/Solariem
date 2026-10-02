import type { Metadata } from 'next';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import CaseTracker from '@/components/CaseTracker';
import Parallax from '@/components/Parallax';
import { parallaxDepth } from '@/lib/parallax';
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
                {/* mt-12, not mt-8. The first step carries the deepest offset, so at
                    the top of its run it rises 20px off its rest position; against a
                    32px margin that left 12px of daylight under the paragraph above,
                    which reads as cramped rather than as drift. 48px keeps 28px at the
                    worst point of the run.

                    Steps drift at slightly different rates as they pass, so the list
                    fans out into depth instead of sliding as one flat block. Each step
                    carries its own connector and its own number precisely so that is
                    possible — a shared rule drawn across the rows would tear as the rows
                    pulled apart from it. Under reduced motion the transform rule does
                    not exist and the list is simply at rest. */}
                <Parallax className="mt-12">
                  <ol>
                    {TIMELINE.map((t, i) => (
                      <li
                        key={t.step}
                        className="timeline-step parallax-item"
                        style={{ '--depth': parallaxDepth(i, TIMELINE.length) } as CSSProperties}
                      >
                        <span className="timeline-step-index" aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <p className="text-body-sm font-medium text-foreground">{t.step}</p>
                        <p className="mt-2 text-body-sm text-muted-foreground">{t.body}</p>
                      </li>
                    ))}
                  </ol>
                </Parallax>
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
