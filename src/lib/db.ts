import { MongoClient, type Db } from "mongodb";

declare global {
  var __psuOjtMongoClient: MongoClient | undefined;
  var __psuOjtMongoConnect: Promise<MongoClient> | undefined;
}

function createClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file (see .env.example) — " +
        "point it at a MongoDB Atlas cluster (or a local MongoDB instance)."
    );
  }
  return new MongoClient(uri, {
    connectTimeoutMS: 15000,
    serverSelectionTimeoutMS: 15000,
  });
}

async function connect(): Promise<MongoClient> {
  if (!global.__psuOjtMongoClient) {
    global.__psuOjtMongoClient = createClient();
  }
  return global.__psuOjtMongoClient.connect();
}

function getClient(): Promise<MongoClient> {
  if (!global.__psuOjtMongoConnect) {
    global.__psuOjtMongoConnect = connect().catch((err) => {
      global.__psuOjtMongoConnect = undefined;
      global.__psuOjtMongoClient = undefined;
      throw err;
    });
  }
  return global.__psuOjtMongoConnect;
}

const RETRYABLE_PATTERNS = [
  "timed out",
  "timeout",
  "econnreset",
  "topology was destroyed",
  "server selection error",
  "connection closed",
  "connection terminated",
];

function isRetryableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return RETRYABLE_PATTERNS.some((pattern) => message.includes(pattern));
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDb(): Promise<Db> {
  const delays = [1000, 3000];
  let lastError: unknown;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const client = await getClient();
      return client.db();
    } catch (err) {
      lastError = err;
      if (attempt < delays.length && isRetryableError(err)) {
        await sleep(delays[attempt]);
        continue;
      }
      throw err;
    }
  }

  throw lastError;
}

let migrated: Promise<void> | null = null;

async function migrate() {
  const db = await getDb();

  const collections = await db.listCollections().toArray();
  const names = new Set(collections.map((c) => c.name));

  if (!names.has("users")) {
    await db.createCollection("users");
  }
  if (!names.has("time_logs")) {
    await db.createCollection("time_logs");
  }
  if (!names.has("password_reset_tokens")) {
    await db.createCollection("password_reset_tokens");
  }

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("users").createIndex({ role: 1 });
  await db.collection("users").createIndex({ supervisorId: 1 });
  await db.collection("time_logs").createIndex({ userId: 1, logDate: 1 });
  await db.collection("password_reset_tokens").createIndex({ token: 1 }, { unique: true });
  // TTL index: MongoDB automatically deletes a token document once its
  // expiresAt time has passed — no manual cleanup job needed.
  await db
    .collection("password_reset_tokens")
    .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
}

export function ensureMigrated(): Promise<void> {
  if (!migrated) migrated = migrate();
  return migrated;
}