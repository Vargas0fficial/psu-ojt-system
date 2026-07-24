import { ObjectId } from "mongodb";
import { getDb, ensureMigrated, withRetry } from "./db";

export type UserRole = "intern" | "supervisor";

export type UserRecord = {
  _id: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  course: string | null;
  department: string | null;
  requiredHours: number;
  ojtStartDate: string | null;
  supervisorId: ObjectId | null;
  avatar: string | null;
  createdAt: Date;
};

export type NewUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  course?: string;
  department?: string;
  requiredHours?: number;
  ojtStartDate?: string;
  supervisorId?: string | null;
};

/** Parses a string into an ObjectId, or returns null if it isn't a valid one. */
export function toObjectId(id: string | null | undefined): ObjectId | null {
  if (!id || !ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

async function usersCollection() {
  await ensureMigrated();
  const db = await getDb();
  return db.collection<UserRecord>("users");
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  return withRetry(async () => {
    const users = await usersCollection();
    return users.findOne({ email: email.toLowerCase() });
  });
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const objectId = toObjectId(id);
  if (!objectId) return null;
  return withRetry(async () => {
    const users = await usersCollection();
    return users.findOne({ _id: objectId });
  });
}

export async function createUser(input: NewUserInput): Promise<UserRecord> {
  return withRetry(async () => {
    const users = await usersCollection();
    const doc: Omit<UserRecord, "_id"> = {
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      role: input.role,
      course: input.course ?? null,
      department: input.department ?? null,
      requiredHours: input.requiredHours ?? 486,
      ojtStartDate: input.ojtStartDate ?? null,
      supervisorId: toObjectId(input.supervisorId ?? null),
      avatar: null,
      createdAt: new Date(),
    };
    const result = await users.insertOne(doc as UserRecord);
    return { ...doc, _id: result.insertedId };
  });
}

export async function listSupervisors(): Promise<{ id: string; name: string }[]> {
  return withRetry(async () => {
    const users = await usersCollection();
    const rows = await users
      .find({ role: "supervisor" }, { projection: { name: 1 } })
      .sort({ name: 1 })
      .toArray();
    return rows.map((u) => ({ id: u._id.toString(), name: u.name }));
  });
}

export async function listInternsForSupervisor(supervisorId: string): Promise<UserRecord[]> {
  const objectId = toObjectId(supervisorId);
  if (!objectId) return [];
  return withRetry(async () => {
    const users = await usersCollection();
    // Match supervisorId whether it was stored as a real ObjectId (current,
    // correct behavior) or accidentally saved as a plain string at some point
    // (e.g. from an older code path) — keeps existing data working without
    // needing a manual DB fix.
    return users
      .find({
        role: "intern",
        $or: [{ supervisorId: objectId }, { supervisorId: supervisorId as unknown as ObjectId }],
      })
      .sort({ name: 1 })
      .toArray();
  });
}

export async function listAllInterns(): Promise<UserRecord[]> {
  return withRetry(async () => {
    const users = await usersCollection();
    return users.find({ role: "intern" }).sort({ name: 1 }).toArray();
  });
}

export async function updatePasswordHash(userId: string, passwordHash: string): Promise<void> {
  const objectId = toObjectId(userId);
  if (!objectId) return;
  await withRetry(async () => {
    const users = await usersCollection();
    await users.updateOne({ _id: objectId }, { $set: { passwordHash } });
  });
}

export async function updateSupervisorId(
  userId: string,
  supervisorId: string | null
): Promise<UserRecord | null> {
  const objectId = toObjectId(userId);
  if (!objectId) return null;
  return withRetry(async () => {
    const users = await usersCollection();
    await users.updateOne(
      { _id: objectId },
      { $set: { supervisorId: toObjectId(supervisorId) } }
    );
    return users.findOne({ _id: objectId });
  });
}

export async function updateOjtStartDate(
  userId: string,
  ojtStartDate: string | null
): Promise<UserRecord | null> {
  const objectId = toObjectId(userId);
  if (!objectId) return null;
  return withRetry(async () => {
    const users = await usersCollection();
    await users.updateOne({ _id: objectId }, { $set: { ojtStartDate } });
    return users.findOne({ _id: objectId });
  });
}

export async function updateRequiredHours(
  userId: string,
  requiredHours: number
): Promise<UserRecord | null> {
  const objectId = toObjectId(userId);
  if (!objectId) return null;
  return withRetry(async () => {
    const users = await usersCollection();
    await users.updateOne({ _id: objectId }, { $set: { requiredHours } });
    return users.findOne({ _id: objectId });
  });
}

export async function updateAvatar(userId: string, avatar: string | null): Promise<void> {
  const objectId = toObjectId(userId);
  if (!objectId) return;
  await withRetry(async () => {
    const users = await usersCollection();
    await users.updateOne({ _id: objectId }, { $set: { avatar } });
  });
}

export function toPublicUser(user: UserRecord) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    course: user.course,
    department: user.department,
    requiredHours: user.requiredHours,
    ojtStartDate: user.ojtStartDate,
    supervisorId: user.supervisorId ? user.supervisorId.toString() : null,
    avatar: user.avatar ?? null,
  };
}