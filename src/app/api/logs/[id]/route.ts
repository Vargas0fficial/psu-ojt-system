import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { isValidDateString, isValidTimeString } from "@/lib/validation";
import { deleteLog, findLogById, updateLog, toPublicLog } from "@/lib/logs";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const { id } = await params;
  const log = await findLogById(id);
  if (!log || log.userId.toString() !== session.id) return fail("Log not found.", 404);

  const body = await req.json().catch(() => ({}));
  const { logDate, timeIn, timeOut, remarks } = body;

  if (logDate && !isValidDateString(logDate)) return fail("Invalid logDate.");
  if (timeIn && !isValidTimeString(timeIn)) return fail("Invalid timeIn.");
  if (timeOut && !isValidTimeString(timeOut)) return fail("Invalid timeOut.");

  const updated = await updateLog(log._id.toString(), {
    logDate: logDate ?? log.logDate,
    timeIn: timeIn ?? log.timeIn,
    timeOut: timeOut ?? log.timeOut,
    remarks: remarks ?? log.remarks,
  });
  if (!updated) return fail("Failed to update log.", 500);

  return ok(toPublicLog(updated));
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const { id } = await params;
  const log = await findLogById(id);
  if (!log || log.userId.toString() !== session.id) return fail("Log not found.", 404);

  await deleteLog(log._id.toString());
  return ok({ deleted: true });
}