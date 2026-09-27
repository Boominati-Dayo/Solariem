import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQS, FEES, TIMELINE } from '@/lib/site';
import PhotoBackdrop from '@/components/PhotoBackdrop';
import FraudInvestigationImg from '@/assets/images_for_pages/financialfraudinvestigation.png';

export const metadata: Metadata = {
  title: 'Lost money to a fraud? Start a case',
  description:
      'Tell us what happened and we will say whether the money can be traced. No fee unless money actually comes back, then 15-25%. We cannot promise a result.',
  alternates: { canonical: '/asset-recovery' },
  openGraph: {
    title: 'Lost money to a fraud? Start a case | Solariem',
    description:
      'Tell us what happened and we will say whether the money can be traced. No fee unless money actually comes back.',
    url: '/asset-recovery',
  },
};

const DOCS = [
  'Bank statements covering the period the fraud happened, not just the page with the transaction on it.',
  'The transaction reference for every payment you made. Your bank can supply these.',
  'Any messages, emails, or letters from the people who took the money. Screenshots are fine.',
  'A short written account of what happened and when, in your own words.',
  'Any identification you have for the people or companies involved, such as a company number or a trading name.',
];

const NOT_WORTH_IT = [
  'You do not have the transaction references and the bank cannot raise them.',
  'The receiving account was closed and emptied the same day, and no institution will identify a new owner.',
  'The money was converted through several exchanges in a way that breaks the chain of custody.',
  'The transfer was for crypto bought through an unregistered service that cannot be identified.',
];

const AGAINST_US = [
  'We are not affiliated with any regulator, police force, or government body.',
  'We do not have special access to banks, and we will not tell you that we do.',
  'We do not recover money for crypto transfers. A chargeback does not exist on the blockchain side of a payment, so anyone offering one is describing something that cannot be done.',
  'We will not guarantee an outcome, and we will not charge a recovery fee unless money actually comes back to you.',
  'We will not stop you from speaking to your own lawyer, your bank, or your family.',
];

export default function AssetRecoveryPage() {
  return (
    <main id="main">
      {/* Hero. The photograph carries the section; the scrim is anchored left
          so the copy always lands on the solid part whatever is in the image.
          The fee table is the one thing here with an opaque background of its
          own (--card is solid white in light, near-solid ink in dark), which is
          what makes it safe to float it over the photo. */}
      <PhotoBackdrop
        image={FraudInvestigationImg}
        scrim="left"
        strength="light"
        position="center right"
        priority
        className="border-b border-border"
      >
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">
                Money taken by fraud is often still traceable.
              </h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                Fraud transfers are not anonymous. They leave a record, and that record names the
                account that received the money. We establish where the funds went, then take the
                next step: a recall to the sending bank, a freeze where one is available, or a claim
                through the courts.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                We cannot guarantee that your money comes back, and we will not tell you we can
                before we have seen your documents. What we can do is tell you quickly, in writing,
                what the realistic outcome is.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn-ink">
                  Send us the details
                </Link>
                <Link href="/track-claim" className="btn-line">
                  Check an existing case
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="border border-border bg-card">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">The fee, in full</h2>
                </div>
                <dl className="divide-y divide-border">
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">To open a case</dt>
                    <dd className="mt-1 text-h3 text-foreground">Nothing</dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">If funds are returned</dt>
                    <dd className="mt-1 text-h3 text-foreground">{FEES.successRate}</dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">If nothing is returned</dt>
                    <dd className="mt-1 text-h3 text-foreground">No success fee</dd>
                  </div>
                </dl>
                <p className="border-t border-border px-6 py-5 text-caption text-muted-foreground">
                  The percentage is agreed in writing before the case starts and does not change
                  during it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </PhotoBackdrop>

      {/* Process */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">How the work actually goes.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              Each stage below has a real legal step behind it. You can see which one your case has
              reached using the reference we give you.
            </p>
          </header>
          <ol className="mt-16 border-t border-border">
            {TIMELINE.map((t, i) => (
              <li key={t.step} className="border-b border-border py-8">
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 md:grid-cols-12 md:gap-6">
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
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* What we need */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What to send us.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                Missing documents are the most common reason a case stalls. Send everything you have,
                even the parts that look irrelevant.
              </p>
            </header>
            <ul className="lg:col-span-7">
              {DOCS.map((d) => (
                <li key={d} className="border-b border-border py-5 first:border-t">
                  <p className="max-w-measure text-body text-foreground">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Honest limits */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">When a case is not worth pursuing.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                We will tell you if your case falls into one of these, rather than take a file and a
                fee and hope. A fast no is more useful to you than a slow maybe.
              </p>
            </header>
            <div className="lg:col-span-7">
              <ul className="border-t border-border">
                {NOT_WORTH_IT.map((n) => (
                  <li key={n} className="border-b border-border py-5">
                    <p className="max-w-measure text-body text-muted-foreground">{n}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What we will never do */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What we will never do.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                These are the marks of a fraudulent recovery firm, published by the FTC, the SEC, the
                CFTC and FINRA. We list them so you can check us against the same list.
              </p>
            </header>
            <div className="lg:col-span-7">
              <ul className="border-t border-border">
                {AGAINST_US.map((a) => (
                  <li key={a} className="border-b border-border py-5">
                    <p className="max-w-measure text-body text-foreground">{a}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Questions about recovery.</h2>
          </header>
          <dl className="mt-14 divide-y divide-border border-y border-border">
            {FAQS.filter((f) =>
              /guarantee|cost|take long|need from me|crypto|confidential|regulator/i.test(f.q),
            ).map((f) => (
              <div key={f.q} className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6">
                <dt className="text-h4 text-foreground md:col-span-4">{f.q}</dt>
                <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border bg-foreground px-6 py-14 text-background sm:px-12">
            <h2 className="font-display text-display-1">Start with the documents.</h2>
            <p className="mt-6 max-w-measure text-lead text-background/70">
              Send us what you have. You will get a plain answer on whether there is a route to
              recover the money, and what it would take. There is no charge for that answer.
            </p>
            <Link href="/contact" className="mt-10 inline-flex h-12 items-center border border-background bg-background px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-background/85">
              Send us the details
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
