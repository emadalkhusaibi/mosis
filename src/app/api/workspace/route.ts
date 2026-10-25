import { z } from "zod";
import { workspaces } from "@/server/db";
import { currentUser } from "@/server/auth";
import { stateSchema } from "@/domain/state";
import { migrate } from "@/domain/migrate";

export const dynamic = "force-dynamic";
const MAX_BYTES = 2_000_000;
const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET() {
  const user = await currentUser();
  if (!user) return json({ error: "unauthorized" }, 401);
  const row = await workspaces.get(user.id);
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
  const written =
    data.revision === 0
      ? await workspaces.insert(user.id, doc, stamp)
      : await workspaces.update(user.id, doc, stamp, data.revision);
  if (!written) return json({ error: "conflict" }, 409);
  return json({ revision: data.revision + 1, updatedAt: stamp });
}
