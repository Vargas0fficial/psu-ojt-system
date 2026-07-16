import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { assertRequiredFields, isValidTimeString } from "@/lib/validation";
import { findLogById, setTimeOut, toPublicLog } from "@/lib/logs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const body = await req.json().catch(() => ({}));
  const missing = assertRequiredFields(body, ["logId", "timeOut"]);
  if (missing) return fail(missing);

  const { logId, timeOut, remarks } = body;
  if (!isValidTimeString(timeOut)) return fail("timeOut must look like '05:12 PM'.");

  const log = await findLogById(String(logId));
  if (!log || log.userId.toString() !== session.id) return fail("Log not found.", 404);
  if (log.status === "Completed") return fail("This log is already completed.", 409);

  const updated = await setTimeOut(log._id.toString(), timeOut, remarks);
  if (!updated) return fail("Failed to update log.", 500);
  return ok(toPublicLog(updated));
}