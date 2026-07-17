import nodemailer from "nodemailer";

declare global {
  var __psuOjtMailTransporter: ReturnType<typeof nodemailer.createTransport> | undefined;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "GMAIL_USER and GMAIL_APP_PASSWORD must be set. Add them to your .env file — " +
        "see .env.example for how to generate a Gmail App Password."
    );
  }

  if (!global.__psuOjtMailTransporter) {
    global.__psuOjtMailTransporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return global.__psuOjtMailTransporter;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const transporter = getTransporter();
  const fromAddress = process.env.GMAIL_USER;

  await transporter.sendMail({
    from: `"PSU OJT Monitoring System" <${fromAddress}>`,
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
}