import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/lib/api-response";
import { assertRequiredFields, isValidEmail, isValidRole } from "@/lib/validation";
import { createUser, findUserByEmail, toPublicUser } from "@/lib/users";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));

  const missing = assertRequiredFields(body, ["name", "email", "password", "role"]);
  if (missing) return fail(missing);

  const { name, email, password, role, course, department, supervisorId, ojtStartDate } = body;

  if (!isValidEmail(email)) return fail("Please enter a valid email address.");
  if (!isValidRole(role)) return fail("Role must be either intern or supervisor.");
  if (String(password).length < 6)
    return fail("Password must be at least 6 characters.");

  if (await findUserByEmail(email)) {
    return fail("An account with this email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    passwordHash,
    role,
    course: role === "intern" ? course : undefined,
    department: role === "supervisor" ? department : undefined,
    supervisorId: role === "intern" && supervisorId ? String(supervisorId) : null,
    ojtStartDate: role === "intern" ? ojtStartDate : undefined,
  });

  const publicUser = toPublicUser(user);

  await setSessionCookie({
    id: publicUser.id,
    name: publicUser.name,
    email: publicUser.email,
    role: publicUser.role,
  });

  return ok(publicUser, 201);
}