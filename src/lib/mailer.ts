/**
 * src/lib/mailer.ts
 * Email dispatch utility supporting Gmail App Passwords and custom SMTP servers.
 * Provides branded HTML templates for email verification, password resets, and notifications.
 */

import nodemailer, { type Transporter } from 'nodemailer';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

let cachedTransporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  return cachedTransporter;
}

/**
 * Sends an email using the configured SMTP transport.
 * If SMTP is not configured, logs the email content to console in development.
 */
export async function sendMail(options: SendMailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.warn(`[MAILER MOCK] To: ${options.to} | Subject: ${options.subject}`);
      console.log(`[MAILER CONTENT]:\n${options.text || options.html}`);
      return { success: true, messageId: 'mock-local-delivery' };
    }

    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || `"UncoverCeylon" <${smtpUser}>`;

    const info = await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>?/gm, ''),
    });

    return { success: true, messageId: info.messageId };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('Mailer error:', errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Sends email verification token to newly registered user.
 */
export async function sendVerificationEmail(email: string, name: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const verifyUrl = `${appUrl}/verify-email?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #DCE8F2; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0F2A3D; margin: 0;">UncoverCeylon</h2>
        <p style="color: #5B7385; font-size: 14px; margin-top: 4px;">Explore Sri Lanka Authentically</p>
      </div>
      <h3 style="color: #0F2A3D;">Ayubowan ${name}!</h3>
      <p style="color: #0F2A3D; font-size: 16px; line-height: 1.6;">
        Thank you for joining UncoverCeylon. Please verify your email address to activate your account, share reviews, save trips, and submit places.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #38A9F0; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #5B7385; font-size: 14px; line-height: 1.5;">
        This link is single-use and will expire in 24 hours.<br />
        If you did not create an account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #DCE8F2; margin: 24px 0;" />
      <p style="color: #8CA0AF; font-size: 12px; text-align: center;">
        UncoverCeylon &bull; Colombo, Sri Lanka
      </p>
    </div>
  `;

  const res = await sendMail({
    to: email,
    subject: 'Verify your email - UncoverCeylon',
    html,
  });

  return res.success;
}

/**
 * Sends password reset token to user.
 */
export async function sendPasswordResetEmail(email: string, name: string, token: string): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetUrl = `${appUrl}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #DCE8F2; border-radius: 16px; background-color: #FFFFFF;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0F2A3D; margin: 0;">UncoverCeylon</h2>
        <p style="color: #5B7385; font-size: 14px; margin-top: 4px;">Password Reset Request</p>
      </div>
      <h3 style="color: #0F2A3D;">Hello ${name},</h3>
      <p style="color: #0F2A3D; font-size: 16px; line-height: 1.6;">
        We received a request to reset your password. Click the button below to choose a new password:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #38A9F0; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #5B7385; font-size: 14px; line-height: 1.5;">
        This link is single-use and will expire in 2 hours.<br />
        If you did not request a password reset, your account is secure and you can ignore this email.
      </p>
    </div>
  `;

  const res = await sendMail({
    to: email,
    subject: 'Password Reset Request - UncoverCeylon',
    html,
  });

  return res.success;
}
