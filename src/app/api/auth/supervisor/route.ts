import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { findUserById, toPublicUser, updateSupervisorId, updateRequiredHours } from "@/lib/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);
  if (session.role !== "intern") return fail("Only interns can set a supervisor.", 403);

  const body = await req.json().catch(() => ({}));
  const supervisorId: string | null = body.supervisorId || null;

  if (supervisorId) {
    const supervisor = await findUserById(supervisorId);
    if (!supervisor || supervisor.role !== "supervisor") {
      return fail("Selected supervisor was not found.", 404);
    }
    // Adopt this supervisor's required-hours target for the intern's
    // program, so "goal hours to finish" reflects whichever supervisor
    // they're now under.
    if (supervisor.requiredHours) {
      await updateRequiredHours(session.id, supervisor.requiredHours);
    }
  }

  const updated = await updateSupervisorId(session.id, supervisorId);
  if (!updated) return fail("Failed to update supervisor.", 500);

  return ok(toPublicUser(updated));
}