import { Resend } from "resend";

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PSU OJT <onboarding@resend.dev>";

function getResendClient(): Resend {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error(
            "RESEND_API_KEY is not set. Add it to your .env file — get a free key at https://resend.com."
        );
    }
    return new Resend(apiKey);
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
    const resend = getResendClient();

    const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject: "Reset your PSU OJT Monitoring System password",
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #0D1B4C;">Reset your password</h2>
        <p>We received a request to reset the password for your PSU OJT Monitoring System account.</p>
        <p>
          <a href="${resetUrl}" style="display: inline-block; background: #F2B705; color: #0A1230; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
            Reset Password
          </a>
        </p>
        <p style="color: #64748B; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
        </p>
        <p style="color: #64748B; font-size: 13px;">
          Or copy this link: <br />
          <a href="${resetUrl}" style="color: #1B3A82; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    `,
    });

    if (error) {
        throw new Error(`Failed to send email: ${error.message}`);
    }
}