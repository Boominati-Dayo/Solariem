import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'banking_app';

let client: MongoClient | null = null;

function getClient(): MongoClient {
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
  }
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

export async function connectToDatabase() {
  try {
    const c = getClient();
    const db = c.db(dbName);
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
