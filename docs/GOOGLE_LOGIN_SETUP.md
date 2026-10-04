# Google OAuth 2.0 Setup Guide

UncoverCeylon supports seamless one-click Google Sign-In (`src/app/api/auth/google/route.ts` and `callback/route.ts`).
Google login uses a feature flag: the button and authentication endpoints activate automatically once `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are present in your environment.

---

## 1. Google Cloud Console Configuration

Follow these steps to obtain credentials:

### Step 1: Create or Select a Project
1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top left and select **New Project**.
3. Name your project **UncoverCeylon** and click **Create**.

### Step 2: Configure the OAuth Consent Screen
1. In the left navigation menu, navigate to **APIs & Services** > **OAuth consent screen**.
2. Select User Type: **External** and click **Create**.
3. Fill in the required fields:
   - **App name**: `UncoverCeylon`
   - **User support email**: Your support or personal email
   - **Developer contact information**: Your email
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes** and select:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `openid`
6. Click **Save and Continue**.
7. If your app is in "Testing" mode, add your test Google email addresses under **Test users**.

### Step 3: Create OAuth 2.0 Client Credentials
1. In the left menu, click **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. Choose Application type: **Web application**.
4. Set Name: `UncoverCeylon Web Client`.
5. Under **Authorized JavaScript origins**, add:
   - `http://localhost:3000` (Local testing)
   - `http://51.79.242.65:3000` (VPS staging)
   - `https://uncoverceylon.com` (Production domain)
6. Under **Authorized redirect URIs**, add:
   - `http://localhost:3000/api/auth/google/callback`
   - `http://51.79.242.65:3000/api/auth/google/callback`
   - `https://uncoverceylon.com/api/auth/google/callback`
7. Click **Create**.
8. A modal will pop up with your **Client ID** and **Client Secret**. Copy both values.

---

## 2. Configure Environment Variables

Add the keys to your `.env` file:

```env
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

On production VPS (`51.79.242.65`), update `NEXT_PUBLIC_APP_URL` to match `http://51.79.242.65:3000` or your custom domain.

---

## 3. How the Authentication Flow Works

1. User clicks **"Continue with Google"** on `/login`.
2. `/api/auth/google` redirects the user to Google's consent screen.
3. Upon approval, Google redirects back to `/api/auth/google/callback` with an authorization code.
4. Server exchanges the code for access tokens, fetches user info (`email`, `name`, `avatar`), and automatically links or creates the user in the database with status `active` and verified email.
5. A secure HTTP-only `uc_session` cookie is issued, and the user is redirected into their dashboard or destination feed.
