import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { headers } from "next/headers";
import { authDatabase } from "./db";
import { resetPasswordMail, sendMail } from "./mail";

const https = (host?: string) => (host ? `https://${host}` : undefined);

/**
 * On Vercel previews the site runs on a branch URL, not the production one, so
 * BETTER_AUTH_URL (usually the production URL) would make every sign-up fail with
 * "Invalid origin". Previews use their own URL, and all of this deployment's
 * Vercel URLs are trusted.
 */
const baseURL = (process.env.VERCEL_ENV === "preview" ? https(process.env.VERCEL_BRANCH_URL) ?? https(process.env.VERCEL_URL) : undefined) ?? process.env.BETTER_AUTH_URL ?? https(process.env.VERCEL_PROJECT_PRODUCTION_URL);
const trustedOrigins = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .map(https)
  .filter((o): o is string => Boolean(o));

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  database: authDatabase,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    autoSignIn: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    // A reset signs out every other device, in case the old password was known to someone else.
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendMail(resetPasswordMail(user.email, user.name, url));
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  rateLimit: {
    enabled: true,
    window: 10,
    max: 100,
    // Credential endpoints stay strict; reading your own session is not a brute-force surface.
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/request-password-reset": { window: 60, max: 3 },
      "/reset-password": { window: 60, max: 5 },
      "/get-session": false,
    },
  },
  plugins: [nextCookies()],
});

export async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}
