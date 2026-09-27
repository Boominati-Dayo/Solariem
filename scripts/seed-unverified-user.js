// Seed a test user with KYC NOT verified
// Run: node scripts/seed-unverified-user.js
// Loads .env.local as well as .env, matching Next.js. Plain 'dotenv/config'
// only reads .env, so MONGODB_URI looked unset here while the app connected fine.
import './load-env.mjs';
import { config } from 'dotenv';
config({ path: '.env.local' });
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banking_app';

if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

const EMAIL = (process.env.UNVERIFIED_EMAIL || 'sam@solariem.com').toLowerCase();
const PASSWORD = process.env.UNVERIFIED_PASSWORD || 'Sam@2026!';
const PIN = process.env.UNVERIFIED_PIN || '4321';

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
    totalInvested: 0,
    currentInvestment: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    referralEarnings: 0,
    balances: { main: 250, investment: 0, referral: 0, total: 250 },
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
