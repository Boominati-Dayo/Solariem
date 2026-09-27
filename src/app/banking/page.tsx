import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import FraudInvestigationImg from '@/assets/images_for_pages/financialfraudinvestigation.png';
import { FAQS, FEES, ORG } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Multi-currency accounts',
  description:
    'Open a Solariem account and hold money in several currencies, send it abroad, and track every movement on one statement. Solariem is not a bank and does not take deposits.',
  alternates: { canonical: '/banking' },
  openGraph: {
    title: 'Multi-currency accounts | Solariem',
    description:
      'Hold money in several currencies, send it abroad, and track every movement on one statement.',
    url: '/banking',
  },
};

const CURRENCIES = [
  { code: 'USD', name: 'US dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Pound sterling' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'AED', name: 'UAE dirham' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'AUD', name: 'Australian dollar' },
];

const FEATURES = [
  {
    title: 'Hold several currencies at once',
    body: 'Keep balances in the currencies you actually use rather than converting back and forth at a rate you did not choose. You can add a currency whenever you need it.',
  },
  {
    title: 'Send money abroad',
    body: 'Transfer to a bank account in the supported countries, or to another Solariem account. Transfers made before the daily cut-off are normally sent the same working day.',
  },
  {
    title: 'One statement, every currency',
    body: 'Every movement appears on a single statement with the exchange rate and the fee shown separately, so you can see what you actually paid to move the money.',
  },
  {
    title: 'Cards that you control',
    body: 'Issue a virtual or physical card per account, freeze it instantly, and set a per-transaction limit. A lost card is a support ticket, not a lost balance.',
  },
  {
    title: 'No monthly minimum',
    body: 'There is no monthly balance requirement and no fee for keeping an account open. You are charged for the transfers you make, at the rate shown before you confirm.',
  },
];

const STEPS = [
  { title: 'Apply', body: 'Email, phone, and a document to confirm your identity. It takes about ten minutes.' },
  { title: 'Verify', body: 'Identity verification runs before the account opens. This is a legal requirement, so it cannot be skipped.' },
  { title: 'Fund it', body: 'Add money by bank transfer, card, or from another account you hold with us.' },
  { title: 'Use it', body: 'Hold, send, and convert. Everything shows on your statement as it happens.' },
];

export default function BankingPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-28 lg:py-32">
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">
                A bank account for money that crosses borders.
              </h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                Hold money in the currency you need, send it to the countries you trade with, and see
                every movement on a single statement. No monthly minimum, and no fee for keeping the
                account open.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                Solariem is not a bank and does not take deposits. Money you hold with us is not covered
                by the FSCS, the FDIC, or any other deposit guarantee scheme. Read the account agreement
                before you fund an account.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/signup" className="btn-ink">
                  Open an account
                </Link>
                <Link href="/contact" className="btn-line">
                  Ask a question first
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 lg:pt-16">
              <figure className="border border-border bg-card p-2">
                <Image
                  src={FraudInvestigationImg}
                  alt="A statement being reviewed line by line"
                  width={1200}
                  height={800}
                  priority
                  className="h-auto w-full"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Currencies */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Currencies you can hold.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              Add any of these when you open the account. Balances in different currencies are kept
              separate, and you convert when you choose to rather than when we decide to.
            </p>
          </header>
          <ul className="mt-14 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
            {CURRENCIES.map((c) => (
              <li key={c.code} className="bg-background px-6 py-8">
                <p className="font-mono text-h3 tabular-nums text-foreground">{c.code}</p>
                <p className="mt-1 text-caption text-muted-foreground">{c.name}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Features */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">What the account does.</h2>
          </header>
          <dl className="mt-16 divide-y divide-border border-y border-border">
            {FEATURES.map((f) => (
              <div key={f.title} className="grid grid-cols-1 gap-2 py-8 md:grid-cols-12 md:gap-6">
                <dt className="text-h4 text-foreground md:col-span-4">{f.title}</dt>
                <dd className="max-w-measure text-body text-muted-foreground md:col-span-8">
                  {f.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* How to open */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Opening an account.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                Most applications are decided the same day. We accept applicants from the{' '}
                {ORG.areaServed.map((c) =>
                  c === 'GB' ? 'UK' : c === 'US' ? 'US' : c === 'SG' ? 'Singapore' : 'UAE',
                ).join(', ')}{' '}
                and we will tell you plainly if we cannot serve you.
              </p>
            </header>
            <ol className="lg:col-span-7">
              {STEPS.map((s, i) => (
                <li key={s.title} className="border-b border-border py-7 first:border-t">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-6">
                    <p className="text-data tabular-nums text-muted-foreground md:col-span-1">
                      {String(i + 1).padStart(2, '0')}
                    </p>
                    <div className="md:col-span-11">
                      <h3 className="text-h4 text-foreground">{s.title}</h3>
                      <p className="mt-2 max-w-measure text-body text-muted-foreground">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Fees — stated plainly, because hiding this is what makes competitors look fraudulent */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What it costs.</h2>
              <p className="mt-5 text-lead text-muted-foreground">{FEES.statement}</p>
            </header>
            <div className="lg:col-span-7">
              <dl className="divide-y divide-border border-y border-border">
                <div className="grid grid-cols-1 gap-1 py-6 md:grid-cols-12 md:gap-6">
                  <dt className="text-body font-medium text-foreground md:col-span-7">
                    Opening or keeping an account
                  </dt>
                  <dd className="text-body text-muted-foreground md:col-span-5">No charge.</dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-6 md:grid-cols-12 md:gap-6">
                  <dt className="text-body font-medium text-foreground md:col-span-7">
                    A transfer between currencies
                  </dt>
                  <dd className="text-body text-muted-foreground md:col-span-5">
                    The rate and the fee are both shown before you confirm.
                  </dd>
                </div>
                <div className="grid grid-cols-1 gap-1 py-6 md:grid-cols-12 md:gap-6">
                  <dt className="text-body font-medium text-foreground md:col-span-7">
                    A recovery case, if you use one
                  </dt>
                  <dd className="text-body text-muted-foreground md:col-span-5">
                    {FEES.successRate} of amounts actually returned. No success fee if nothing comes
                    back.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Questions about accounts.</h2>
          </header>
          <dl className="mt-14 divide-y divide-border border-y border-border">
            {FAQS.filter((f) =>
              /bank|deposit|insur|who can open|confidential|regulator|fee|cost/i.test(f.q),
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
    </main>
  );
}
