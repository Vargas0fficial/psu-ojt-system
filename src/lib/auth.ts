import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "psu-ojt-dev-secret-change-in-production";
const COOKIE_NAME = "psu_ojt_session";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "intern" | "supervisor";
};

export function signSession(user: SessionUser) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

export async function setSessionCookie(user: SessionUser, remember = true) {
  const token = signSession(user);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    ...(remember ? { maxAge: 60 * 60 * 24 * 7 } : {}),
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionUser;
    return decoded;
  } catch {
    return null;
  }
}