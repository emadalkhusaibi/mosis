import "server-only";
import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const path = resolve(/*turbopackIgnore: true*/ process.env.DATABASE_PATH ?? "./data/moasis.db");

const globalForDb = globalThis as unknown as { moasisDb?: Database.Database };

function open() {
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(`CREATE TABLE IF NOT EXISTS workspace (
    user_id TEXT PRIMARY KEY NOT NULL,
    document TEXT NOT NULL,
    revision INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  )`);
  return db;
}

/** One SQLite connection per server process (survives dev hot reloads). */
export const db = (globalForDb.moasisDb ??= open());
