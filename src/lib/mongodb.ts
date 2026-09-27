import { MongoClient, ServerApiVersion } from 'mongodb';
import { requireEnv, describeConfig } from './env';

// No fallback for the database name in production. It previously defaulted to
// 'banking_app', a leftover from the original template, so a missing MONGODB_DB
// would have quietly pointed the app at a differently-named database. The dev
// fallback below is only reached when the variable is genuinely unset, and
// requireEnv() throws instead in production.
const dbName = requireEnv('MONGODB_DB', process.env.MONGODB_DB, 'Banking-Refund');

let client: MongoClient | null = null;

function getClient(): MongoClient {
  const uri = requireEnv('MONGODB_URI', process.env.MONGODB_URI);
  if (!client) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      retryWrites: true,
    });
  }
  return client;
}

let configLogged = false;

export async function connectToDatabase() {
  try {
    const c = getClient();
    const db = c.db(dbName);
    if (!configLogged) {
      configLogged = true;
      // Printed once, and never a secret. Worth having in the platform logs:
      // the most common production misconfiguration is silently running against
      // the wrong site URL or database, and this is where that shows up.
      console.log('[config]\n' + describeConfig());
    }
    return { client: c, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function getDb() {
  const { db } = await connectToDatabase();
  return db;
}

export async function closeConnection() {
  if (client) {
    await client.close();
    client = null;
  }
}
