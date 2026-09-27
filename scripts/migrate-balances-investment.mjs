/**
 * Resolve `balances.investment` on existing user documents.
 *
 *   node scripts/migrate-balances-investment.mjs            # dry run, prints a report
 *   node scripts/migrate-balances-investment.mjs --merge    # fold into balances.main
 *   node scripts/migrate-balances-investment.mjs --writeoff # drop it, change no balance
 *   ... either with --apply to actually write (default is a dry run)
 *
 * WHY THIS EXISTS
 * The investment-plan machinery has been removed: `balances.investment` is
 * gone from the `User` type, and `balances.total` is now defined as
 * `main + referral` everywhere it is recomputed. Documents written before that
 * still carry `balances.investment`, and since nothing reads it any more, those
 * users are currently seeing a total that is too low by exactly that amount.
 *
 * WHY IT IS NOT AUTOMATIC
 * Only the business knows whether that figure was ever real money — i.e.
 * whether it was a genuine balance a client paid in, or a synthetic number
 * produced by the old plan machinery. Guessing wrong either inflates a real
 * balance out of nothing, or silently takes money off a client who paid it in.
 * So this script reports first, backs up second, and only writes on an
 * explicit --apply.
 */
// Loads .env.local as well as .env, matching Next.js. Plain 'dotenv/config'
// only reads .env, so MONGODB_URI looked unset here while the app connected fine.
import './load-env.mjs';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banking_app';

const argv = new Set(process.argv.slice(2));
const apply = argv.has('--apply');
const merge = argv.has('--merge');
const writeOff = argv.has('--writeoff');

if (merge && writeOff) {
  console.error('Pass either --merge or --writeoff, not both.');
  console.error('  --merge    add balances.investment into balances.main, then drop the field');
  console.error('  --writeoff drop the field and leave every balance exactly as it is');
  process.exit(1);
}

// --apply is the only thing that writes, so it must not be reachable without
// saying which of the two very different outcomes is intended. Silently
// defaulting to one of them here is how real money disappears.
if (apply && !merge && !writeOff) {
  console.error('--apply needs a mode. Add --merge or --writeoff.');
  console.error('Run without --apply to see what is affected and what each mode would do.');
  process.exit(1);
}

if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env first.');
  process.exit(1);
}

const BACKUP = 'balances_investment_backup';

/** Balance fields that may be missing or non-numeric on older documents. */
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

const money = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  const affected = await users
    .find({ 'balances.investment': { $exists: true, $ne: 0 } }, { projection: { email: 1, username: 1, balances: 1 } })
    .toArray();

  const presentAtAll = await users.countDocuments({ 'balances.investment': { $exists: true } });

  console.log(`\nDatabase: ${dbName}`);
  console.log(`Documents carrying balances.investment at all : ${presentAtAll}`);
  console.log(`Documents with a NON-ZERO balances.investment   : ${affected.length}\n`);

  if (affected.length === 0) {
    console.log('Nothing to do. No user has a non-zero investment balance.\n');
    await client.close();
    return;
  }

  const rows = affected.map((u) => ({
    email: u.email || '(none)',
    username: u.username || '(none)',
    investment: num(u.balances?.investment),
    main: num(u.balances?.main),
    referral: num(u.balances?.referral),
  }));

  const total = rows.reduce((s, r) => s + r.investment, 0);
  const positive = rows.filter((r) => r.investment > 0);
  const negative = rows.filter((r) => r.investment < 0);

  console.log(`  Total value held in balances.investment : ${money(total)}`);
  console.log(`  Positive balances                        : ${positive.length}`);
  console.log(`  Negative balances                        : ${negative.length}`);
  console.log(`  Largest single balance                   : ${money(
    rows.reduce((m, r) => Math.max(m, r.investment), 0),
  )}\n`);

  console.log('  email                          investment        main');
  console.log('  ' + '-'.repeat(64));
  for (const r of rows.sort((a, b) => b.investment - a.investment).slice(0, 25)) {
    console.log(
      `  ${r.email.slice(0, 30).padEnd(30)} ${money(r.investment).padStart(12)} ${money(r.main).padStart(12)}`,
    );
  }
  if (rows.length > 25) console.log(`  ... and ${rows.length - 25} more`);
  console.log('');

  if (!apply) {
    console.log('DRY RUN. No documents were modified.\n');
    console.log('Decide which of these is true of the figure above, then re-run:');
    console.log('  --merge --apply    it was real money clients paid in; preserve it');
    console.log('  --writeoff --apply it was synthetic output of the removed plan machinery\n');
    console.log('Read the balance against a payment record before choosing. If it cannot be');
    console.log('traced to an incoming transaction, it was synthetic — write it off.\n');
    await client.close();
    return;
  }

  // Back up before touching anything. Without this the operation is one-way.
  const stamp = new Date().toISOString();
  if ((await db.collection(BACKUP).countDocuments({})) === 0) {
    await db.collection(BACKUP).insertMany(
      affected.map((u) => ({
        userId: u._id,
        email: u.email,
        balancesAtMigration: u.balances,
        migratedAt: new Date(),
      })),
    );
    console.log(`Backed up ${affected.length} documents to "${BACKUP}".`);
  } else {
    console.log(`"${BACKUP}" already exists — leaving the existing backup untouched.`);
  }

  if (merge) {
    // $set main to main + investment and total to main + referral in one pass, so
    // the document is never briefly inconsistent with itself.
    const result = await users.updateMany(
      { _id: { $in: affected.map((u) => u._id) } },
      [
        {
          $set: {
            'balances.main': {
              $add: [{ $ifNull: ['$balances.main', 0] }, { $ifNull: ['$balances.investment', 0] }],
            },
            'balances.referral': { $ifNull: ['$balances.referral', 0] },
            migratedBalancesInvestment: stamp,
          },
        },
        { $set: { 'balances.total': { $add: ['$balances.main', '$balances.referral'] } } },
        { $unset: 'balances.investment' },
      ],
    );
    console.log(`\n--merge: updated ${result.modifiedCount} documents.`);
    console.log(`${money(total)} folded into balances.main, then balances.investment removed.`);
  } else {
    // Write-off still has to fix `total`, because it was left inconsistent by
    // whatever wrote it last. Recompute from the surviving fields only.
    const result = await users.updateMany(
      { _id: { $in: affected.map((u) => u._id) } },
      [
        { $set: { 'balances.referral': { $ifNull: ['$balances.referral', 0] } } },
        { $set: { 'balances.total': { $add: ['$balances.main', '$balances.referral'] } } },
        { $unset: 'balances.investment' },
      ],
    );
    console.log(`\n--writeoff: updated ${result.modifiedCount} documents.`);
    console.log('balances.main untouched, balances.investment removed, balances.total recomputed');
    console.log(`as main + referral. ${money(total)} has been dropped from display only.`);
    console.log('\nIf that was real client money, restore it with:');
    console.log(`  db.${BACKUP}.find().forEach(d => db.users.updateOne({_id: d.userId}, {$set: {balances: d.balancesAtMigration}}))`);
  }

  await client.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
