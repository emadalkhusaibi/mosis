import { z } from "zod";
import { db } from "@/server/db";
import { currentUser } from "@/server/auth";
import { stateSchema } from "@/domain/state";
import { migrate } from "@/domain/migrate";

export const dynamic = "force-dynamic";
const MAX_BYTES = 2_000_000;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

type Row = { document: string; revision: number; updated_at: string };

export async function GET() {
  const user = await currentUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const row = db.prepare("SELECT document, revision, updated_at FROM workspace WHERE user_id = ?").get(user.id) as Row | undefined;
  return json({
    user: { name: user.name, email: user.email },
    state: row ? migrate(JSON.parse(row.document)) : null,
    revision: row?.revision ?? 0,
    updatedAt: row?.updated_at ?? null,
  });
}

export async function PUT(request: Request) {
  const user = await currentUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ error: "invalid_origin" }, 403);
  const body = await request.text();
  if (body.length > MAX_BYTES) return json({ error: "too_large" }, 413);
  let data: { state: z.infer<typeof stateSchema>; revision: number };
  try {
    data = z.object({ state: stateSchema, revision: z.number().int().min(0) }).parse(JSON.parse(body));
  } catch {
    return json({ error: "invalid_document" }, 400);
  }
  const stamp = new Date().toISOString();
  const doc = JSON.stringify(data.state);
  // Optimistic concurrency: a stale revision never overwrites a newer save.
  const result =
    data.revision === 0
      ? db.prepare("INSERT INTO workspace (user_id, document, revision, updated_at) VALUES (?, ?, 1, ?) ON CONFLICT(user_id) DO NOTHING").run(user.id, doc, stamp)
      : db.prepare("UPDATE workspace SET document = ?, revision = revision + 1, updated_at = ? WHERE user_id = ? AND revision = ?").run(doc, stamp, user.id, data.revision);
  if (result.changes !== 1) return json({ error: "conflict" }, 409);
  return json({ revision: data.revision + 1, updatedAt: stamp });
}
