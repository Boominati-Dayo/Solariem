// Create the first admin account on a fresh database.
//
//   node scripts/seed-admin.js                    admin only
//   node scripts/seed-admin.js --with-test-user   also a non-admin test account
//
// Idempotent: an existing account with the same email is left untouched, so
// re-running is safe.
//
// There is deliberately NO default password. The previous version fell back to
// a literal `Admin@2026!` with PIN `1234`, which meant any install that forgot
// to set ADMIN_PASSWORD got an admin account with a credential that is public
// in this file. It now refuses to run unless ADMIN_PASSWORD and ADMIN_PIN are
// set explicitly in .env.local.
import './load-env.mjs';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banking_app';

if (!uri) {
  console.error('MONGODB_URI is not set in .env.local');
  process.exit(1);
}

// --- required credentials, no fallbacks -----------------------------------
const missing = ['ADMIN_EMAIL', 'ADMIN_PASSWORD', 'ADMIN_PIN'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error('Refusing to seed. Missing from .env.local: ' + missing.join(', '));
  console.error('');
  console.error('Set a strong ADMIN_PASSWORD and a 4-digit ADMIN_PIN first.');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_PIN = process.env.ADMIN_PIN;

const wantsTestUser = process.argv.includes('--with-test-user');
// The test account is opt-in because its password would otherwise be a second
// known credential on a live database.
const UK_EMAIL = process.env.UK_EMAIL || 'james@solariem.com';
const UK_PASSWORD = process.env.UK_PASSWORD;
const UK_PIN = process.env.UK_PIN;

if (wantsTestUser && (!UK_PASSWORD || !UK_PIN)) {
  console.error('--with-test-user needs UK_PASSWORD and UK_PIN in .env.local.');
  process.exit(1);
}

function generateUserCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

async function uniqueUserCode(users) {
  let userCode = generateUserCode();
  while (await users.findOne({ userCode })) {
    userCode = generateUserCode();
  }
  return userCode;
}

async function seedUser(db, { email, password, pin, username, firstName, lastName, displayName, country, state, city, zip, phone, currency, isAdmin }) {
  const users = db.collection('users');

  const existing = await users.findOne({ email });
  if (existing) {
    console.log(`- already exists, left unchanged: ${existing.email}`);
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const now = new Date();
  const userCode = await uniqueUserCode(users);

  // Field set matches the User interface in src/lib/auth/user.ts. The previous
  // version of this script still wrote totalInvested, currentInvestment and
  // balances.investment, which were removed from the model when the old
  // investment template was discarded. Writing them here would have recreated
  // the discarded fields in every freshly seeded database.
  const user = {
    email,
    username,
    password: hashedPassword,
    transactionPin: pin,
    firstName,
    lastName,
    displayName,
    accountType: isAdmin ? 'admin' : 'individual',
    emailVerified: true,
    userCode,
    isAdmin: !!isAdmin,
    isActive: true,
    phone,
    country,
    state,
    city,
    zip,
    currency,
    totalDeposit: 0,
    totalWithdraw: 0,
    referralEarnings: 0,
    balances: { main: 0, referral: 0, total: 0 },
    kycStatus: 'verified',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    updatedBy: 'system',
    activityLog: [{ action: 'Account created', timestamp: now.toISOString() }],
  };

  const result = await users.insertOne({ ...user, _id: new ObjectId() });

  // Create the indexes the application relies on. Without these, a lookup by
  // email is a collection scan and duplicate accounts become possible.
  try {
    await users.createIndex({ email: 1 }, { unique: true });
    await users.createIndex({ userCode: 1 }, { unique: true });
  } catch (e) {
    console.log('  (index creation: ' + e.message.split('\n')[0] + ')');
  }

  console.log(`+ created: ${email}  [${currency}, ${country}]`);
  console.log(`    _id      : ${result.insertedId.toString()}`);
  console.log(`    user code: ${userCode}`);
  console.log(`    password : ${password}`);
  console.log(`    PIN      : ${pin}`);
  return { email, password, pin };
}

const client = new MongoClient(uri, { connectTimeoutMS: 60000, socketTimeoutMS: 60000 });
try {
  await client.connect();
  const db = client.db(dbName);

  console.log('Seeding into: ' + dbName);
  console.log('');

  const seeded = [];
  const admin = await seedUser(db, {
    email: ADMIN_EMAIL.toLowerCase(),
    password: ADMIN_PASSWORD,
    pin: ADMIN_PIN,
    username: 'admin',
    firstName: 'Solariem',
    lastName: 'Admin',
    displayName: 'Solariem Admin',
    country: 'GB',
    state: 'London',
    city: 'London',
    zip: 'SW1A 1AA',
    phone: '+44 20 7946 0958',
    currency: 'USD',
    isAdmin: true,
  });
  if (admin) seeded.push(['Admin', admin]);

  if (wantsTestUser) {
    const uk = await seedUser(db, {
      email: UK_EMAIL.toLowerCase(),
      password: UK_PASSWORD,
      pin: UK_PIN,
      username: 'jameswilliams',
      firstName: 'James',
      lastName: 'Williams',
      displayName: 'James Williams',
      country: 'GB',
      state: 'England',
      city: 'London',
      zip: 'EC2A 4BX',
      phone: '+44 20 7946 0811',
      currency: 'GBP',
      isAdmin: false,
    });
    if (uk) seeded.push(['Test user', uk]);
  }

  console.log('');
  if (seeded.length) {
    console.log('Credentials for anything just created:');
    for (const [label, u] of seeded) {
      console.log(`  ${label}: ${u.email} / ${u.password} / PIN ${u.pin}`);
    }
    console.log('');
    console.log('These live in .env.local. Change the password after first sign-in.');
  }
} catch (error) {
  console.error('Seeding failed:', error);
  process.exitCode = 1;
} finally {
  await client.close();
}
