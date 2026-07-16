import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { assertRequiredFields } from "@/lib/validation";
import { findUserById, updatePasswordHash } from "@/lib/users";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return fail("Not authenticated.", 401);

  const body = await req.json().catch(() => ({}));
  const missing = assertRequiredFields(body, ["currentPassword", "newPassword"]);
  if (missing) return fail(missing);

  const { currentPassword, newPassword } = body;
  if (String(newPassword).length < 6) {
    return fail("New password must be at least 6 characters.");
  }

  const user = await findUserById(session.id);
  if (!user) return fail("Account not found.", 404);

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) return fail("Current password is incorrect.", 401);

  const newHash = await bcrypt.hash(newPassword, 10);
  await updatePasswordHash(user._id.toString(), newHash);

  return ok({ updated: true });
}