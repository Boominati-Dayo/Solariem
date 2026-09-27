import type { Metadata } from 'next';
import Link from 'next/link';
import { ORG } from '@/lib/site';

/**
 * The Journal index.
 *
 * Deliberately a server component with real metadata. It used to be a client
 * component, which meant it had no metadata export and silently inherited the
 * homepage's canonical URL — a duplicate-content defect, and the reason this
 * page was invisible to search for anything.
 *
 * The article list below is a roadmap, not a set of links. Nothing here points
 * at an article that does not exist yet. Publishing half-written or unsourced
 * pieces to fill an index is the exact failure mode of the industry this
 * journal exists to push back against, and rule 8 in the editorial plan says
 * our own writing has to pass the same checklist as everyone else's.
 *
 * Sources for every claim below: research/journal-content-source-report.md
 */

export const metadata: Metadata = {
  title: 'What happens after you lose money to a scam',
  description: 'Plain answers on fraud, tracing and recovery: the deadlines that matter, who to contact, and how recovery scammers find people who have already been scammed.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'What happens after you lose money to a scam | Solariem',
    description:
      'The deadlines that matter, who to contact, and how recovery scammers find people who have already been scammed.',
    url: '/blog',
  },
};

/**
 * If someone is reading this at 2am, the numbers below are the only part that
 * matters. Every figure is date-stamped because they change — editorial rule 4.
 */
const URGENT = [
  {
    who: 'Report Fraud',
    detail: 'The UK national reporting centre. Online at reportfraud.police.uk, or 0300 123 2040.',
  },
  {
    who: 'MoneyHelper',
    detail:
      'Free, official, impartial. Financial Crimes and Scams Unit on 0800 015 4402. It will never contact you first and never charge for help.',
  },
  {
    who: 'Your bank',
    detail:
      'Call before you do anything else, and use the fraud line rather than the number in a recent text or email. For a Faster Payments transfer, ask them to raise a recall request.',
  },
];

/**
 * Rule 8: every mention of a recovery service — including ours — is tested
 * against the red-flag list the CFTC, FINRA, FTC and FBI publish. Stating the
 * rules on the page is the cheapest way to demonstrate that we mean them.
 */
const RULES = [
  'No success rates, and no "typical" amount recovered. Not softened, not hedged. Absent.',
  'No personal financial or legal advice. We describe the mechanism and the deadline, and name the body that decides.',
  'No claim that a fee buys a result, and no promise that your money will come back.',
  'Every number carries the date it was true, because these numbers change.',
  'Registers are linked, never screenshotted. A screenshot goes stale and can be faked in an afternoon.',
  'Every article is checked against the same fraud-warning list that we apply to other firms. Ours included.',
];

type Tag = 'Before it happens' | 'You have already lost money' | 'Checking a claim' | 'The industry itself';

const PLANNED: { title: string; tag: Tag; blurb: string }[] = [
  {
    title: 'I sent crypto to a scammer — what to do in the first hour',
    tag: 'You have already lost money',
    blurb:
      'Which call to make first, what to write down before the window closes, and where the transaction hash actually is.',
  },
  {
    title: 'Can I chargeback crypto? Why chargebacks do not work on on-chain transfers',
    tag: 'Checking a claim',
    blurb:
      'The short answer is no, and the reason is not technical. It is that the exchange supplied the service you paid for.',
  },
  {
    title: 'Section 75 or chargeback? The difference, and why crypto breaks both',
    tag: 'Checking a claim',
    blurb:
      'Two different mechanisms with two different clocks and two different limits. People confuse them constantly, usually to their cost.',
  },
  {
    title: 'Fraud recovery scams: how the second wave works and how to spot it',
    tag: 'Before it happens',
    blurb:
      'The second contact usually comes from the people who committed the first fraud. This is the single most important article on the site.',
  },
  {
    title: 'Recovery firms that ask for money up front — is that always a scam?',
    tag: 'The industry itself',
    blurb:
      'What the warning lists actually say, and what a regulated professional is required to do instead.',
  },
  {
    title: 'How long do I have to report a bank transfer scam? Every deadline that matters',
    tag: 'You have already lost money',
    blurb:
      'Thirteen months, 120 days, six years, 45 days. Which clock applies to you, and which one is quietly running now.',
  },
  {
    title: 'What is the £85,000 APP scam limit and does my claim qualify?',
    tag: 'Checking a claim',
    blurb:
      'A cap, a £100 excess, a 13-month window and a set of exclusions that quietly remove more claims than people expect.',
  },
  {
    title: 'Can my bank or the exchange get it back?',
    tag: 'You have already lost money',
    blurb:
      'A recall is a request, not a right. A freeze request to an exchange is also a request. Here is what each one can and cannot do.',
  },
  {
    title: 'How to spot a crypto investment scam before you send the first payment',
    tag: 'Before it happens',
    blurb:
      'The small successful withdrawal is not proof the platform is real. It is the single most reliable part of the scam.',
  },
  {
    title: 'How to tell if a crypto platform is real, or a clone of a real one',
    tag: 'Checking a claim',
    blurb:
      'A convincing logo, a London address and an "FCA regulated" badge on the website prove nothing. How to check properly.',
  },
  {
    title: 'Why will the police or the regulator not get my crypto back?',
    tag: 'You have already lost money',
    blurb:
      'Different bodies have different remits, and none of them has a mandate to recover your money from an overseas exchange.',
  },
  {
    title: 'What is still traceable after a crypto scam?',
    tag: 'Before it happens',
    blurb:
      'Both halves of the answer, which are almost never given together: transactions are permanently recorded, and tracing becomes hard across borders.',
  },
  {
    title: 'Please send your seed phrase to recover your funds — and every other wallet trick',
    tag: 'Before it happens',
    blurb:
      'Nobody legitimate ever asks for a seed phrase. The ways people are talked into handing one over are more inventive than the warnings suggest.',
  },
  {
    title: 'Invoicing fraud and payment-diversion scams: the business playbook',
    tag: 'Before it happens',
    blurb:
      'The supplier email that looks entirely genuine except for the bank details, and the controls that would have caught it.',
  },
  {
    title: 'Which register proves a firm is real?',
    tag: 'Checking a claim',
    blurb:
      'One register per activity per jurisdiction — and the gap where the exchange you actually used is registered nowhere at all.',
  },
];

export default function JournalPage() {
  return (
    <main id="main">
      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-container px-5 py-20 sm:px-8 sm:py-24">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <h1 className="font-display text-display-1 sm:text-display-2">Journal</h1>
              <p className="mt-7 max-w-measure text-lead text-muted-foreground">
                Plain answers about fraud, tracing and recovery. The kind of thing you need at two in
                the morning, when you have just realised what has happened and you cannot tell
                whether any of it is reversible.
              </p>
              <p className="mt-5 max-w-measure text-body text-muted-foreground">
                We write about mechanisms and deadlines, and we name the body that decides. We do not
                publish success rates, we do not give personalised advice, and we do not sell
                anything here.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pt-12">
              <div className="border border-border bg-foreground px-6 py-7 text-background">
                <h2 className="text-h3 font-normal text-background">
                  If this is happening now
                </h2>
                <dl className="mt-6 divide-y divide-background/15">
                  {URGENT.map((u) => (
                    <div key={u.who} className="py-4 first:pt-0 last:pb-0">
                      <dt className="text-body-sm font-medium text-background">{u.who}</dt>
                      <dd className="mt-1 text-body-sm text-background/65">{u.detail}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 border-t border-background/15 pt-4 font-mono text-caption text-background/40">
                  Figures checked 27 September 2026.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Editorial rules */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 lg:grid-cols-12">
            <header className="section-head lg:col-span-5">
              <h2 className="text-h2 text-foreground">What we will not publish.</h2>
              <p className="mt-5 text-lead text-muted-foreground">
                Most of what circulates about recovering money is written by people who want your fee.
                These are the rules we hold ourselves to, published so you can hold us to them.
              </p>
            </header>
            <ol className="lg:col-span-7">
              {RULES.map((r, i) => (
                <li
                  key={i}
                  className="flex gap-5 border-b border-border py-5 first:border-t"
                >
                  <span className="font-mono text-data text-muted-foreground">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="max-w-measure text-body text-muted-foreground">{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Article roadmap */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <header className="section-head">
            <h2 className="text-h2 text-foreground">What is being written.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              These are the pieces we are working through, in the order people need them. Each is
              checked against a named official source before it goes up, and the ones with numbers in
              them carry the date the number was true.
            </p>
            <p className="mt-4 text-body-sm text-muted-foreground">
              None of them is linked yet, because they do not exist yet. A half-written article is
              worse than no article — particularly on a subject where someone is about to make a
              decision based on what they read.
            </p>
          </header>

          <div className="mt-16 grid grid-cols-1 gap-px border border-border bg-border md:grid-cols-2">
            {PLANNED.map((a) => (
              <article key={a.title} className="bg-background p-6 lg:p-8">
                <p className="font-mono text-caption uppercase tracking-[0.08em] text-muted-foreground">
                  {a.tag}
                </p>
                <h3 className="mt-3 text-h4 text-foreground">{a.title}</h3>
                <p className="mt-3 text-body-sm text-muted-foreground">{a.blurb}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          <div className="border border-border px-6 py-14 sm:px-12">
            <h2 className="font-display text-display-1">Something not covered here?</h2>
            <p className="mt-6 max-w-measure text-lead text-muted-foreground">
              If you cannot find the answer to a question you are actually asking, tell us. If it is a
              question other people are asking too, it is probably the next thing we write — and we
              would rather write it than guess.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/contact" className="btn-ink">
                Ask the question
              </Link>
              <Link href="/asset-recovery" className="btn-line">
                About recovery
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
