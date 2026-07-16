import crypto from "crypto";
import { getDb, ensureMigrated } from "./db";

export type ResetTokenRecord = {
  token: string;
  userId: string;
  email: string;
  expiresAt: Date;
  createdAt: Date;
};

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function tokensCollection() {
  await ensureMigrated();
  const db = await getDb();
  return db.collection<ResetTokenRecord>("password_reset_tokens");
}

/** Creates a fresh reset token for a user, invalidating any previous ones. */
export async function createResetToken(userId: string, email: string): Promise<string> {
  const tokens = await tokensCollection();

  // Invalidate any older, still-pending tokens for this user so only the
  // most recently requested link works.
  await tokens.deleteMany({ userId });

  const token = crypto.randomBytes(32).toString("hex");
  await tokens.insertOne({
    token,
    userId,
    email,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    createdAt: new Date(),
  });

  return token;
}

/** Returns the token record if it exists and hasn't expired, else null. */
export async function findValidResetToken(token: string): Promise<ResetTokenRecord | null> {
  const tokens = await tokensCollection();
  const record = await tokens.findOne({ token });
  if (!record) return null;
  if (record.expiresAt.getTime() < Date.now()) return null;
  return record;
}

/** Deletes a token so it can't be reused (call after a successful reset). */
export async function consumeResetToken(token: string): Promise<void> {
  const tokens = await tokensCollection();
  await tokens.deleteOne({ token });
}