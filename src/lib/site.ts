/**
 * SOLARIEM — single source of truth for brand constants and copy.
 *
 * Compliance note: Solariem is NOT a bank and is not authorised to take
 * deposits. Never describe the service as "guaranteed", "insured", "risk-free"
 * or "protected", and never claim a regulator or law-enforcement connection.
 * Those are precisely the markers the FTC, SEC, CFTC and FINRA use to warn
 * people about fraudulent recovery firms.
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
 * Canonical origin. Every canonical URL, Open Graph tag, sitemap entry and
 * JSON-LD @id derives from this value, so it must never point at a domain we do
 * not control.
 *
 * Delegated to SITE_URL in ./env, which refuses to serve with a placeholder in
 * production. Previously this was `|| 'http://localhost:3000'`, which meant a
 * deploy that forgot the variable published localhost as the canonical origin
 * for the entire site and looked healthy doing it.
 */
export { SITE_URL } from './env';

export const ORG = {
  name: 'Solariem',
  legalName: 'Solariem',
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
   * SPELLING: `solarimtrustbank` is not `solariem`. It is as specified, but the
   * brand is Solariem everywhere else, and a transposed letter in a domain is
   * expensive to fix later — it is a phishing-lookalike risk in a business whose
   * entire value proposition is that people can check who they are dealing with.
   * Worth confirming before the domain is registered.
   */
  email: 'info@solarimtrustbank.com',
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

export const SERVICES: Service[] = [
  {
    name: 'Multi-currency accounts',
    url: '/banking',
    headline: 'One account, many currencies',
    description:
      'Hold money in several currencies, send it abroad, and keep it in one place.',
    body: 'Open an account and hold money in the currencies you actually use. Move it between them without leaving the platform, and see every movement on one statement. Solariem is not a bank, so money you hold with us does not carry the deposit protection that a bank account does. Read the account agreement before you fund an account, and ask us anything in it that is unclear.',
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
    a: 'No. Solariem is a company that provides multi-currency accounts and asset recovery services. It is not a bank and is not authorised to take deposits. Money you hold with us is not covered by the FSCS, the FDIC, or any other deposit guarantee scheme.',
  },
  {
    q: 'Is my money insured?',
    a: 'No. Because we are not a bank and do not take deposits, there is no deposit guarantee or deposit insurance behind a balance held with us. Treat money held with Solariem differently from money in a bank current account. The account agreement sets out exactly what protection, if any, applies, and we will give you a copy before you fund an account.',
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
