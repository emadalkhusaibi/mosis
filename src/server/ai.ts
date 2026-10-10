/** Shared guards for the AI routes. */
export const noStore = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export const sameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
};

/** A small per-instance limiter: enough to stop a runaway loop, not a billing control. */
const buckets = new Map<string, number[]>();
export function limited(request: Request, scope: string, max: number, windowMs = 10 * 60_000) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const recent = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  buckets.set(key, recent);
  if (buckets.size > 5000) buckets.clear();
  return recent.length > max;
}

/** The Anthropic key from the environment, tolerating stray spaces or quotes from copy-paste. */
export const anthropicKey = () => process.env.ANTHROPIC_API_KEY?.trim().replace(/^["']|["']$/g, "") || null;
