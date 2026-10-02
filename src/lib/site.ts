/**
 * SOLARIEM — single source of truth for brand constants and copy.
 *
 * Compliance note: we HOLD CUSTOMER MONEY, and we ARE A BANK. Money recovered
 * on a case is credited to the account it belongs to, accounts hold balances
 * customers can withdraw from, and the owner confirmed on 2026-10-02 that
 * Solariem is a bank which also does asset recovery — not an "account
 * provider that is careful about the word bank". An earlier version of this
 * file said "Solariem is NOT a bank and is not authorised to take deposits".
 * That was false, and false in the one place a fraud victim is most likely to
 * check. Do not reintroduce it. Say what the business is.
 *
 * Two rules follow from that:
 *
 * 1. Being a bank does NOT license a regulatory claim. Do not write "FCA
 *    authorised", "PRA regulated", "licensed", "an e-money institution", "FSCS
 *    member", or invent a register number — and equally, do not write "not
 *    regulated" or "not authorised to take deposits". We publish no regulatory
 *    status until the exact permission and its regulator are confirmed in
 *    writing. Silence is honest; a guess is not. This is why
 *    SecurityCompliance.tsx says "we have no special access to anyone" rather
 *    than denying being a bank: the first is a true and useful warning, the
 *    second was the thing that had to go.
 *
 * 2. Still never describe the service as "guaranteed", "insured", "risk-free"
 *    or "protected", and never claim a regulator or law-enforcement
 *    connection. Those are precisely the markers the FTC, SEC, CFTC and FINRA
 *    use to warn people about fraudulent recovery firms, and a recovery firm
 *    that makes one loses the argument on every honest page it has.
 *
 * OPEN AND NEEDING AN ANSWER FROM THE OWNER: the FSCS / deposit-guarantee
 * wording. Roughly a dozen places say money held with us is not covered by any
 * deposit guarantee scheme. That was written as the conservative direction
 * while the business was described as not a bank. Now that it IS a bank, the
 * statement may be the opposite of the truth — a UK bank's eligible deposits
 * are normally inside the FSCS up to the published limit. Do not "fix" this by
 * asserting protection either: if we are not a member, claiming cover is a
 * serious misrepresentation, and we do not know which we are. Until the owner
 * confirms the membership position and the applicable limit, the existing
 * conservative wording stays. It is the only claim in this file that is
 * knowingly out of step with the rest, and it is flagged in
 * docs/launch-blockers.md rather than silently resolved.
 *
 * ON FEES — read before editing FEES or the fee copy.
 * The success fee statement below is accurate: it is charged only on money
 * that actually reaches the client. But do NOT turn it into a blanket promise
 * that no charge of any kind can ever arise, because the application does
 * raise account-level charges (an account may be restricted pending
 * verification, and clearing that restriction can carry a fee). The wording
 * used here is deliberately "no success fee unless money is returned, and
 * anything else is shown with its amount before you authorise it", which is
 * both true and still a strong claim. Restoring "you will never be asked to
 * pay a fee before work starts" would put a false statement in a contract.
 */

/* ------------------------------------------------------------------ */
/* Identity                                                            */
/* ------------------------------------------------------------------ */

/**
 * Canonical origin lives in ./env as SITE_URL, and is deliberately NOT
 * re-exported here.
 *
 * This module is imported by client components (Header, FAQSection,
 * dashboard/SupportSection) to read ORG. A re-export would drag ./env — and
 * therefore the "Configuration error" throw — into the browser bundle, where
 * `process.env.NODE_ENV` is inlined as "production" and a missing
 * NEXT_PUBLIC_* variable took the whole page down as a blank error screen
 * instead of failing the server where the mistake is fixable. That is not
 * hypothetical: it is what shipped, and it is what the launch gate now checks
 * for in scripts/check-bundle-env.mjs.
 *
 * Server-side code that needs the origin imports it directly:
 *   import { SITE_URL } from '@/lib/env';
 *
 * Do not add it back. ORG and the other exports below are plain literals and
 * must stay free of any environment dependency, so that importing this file
 * from a client component is always safe.
 */

export const ORG = {
  name: 'Solariem',
  /**
   * Registered entity name. Appears in the terms, privacy notice, disclaimer,
   * footer copyright line and the JSON-LD Organization node.
   *
   * NOTE ON THE WORD "BANK": this is the registered name, and the business
   * genuinely holds customer money in multi-currency accounts, so the name is
   * not decoration. We also run a multi-currency account business alongside
   * recovery. The legal pages therefore describe what we do rather than
   * asserting a regulatory status in either direction, and the terms and
   * disclaimer name the word "bank" out loud instead of hoping nobody notices
   * it. Do not "simplify" that sentence away, and do not reintroduce a
   * claim that we are, or are not, authorised to take deposits.
   */
  legalName: 'Solariem Trust Bank',
  tagline: 'Every asset, accounted for.',
  description:
    'Solariem provides multi-currency accounts and traces fraudulent transfers through the institutions involved. No success fee is charged unless money is actually returned to you.',
  foundingDate: '2020',
  /**
   * The address shown to visitors across the public site.
   *
   * Deliberately separate from SMTP_USER in .env.local, which is a Gmail
   * account used only to exercise notifications during development. Nothing
   * routes to this address yet — enquiries are delivered to ADMIN_EMAIL. The two
   * converge when the domain and business mailbox are provisioned.
   *
   * SPELLING: `solariemtrustbank`, matching ORG.legalName. This was raised
   * before the domain was registered because a transposed letter in a domain
   * is expensive to fix later, and `solarimtrustbank.com` is a
   * phishing-lookalike risk in a business whose entire value proposition is
   * that people can check who they are dealing with. Confirmed by the owner
   * 2026-09-28 as Solariem Trust Bank, so the address is correct as written.
   */
  email: 'info@solariemtrustbank.com',
  phone: '+1 800 555 0199',
  areaServed: ['GB', 'US', 'SG', 'AE'],
  addresses: [
    { city: 'London', country: 'United Kingdom', line: '1 Angel Court, London EC2R 7HJ' },
    { city: 'New York', country: 'United States', line: '200 Park Avenue, New York, NY 10166' },
    { city: 'Dubai', country: 'United Arab Emirates', line: 'Gate Village 7, DIFC, Dubai' },
  ],
} as const;

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

export type Service = {
  name: string;
  url: string;
  headline: string;
  description: string;
  body: string;
};

/**
 * Brand assets. One place to point at the logo, so a new mark is a one-file
 * change rather than an edit inside every email template.
 *
 * WHY THE EXISTENCE CHECK EXISTS. Email is the only surface where a missing
 * image cannot degrade gracefully on its own: a broken <img> in Gmail renders
 * as a torn-image icon in the header of a message we are asking someone to
 * trust with a banking password. So `emailLogoUrl` in ./email.ts tests for the
 * file and falls back to the text wordmark. Text is a downgrade; a broken image
 * is a credibility problem.
 *
 * TO INSTALL THE REAL LOGO: drop a PNG at the path below in `public/`. It must
 * be a PNG rather than an SVG because Outlook, Gmail and Yahoo all block or
 * mangle SVG in message bodies, and a logo that only renders in Apple Mail is
 * not a logo.
 *   - 2x the CSS size, so it stays sharp on a retina phone
 *   - transparent background
 *   - a mark that still reads at 32px tall, because that is what the header
 *     collapses to on a narrow screen
 * Nothing else needs editing. `npm run check:launch` will report the file as
 * missing until it is there.
 */
export const BRAND_ASSETS = {
  /** Path under /public. Resolved to an absolute URL at send time. */
  logoPath: '/brand/solariem-logo.png',
  /** Intrinsic size in CSS pixels; the PNG should be 2x this. */
  logoWidth: 168,
  logoHeight: 48,
  /** Alt text. The name, because that is all a logo communicates. */
  logoAlt: 'Solariem',
};

export const SERVICES: Service[] = [
  {
    name: 'Multi-currency accounts',
    url: '/banking',
    headline: 'One account, many currencies',
    description:
      'Hold money in several currencies, send it abroad, and keep it in one place.',
    body: 'Open an account and hold money in the currencies you actually use. Move it between them without leaving the platform, and see every movement on one statement. Money recovered on a case is credited to the account it belongs to, so recovered funds land in the same place as everything else you hold. Money you hold with us does not carry the deposit protection of a bank current account, so read the account agreement before you fund an account, and ask us anything in it that is unclear.',
  },
  {
    name: 'Asset recovery',
    url: '/asset-recovery',
    headline: 'Tracing money that was taken',
    description:
      'We trace where fraudulent payments went and act on them through the banks and courts involved.',
    body: 'When money leaves your account because of a scam, the first job is to establish exactly where it went and who received it. We work that out from transaction records, then take the next step: a recall request to the sending bank, a freeze application where one is available, or a claim through the courts. Some cases end in a full return, some in a partial one, and some recover nothing. We cannot promise a result before we have seen the evidence.',
  },
  {
    name: 'Case tracking',
    url: '/track-claim',
    headline: 'Follow your case',
    description: 'Check the current stage of a recovery case with the reference we gave you.',
    body: 'Every open case has a reference. Enter it to see the stage it has reached, what we are waiting on, and what we need from you. If a case has stalled, the reason is usually a document we could not obtain from a third party, and it will be listed there.',
  },
];

/* ------------------------------------------------------------------ */
/* Fees, timelines and terms — plain English, no hedging              */
/* ------------------------------------------------------------------ */

export const FEES = {
  /** Charged only on amounts actually received. */
  successRate: '15–25%',
  /**
   * Note there is deliberately no `upfront: 'none'` key. The application can
   * raise account-level charges, so a flat "no upfront fee" constant is a claim
   * the code cannot support. See the compliance note at the top of this file.
   */
  statement:
    'Opening an account is free, and we do not charge a recovery fee unless money is actually returned to you. When money comes back, we take ' +
    '15–25% of the amount that actually reached you, at the rate agreed in writing before the case begins. If nothing is returned, no success fee is due. ' +
    'The only other charges that can arise are account-level ones — for example, clearing a restriction on an account held for verification — and those are shown to you in the app with the amount before you authorise them.',
} as const;

/* ------------------------------------------------------------------ */
/* The fee SCHEDULE, in one place                                      */
/* ------------------------------------------------------------------ */

/**
 * Account pricing and recovery pricing, as data rather than as hand-written
 * rows in each page.
 *
 * WHY THIS EXISTS. Four surfaces used to state these numbers independently: the
 * /banking hero panel, the /banking "What it costs" table, the /asset-recovery
 * hero panel, and the FinalCTA panel on the homepage. They drifted - one page
 * said "Nothing", another "No charge", a third "Free", for what was meant to be
 * the same fact. "Keep them consistent across the pages" cannot be honoured by
 * four independent copies of a price list, so there is one list now and every
 * surface maps over it.
 *
 * `Free` and `£0` are deliberately not the same string, because they are not
 * the same claim. "£0" is a specific number for the specific thing being asked
 * about (a monthly minimum, a keeping-open charge). "Free" is used where the
 * whole action costs nothing. Collapsing them into one word loses exactly the
 * distinction the reader is checking for.
 *
 * THESE ARE PLACEHOLDERS AND MUST BE CONFIRMED BY THE OWNER BEFORE LAUNCH.
 * They are modelled on a plausible GBP-denominated multi-currency account, and
 * they are the sort of figure a customer will hold us to. If one is wrong, fix
 * it here and every page corrects itself - which is the entire point.
 *
 * The account holds several currencies, so GBP is stated as the base and the
 * per-currency equivalent is shown in the app before a transfer is confirmed.
 */
export const ACCOUNT_FEES: { label: string; amount: string }[] = [
  { label: 'To open an account', amount: 'Free' },
  { label: 'Monthly minimum', amount: '£0' },
  { label: 'To keep it open', amount: '£0' },
  { label: 'Money coming in', amount: 'Free' },
  { label: 'Sending within the UK and the EU', amount: 'Free' },
  { label: 'Sending outside those, per transfer', amount: '£6' },
  { label: 'Converting between currencies', amount: '0.4% of the amount' },
];

/**
 * Recovery-case pricing, kept apart from ACCOUNT_FEES because the two are a
 * different kind of contract: one is the schedule for holding money, the other
 * is a contingent percentage on an outcome. Merged into a single list, a "free
 * to open" row would sit next to a "15-25%" row and imply they are the same
 * kind of charge.
 *
 * The success fee references `FEES.successRate` rather than repeating the
 * string, so the one number that also appears in the legal pages cannot drift
 * from the one that appears in the panels.
 */
export const RECOVERY_FEES: { label: string; amount: string }[] = [
  { label: 'To start a case', amount: 'Free' },
  { label: 'While the case is open', amount: '£0' },
  {
    label: 'If funds come back to you',
    amount: FEES.successRate + ' of the amount that reached you',
  },
  { label: 'If nothing comes back to you', amount: 'No success fee is due' },
];

/**
 * The currency the figures above are quoted in. Rendered beside any fee table,
 * because a bare "£6" on a page about seven currencies reads as though it
 * applies to all seven equally.
 */
export const FEE_CURRENCY_NOTE =
  'Amounts are quoted in pounds sterling. What is charged in another currency is shown in the app before you confirm, together with the exchange rate.';

export const TIMELINE = [
  {
    step: 'You send us the details',
    body: 'Bank statements, transaction references, and any messages you received. We will tell you if something is missing.',
  },
  {
    step: 'We establish where the money went',
    body: 'We identify the receiving accounts and the institutions that hold them. This is the step that decides whether a case is worth pursuing.',
  },
  {
    step: 'We file with the institutions involved',
    body: 'Recall requests, freeze applications, and formal complaints are filed through the sending bank and the receiving institution.',
  },
  {
    step: 'We escalate through the courts if needed',
    body: 'Where an institution will not act on its own, we issue proceedings through counsel in the relevant jurisdiction.',
  },
  {
    step: 'Funds are returned and the fee is calculated',
    body: 'Your share is calculated on the amount that actually reached you, and the success fee is invoiced at that point. It is not charged earlier.',
  },
];

/* ------------------------------------------------------------------ */
/* FAQ — answer-first copy, phrased as the question                   */
/* ------------------------------------------------------------------ */

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'Can you guarantee that my money comes back?',
    a: 'No, and anyone who guarantees it is either mistaken or lying. What determines the outcome is who received your money, which institution holds it, and whether that institution will cooperate. We will tell you what we think the realistic outcome is after we have reviewed your documents, and we will put that in writing before you commit to anything.',
  },
  {
    q: 'What does it cost?',
    a: `Opening an account is free, and we do not charge a recovery fee unless money is actually returned to you. If money comes back we charge ${FEES.successRate} of the amount that actually reached you, at the rate agreed in writing before the case starts. If nothing is returned, no success fee is due. The only other charges that can arise are account-level ones, such as clearing a restriction on an account held for verification, and those are shown to you in the app with the amount before you authorise them.`,
  },
  {
    q: 'Are you a bank?',
    a: 'Solariem Trust Bank holds money for customers in multi-currency accounts, and money we recover for you is credited to the Solariem account it belongs to. Balances held with us are not covered by the FSCS, the FDIC, or any other deposit guarantee scheme, so treat a balance with us differently from money sitting in a bank current account. If you want to know which authorisations we actually hold, ask us directly and we will answer in writing rather than give you a marketing line.',
  },
  {
    q: 'Is my money insured?',
    a: 'No. There is no deposit guarantee or deposit insurance behind a balance held with us. Treat money held with Solariem differently from money in a bank current account. The account agreement sets out exactly what protection, if any, applies, and we will give you a copy before you fund an account.',
  },
  {
    q: 'How long does recovery take?',
    a: 'Most cases that succeed take between four and twelve months from the first filing. Cases that end in nothing usually end within three months, because the receiving institution confirms there is nothing to recover. A freeze order, if one is granted, is the single biggest factor in how fast money moves.',
  },
  {
    q: 'What do you need from me to start?',
    a: 'Bank statements covering the period of the fraud, the transaction references for each payment you made, any messages or emails from the people who took the money, and a short written account of what happened and when. Missing documents are the most common reason a case stalls, so send everything you have even if it seems irrelevant.',
  },
  {
    q: 'What if the money went to cryptocurrency?',
    a: 'Crypto transfers cannot be recalled the way a bank transfer can. What we can do is identify the wallet address that received the funds, work out which exchange or custodian it belongs to, and file a legal claim against that exchange. A chargeback does not exist on the blockchain side of a payment, so anyone offering one for a crypto transfer is describing something that is not possible.',
  },
  {
    q: 'Will you keep my case confidential?',
    a: 'We treat your case as confidential and we do not sell or share your details. But we will never ask you to keep a case secret from your own lawyer, your bank, or your family. Legitimate firms have nothing to hide from advisers, and a request to do so is a warning sign rather than a reassurance.',
  },
  {
    q: 'Do you work with regulators or law enforcement?',
    a: 'We are not affiliated with any regulator, police force, or government body, and we will never claim to have special access to them. We work through banks, exchanges, ombudsman schemes, and the courts. If a firm tells you it has contacts inside a regulator, that is not true.',
  },
  {
    q: 'Who can open an account?',
    a: 'We accept applicants from the United Kingdom, the United States, Singapore, and the United Arab Emirates. You must be at least 18 years old and pass identity verification. Some restricted jurisdictions cannot be served, and we will tell you if that applies to you.',
  },
];

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export const NAV = [
  { href: '/banking', label: 'Banking' },
  { href: '/asset-recovery', label: 'Asset recovery' },
  { href: '/about', label: 'About' },
  { href: '/track-claim', label: 'Track a case' },
  { href: '/blog', label: 'Journal' },
] as const;

export const FOOTER_LINKS = {
  Services: [
    { href: '/banking', label: 'Multi-currency accounts' },
    { href: '/asset-recovery', label: 'Asset recovery' },
    { href: '/track-claim', label: 'Track a case' },
  ],
  Company: [
    { href: '/about', label: 'About Solariem' },
    { href: '/blog', label: 'Journal' },
    { href: '/contact', label: 'Contact' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/disclaimer', label: 'Disclaimer' },
  ],
} as const;

export const SUCCESS_FEE = FEES;
