import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { findUserById, toPublicUser } from "@/lib/users";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const user = await findUserById(session.id);
  if (!user) return fail("Account no longer exists.", 401);

  return ok(toPublicUser(user));
}