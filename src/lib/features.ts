/**
 * Accounts (sign-in, sign-up, password reset) are switched off until a hosted
 * database and auth secret are configured. Everything then saves on the device.
 * Set NEXT_PUBLIC_ACCOUNTS=on at build time to bring them back.
 */
export const accountsEnabled = process.env.NEXT_PUBLIC_ACCOUNTS === "on";
