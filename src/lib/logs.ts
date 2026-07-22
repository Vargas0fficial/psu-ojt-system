import { ObjectId } from "mongodb";
import { getDb, ensureMigrated } from "./db";
import { toObjectId } from "./users";

export type LogStatus = "Time In" | "Completed";
export type ApprovalStatus = "pending" | "approved" | "flagged";

export type LogRecord = {
  _id: ObjectId;
  userId: ObjectId;
  logDate: string;
  timeIn: string | null;
  timeOut: string | null;
  remarks: string | null;
  status: LogStatus;
  createdAt: Date;
  approvalStatus?: ApprovalStatus;
  supervisorRemark?: string | null;
  reviewedAt?: Date | null;
};

function parseTimeToMinutes(time: string): number {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return 0;
  const [, h, m, meridian] = match as unknown as [string, string, string, string];
  let hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  if (meridian.toUpperCase() === "PM" && hours !== 12) hours += 12;
  if (meridian.toUpperCase() === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function computeDurationLabel(timeIn: string | null, timeOut: string | null): string {
  if (!timeIn || !timeOut) return "-";
  const start = parseTimeToMinutes(timeIn);
  const end = parseTimeToMinutes(timeOut);
  let diff = end - start;
  if (diff < 0) diff += 24 * 60;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export function computeDurationMinutes(timeIn: string | null, timeOut: string | null): number {
  if (!timeIn || !timeOut) return 0;
  const start = parseTimeToMinutes(timeIn);
  const end = parseTimeToMinutes(timeOut);
  let diff = end - start;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

async function logsCollection() {
  await ensureMigrated();
  const db = await getDb();
  return db.collection<LogRecord>("time_logs");
}

export async function findOpenLogForToday(
  userId: string,
  logDate: string
): Promise<LogRecord | null> {
  const objectId = toObjectId(userId);
  if (!objectId) return null;
  const logs = await logsCollection();
  return logs.findOne({ userId: objectId, logDate }, { sort: { _id: -1 } });
}

export async function createTimeInLog(
  userId: string,
  logDate: string,
  timeIn: string,
  remarks?: string
): Promise<LogRecord> {
  const objectId = toObjectId(userId);
  if (!objectId) throw new Error("Invalid user id");
  const logs = await logsCollection();
  const doc: Omit<LogRecord, "_id"> = {
    userId: objectId,
    logDate,
    timeIn,
    timeOut: null,
    remarks: remarks ?? null,
    status: "Time In",
    createdAt: new Date(),
  };
  const result = await logs.insertOne(doc as LogRecord);
  return { ...doc, _id: result.insertedId };
}

export async function setTimeOut(
  logId: string,
  timeOut: string,
  remarks?: string
): Promise<LogRecord | null> {
  const objectId = toObjectId(logId);
  if (!objectId) return null;
  const logs = await logsCollection();
  const update: Partial<LogRecord> = { timeOut, status: "Completed" };
  if (remarks !== undefined) update.remarks = remarks;
  await logs.updateOne({ _id: objectId }, { $set: update });
  return logs.findOne({ _id: objectId });
}

export async function updateLog(
  logId: string,
  fields: Partial<Pick<LogRecord, "timeIn" | "timeOut" | "remarks" | "logDate">>
): Promise<LogRecord | null> {
  const objectId = toObjectId(logId);
  if (!objectId) return null;
  const logs = await logsCollection();

  const current = await logs.findOne({ _id: objectId });
  if (!current) return null;

  const merged = { ...current, ...fields };
  const status: LogStatus = merged.timeOut ? "Completed" : "Time In";

  await logs.updateOne(
    { _id: objectId },
    {
      $set: {
        logDate: merged.logDate,
        timeIn: merged.timeIn,
        timeOut: merged.timeOut,
        remarks: merged.remarks,
        status,
      },
    }
  );
  return logs.findOne({ _id: objectId });
}

export async function deleteLog(logId: string): Promise<void> {
  const objectId = toObjectId(logId);
  if (!objectId) return;
  const logs = await logsCollection();
  await logs.deleteOne({ _id: objectId });
}

export async function findLogById(logId: string): Promise<LogRecord | null> {
  const objectId = toObjectId(logId);
  if (!objectId) return null;
  const logs = await logsCollection();
  return logs.findOne({ _id: objectId });
}

export async function reviewLog(
  logId: string,
  approvalStatus: ApprovalStatus,
  supervisorRemark: string | null
): Promise<LogRecord | null> {
  const objectId = toObjectId(logId);
  if (!objectId) return null;

  const logs = await logsCollection();
  await logs.updateOne(
    { _id: objectId },
    {
      $set: {
        approvalStatus,
        supervisorRemark,
        reviewedAt: new Date(),
      },
    }
  );
  return logs.findOne({ _id: objectId });
}

export async function listLogsForUser(userId: string, limit = 100): Promise<LogRecord[]> {
  const objectId = toObjectId(userId);
  if (!objectId) return [];
  const logs = await logsCollection();
  return logs
    .find({ userId: objectId })
    .sort({ logDate: -1, _id: -1 })
    .limit(limit)
    .toArray();
}

export async function totalMinutesForUser(userId: string): Promise<number> {
  const objectId = toObjectId(userId);
  if (!objectId) return 0;
  const logs = await logsCollection();
  const rows = await logs
    .find(
      { userId: objectId, timeOut: { $ne: null } },
      { projection: { timeIn: 1, timeOut: 1 } }
    )
    .toArray();
  return rows.reduce((sum, l) => sum + computeDurationMinutes(l.timeIn, l.timeOut), 0);
}

export async function minutesThisWeekForUser(
  userId: string
): Promise<{ minutes: number; days: number }> {
  const objectId = toObjectId(userId);
  if (!objectId) return { minutes: 0, days: 0 };

  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const mondayStr = monday.toISOString().slice(0, 10);

  const logs = await logsCollection();
  const rows = await logs
    .find(
      { userId: objectId, logDate: { $gte: mondayStr } },
      { projection: { timeIn: 1, timeOut: 1 } }
    )
    .toArray();

  const minutes = rows.reduce((sum, l) => sum + computeDurationMinutes(l.timeIn, l.timeOut), 0);
  return { minutes, days: rows.length };
}

export function formatMinutesLabel(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

/**
 * Maps a Mongo LogRecord to the flat, snake_case JSON shape the existing
 * frontend hooks/components already expect (kept stable across the
 * SQLite -> Postgres -> MongoDB migrations so client code doesn't churn).
 */
export function toPublicLog(log: LogRecord) {
  return {
    id: log._id.toString(),
    user_id: log.userId.toString(),
    log_date: log.logDate,
    time_in: log.timeIn,
    time_out: log.timeOut,
    remarks: log.remarks,
    status: log.status,
    duration: computeDurationLabel(log.timeIn, log.timeOut),
    approvalStatus: log.approvalStatus ?? "pending",
    supervisorRemark: log.supervisorRemark ?? null,
    reviewedAt: log.reviewedAt ?? null,
  };
}