import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { assertRequiredFields, isValidDateString, isValidTimeString } from "@/lib/validation";
import {
  createTimeInLog,
  findOpenLogForToday,
  listLogsForUser,
  minutesThisWeekForUser,
  totalMinutesForUser,
  formatMinutesLabel,
  toPublicLog,
} from "@/lib/logs";
import { findUserById, setOjtStartDate } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const today = new Date().toISOString().slice(0, 10);

  const [rawLogs, totalMinutes, week, user, todayLog] = await Promise.all([
    listLogsForUser(session.id),
    totalMinutesForUser(session.id),
    minutesThisWeekForUser(session.id),
    findUserById(session.id),
    findOpenLogForToday(session.id, today),
  ]);

  const logs = rawLogs.map(toPublicLog);

  return ok({
    logs,
    summary: {
      totalHoursLabel: formatMinutesLabel(totalMinutes),
      totalMinutes,
      requiredHours: user?.requiredHours ?? 486,
      logsThisWeek: week.days,
      weekHoursLabel: formatMinutesLabel(week.minutes),
      todayLog: todayLog ? toPublicLog(todayLog) : null,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const body = await req.json().catch(() => ({}));
  const missing = assertRequiredFields(body, ["logDate", "timeIn"]);
  if (missing) return fail(missing);

  const { logDate, timeIn, remarks } = body;
  if (!isValidDateString(logDate)) return fail("logDate must be in YYYY-MM-DD format.");
  if (!isValidTimeString(timeIn)) return fail("timeIn must look like '08:02 AM'.");

  const existing = await findOpenLogForToday(session.id, logDate);
  if (existing && existing.status === "Time In") {
    return fail("You already have an open time-in for this date. Please time out first.", 409);
  }

  // Set the user's OJT start date the first time they ever time in.
  const user = await findUserById(session.id);
  if (user && !user.ojtStartDate) {
    await setOjtStartDate(session.id, logDate);
  }

  const log = await createTimeInLog(session.id, logDate, timeIn, remarks);
  return ok(toPublicLog(log), 201);
}