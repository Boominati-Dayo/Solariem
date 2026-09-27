// Seed a test user with KYC NOT verified
// Run: node scripts/seed-unverified-user.js
// Loads .env.local as well as .env, matching Next.js. Plain 'dotenv/config'
// only reads .env, so MONGODB_URI looked unset here while the app connected fine.
import './load-env.mjs';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

// No default credentials. This script previously fell back to the literal
// 'Sam@2026!' with PIN '4321', so running it on a fresh database created a
// real loginable account with a credential published in this file. It now
// refuses to run unless all three are set explicitly in .env.local.
const missing = ['UNVERIFIED_EMAIL', 'UNVERIFIED_PASSWORD', 'UNVERIFIED_PIN'].filter(
  (k) => !process.env[k]
);
if (missing.length) {
  console.error('Refusing to seed. Missing from .env.local: ' + missing.join(', '));
  console.error('');
  console.error('This script creates a loginable account, so it will not invent a');
  console.error('password. Set UNVERIFIED_EMAIL, UNVERIFIED_PASSWORD and');
  console.error('UNVERIFIED_PIN first, or delete the script if it is not needed.');
  process.exit(1);
}

const EMAIL = process.env.UNVERIFIED_EMAIL.toLowerCase();
const PASSWORD = process.env.UNVERIFIED_PASSWORD;
const PIN = process.env.UNVERIFIED_PIN;

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

const client = new MongoClient(uri, {
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
});

try {
  await client.connect();
  const db = client.db(dbName);
  const users = db.collection('users');

  const existing = await users.findOne({ email: EMAIL });
  if (existing) {
    console.log(`User already exists: ${existing.email}`);
    console.log('KYC status:', existing.kycStatus);
    console.log('If you need to reset credentials, delete this user and re-run.');
    console.log('\nCredentials:');
    console.log(`  Email:    ${existing.email}`);
    console.log(`  Password: ${PASSWORD}`);
    console.log(`  PIN:      ${PIN}`);
    console.log(`  UserCode: ${existing.userCode}`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(PASSWORD, 12);
  const now = new Date();
  const userCode = await uniqueUserCode(users);

  const user = {
    email: EMAIL,
    username: 'samthompson',
    password: hashedPassword,
    transactionPin: PIN,
    firstName: 'Sam',
    lastName: 'Thompson',
    displayName: 'Sam Thompson',
    accountType: 'individual',
    emailVerified: true,
    userCode,
    isAdmin: false,
    isActive: true,
    phone: '+1 415 555 0182',
    country: 'US',
    state: 'California',
    city: 'San Francisco',
    zip: '94103',
    currency: 'USD',
    totalDeposit: 0,
    totalWithdraw: 0,
    referralEarnings: 0,
    // Field set matches the User interface in src/lib/auth/user.ts, which has
    // no investment balance. The previous version of this script still wrote
    // totalInvested, currentInvestment and balances.investment.
    balances: { main: 250, referral: 0, total: 250 },
    kycStatus: 'unverified',
    kycDocuments: null,
    kycSubmittedAt: null,
    kycVerifiedAt: null,
    kycRejectionReason: null,
    isAccountBlocked: false,
    isAccountRestricted: false,
    accountBlockReason: null,
    accountUnblockFee: 0,
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now,
    updatedBy: 'system',
    activityLog: [{ action: 'Account created', timestamp: now.toISOString() }],
  };

  const result = await users.insertOne({ ...user, _id: new ObjectId() });

  console.log(`✅ Created unverified-KYC user: ${EMAIL}`);
  console.log('\nCredentials:');
  console.log(`  Email:    ${EMAIL}`);
  console.log(`  Password: ${PASSWORD}`);
  console.log(`  PIN:      ${PIN}`);
  console.log(`  UserCode: ${userCode}`);
  console.log(`  _id:      ${result.insertedId.toString()}`);
  console.log(`  Currency: USD`);
  console.log(`  Balance:  250 USD (so they can test withdrawals)`);
  console.log(`  KYC:      unverified (cannot withdraw until verified)`);
} catch (error) {
  console.error('❌ Error seeding user:', error);
  process.exitCode = 1;
} finally {
  await client.close();
}
