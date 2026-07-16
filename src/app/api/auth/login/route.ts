import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/lib/api-response";
import { assertRequiredFields, isValidRole } from "@/lib/validation";
import { findUserByEmail, toPublicUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const missing = assertRequiredFields(body, ["email", "password", "role"]);
  if (missing) return fail(missing);

  const { email, password, role, remember } = body;

  if (!isValidRole(role)) return fail("Role must be either intern or supervisor.");

  const user = await findUserByEmail(email);
  if (!user) return fail("Invalid email or password.", 401);

  if (user.role !== role) {
    return fail(
      `This account is registered as ${user.role}. Please switch tabs and try again.`,
      401
    );
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) return fail("Invalid email or password.", 401);

  const publicUser = toPublicUser(user);

  await setSessionCookie(
    {
      id: publicUser.id,
      name: publicUser.name,
      email: publicUser.email,
      role: publicUser.role,
    },
    remember !== false
  );

  return ok(publicUser);
}