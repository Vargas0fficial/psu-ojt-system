import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { updateRequiredHours, toPublicUser } from "@/lib/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);
  if (session.role !== "supervisor") {
    return fail("Only supervisors can set the required OJT hours.", 403);
  }

  const body = await req.json().catch(() => ({}));
  const { requiredHours } = body;
  const hours = Number(requiredHours);

  if (!Number.isFinite(hours) || hours <= 0 || hours > 5000) {
    return fail("Please enter a valid number of hours (1–5000).");
  }

  const updated = await updateRequiredHours(session.id, Math.round(hours));
  if (!updated) return fail("Account not found.", 404);

  return ok(toPublicUser(updated));
}