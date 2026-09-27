import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG, FEES } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms',
  description: `The terms on which ${ORG.name} provides multi-currency accounts and asset recovery services, including fees, identity checks, and what we can and cannot promise.`,
  alternates: { canonical: '/terms' },
  openGraph: {
    title: `Terms | ${ORG.name}`,
    description: 'Fees, identity checks, account use, recovery cases, and what we can and cannot promise.',
    url: '/terms',
  },
};

const UPDATED = '27 September 2026';

/**
 * Plain-English terms, written against what the application actually does.
 *
 * Two things must not drift back in:
 *  1. Any promise of a guaranteed recovery, a protected balance, or a return
 *     on a balance. None of those exist in the product.
 *  2. Any claim that no charge of any kind can arise before a recovery. The
 *     application can raise account-level charges, so the accurate promise is
 *     narrower: no success fee without money returned, and anything else shown
 *     with its amount before it is owed. See clause 7 and the note in
 *     src/lib/site.ts.
 */
const CLAUSES = [
  {
    n: 1,
    title: 'Who we are',
    body: [
      `${ORG.legalName} provides multi-currency accounts and asset recovery services. We are a company, not a bank, and we are not authorised to take deposits. Money you hold with us is not covered by the FSCS, the FDIC, or any other deposit guarantee scheme, and it does not carry the protection a bank current account does. Treat it accordingly.`,
      'We are not affiliated with, and do not act on behalf of, any regulator, police force, court, bank, or government body. If anyone tells you we are, they are mistaken.',
    ],
  },
  {
    n: 2,
    title: 'These terms',
    body: [
      `These terms apply to this website and to accounts opened with us. Where we do other work — tracing a fraudulent transfer, for example — that work is governed by a separate written agreement which we give you before it begins. Where that agreement and these terms differ, the agreement for that piece of work prevails.`,
      `Versions of these terms apply from the date we publish them. We keep a copy of every version, and if you ask we will send you the one that applied when you opened your account.`,
    ],
  },
  {
    n: 3,
    title: 'Opening an account',
    body: [
      'You must be at least 18 years old and legally able to enter into a contract where you live. You must give us accurate information. If what you have told us turns out to be wrong, we may have to close the account, and we will tell you why.',
      'One person, one account. Opening extra accounts to work around a limit or a restriction is a breach of these terms.',
    ],
  },
  {
    n: 4,
    title: 'Identity verification',
    body: [
      'Before an account can be used, and before a recovery case is accepted, we have to verify who you are. This is a legal requirement of the business we are in, not a marketing step, and it is not optional.',
      'You must send us the documents we ask for by the date we ask for them. If we do not receive them, or if they do not match the account, we cannot proceed. Verification that fails is not a judgement about you; it is usually an expired document, a name that does not match, or a photograph that is too unclear to read.',
    ],
  },
  {
    n: 5,
    title: 'Using your account',
    body: [
      'You can hold money in the currencies we support, send it to others, and move it between currencies. Every movement is recorded and shown to you.',
      'You are responsible for the security of your sign-in details, your password, and your transaction PIN. Tell us immediately if you think someone else has used your account. We will not reverse a payment made with your credentials where the transaction itself was properly authorised, but we will investigate and we will always look at what actually happened.',
      'We can delay, hold, or decline a transaction where we are required to by law, where we have reasonable grounds to believe it is connected to fraud or to money laundering, or where a bank or exchange involved has asked us to. We will tell you when we do, and why, as soon as we are able.',
    ],
  },
  {
    n: 6,
    title: 'Recovery cases',
    body: [
      'A recovery case means we trace a payment you say was taken by fraud, and act on it through the institutions involved — the bank that sent it, the bank or exchange that received it, and where appropriate the courts.',
      'Accepting a case does not mean we think your account is true. It means the evidence you have given us is good enough to justify spending our time on it. We tell you at the outset whether we can identify a route to the money, and we tell you when we cannot.',
      'We will not run a case designed to produce a result you want rather than one the evidence supports. If the money cannot be traced, we close the case and say so.',
    ],
  },
  {
    n: 7,
    title: 'Fees and charges',
    body: [
      `Opening an account is free. We do not charge a recovery fee unless money is actually returned to you. When money comes back, we take ${FEES.successRate} of the amount that actually reached you, at the rate agreed in writing before the case begins. If nothing is returned, no success fee is due.`,
      'That percentage is fixed for the case. We do not raise it once a case is under way, and we do not introduce a success fee on a case we had told you was fee-free.',
      'The only other charges that can arise are account-level ones — for example, clearing a restriction on an account held for verification. Where one applies it is shown to you in the app with the amount before you authorise it. We will not charge you for something we have not shown you.',
      'We never ask for payment to a personal bank account, a crypto wallet, a gift card, or a money transfer service. If anyone asks you for that in our name, it was not us. Stop, and contact us before you send anything.',
    ],
  },
  {
    n: 8,
    title: 'Restricted and closed accounts',
    body: [
      'We may restrict an account while we complete identity verification, while we investigate a disputed transaction, or in response to a request from a bank, an exchange, a court, or a law enforcement body. We may close it if verification cannot be completed, if the account was opened with false information, or if we are required to.',
      'While an account is restricted you can see the restriction and the reason for it in the app, and you can contact us about it. If a charge applies to lifting a restriction, it is shown to you with the amount before it is owed.',
      'We will not restrict an account in order to extract money from you. If you believe one is, that is a complaint and clause 14 tells you how to make it.',
    ],
  },
  {
    n: 9,
    title: 'What we cannot promise',
    body: [
      'We do not guarantee that money will be recovered. Whether it can be traced and returned depends on which institution holds it, the law where it is held, and how long ago it moved. Nobody who tells you otherwise is being straight with you.',
      'We do not recover money from a crypto transfer. There is no chargeback on the blockchain side of a payment, because the transfer has already settled and cannot be pulled back the way a card payment can. We will tell you this before you send us anything, not after.',
      'We do not guarantee the pace of any institution we approach. They owe you their own timescales, not ours, and we do not control them.',
      'A recovery we have achieved before is not a prediction about your case.',
    ],
  },
  {
    n: 10,
    title: 'What you must not do',
    body: [
      'Do not use the service for anything unlawful, and do not use it to move money on behalf of someone else without telling us. Opening an account to receive and pass on money for another person is how money laundering works, and we are required to stop it.',
      'Do not try to gain access to another person’s account, and do not try to obtain money by deception, including by making a claim you know to be false. We pursue fraud claims; we do not assist them.',
      'Do not upload anything you do not have the right to share, and do not upload harmful material. We may remove content and close the account if you do.',
    ],
  },
  {
    n: 11,
    title: 'Confidentiality, in both directions',
    body: [
      'We treat your case and your information as confidential, and we will not disclose either to anyone who is not involved in the work or required by law. We will not sell your details to anyone, for any purpose.',
      'We will not ask you to keep a case secret from the people around you. You are free to speak to your own lawyer, your bank, your family, or the police, and doing so will not affect your case with us. A firm that wants you to keep quiet is a firm you should not be dealing with.',
      'We will also tell you if a public body asks us for information about your case, unless we are legally forbidden from disclosing that we have been asked.',
    ],
  },
  {
    n: 12,
    title: 'Our liability',
    body: [
      'Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, for fraud, or for anything else that cannot lawfully be excluded.',
      'Subject to that, we are not liable to you for indirect or consequential loss — loss of profit, loss of opportunity, loss of anticipated savings, or loss of goodwill — arising from the service or this site. We are not liable for the acts or omissions of a bank, exchange, court, or other third party, including the failure of an institution to respond or to recover funds.',
      'We are not liable for a loss caused by you failing to follow the security steps in clause 5, or by you giving us information you knew to be false.',
    ],
  },
  {
    n: 13,
    title: 'Ending the relationship',
    body: [
      'You may close your account at any time by asking us. We may close it under clause 8. When an account closes, we return any balance that is not subject to a restriction, a charge, or a dispute, and we keep the records for as long as the law requires.',
      'Closing an account does not end our obligations to keep your information confidential, and it does not cancel a recovery fee already due on money that has been returned to you.',
    ],
  },
  {
    n: 14,
    title: 'Complaints and disputes',
    body: [
      `Write to us at ${ORG.email} first. We will acknowledge within three working days and tell you what will happen and when. Where you have sent money, we will keep you updated until the matter is settled.`,
      'If our answer does not satisfy you, you can take it further. As a consumer, the law of the country you live in gives you rights to refer a complaint to an ombudsman or to a regulator, and nothing in these terms removes them. If you are in the United Kingdom, a complaint about our conduct can go to the Financial Ombudsman Service, and a complaint about our handling of your money can go to the Financial Conduct Authority. We will give you the current details on request.',
      'Nothing in this clause stops you contacting the police, a regulator, or a court at any time.',
    ],
  },
  {
    n: 15,
    title: 'Changes to these terms',
    body: [
      'We may change these terms. If a change materially affects you, we will tell you before it takes effect, and you can close your account first without penalty if you would rather not accept it.',
      'A change does not apply to a recovery case already under way, and it cannot change the success fee agreed for a case already begun.',
    ],
  },
  {
    n: 16,
    title: 'Governing law',
    body: [
      'The governing law and the courts that have jurisdiction over a piece of work are set out in the written agreement for that work, which you receive before it begins. We do not impose them in these terms, because they differ from case to case.',
      'If you are a consumer, the mandatory law of the country you live in applies to you regardless of the above, and nothing in these terms removes a right that law gives you. Nothing here limits a right you have under the law of your country or under the law that must be applied whatever the agreement says.',
    ],
  },
] as const;

const SHORT = [
  { k: 'Not a bank', v: 'No deposit guarantee, and no regulator connection.' },
  { k: 'No recovery fee without recovery', v: `${FEES.successRate} of money that actually reaches you, and only then.` },
  { k: 'Anything else, shown first', v: 'Account-level charges appear in the app with the amount before you owe them.' },
  { k: 'No guarantees', v: 'We do not promise money will come back, and we say so before you decide.' },
];

export default function TermsPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">Terms</h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                What we do, what it costs, and what we cannot promise. Written to be read rather than
                to be skimmed past. If a clause is unclear, ask before you sign anything.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                Last updated {UPDATED}.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="border border-border">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">The short version</h2>
                </div>
                <dl className="divide-y divide-border">
                  {SHORT.map((s) => (
                    <div key={s.k} className="px-6 py-5">
                      <dt className="text-h4 text-foreground">{s.k}</dt>
                      <dd className="mt-1 text-body-sm text-muted-foreground">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
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

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border bg-foreground px-6 py-14 text-background sm:px-12">
            <h2 className="font-display text-display-1">Take these to your own lawyer.</h2>
            <p className="mt-6 max-w-measure text-lead text-background/70">
              You are entitled to independent advice before you sign anything, and we will not ask
              you not to get it. If a term here does not make sense, or does not match what we told
              you on the phone, say so before you open an account rather than after.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-background bg-background px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-background/85"
              >
                Ask a question
              </Link>
              <Link
                href="/privacy"
                className="inline-flex h-12 items-center border border-background px-6 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-background hover:text-foreground"
              >
                Read the privacy notice
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
