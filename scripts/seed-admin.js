// Admin and test user seeding script
// Run: node scripts/seed-admin.js
// Loads .env.local as well as .env, matching Next.js. Plain 'dotenv/config'
// only reads .env, so MONGODB_URI looked unset here while the app connected fine.
import './load-env.mjs';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banking_app';

if (!uri) {
  console.error('MONGODB_URI is not set in .env');
  process.exit(1);
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'support@solariem.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026!';
const ADMIN_PIN = process.env.ADMIN_PIN || '1234';

const UK_EMAIL = process.env.UK_EMAIL || 'james@solariem.com';
const UK_PASSWORD = process.env.UK_PASSWORD || 'Password@123!';
const UK_PIN = process.env.UK_PIN || '5678';

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

async function seedUser({ email, password, pin, username, firstName, lastName, displayName, country, state, city, zip, phone, currency, isAdmin }) {
  const client = new MongoClient(uri, {
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const existing = await users.findOne({ email });
    if (existing) {
      console.log(`User already exists: ${existing.email}`);
      console.log('If you need to reset credentials, delete this user and re-run.');
      return existing;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const now = new Date();
    const userCode = await uniqueUserCode(users);

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
      totalInvested: 0,
      currentInvestment: 0,
      totalDeposit: 0,
      totalWithdraw: 0,
      referralEarnings: 0,
      balances: { main: 0, investment: 0, referral: 0, total: 0 },
      kycStatus: 'verified',
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      updatedBy: 'system',
      activityLog: [{ action: 'Account created', timestamp: now.toISOString() }],
    };

    const result = await users.insertOne({ ...user, _id: new ObjectId() });
    console.log(`✅ Created: ${email} (${currency}, ${country})`);
    console.log(`   Password: ${password}`);
    console.log(`   Transaction PIN: ${pin}`);
    console.log(`   User Code: ${userCode}`);
    console.log(`   _id: ${result.insertedId.toString()}`);
    return user;
  } catch (error) {
    console.error(`❌ Error seeding ${email}:`, error);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

const admin = await seedUser({
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

const ukUser = await seedUser({
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

console.log('\nCredentials:');
if (admin) console.log(`  Admin:  ${admin.email} / ${ADMIN_PASSWORD}`);
if (ukUser) console.log(`  UK:     ${ukUser.email} / ${UK_PASSWORD} / PIN ${UK_PIN}`);

