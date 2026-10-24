import "server-only";
import Database from "better-sqlite3";
import { Pool } from "pg";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Storage for accounts and workspaces.
 *
 * - With DATABASE_URL (a Postgres connection string, e.g. Supabase or Neon), everything is
 *   kept in a hosted database and survives redeploys. This is the production setting.
 * - Without it, a local SQLite file is used. On Vercel that file lives in /tmp and resets
 *   when the function instance is recycled, so accounts there are temporary.
 */
export type WorkspaceRow = { document: string; revision: number; updated_at: string };

export interface WorkspaceStore {
  kind: "postgres" | "sqlite";
  get(userId: string): Promise<WorkspaceRow | undefined>;
  /** Creates the first revision. Returns false if a row already exists. */
  insert(userId: string, doc: string, stamp: string): Promise<boolean>;
  /** Writes only if `revision` is still current (optimistic concurrency). */
  update(userId: string, doc: string, stamp: string, revision: number): Promise<boolean>;
  ready(): Promise<void>;
}

const workspaceTable = (json: string) => `CREATE TABLE IF NOT EXISTS workspace (
  user_id TEXT PRIMARY KEY NOT NULL,
  document ${json} NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
)`;

function openSqlite() {
  const fallback = process.env.VERCEL ? "/tmp/moasis.db" : "./data/moasis.db";
  const path = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? fallback);
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(workspaceTable("TEXT"));
  const store: WorkspaceStore = {
    kind: "sqlite",
    ready: async () => {},
    get: async (id) => db.prepare("SELECT document, revision, updated_at FROM workspace WHERE user_id = ?").get(id) as WorkspaceRow | undefined,
    insert: async (id, doc, stamp) =>
      db.prepare("INSERT INTO workspace (user_id, document, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING").run(id, doc, stamp).changes === 1,
    update: async (id, doc, stamp, rev) =>
      db.prepare("UPDATE workspace SET document = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?").run(doc, stamp, id, rev).changes === 1,
  };
  return { authDatabase: db, store };
}

function openPostgres(url: string) {
  const pool = new Pool({ connectionString: url, max: 5, ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : { rejectUnauthorized: false } });
  let created: Promise<void> | null = null;
  const ready = () => (created ??= pool.query(workspaceTable("TEXT")).then(() => undefined));
  const store: WorkspaceStore = {
    kind: "postgres",
    ready,
    get: async (id) => {
      await ready();
      return (await pool.query<WorkspaceRow>("SELECT document, revision, updated_at FROM workspace WHERE user_id = $1", [id])).rows[0];
    },
    insert: async (id, doc, stamp) => {
      await ready();
      return ((await pool.query("INSERT INTO workspace (user_id, document, revision, updated_at) VALUES ($1, $2, 1, $3) ON CONFLICT (user_id) DO NOTHING", [id, doc, stamp])).rowCount ?? 0) === 1;
    },
    update: async (id, doc, stamp, rev) => {
      await ready();
      return ((await pool.query("UPDATE workspace SET document = $1, revision = revision + 1, updated_at = $2 WHERE user_id = $3 AND revision = $4", [doc, stamp, id, rev])).rowCount ?? 0) === 1;
    },
  };
  return { authDatabase: pool, store };
}

type Opened = ReturnType<typeof openSqlite> | ReturnType<typeof openPostgres>;
const globalForDb = globalThis as unknown as { moasisDb?: Opened };

/** One connection (or pool) per server process; survives dev hot reloads. */
const opened = (globalForDb.moasisDb ??= process.env.DATABASE_URL ? openPostgres(process.env.DATABASE_URL) : openSqlite());

export const authDatabase = opened.authDatabase;
export const workspaces = opened.store;
/** True when accounts survive redeploys. */
export const persistentStorage = opened.store.kind === "postgres" || !process.env.VERCEL;
