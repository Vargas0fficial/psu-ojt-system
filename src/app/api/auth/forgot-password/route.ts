import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { assertRequiredFields, isValidEmail } from "@/lib/validation";
import { findUserByEmail } from "@/lib/users";
import { createResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    const body = await req.json().catch(() => ({}));
    const missing = assertRequiredFields(body, ["email"]);
    if (missing) return fail(missing);

    const { email } = body;
    if (!isValidEmail(email)) return fail("Please enter a valid email address.");

    const user = await findUserByEmail(email);

    if (user) {
        try {
            const token = await createResetToken(user._id.toString(), user.email);
            const resetUrl = `${req.nextUrl.origin}/reset-password?token=${token}`;
            await sendPasswordResetEmail(user.email, resetUrl);
        } catch (err) {
            console.error("Failed to send password reset email:", err);
        }
    }

    return ok({
        message: "If an account with that email exists, a reset link has been sent.",
    });
}