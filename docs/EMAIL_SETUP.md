# Email Setup Guide (Gmail App Password & Custom SMTP)

UncoverCeylon uses a unified mailer abstraction (`src/lib/mailer.ts`) built on `nodemailer`. This guide explains how to set up email sending for email verification, password reset links, and system notifications.

---

## 1. Quick Setup with Gmail App Password (Free, Recommended for Launch)

A Gmail App Password lets UncoverCeylon send outgoing verification emails without requiring OAuth setup or a paid domain mail service.

### Step-by-Step Instructions:

1. **Log in to your Google Account**:
   Open [https://myaccount.google.com/](https://myaccount.google.com/) with the Gmail account you wish to send emails from.

2. **Enable 2-Step Verification**:
   - In the left sidebar, click **Security**.
   - Under *“How you sign in to Google”*, verify that **2-Step Verification** is turned **ON**. (Google requires 2FA to create app passwords).

3. **Generate an App Password**:
   - In the search box at the top of the Google Account page, search for **“App passwords”** (or go to `https://myaccount.google.com/apppasswords`).
   - For **App name**, enter: `UncoverCeylon`.
   - Click **Create**.
   - Google will show a 16-character password in a yellow box (e.g. `abcd efgh ijkl mnop`).
   - Copy this 16-character code (remove any spaces).

4. **Add to `.env`**:
   Add the following variables to your `.env` file:

   ```env
   # Email / SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SECURE=true
   SMTP_USER=yourname@gmail.com
   SMTP_PASSWORD=abcdefghijklmnop
   SMTP_FROM="UncoverCeylon <yourname@gmail.com>"
   ```

5. **Restart Server**:
   Restart the Next.js development server or PM2 process for environment variables to take effect.

---

## 2. Deliverability & Spam Considerations

- **Spam Folder Warning**: Because emails are sent via personal Gmail SMTP rather than a custom domain with SPF/DKIM records, test emails may initially land in your recipient's **Spam / Junk** folder. Ask testers to mark the email as *"Not Spam"*.
- **Daily Quotas**: Standard Gmail accounts have a sending limit of ~500 emails per 24 hours, which is well-suited for early development, testing, and initial soft-launch.

---

## 3. Production SMTP (Brevo / SendGrid / Amazon SES / Postmark)

When migrating to a custom domain (`uncoverceylon.com`), switch to a dedicated transactional email provider to guarantee inbox delivery.

### Brevo (Recommended Free Tier - 300 emails/day):
1. Sign up at [https://www.brevo.com/](https://www.brevo.com/).
2. Add and verify your domain DNS records (SPF, DKIM, DMARC).
3. In Brevo Dashboard, go to **Transactional** -> **Settings** -> **Configuration**.
4. Update `.env`:
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_brevo_login
   SMTP_PASSWORD=your_brevo_smtp_key
   SMTP_FROM="UncoverCeylon <noreply@uncoverceylon.com>"
   ```
5. Zero code changes are required—the mailer abstraction automatically adapts to any standard SMTP server.

---

## 4. Verification & Testing

To verify your configuration:
1. Register a new user at `http://localhost:3000/login?mode=register` (or production URL).
2. Check your mailbox for the *“Verify your UncoverCeylon Account”* email.
3. Click the single-use 24-hour verification link.
4. Your account will automatically activate to `active` status.
