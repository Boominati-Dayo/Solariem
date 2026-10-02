import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQS, TIMELINE, RECOVERY_FEES } from '@/lib/site';
import { Check, X } from 'lucide-react';
import CardRail from '@/components/CardRail';
import { lastCardSpan } from '@/lib/cardGrid';
import PhotoBackdrop from '@/components/PhotoBackdrop';
import ScrollProgress from '@/components/ScrollProgress';
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

/**
 * Both lists have an odd number of cards, and both sit in grids that divide
 * evenly by two but not by three, so the last card sits alone in a row with the
 * hairline rules running past it. `lastCardSpan` works out how far it has to
 * reach; see src/lib/cardGrid.ts for why that is arithmetic in JS rather than a
 * CSS selector. DOCS is a rail below `lg`, where one scrolling row cannot have
 * a hole, and a three-column grid at `lg`, where it can.
 */
const DOCS_SPAN = lastCardSpan(DOCS.length, 3, 'lg');
const AGAINST_US_SPAN = lastCardSpan(AGAINST_US.length, 2, 'md');
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
        photo="full"
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
                  {RECOVERY_FEES.map((f) => (
                    <div key={f.label} className="px-6 py-5">
                      <dt className="text-caption text-muted-foreground">{f.label}</dt>
                      <dd className="mt-1 text-h3 tabular-nums text-foreground">{f.amount}</dd>
                    </div>
                  ))}
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

      {/* Process. Pinned and scrubbed: the section stays put for the length of
          the scroll and the background fills in as the reader moves through it.
          The colour follows the case actually progressing — bone while they are
          sending details, verdigris once we are tracing, gold once we are
          filing — so the colour carries the same information as the step
          counter rather than being decoration. */}
      <ScrollProgress
        /* The alphas below are the OUTPUT of a solve, not a guess.
           `scripts/audit-scroll-progress.mjs` composites every layer at every
           0.005 of --progress and reports the worst WCAG ratio, and these are
           the values that keep body copy at AA for the whole run.

           Two things the solve changed about the obvious approach:

           1. The body colour had to be darkened. --muted-foreground sits at
              5.27:1 on bone, which is 0.77 of headroom before AA — a tint
              strong enough to perceive spends essentially all of it at once,
              which is why the first attempt topped out at alpha 0.05 and
              looked like nothing had happened. `text-sp-body` is the same hue
              at 40 8% 34%, 6.60:1 base, which buys a visible ramp.

           2. The ramp stays light. Going to an ink panel at the end of the
              scroll would mean the copy colour has to invert mid-scroll, and
              then contrast is only correct for part of the run. Bone ->
              verdigris wash -> gold wash reads as progression without the
              text ever changing colour. */
        steps={[
          { at: 0, label: 'You send us the details', background: 'hsl(var(--background))', strength: 0 },
          { at: 0.05, label: 'You send us the details', background: 'hsl(var(--accent) / 0.05)' },
          { at: 0.3, label: 'We establish where the money went', background: 'hsl(var(--accent) / 0.11)' },
          { at: 0.55, label: 'We file with the institutions involved', background: 'hsl(var(--gold) / 0.07)' },
          { at: 0.8, label: 'Funds are returned and the fee is calculated', background: 'hsl(var(--gold) / 0.12)' },
        ]}
        className="border-y border-border"
      >
        <div className="mx-auto flex max-w-container flex-col justify-center px-5 py-16 sm:px-8 lg:h-full lg:py-28 lg:[justify-content:safe_center]">
          <header className="section-head max-w-measure">
            <h2 className="text-h2 text-foreground">How the work actually goes.</h2>
            <p className="mt-5 text-lead text-sp-body">
              Each stage below has a real legal step behind it. You can see which one your case has
              reached using the reference we give you.
            </p>
          </header>

          {/* Below `lg` the panel is static and auto-height (see
              `.scroll-progress` in globals.css for why it cannot be pinned on a
              phone), so the cards stack and run the full width of the section.
              `lg:h-full` and the safe centring above only take effect once the
              panel actually has a fixed height to centre inside.

              The old `max-w-4xl` is gone. It capped five columns at 896px —
              153px each, which wraps the longest step body into about eight
              lines — while leaving 240px of empty space to the right, because
              nothing centred it. The full container gives 201px per column, so
              the same text runs to four or five lines and the panel is ~75px
              shorter, which is the difference between fitting in 100svh on a
              laptop and needing the overflow fallback. */}
          <ol className="mt-12 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-5">
            {TIMELINE.map((t, i) => (
              <li key={t.step} className="flex flex-col">
                <span
                  aria-hidden="true"
                  className="mb-4 inline-flex h-7 min-w-[1.75rem] items-center justify-center border-t-[3px] border-accent px-1 font-mono text-data tabular-nums text-sp-body"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-body-sm font-medium leading-snug text-foreground">{t.step}</h3>
                <p className="mt-2 text-caption text-sp-body">{t.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </ScrollProgress>

      {/* What we need */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          {/* The heading now sits above the rail rather than beside it. In the
              old 5/7 split the list had seven columns to work with, and a rail
              in seven columns is a rail of slivers — each card would be about
              half the width it is now. A horizontal list needs the full measure
              to have anything to scroll across, so the header goes on top and
              the track gets the whole container. At `lg` the rail becomes a
              three-column grid, which is the same shape this section had. */}
          <header className="section-head">
            <h2 className="text-h2 text-foreground">What to send us.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              Missing documents are the most common reason a case stalls. Send everything you have,
              even the parts that look irrelevant.
            </p>
          </header>
          <CardRail label="Documents to send us" columns={3} className="mt-14">
            {DOCS.map((d, i) => (
              <li key={d} className={`flex flex-col ${DOCS_SPAN}`}>
                <span className="card-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-body text-foreground">{d}</p>
              </li>
            ))}
          </CardRail>
        </div>
      </section>

      {/* Honest limits */}
      <section className="section section-rule">
        <div className="mx-auto max-w-container px-5 sm:px-8">
          {/* Four independent disqualifiers, and the third rail on the site.
              This is the marginal case and it earns its place for a specific
              reason: a reader arrives here to answer one question — is my case
              one of these? — and a rail turns that into a single pass along a
              row rather than a scroll down a column. The items run 74-104
              characters, which is the top of what reads well at
              `min(20rem, 82%)`, so this is as long as a rail should get. The
              next section is deliberately left as a grid: one of its items is
              178 characters and would break into a narrow unreadable column.

              The header moved above, as with the rail above this one. Four is
              the smallest list worth a rail — at 82% card width one and a bit
              are visible, so there is a real second screen to reach and a real
              reason to swipe. At `lg` it is a four-wide grid on one row, which
              is the neatest version this section has had. */}
          <header className="section-head">
            <h2 className="text-h2 text-foreground">When a case is not worth pursuing.</h2>
            <p className="mt-5 text-lead text-muted-foreground">
              We will tell you if your case falls into one of these, rather than take a file and a
              fee and hope. A fast no is more useful to you than a slow maybe.
            </p>
          </header>
          <CardRail label="Cases we will not pursue" columns={4} className="mt-14">
            {NOT_WORTH_IT.map((n) => (
              <li key={n} className="flex">
                <span
                  aria-hidden="true"
                  className="mt-0.5 mr-4 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-border text-muted-foreground"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </span>
                <p className="text-body text-muted-foreground">{n}</p>
              </li>
            ))}
          </CardRail>
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
            {/* The FTC/SEC/CFTC/FINRA marks of a fraudulent firm. This list is
                meant to be read against an external one, so each commitment
                gets a card of its own rather than a row in a list.

                The tick and the cross are lucide SVG, not the &check; and
                &times; characters this used to be. That was a real bug rather
                than a preference: JSX decodes only the entities Babel knows
                about, and `check` is not among them. An unknown entity is left
                as literal text, React then escapes the ampersand, and the page
                ships `&amp;check;` — so the browser paints the reader the
                seven characters "&check;" inside the box. `times` IS known, so
                the cross rendered fine, which is why it looked like one broken
                glyph rather than a broken approach. SVG cannot get this wrong:
                there is no entity layer to get wrong. */}
            <ul className="card-grid-2 lg:col-span-7">
              {AGAINST_US.map((a) => (
                <li key={a} className={`flex ${AGAINST_US_SPAN}`}>
                  <span
                    aria-hidden="true"
                    className="mt-0.5 mr-4 inline-flex h-6 w-6 shrink-0 items-center justify-center border border-accent/40 text-accent"
                  >
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <p className="text-body text-foreground">{a}</p>
                </li>
              ))}
            </ul>
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
