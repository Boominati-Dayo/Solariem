import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG, FEES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `What ${ORG.name} information does and does not mean. Including why we cannot promise a recovery, and how to tell a real recovery firm from a fraudster.`,
  alternates: { canonical: '/disclaimer' },
  openGraph: {
    title: `Disclaimer | ${ORG.name}`,
    description: 'What this site does and does not mean, and how to spot a recovery fraudster.',
    url: '/disclaimer',
  },
};

const UPDATED = '27 September 2026';

const CLAUSES = [
  {
    n: 1,
    title: 'General information, not advice',
    body: [
      'Everything on this site is general information. It is not legal advice, not financial advice, and not a recommendation to act. We are not a law firm and we are not authorised to practise law. Where a matter needs to be issued in a court or an ombudsman, we instruct independent solicitors or barristers in that jurisdiction, who advise you in their own capacity.',
      'If a decision matters to you — a large sum, a legal deadline, a dispute with your bank — take independent advice before you act on anything you read here.',
    ],
  },
  {
    n: 2,
    title: 'No guaranteed recovery',
    body: [
      'We do not promise that money will be returned to you, and no one who honestly does this work can. Whether a transfer can be traced and recovered depends on which institution holds the money, the law where it is held, how long ago it moved, and whether that institution is willing to act. Those are not things we control.',
      'We do not use the words guaranteed, insured, risk-free, or protected to describe a recovery, and we will not do so in any future material either. Treat any firm that does as a warning sign.',
    ],
  },
  {
    n: 3,
    title: 'Crypto transfers cannot be chargebacked',
    body: [
      'A card payment can sometimes be reversed by the card scheme. A crypto transfer cannot. Once the transfer has settled on the blockchain there is nothing to reverse and no institution to reverse it with. Any firm offering a crypto chargeback, or describing one as straightforward, is describing something that does not exist.',
      'We do not take on crypto recovery cases. We say this up front so nobody pays us to tell them something they were told differently elsewhere.',
    ],
  },
  {
    n: 4,
    title: 'We are not a bank or a regulated firm',
    body: [
      `${ORG.legalName} is a company that provides multi-currency accounts and asset recovery services. It is not a bank, it is not authorised to take deposits, and it is not a firm authorised to give investment advice.`,
      'Money held with us is not covered by the FSCS, the FDIC, or any other deposit guarantee scheme. We are not affiliated with, and do not act for, any regulator, police force, court, bank, or government body. If you are told we are, that person is wrong.',
    ],
  },
  {
    n: 5,
    title: 'Fees',
    body: [
      `We charge a recovery fee of ${FEES.successRate} of the amount that actually reaches you, at a rate agreed in writing before a case begins, and we charge no recovery fee if nothing is returned. Any other charge that applies is shown to you in the app with the amount before you authorise it.`,
      'This page is not the operative fee schedule. The agreement for a case is, and it is always given to you in writing before any work starts.',
    ],
  },
  {
    n: 6,
    title: 'Outcomes we describe',
    body: [
      'Where we describe a recovery, it happened. Where we show a client’s experience, it is that client’s, given to us in writing, and reproduced without editing beyond removing identifying details.',
      'A past case is not a prediction about yours. Most cases do not succeed, and a firm that quotes you a success rate has either cherry-picked its history or is misleading you.',
    ],
  },
  {
    n: 7,
    title: 'Third-party content and links',
    body: [
      'This site may link to, or quote from, other sites, including regulators, police forces, and financial institutions. We do not control them and we are not responsible for their content. A link is a convenience, not an endorsement.',
      'Information about law and procedure is general and current as at the date shown. It may be out of date by the time you read it, and it does not apply in every jurisdiction.',
    ],
  },
  {
    n: 8,
    title: 'Your responsibility to check who you are dealing with',
    body: [
      'This matters more than anything else on this page. Recovery fraud works in a specific way: someone who has already lost money is contacted by someone claiming to have their funds, and is then asked to pay an fee, tax, or release charge so the money can be sent to them. The first contact usually arrives by phone, email, or social media, and the caller already knows details about the original loss.',
      'Before you send any money to anyone claiming to recover funds for you: search the name and number independently rather than using the link they sent you; check that the firm is registered with the appropriate regulator or ombudsman service; and ask for the fee in writing before you engage, not after.',
    ],
  },
];

export default function DisclaimerPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">Disclaimer</h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                What the information on this site means, and more importantly what it does not. The
                last section on this page is the one worth reading twice.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                Last updated {UPDATED}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Clauses */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <ol className="border-t border-border">
            {CLAUSES.map((c) => (
              <li
                key={c.n}
                className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-border py-10 lg:grid-cols-12"
              >
                <div className="lg:col-span-4">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-data text-muted-foreground">
                      {String(c.n).padStart(2, '0')}
                    </span>
                    <h2 className="text-h3 font-normal text-foreground">{c.title}</h2>
                  </div>
                </div>
                <div className="lg:col-span-8">
                  {c.body.map((p, i) => (
                    <p
                      key={i}
                      className={`max-w-measure text-body text-muted-foreground${
                        i > 0 ? ' mt-4' : ''
                      }`}
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Impersonation warning — the most useful thing on the page. */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-px border border-border bg-border lg:grid-cols-2">
            <div className="bg-background p-6 lg:p-10">
              <h2 className="text-h2 text-foreground">Someone claiming to be us.</h2>
              <p className="mt-6 max-w-measure text-body text-muted-foreground">
                We never contact you first to ask for a fee, tax, or release charge in order to send
                you money you have already lost. If you are asked for one, it did not come from us.
              </p>
              <ul className="mt-6 space-y-3 text-body-sm text-muted-foreground">
                <li className="border-l border-border pl-4">
                  We will not ask for your bank password, your transaction PIN, or a one-time code.
                  No legitimate firm ever does.
                </li>
                <li className="border-l border-border pl-4">
                  We will not ask you to pay to a personal account, a crypto wallet, a gift card, or a
                  money transfer service.
                </li>
                <li className="border-l border-border pl-4">
                  Case details and updates are in your account. If someone needs you to log in
                  somewhere else, stop.
                </li>
              </ul>
            </div>
            <div className="bg-foreground p-6 text-background lg:p-10">
              <h2 className="text-h2 text-background">If you have already paid.</h2>
              <p className="mt-6 max-w-measure text-body text-background/70">
                This is not your fault. People are targeted deliberately, with knowledge of the loss
                they made, and the contact looks legitimate.
              </p>
              <ol className="mt-6 space-y-3 text-body-sm text-background/70">
                <li className="border-l border-background/20 pl-4">
                  Contact your bank or card issuer immediately and ask them to recall the payment.
                  The speed matters more than the odds.
                </li>
                <li className="border-l border-background/20 pl-4">
                  Report it to the police. In the United Kingdom, Report Fraud on{' '}
                  <a href="https://reportfraud.police.uk" className="underline">
                    reportfraud.police.uk
                  </a>{' '}
                  or 0300 123 2040. Elsewhere, use the fraud line for where you live.
                </li>
                <li className="border-l border-background/20 pl-4">
                  Keep everything — messages, numbers, call recordings, transfer references. It is
                  the only evidence that will be useful later.
                </li>
                <li className="border-l border-background/20 pl-4">
                  Tell us at{' '}
                  <a href={`mailto:${ORG.email}`} className="underline">
                    {ORG.email}
                  </a>
                  . If it was someone using our name, we want to know and it helps us warn others.
                </li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border px-6 py-14 sm:px-12">
            <h2 className="font-display text-display-1">Ask before you trust.</h2>
            <p className="mt-6 max-w-measure text-lead text-muted-foreground">
              Check who you are dealing with before you send anything, and take independent advice
              before you sign anything. Those two habits would prevent most of the harm we exist to
              undo. If you want to know more about how we work, ask us.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-foreground bg-foreground px-6 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
              >
                Contact us
              </Link>
              <Link
                href="/terms"
                className="inline-flex h-12 items-center border border-foreground px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background"
              >
                Read the terms
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
