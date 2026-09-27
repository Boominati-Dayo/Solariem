import Link from 'next/link';
import type { Metadata } from 'next';

/**
 * 404.
 *
 * The previous version opened with "unlike fraudulent transactions, we can
 * easily reverse this error". It was a joke, and it made the one claim this
 * company must never make even as a joke — that a fraudulent transfer can be
 * reversed at will. It also double-suffixed the title via the root template
 * ("Page Not Found | Solariem | Solariem") and leaned on a navy gradient with
 * three lucide icons.
 *
 * Kept useful: someone who lands here having followed a link about tracing
 * money is often here because they are in a panic, so the page routes to the
 * two things that actually help rather than just apologising.
 */
export const metadata: Metadata = {
  title: 'Page not found',
  description:
    'That page does not exist. If you are trying to trace money taken by fraud, these are the two places that can act on it.',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main id="main" className="bg-background">
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-32">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="font-mono text-data text-muted-foreground">404</p>
              <h1 className="mt-5 font-display text-display-1 sm:text-display-2">
                That page is not here.
              </h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                The link may be old, or it may have been typed slightly wrong. Nothing has gone wrong
                with your account, and nothing has been lost.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/" className="btn-ink">
                  Go to the front page
                </Link>
                <Link href="/contact" className="btn-line">
                  Tell us what you were looking for
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-16">
              <div className="border border-border">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">
                    If you came here about lost money
                  </h2>
                </div>
                <div className="px-6 py-6">
                  <p className="text-body-sm text-muted-foreground">
                    A broken link is easy to fix. A fraudulent transfer is not, and the order you do
                    things in matters more than anything else you do. If that is what you are here
                    for, start here instead:
                  </p>
                  <ul className="mt-5 space-y-3 text-body-sm text-muted-foreground">
                    <li className="border-l border-border pl-4">
                      Call your bank on the number on your card and ask them to raise a recall request.
                    </li>
                    <li className="border-l border-border pl-4">
                      Report it to your national fraud body — in the UK, Report Fraud on 0300 123
                      2040.
                    </li>
                    <li className="border-l border-border pl-4">
                      Keep every message, number and reference you have. It is the only evidence that
                      will be useful later.
                    </li>
                  </ul>
                  <Link href="/blog" className="btn-line mt-6 w-full">
                    Read the journal
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
