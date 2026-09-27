import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG, SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `How ${ORG.name} collects, uses, shares and stores your personal information, and what you can ask us to do with it.`,
  alternates: { canonical: '/privacy' },
  openGraph: {
    title: `Privacy | ${ORG.name}`,
    description: 'What we collect, why we collect it, who we share it with, and how to make us delete it.',
    url: '/privacy',
  },
};

const UPDATED = '27 September 2026';

/**
 * Written against the fields the application actually stores, not a generic
 * template. If a field is added to the User model or a new document type is
 * collected, it needs to be reflected in the "What we hold" table below.
 */
const WE_HOLD = [
  {
    what: 'Identity and contact details',
    items:
      'Name, email address, phone number, postal address, country, and the type of account you opened.',
  },
  {
    what: 'Sign-in credentials',
    items:
      'A hashed password, a hashed transaction PIN, verification and password-reset tokens, and a record of your last sign-in.',
  },
  {
    what: 'Identity verification documents',
    items:
      'Photographs of your identity document, a selfie, the document type, and the date you submitted them. We also record whether verification passed or failed and, if it failed, why.',
  },
  {
    what: 'Financial records',
    items:
      'Balances, deposits, withdrawals, transfers, card activity, loan applications, tax rebate claims, and every movement with its date, amount and status.',
  },
  {
    what: 'Recovery case files',
    items:
      'Your claim reference, the type of fraud, the amount lost, the date it happened, the platform or person involved, your written account of events, and any documents or screenshots you send us.',
  },
  {
    what: 'Messages and notifications',
    items: 'Support messages, replies from us, and notifications we send you. We also hold your newsletter subscription if you gave us one.',
  },
  {
    what: 'Security and audit records',
    items:
      'An activity log of significant actions on your account, including administrative actions taken by our staff, and the IP address used when you sign in.',
  },
];

const WHY = [
  {
    basis: 'To perform our contract with you',
    detail:
      'Opening and running your account, moving money, and tracing and pursuing a recovery case. Without this information we cannot do the work you have asked us to do.',
  },
  {
    basis: 'To comply with a legal obligation',
    detail:
      'Identity verification, record-keeping, and responding to a regulator, court, or law enforcement body. We are not permitted to refuse you for failing to provide information we are legally required to hold.',
  },
  {
    basis: 'For our legitimate interests',
    detail:
      'Keeping the service secure, preventing fraud, investigating a disputed transaction, and improving what we do. We balance this against your rights and do not use your data for anything you would not expect.',
  },
  {
    basis: 'With your consent',
    detail: 'The newsletter, and nothing else. You can withdraw consent at any time and it will not affect anything else we do with your information.',
  },
];

const SHARED_WITH = [
  {
    who: 'Banks, card issuers, exchanges, ombudsman schemes and the courts',
    what:
      'Only where a recovery case requires it. To trace a payment or bring a claim we have to give the institution concerned the transaction references, dates and amounts. This is the substance of the work and you cannot opt out of it while the case is open.',
  },
  {
    who: 'Solicitors and barristers instructed by us',
    what:
      'The case file, where we issue proceedings. They act as independent professionals and are bound by their own duty of confidentiality.',
  },
  {
    who: 'Our email provider',
    what:
      'Your email address and the content of messages we send you, so they can be delivered. Our provider processes this on our instructions.',
  },
  {
    who: 'Our file storage provider',
    what:
      'Documents and images you upload, such as identity documents and evidence. Files are stored under a random reference rather than your name.',
  },
  {
    who: 'Our database hosting provider',
    what: 'The records above, in order to run the application.',
  },
];

const RIGHTS = [
  {
    right: 'See what we hold',
    detail: 'Ask for a copy of your personal information. We usually answer within one month and there is no charge.',
  },
  {
    right: 'Correct it',
    detail:
      'Ask us to fix anything wrong. We will correct simple mistakes ourselves and will not charge you for that.',
  },
  {
    right: 'Delete it',
    detail:
      'Ask us to erase your information. We will do so unless we are legally required to keep it, for example for financial record-keeping or an open investigation.',
  },
  {
    right: 'Restrict or object',
    detail:
      'Ask us to pause processing while a dispute is resolved, or object to processing you did not expect.',
  },
  {
    right: 'Move it',
    detail:
      'Ask for your information in a portable format, or to pass it to another provider, where the processing is automated.',
  },
  {
    right: 'Withdraw consent',
    detail: 'For the newsletter, at any time, with no effect on anything else.',
  },
];

export default function PrivacyPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">Privacy</h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                This page says what we hold, why we hold it, who else sees it, and what you can ask us
                to do about it. We have written it plainly rather than hiding behind language designed
                to be unreadable.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                It applies to this website, to accounts opened with {ORG.name}, and to recovery cases
                run by us. Last updated {UPDATED}.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="border border-border">
                <div className="border-b border-border bg-muted px-6 py-4">
                  <h2 className="text-body-sm font-medium text-foreground">In short</h2>
                </div>
                <dl className="divide-y divide-border">
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Who is responsible</dt>
                    <dd className="mt-1 text-body text-foreground">
                      {ORG.legalName}, for the information described here.
                    </dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Write to us</dt>
                    <dd className="mt-1 text-body text-foreground">
                      <a href={`mailto:${ORG.email}`} className="underline">
                        {ORG.email}
                      </a>
                    </dd>
                  </div>
                  <div className="px-6 py-5">
                    <dt className="text-caption text-muted-foreground">Complaints</dt>
                    <dd className="mt-1 text-body text-foreground">
                      Email us first. If we cannot resolve it, you can complain to the data
                      protection authority where you live.
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What we hold */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What we hold.</h2>
            </header>
            <div className="lg:col-span-7">
              <p className="max-w-measure text-body text-muted-foreground">
                We only ask for what the work requires. If a field is marked optional in the
                application, you can leave it blank and nothing else changes.
              </p>
              <dl className="mt-10 divide-y divide-border border-y border-border">
                {WE_HOLD.map((row) => (
                  <div key={row.what} className="py-6">
                    <dt className="text-h4 text-foreground">{row.what}</dt>
                    <dd className="mt-2 max-w-measure text-body text-muted-foreground">{row.items}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Why we are allowed to hold it.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                Privacy law does not let a company simply decide to keep everything. Each category
                has to rest on a lawful reason, and here they are in plain terms.
              </p>
            </header>
            <dl className="lg:col-span-7">
              {WHY.map((w) => (
                <div key={w.basis} className="border-b border-border py-6 first:border-t">
                  <dt className="text-h4 text-foreground">{w.basis}</dt>
                  <dd className="mt-2 max-w-measure text-body text-muted-foreground">{w.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Sharing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Who else sees it.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                We do not sell your information and we do not share it for advertising. The list below
                is the complete set of parties who receive it.
              </p>
            </header>
            <dl className="lg:col-span-7">
              {SHARED_WITH.map((s) => (
                <div key={s.who} className="border-b border-border py-6 first:border-t">
                  <dt className="text-h4 text-foreground">{s.who}</dt>
                  <dd className="mt-2 max-w-measure text-body text-muted-foreground">{s.what}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Transfers, retention, security */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">Transfers, retention and security.</h2>
          </header>
          <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-3">
            <div className="bg-background p-6 lg:p-8">
              <h3 className="text-h3 font-normal text-foreground">Sent abroad</h3>
              <p className="mt-4 text-body-sm text-muted-foreground">
                A recovery claim has to reach the institution holding the money, and that institution
                is usually in another country. Your case information is therefore sent abroad as part
                of doing the work. Where a country is not covered by an adequacy decision, we rely on
                standard contractual clauses and a transfer risk assessment.
              </p>
            </div>
            <div className="bg-background p-6 lg:p-8">
              <h3 className="text-h3 font-normal text-foreground">How long we keep it</h3>
              <p className="mt-4 text-body-sm text-muted-foreground">
                Account and financial records are kept for five years after you close your account,
                and case files for five years after the case closes. That period is set by
                anti-money-laundering record-keeping rules rather than by us. After that we delete or
                anonymise them. We keep your name and contact details for as long as the relationship
                lasts, and no longer.
              </p>
            </div>
            <div className="bg-background p-6 lg:p-8">
              <h3 className="text-h3 font-normal text-foreground">How it is protected</h3>
              <p className="mt-4 text-body-sm text-muted-foreground">
                Traffic is encrypted in transit with TLS, passwords and transaction PINs are stored
                only as hashes, access to case files is limited to staff who need them, and every
                administrative action is written to an audit log. We will not claim a certification
                grade of security, because that is something a client should be able to verify in an
                audit report and we have not commissioned one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rights */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What you can ask for.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                These rights apply regardless of where you live. If we cannot act on a request, we
                will say why rather than leaving you guessing.
              </p>
            </header>
            <dl className="lg:col-span-7">
              {RIGHTS.map((r) => (
                <div key={r.right} className="border-b border-border py-6 first:border-t">
                  <dt className="text-h4 text-foreground">{r.right}</dt>
                  <dd className="mt-2 max-w-measure text-body text-muted-foreground">{r.detail}</dd>
                </div>
              ))}
              <div className="py-6">
                <dt className="text-h4 text-foreground">If you are unhappy with us</dt>
                <dd className="mt-2 max-w-measure text-body text-muted-foreground">
                  Write to us first at{' '}
                  <a href={`mailto:${ORG.email}`} className="underline">
                    {ORG.email}
                  </a>
                  . If the answer does not satisfy you, you may complain to your local data
                  protection authority. In the United Kingdom that is the Information Commissioner&rsquo;s
                  Office at ico.org.uk. We do not ask you to raise a complaint with us first, and
                  doing so does not affect your right to complain.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">Cookies.</h2>
            </header>
            <div className="lg:col-span-7">
              <p className="max-w-measure text-body text-muted-foreground">
                We use a session cookie to keep you signed in, and a small amount of local storage
                to remember choices you have made in the browser, such as a referral code. We do not
                run advertising trackers and we do not build a profile of you across other websites.
                Clearing your browser storage will sign you out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border bg-foreground px-6 py-14 text-background sm:px-12">
            <h2 className="font-display text-display-1">Ask before you sign.</h2>
            <p className="mt-6 max-w-measure text-lead text-background/70">
              If anything in here is unclear, or you want to see the data we hold on you before you
              commit to anything, email {ORG.email} and you will get a straight answer.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link
                href="/terms"
                className="inline-flex h-12 items-center border border-background bg-background px-6 text-body-sm font-medium text-foreground transition-colors duration-150 hover:bg-background/85"
              >
                Read the terms
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center border border-background px-6 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-background hover:text-foreground"
              >
                Contact us
              </Link>
            </div>
            <p className="mt-10 font-mono text-data text-background/40">
              <a href={SITE_URL} className="underline">
                {SITE_URL}
              </a>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
