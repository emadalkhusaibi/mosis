import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { brandSchema, chatMessageSchema, logoShapes, logoFonts } from "@/domain/brand";
import { sectorOf } from "@/content/sectors";
import { anthropicKey, limited, noStore as json, sameOrigin } from "@/server/ai";

export const dynamic = "force-dynamic";

const MAX_BODY = 40_000;
const MAX_TURNS = 12;

/** What the browser sends: the conversation so far plus enough context to stay specific. */
const requestSchema = z.object({
  lang: z.enum(["en", "ar"]),
  messages: z.array(chatMessageSchema).min(1).max(MAX_TURNS * 2),
  venture: z.object({
    name: z.string().max(100),
    sector: z.string().max(40),
    other: z.string().max(120),
    city: z.string().max(80),
    idea: z.string().max(600),
  }),
  brand: brandSchema.omit({ chat: true, concepts: true }),
  usesDrawnLogo: z.boolean().optional(),
});

/** What the model must return. Lengths are enforced after parsing. */
const hex = z.string().describe("A colour as #RRGGBB");
const replySchema = z.object({
  reply: z.string().describe("Your conversational answer, in the founder's language, under 120 words."),
  names: z.array(z.object({ en: z.string(), ar: z.string(), why: z.string() })).describe("0 to 5 name ideas. Empty unless names are being discussed."),
  palettes: z.array(z.object({ name: z.string(), primary: hex, accent: hex, surface: hex, why: z.string() })).describe("0 to 3 palettes. Empty unless colours are being discussed."),
  logo: z
    .object({ shape: z.enum(logoShapes), mark: z.string().describe("1 to 3 characters"), font: z.enum(logoFonts), why: z.string() })
    .nullable()
    .describe("A logo suggestion, or null unless the logo is being discussed."),
});

const isHex = (s: string) => /^#[0-9a-fA-F]{6}$/.test(s);

function systemPrompt(v: z.infer<typeof requestSchema>["venture"], b: z.infer<typeof requestSchema>["brand"], lang: "en" | "ar", drawn: boolean) {
  const sector = sectorOf(v.sector);
  return `You are the brand partner inside Moasis, a workspace for people starting small businesses in Oman. You help one founder create their business name, colours and a simple logo. You are warm, direct and practical, like an experienced Omani designer who also understands small-business budgets.

The founder's business
- Type: ${sector.name[0]}${v.other ? ` (${v.other})` : ""}
- Working name: ${v.name || "not chosen yet"}
- City: ${v.city || "Oman"}
- Idea in their words: ${v.idea || "not written yet"}

Their brand so far
- Name: ${b.name || "none"}${b.nameAr ? ` / ${b.nameAr}` : ""}
- Tagline: ${b.tagline || "none"}
- Colours: primary ${b.colors.primary}, accent ${b.colors.accent}, background ${b.colors.surface}
- Logo: ${drawn ? "an AI-drawn logo picked from the concepts the studio drew" : `${b.logo.shape} shape, mark "${b.logo.mark}", ${b.logo.font} lettering`}
- Shortlisted names: ${b.shortlist.map((n) => `${n.en} / ${n.ar}`).join("; ") || "none"}

How to help
- Reply in ${lang === "ar" ? "Arabic (Modern Standard, natural for Gulf readers)" : "English"}. Keep replies under 120 words. Ask at most one question at a time.
- Names: every idea has an English form and an Arabic form that sound related, are easy to say in both, and suit Oman. Explain the meaning briefly in "why". Avoid names of real, well-known companies and religious or tribal names. Remind the founder to check availability on the Oman Business Platform and for social handles; never claim a name is available or registrable.
- Colours: suggest palettes where text on the primary colour is readable. Primary and background must contrast strongly. Say what feeling each palette gives.
- Logo: the studio has a "Draw logo ideas" button in the Logo section that draws full pictorial logo concepts; when the founder wants a drawn logo, help them write a short description to put in that box. For a simple letter mark you can suggest a shape (circle, square, arch, hexagon, leaf or none) with 1 to 3 letters.
- Only fill "names", "palettes" or "logo" when they are being discussed; otherwise leave them empty or null.
- You only help with naming, colour, logo, tagline and brand voice for this business. Politely decline other requests.`;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: "invalid_origin" }, 403);
  const apiKey = anthropicKey();
  if (!apiKey) return json({ error: "not_configured" }, 503);

  if (limited(request, "chat", 20)) return json({ error: "rate_limited" }, 429);

  const raw = await request.text();
  if (raw.length > MAX_BODY) return json({ error: "too_large" }, 413);
  let body: z.infer<typeof requestSchema>;
  try {
    body = requestSchema.parse(JSON.parse(raw));
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  const turns = body.messages.slice(-MAX_TURNS * 2);
  // The conversation must start with the founder.
  while (turns.length && turns[0].role !== "user") turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== "user") return json({ error: "invalid_request" }, 400);

  const client = new Anthropic({ apiKey });
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(replySchema) },
      system: systemPrompt(body.venture, body.brand, body.lang, Boolean(body.usesDrawnLogo)),
      messages: turns.map((m) => ({ role: m.role, content: m.text })),
    });
    if (response.stop_reason === "refusal") return json({ error: "declined" }, 422);
    const out = response.parsed_output;
    if (!out) return json({ error: "no_answer" }, 502);
    return json({
      reply: out.reply.slice(0, 2000),
      names: out.names.slice(0, 5).map((n) => ({ en: n.en.slice(0, 60), ar: n.ar.slice(0, 60), why: n.why.slice(0, 240) })),
      palettes: out.palettes
        .filter((x) => isHex(x.primary) && isHex(x.accent) && isHex(x.surface))
        .slice(0, 3)
        .map((x) => ({ ...x, name: x.name.slice(0, 40), why: x.why.slice(0, 240) })),
      logo: out.logo ? { ...out.logo, mark: [...out.logo.mark].slice(0, 3).join(""), why: out.logo.why.slice(0, 240) } : null,
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 429);
    if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError) return json({ error: "key_rejected" }, 503);
    if (error instanceof Anthropic.BadRequestError && /credit|billing/i.test(error.message)) return json({ error: "no_credit" }, 402);
    if (error instanceof Anthropic.APIError) return json({ error: "upstream" }, 502);
    return json({ error: "failed" }, 500);
  }
}
