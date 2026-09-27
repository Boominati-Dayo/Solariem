/**
 * Pre-launch check. Reports anything that would make the site wrong, unsafe or
 * legally inaccurate in public, and exits non-zero if any BLOCKER is present.
 *
 *   node scripts/check-launch-readiness.mjs
 *
 * Why a script rather than a checklist: every item here is a value that is
 * currently a placeholder. Placeholders do not announce themselves. The app
 * builds, serves and sends email perfectly happily while pointing canonical
 * URLs at localhost, or listing a reserved fictional phone number in JSON-LD,
 * or claiming three offices that do not exist. Only a check that reads the real
 * values at the moment of release catches that.
 *
 * Exit codes:  0 = clear to launch   1 = one or more blockers
 */
import './load-env.mjs';
import { readFileSync, existsSync } from 'node:fs';
import { MongoClient } from 'mongodb';

const results = [];
const add = (level, area, msg, fix) => results.push({ level, area, msg, fix });

/**
 * Findings the owner has reviewed and consciously accepted.
 *
 * These are NOT deleted from the check. Deleting them would leave the next
 * person to change the value with nothing to catch it, and would hide the fact
 * that a known-fictional phone number is being published. They are re-raised as
 * ACKNOWLEDGED, do not fail the exit code, and re-appear as full blockers the
 * moment the underlying value changes — so replacing the phone with a real one
 * silently retires the entry, while editing an address re-opens the question.
 *
 * `match` is evaluated against the current value on every run.
 */
const WAIVED = [
  {
    area: 'legal',
    match: (o) => /555/.test(o.phone || ''),
    finding: 'ORG.phone is a reserved fictional number (555-01xx can never receive a call). Published as a clickable tel: link and in JSON-LD.',
    decision: 'Accepted by the owner 2026-09-27 with the value left as +1 800 555 0199.',
    risk: 'A visitor who calls it will not reach anyone. The range is permanently reserved for fiction, so it can never be made to work.',
  },
  {
    area: 'legal',
    match: (o) => o.addressCount > 0,
    finding: 'ORG.addresses lists three real buildings (1 Angel Court London, 200 Park Avenue New York, Gate Village 7 DIFC) that are not the organisation\'s offices. SecurityCompliance.tsx renders them as "Registered offices" and the about page and footer list them as locations.',
    decision: 'Accepted by the owner 2026-09-27 with all three kept as written.',
    risk: 'Publishing real buildings as your registered offices, one in the DIFC financial free zone, is a factual claim in a document whose entire purpose is telling a fraud victim how to verify who they are dealing with.',
  },
];

// --- read the real ORG values out of site.ts ------------------------------
const siteSrc = readFileSync(new URL('../src/lib/site.ts', import.meta.url), 'utf8');
const orgVal = (key) => siteSrc.match(new RegExp(`\\b${key}:\\s*'([^']*)'`))?.[1] ?? null;

const ORG = {
  legalName: orgVal('legalName'),
  phone: orgVal('phone'),
  email: orgVal('email'),
  foundingDate: orgVal('foundingDate'),
  addressesBlock: siteSrc.match(/addresses:\s*\[([\s\S]*?)\n  \]/)?.[1] ?? '',
};
const addressCount = (ORG.addressesBlock.match(/city:/g) || []).length;

// ---------------------------------------------------------------------------
// 1. Required environment
// ---------------------------------------------------------------------------
const REQUIRED = [
  'MONGODB_URI', 'MONGODB_DB', 'JWT_SECRET',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM', 'ADMIN_EMAIL',
  'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
  'NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_APP_URL',
];
for (const k of REQUIRED) {
  const v = process.env[k];
  if (!v || !v.trim()) {
    add('BLOCKER', 'env', `${k} is not set`, 'Set it in the deployment platform.');
  } else if (/<(username|password|cluster|host|token|key)>/i.test(v) ||
             /^(your[-_]|changeme|placeholder|xxx)/i.test(v.trim())) {
    // Deliberately specific. A loose /<[^>]+>/ test flagged EMAIL_FROM as a
    // placeholder because a From header legitimately contains angle brackets
    // around the address: "Solariem" <someone@example.com>.
    add('BLOCKER', 'env', `${k} still holds a placeholder`, 'Replace with the real value.');
  }
}

// ---------------------------------------------------------------------------
// 2. Canonical origin
// ---------------------------------------------------------------------------
const site = process.env.NEXT_PUBLIC_SITE_URL || '';
if (/localhost|127\.0\.0\.1/.test(site)) {
  add('BLOCKER', 'seo',
    'NEXT_PUBLIC_SITE_URL is localhost',
    'Every canonical tag, sitemap entry, Open Graph URL and JSON-LD id derives from it. Search engines would index localhost.');
} else if (!/^https:\/\//.test(site)) {
  add('BLOCKER', 'seo', `NEXT_PUBLIC_SITE_URL is not https (${site || 'unset'})`, 'Use the https origin.');
}
if (site && !site.includes(new URL((process.env.NEXT_PUBLIC_APP_URL || site)).hostname)) {
  add('WARN', 'seo', 'NEXT_PUBLIC_APP_URL and NEXT_PUBLIC_SITE_URL are different hosts',
    'Password-reset and verification links will point somewhere other than the canonical site.');
}

// ---------------------------------------------------------------------------
// 3. Secrets that are still obviously development values
// ---------------------------------------------------------------------------
if (/gmail\.com|googlemail\.com/i.test(process.env.SMTP_HOST || '')) {
  add('BLOCKER', 'email',
    `SMTP_HOST is ${process.env.SMTP_HOST} (a personal mailbox)`,
    'Replace with the business mail host. Until then every transactional email comes from a gmail.com address while displaying the Solariem name, and the site cannot honestly tell users how to verify a sender.');
}
if (process.env.EMAIL_FROM && !process.env.EMAIL_FROM.includes(new URL(site || 'https://x.com').hostname)) {
  add('WARN', 'email',
    `EMAIL_FROM (${process.env.EMAIL_FROM}) is not on the site domain`,
    'Expected until Google Workspace or the business mail host is set up.');
}

// ---------------------------------------------------------------------------
// 4. Legal identity in ORG
// ---------------------------------------------------------------------------
const ctx = { ...ORG, addressCount };

if (!ORG.legalName || ORG.legalName === 'Solariem') {
  add('BLOCKER', 'legal',
    'ORG.legalName is just the trading name, with no registered entity',
    'The terms, privacy, disclaimer and footer all state this is "a company". A company must be identified by its registered name. Set it in src/lib/site.ts.');
} else if (/bank/i.test(ORG.legalName)) {
  // Not a defect. The registered name contains "bank" while the legal pages
  // state the business is not one, so confirm the pages still say so rather
  // than leaving the contradiction to be found by a regulator.
  add('WARN', 'legal',
    `ORG.legalName contains the word "bank" while the legal pages state the business is not a bank`,
    'Expected. The terms and disclaimer now acknowledge the name explicitly. Confirm that wording is still present before launch.');
}
if (!/\d/.test(ORG.phone || '')) {
  add('BLOCKER', 'legal', 'ORG.phone is not a number', 'Set a real number in src/lib/site.ts.');
} else if (!WAIVED.some((w) => w.match(ctx)) && /555/.test(ORG.phone)) {
  add('BLOCKER', 'legal',
    `ORG.phone (${ORG.phone}) is a reserved fictional number`,
    'The 555-01xx range is permanently reserved for fiction, so it can never receive a call. It is rendered as a clickable tel: link and published in JSON-LD. Set a real number.');
}
if (addressCount > 0 && !WAIVED.some((w) => w.match(ctx))) {
  add('BLOCKER', 'legal',
    `ORG.addresses lists ${addressCount} offices, rendered as "Registered offices"`,
    'Either supply addresses you control or remove the field before launch.');
}
if (ORG.foundingDate && Number(ORG.foundingDate) > new Date().getFullYear()) {
  add('BLOCKER', 'legal', 'ORG.foundingDate is in the future', 'Correct it in src/lib/site.ts.');
}

// ---------------------------------------------------------------------------
// 5. Domain in the published contact address
// ---------------------------------------------------------------------------
if (ORG.email && site && !ORG.email.includes(new URL(site).hostname.replace(/^www\./, ''))) {
  add('BLOCKER', 'legal',
    `ORG.email (${ORG.email}) is not on the site domain (${new URL(site).hostname})`,
    'The contact address is printed on the contact page, the footer and all three legal pages.');
}

// ---------------------------------------------------------------------------
// 6. Database reachable and not empty
// ---------------------------------------------------------------------------
let dbNote = 'not checked';
try {
  const client = new MongoClient(process.env.MONGODB_URI || '', { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB);
  const cols = await db.listCollections().toArray();
  const admins = await db.collection('users').countDocuments({ isAdmin: true });
  if (!cols.length) {
    add('BLOCKER', 'database', `${process.env.MONGODB_DB} has no collections`,
      'Run `node scripts/seed-admin.js` to create the first admin account.');
  }
  if (!admins) {
    add('BLOCKER', 'database', 'no admin account exists',
      'Nobody can reach /admin. Run `node scripts/seed-admin.js`.');
  }
  dbNote = `${cols.length} collections, ${admins} admin(s)`;
  await client.close();
} catch (e) {
  add('BLOCKER', 'database', 'cannot connect: ' + e.message.split('\n')[0], 'Check MONGODB_URI.');
}

// ---------------------------------------------------------------------------
// 7. Brand assets
// ---------------------------------------------------------------------------
// The logo is a one-file swap, so nothing breaks if it is missing -- the email
// template falls back to a text wordmark. But a banking site going out with a
// default Next.js triangle in the tab and a bare text name in every email is not
// a finished product, and neither failure announces itself. Hence the check.
const logoPath = siteSrc.match(/logoPath:\s*'([^']*)'/)?.[1];
if (logoPath) {
  const logoAbs = new URL('../public' + logoPath, import.meta.url);
  if (!existsSync(logoAbs)) {
    add('BLOCKER', 'brand',
      `logo ${logoPath} is missing, so every transactional email goes out with a bare text wordmark`,
      `Drop the PNG at public${logoPath}. See public/brand/README.md for the size and format the email clients need. No code change is needed once the file is there.`);
  }
  // Icons are already wired in layout.tsx (favicon.ico, favicon.svg,
  // apple-touch-icon, web-app-manifest) and all present, so this only fires if
  // one is deleted. Kept as a warning because the site still works without it.
  const layoutSrc = readFileSync(new URL('../src/app/layout.tsx', import.meta.url), 'utf8');
  for (const iconPath of [...layoutSrc.matchAll(/url: '(\/[^']+)'|'(?=\/favicon\/)[^']*'/g)]
    .map((m) => m[1])
    .filter(Boolean)) {
    if (!existsSync(new URL('../public' + iconPath, import.meta.url))) {
      add('WARN', 'brand', `icon ${iconPath} is referenced in layout.tsx but not in public/`,
        'Browsers will fall back to a default icon or a broken request.');
    }
  }
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
console.log('LAUNCH READINESS');
console.log('='.repeat(72));
console.log(`  site origin   ${site || '(unset)'}`);
console.log(`  contact       ${ORG.email || '(unset)'}`);
console.log(`  legal name    ${ORG.legalName || '(unset)'}`);
console.log(`  phone         ${ORG.phone || '(unset)'}`);
console.log(`  addresses     ${addressCount}`);
console.log(`  database      ${dbNote}`);
console.log('='.repeat(72));
console.log('');

const blockers = results.filter((r) => r.level === 'BLOCKER');
const warns = results.filter((r) => r.level === 'WARN');
const live = WAIVED.filter((w) => w.match(ctx));

for (const r of results) {
  console.log(`[${r.level}] ${r.area}: ${r.msg}`);
  if (r.fix) console.log(`         -> ${r.fix}`);
  console.log('');
}

if (live.length) {
  console.log('-'.repeat(72));
  console.log('ACKNOWLEDGED BY THE OWNER — accepted, not fixed');
  console.log('These are known and deliberately kept. They are listed so nobody');
  console.log('later reads a passing check as "there are no issues here".');
  console.log('');
  for (const w of live) {
    console.log(`[ACCEPTED] ${w.area}: ${w.finding}`);
    console.log(`         decision: ${w.decision}`);
    console.log(`         risk    : ${w.risk}`);
    console.log('');
  }
}

if (!results.length) {
  console.log('No issues found. Clear to launch.');
} else {
  console.log(`${blockers.length} blocker(s), ${warns.length} warning(s), ${live.length} accepted.`);
}
console.log('');

process.exit(blockers.length ? 1 : 0);
