/** Brings the auth tables up to date when the server starts, so a fresh checkout needs no manual migration step. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { getMigrations } = await import("better-auth/db/migration");
  const { auth } = await import("./server/auth");
  const { runMigrations } = await getMigrations(auth.options);
  await runMigrations();
}
