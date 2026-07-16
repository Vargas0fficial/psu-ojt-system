import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { findUserById, toPublicUser } from "@/lib/users";
import { listLogsForUser, toPublicLog } from "@/lib/logs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);
  if (session.role !== "supervisor") return fail("Supervisors only.", 403);

  const internId = req.nextUrl.searchParams.get("internId");
  if (!internId) return fail("internId query param is required.");

  const intern = await findUserById(internId);
  if (
    !intern ||
    intern.role !== "intern" ||
    !intern.supervisorId ||
    intern.supervisorId.toString() !== session.id
  ) {
    return fail("Intern not found under your supervision.", 404);
  }

  const rawLogs = await listLogsForUser(intern._id.toString(), 200);
  const logs = rawLogs.map(toPublicLog);

  return ok({ intern: toPublicUser(intern), logs });
}