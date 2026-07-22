import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { findUserById } from "@/lib/users";
import { findLogById, reviewLog, toPublicLog, type ApprovalStatus } from "@/lib/logs";

const VALID_STATUSES: ApprovalStatus[] = ["pending", "approved", "flagged"];

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);
  if (session.role !== "supervisor") return fail("Supervisors only.", 403);

  const { id } = await params;
  const log = await findLogById(id);
  if (!log) return fail("Log not found.", 404);

  const intern = await findUserById(log.userId.toString());
  if (!intern || !intern.supervisorId || intern.supervisorId.toString() !== session.id) {
    return fail("This log does not belong to one of your interns.", 403);
  }

  const body = await req.json().catch(() => ({}));
  const { approvalStatus, supervisorRemark } = body;

  if (!VALID_STATUSES.includes(approvalStatus)) {
    return fail("approvalStatus must be pending, approved, or flagged.");
  }
  if (supervisorRemark !== undefined && supervisorRemark !== null && typeof supervisorRemark !== "string") {
    return fail("supervisorRemark must be text.");
  }

  const updated = await reviewLog(id, approvalStatus, supervisorRemark || null);
  if (!updated) return fail("Failed to update log.", 500);

  return ok(toPublicLog(updated));
}