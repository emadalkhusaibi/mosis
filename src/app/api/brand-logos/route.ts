import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { paletteSchema, safeSvg } from "@/domain/brand";
import { sectorOf } from "@/content/sectors";
import { limited, noStore as json, sameOrigin } from "@/server/ai";

export const dynamic = "force-dynamic";
// Drawing three detailed logos takes a while.
export const maxDuration = 120;

const requestSchema = z.object({
  lang: z.enum(["en", "ar"]),
  brief: z.string().max(600),
  venture: z.object({ name: z.string().max(100), sector: z.string().max(40), other: z.string().max(120), city: z.string().max(80), idea: z.string().max(600) }),
  name: z.string().max(60),
  nameAr: z.string().max(60),
  tagline: z.string().max(140),
  colors: paletteSchema,
});

const outputSchema = z.object({
  concepts: z
    .array(
      z.object({
        title: z.string().describe("A 2 to 4 word name for the concept, in the founder's language"),
        idea: z.string().describe("One or two sentences, in the founder's language, on what the mark shows and why it suits the business"),
        svg: z.string().describe("The complete SVG markup for the mark"),
      }),
    )
    .describe("Exactly three distinct logo concepts"),
});

function prompt(b: z.infer<typeof requestSchema>) {
  const sector = sectorOf(b.venture.sector);
  return `Design three distinct logo concepts for a small business in Oman.

Business
- Name: ${b.name || b.venture.name || "not chosen yet"}${b.nameAr ? ` / ${b.nameAr}` : ""}
- Type: ${sector.name[0]}${b.venture.other ? ` (${b.venture.other})` : ""}
- City: ${b.venture.city || "Oman"}
- Idea: ${b.venture.idea || "not written"}
- Tagline: ${b.tagline || "none"}
- Brand colours: main ${b.colors.primary}, accent ${b.colors.accent}, background ${b.colors.surface}
- What the founder asked for: ${b.brief || "nothing specific; use your judgement"}

Each concept is a logo MARK (a symbol), drawn as a single SVG:
- Root element exactly: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">. Keep artwork inside a 16px margin.
- Flat, professional vector design that would work printed on a cup, a sign and a 32px profile picture. Bold, simple silhouettes; no tiny details, no photorealism, no clip-art look.
- Draw a real pictorial or abstract symbol that says something about this business (for example a cup whose steam forms a falaj channel, scissors shaped into an Omani arch, a frankincense tear inside a hexagon). Make the three concepts genuinely different: one pictorial, one abstract or geometric, one that combines a letter or Arabic letterform with a symbol.
- Use only the brand colours above plus white. Transparent background (do not draw a full-size background rectangle).
- Allowed elements only: g, path, circle, ellipse, rect, line, polyline, polygon, text, tspan, defs, linearGradient, radialGradient, stop, clipPath. Allowed attributes: geometry, fill, stroke and its properties, opacity, transform, id, gradient attributes, clip-path, and for text font-family, font-size, font-weight, text-anchor. No style attributes, no <style>, no CSS classes, no images, no links, no scripts, no comments, no entities. url() only as url(#id).
- Prefer paths over text. If you use text, at most 3 characters, with font-family "Sora, Tajawal, sans-serif".
- Keep each SVG under 6,000 characters.

Write "title" and "idea" in ${b.lang === "ar" ? "Arabic" : "English"}.`;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "invalid_origin" }, 403);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503);
  if (limited(request, "logos", 6)) return json({ error: "rate_limited" }, 429);

  const raw = await request.text();
  if (raw.length > 10_000) return json({ error: "too_large" }, 413);
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(JSON.parse(raw));
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const client = new Anthropic();
  try {
    // Streamed so a long drawing never hits the SDK's request timeout.
    const message = await client.beta.messages
      .stream({
        model: "claude-opus-5-5",
        max_tokens: 16000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "medium", format: betaZodOutputFormat(outputSchema) },
        messages: [{ role: "user", content: prompt(body) }],
      })
      .finalMessage();
    if (message.stop_reason === "refusal") return json({ error: "declined" }, 422);
    if (message.stop_reason === "max_tokens") return json({ error: "no_answer" }, 502);
    const text = message.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("");
    const parsed = outputSchema.safeParse(JSON.parse(text));
    if (!parsed.success) return json({ error: "no_answer" }, 502);
    // Anything outside the drawing allowlist is dropped, never repaired.
    const concepts = parsed.data.concepts
      .map((c) => ({ title: c.title.slice(0, 60), idea: c.idea.slice(0, 300), svg: safeSvg(c.svg) }))
      .filter((c): c is { title: string; idea: string; svg: string } => c.svg !== null)
      .slice(0, 4);
    if (!concepts.length) return json({ error: "no_answer" }, 502);
    return json({ concepts });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (error instanceof Anthropic.AuthenticationError) return json({ error: "not_configured" }, 503);
    if (error instanceof Anthropic.APIError) return json({ error: "upstream" }, 502);
    if (error instanceof SyntaxError) return json({ error: "no_answer" }, 502);
    return json({ error: "failed" }, 500);
  }
}
