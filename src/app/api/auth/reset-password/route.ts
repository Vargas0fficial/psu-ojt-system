import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { ok, fail } from "@/lib/api-response";
import { assertRequiredFields } from "@/lib/validation";
import { findValidResetToken, consumeResetToken } from "@/lib/password-reset";
import { updatePasswordHash } from "@/lib/users";

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return fail("Missing token.", 400);

    const record = await findValidResetToken(token);
    if (!record) {
        return fail("This reset link is invalid or has expired.", 400);
    }

    return ok({ valid: true, email: record.email });
}

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const missing = assertRequiredFields(body, ["token", "newPassword"]);
    if (missing) return fail(missing);

    const { token, newPassword } = body;
    if (String(newPassword).length < 6) {
        return fail("Password must be at least 6 characters.");
    }

    const record = await findValidResetToken(token);
    if (!record) {
        return fail("This reset link is invalid or has expired. Please request a new one.", 400);
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await updatePasswordHash(record.userId, newHash);
    await consumeResetToken(token);

    return ok({ reset: true });
}