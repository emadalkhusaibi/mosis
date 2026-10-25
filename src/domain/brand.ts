import { z } from "zod";

/** The identity a founder builds in the brand studio: a name, three colours and a simple logo. */
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
export const logoShapes = ["circle", "square", "arch", "hex", "leaf", "none"] as const;
export const logoFonts = ["sans", "serif", "heavy"] as const;
export const logoLayouts = ["inline", "stacked"] as const;

export const nameIdeaSchema = z.object({ en: z.string().max(60), ar: z.string().max(60), why: z.string().max(240) });
export type NameIdea = z.infer<typeof nameIdeaSchema>;

export const paletteSchema = z.object({ primary: hex, accent: hex, surface: hex });
export type Palette = z.infer<typeof paletteSchema>;

export const MAX_SVG = 24_000;
export const logoSchema = z.object({
  shape: z.enum(logoShapes),
  mark: z.string().max(3),
  font: z.enum(logoFonts),
  layout: z.enum(logoLayouts),
  /** An AI-drawn logo (SVG markup) that replaces the letter mark when set. */
  custom: z.string().max(MAX_SVG).optional(),
});
export type Logo = z.infer<typeof logoSchema>;

export const chatMessageSchema = z.object({ role: z.enum(["user", "assistant"]), text: z.string().max(2000) });
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const conceptSchema = z.object({ title: z.string().max(60), idea: z.string().max(300), svg: z.string().max(MAX_SVG) });
export type Concept = z.infer<typeof conceptSchema>;

export const brandSchema = z.object({
  name: z.string().max(60),
  nameAr: z.string().max(60),
  tagline: z.string().max(140),
  shortlist: z.array(nameIdeaSchema).max(12),
  colors: paletteSchema,
  logo: logoSchema,
  chat: z.array(chatMessageSchema).max(40),
  /** The latest AI logo concepts, kept so they survive a reload. */
  concepts: z.array(conceptSchema).max(4).optional(),
});
export type Brand = z.infer<typeof brandSchema>;

export const MAX_CHAT = 40;

export function emptyBrand(name = ""): Brand {
  return {
    name,
    nameAr: "",
    tagline: "",
    shortlist: [],
    colors: palettes[0].colors,
    logo: { shape: "circle", mark: initials(name) || "M", font: "sans", layout: "inline" },
    chat: [],
  };
}

/** First letters of up to two words, in whichever script the name is written. */
export function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  // Arabic letters change shape when joined, so one letter reads better than two.
  if (/[؀-ۿ]/.test(name)) return words[0]?.replace(/^ال/, "").charAt(0) ?? "";
  return words.slice(0, 2).map((x) => x.charAt(0).toUpperCase()).join("");
}

/* ---------- Colour ---------- */

const channel = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
export function luminance(h: string) {
  const n = parseInt(h.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}
/** WCAG contrast ratio between two hex colours, 1 to 21. */
export function contrast(a: string, b: string) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
/** Text colour that reads on a given background. */
export const onColor = (bg: string) => (contrast(bg, "#ffffff") >= contrast(bg, "#111418") ? "#ffffff" : "#111418");

export type PaletteOption = { id: string; name: readonly [string, string]; mood: readonly [string, string]; colors: Palette };
export const palettes: PaletteOption[] = [
  { id: "frankincense", name: ["Frankincense", "لُبان"], mood: ["Warm, crafted, heritage", "دافئ، حِرفي، أصيل"], colors: { primary: "#5B4232", accent: "#C8A06A", surface: "#F6F0E7" } },
  { id: "wadi", name: ["Wadi", "وادي"], mood: ["Fresh, natural, calm", "منعش، طبيعي، هادئ"], colors: { primary: "#1F4D3F", accent: "#8DBE9A", surface: "#F1F5F0" } },
  { id: "muttrah", name: ["Muttrah sea", "بحر مطرح"], mood: ["Trustworthy, clean, coastal", "موثوق، نظيف، ساحلي"], colors: { primary: "#14365A", accent: "#4F8FC0", surface: "#EEF3F8" } },
  { id: "desert", name: ["Sharqiya sands", "رمال الشرقية"], mood: ["Bold, sunny, energetic", "جريء، مشمس، نشيط"], colors: { primary: "#9A3B1E", accent: "#E9A23B", surface: "#FBF4EA" } },
  { id: "pomegranate", name: ["Jebel pomegranate", "رمان الجبل"], mood: ["Rich, confident, festive", "غني، واثق، احتفالي"], colors: { primary: "#7A1F2B", accent: "#D96C5F", surface: "#FAF0EE" } },
  { id: "graphite", name: ["Graphite", "جرافيت"], mood: ["Modern, precise, technical", "عصري، دقيق، تقني"], colors: { primary: "#22272D", accent: "#7C8792", surface: "#F1F4F6" } },
  { id: "date", name: ["Date palm", "نخلة"], mood: ["Earthy, generous, family", "ترابي، كريم، عائلي"], colors: { primary: "#4A3B1F", accent: "#A8873A", surface: "#F5F1E6" } },
  { id: "rosewater", name: ["Jebel rose", "ورد الجبل"], mood: ["Soft, caring, elegant", "ناعم، مهتم، أنيق"], colors: { primary: "#6E3A4E", accent: "#E3A6B4", surface: "#FBF2F4" } },
];

/* ---------- Names, offline ---------- */

const roots: [string, string, string, string][] = [
  ["Luban", "لُبان", "frankincense, Oman's oldest trade", "اللبان، أقدم تجارة في عُمان"],
  ["Sidr", "سِدر", "the hardy sidr tree", "شجرة السدر الصامدة"],
  ["Falaj", "فلج", "the falaj channels that share water fairly", "الأفلاج التي تقسم الماء بالعدل"],
  ["Nakhla", "نخلة", "the date palm", "النخلة"],
  ["Darb", "درب", "a path or way", "الطريق"],
  ["Noor", "نور", "light", "الضوء"],
  ["Mawja", "موجة", "a wave", "الموجة"],
  ["Rimal", "رمال", "sands", "الرمال"],
  ["Qimma", "قمّة", "a summit", "القمة"],
  ["Sana", "سنا", "brightness", "الضياء"],
  ["Jisr", "جسر", "a bridge", "الجسر"],
  ["Baraka", "بركة", "blessing and abundance", "البركة والوفرة"],
  ["Wadi", "وادي", "a valley", "الوادي"],
  ["Hikma", "حكمة", "wisdom", "الحكمة"],
  ["Murjan", "مرجان", "coral", "المرجان"],
  ["Nujoom", "نجوم", "stars", "النجوم"],
];

/** What the business is, as it might appear after a name. */
const kinds: Record<string, [string, string][]> = {
  cafe: [["Coffee", "قهوة"], ["Roasters", "محمصة"], ["Café", "مقهى"]],
  restaurant: [["Kitchen", "مطبخ"], ["Table", "سفرة"], ["Grill", "مشويات"]],
  retail: [["Market", "سوق"], ["Store", "متجر"], ["Corner", "ركن"]],
  ecommerce: [["Store", "متجر"], ["Box", "صندوق"], ["Online", "أونلاين"]],
  salon: [["Salon", "صالون"], ["Beauty", "جمال"], ["Studio", "استوديو"]],
  fitness: [["Fitness", "لياقة"], ["Gym", "نادي"], ["Move", "حركة"]],
  services: [["Care", "رعاية"], ["Home", "بيت"], ["Services", "خدمات"]],
  studio: [["Studio", "استوديو"], ["Creative", "إبداع"], ["Works", "أعمال"]],
  tech: [["Labs", "مختبر"], ["Tech", "تقنية"], ["Cloud", "سحابة"]],
  education: [["Academy", "أكاديمية"], ["Learning", "تعلّم"], ["Tutors", "معلّمون"]],
  tourism: [["Trails", "دروب"], ["Journeys", "رحلات"], ["Adventures", "مغامرات"]],
  logistics: [["Express", "إكسبرس"], ["Delivery", "توصيل"], ["Cargo", "شحن"]],
  automotive: [["Auto", "أوتو"], ["Garage", "كراج"], ["Car Care", "عناية السيارات"]],
  events: [["Events", "فعاليات"], ["Catering", "ضيافة"], ["Occasions", "مناسبات"]],
  manufacturing: [["Crafts", "حِرف"], ["Workshop", "ورشة"], ["Made", "صُنع"]],
  other: [["Co.", "شركة"], ["House", "دار"], ["Works", "أعمال"]],
};

/** Deterministic name ideas from Omani roots and the business type, so the studio works without the assistant. */
export function nameIdeas(sector: string, seed: number, lang: "en" | "ar", count = 6): NameIdea[] {
  const k = kinds[sector] ?? kinds.other;
  const out: NameIdea[] = [];
  for (let i = 0; i < count; i++) {
    const r = roots[(seed * 7 + i * 5) % roots.length];
    const kind = k[(seed + i) % k.length];
    out.push({ en: `${r[0]} ${kind[0]}`, ar: `${kind[1]} ${r[1]}`, why: lang === "ar" ? `«${r[1]}» تعني ${r[3]}.` : `${r[0]} (${r[1]}) means ${r[2]}.` });
  }
  return out;
}

/* ---------- AI-drawn logos ---------- */

const SVG_TAGS = new Set(["svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon", "text", "tspan", "defs", "lineargradient", "radialgradient", "stop", "clippath", "title"]);
const SVG_ATTRS = new Set([
  "xmlns", "viewbox", "width", "height", "d", "cx", "cy", "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "points",
  "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "fill-rule", "clip-rule", "opacity",
  "fill-opacity", "stroke-opacity", "transform", "id", "offset", "stop-color", "stop-opacity", "gradientunits", "gradienttransform",
  "clip-path", "font-family", "font-size", "font-weight", "text-anchor", "dominant-baseline", "letter-spacing", "role", "aria-label",
]);

/**
 * Accepts only plain vector drawing: an allowlist of shape elements and attributes, no scripts,
 * styles, links, images or event handlers. url() is allowed only for in-file references (#id).
 * Returns the markup unchanged when it passes, otherwise null.
 */
export function safeSvg(svg: string): string | null {
  const s = svg.trim();
  if (!s.startsWith("<svg") || !s.endsWith("</svg>") || s.length > MAX_SVG) return null;
  if (/<!|<\?|&#|\\/.test(s)) return null;
  const tag = /<\/?([a-zA-Z][\w:-]*)([^>]*)>/g;
  let m: RegExpExecArray | null;
  let last = 0;
  while ((m = tag.exec(s))) {
    // Text between tags may only be words inside <text>/<title>; it can never contain markup.
    if (/[<>]/.test(s.slice(last, m.index))) return null;
    last = tag.lastIndex;
    if (!SVG_TAGS.has(m[1].toLowerCase())) return null;
    const attrs = m[2].replace(/\/\s*$/, "");
    const attr = /\s*([a-zA-Z][\w:-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let rest = attrs;
    let a: RegExpExecArray | null;
    while ((a = attr.exec(attrs))) {
      const name = a[1].toLowerCase();
      const value = a[3] ?? a[4] ?? "";
      if (!SVG_ATTRS.has(name)) return null;
      if (/url\(/i.test(value) && !/^url\(#[\w-]+\)$/.test(value.trim())) return null;
      if (/javascript:|data:|expression\(/i.test(value)) return null;
      rest = rest.replace(a[0], "");
    }
    if (rest.trim()) return null;
  }
  if (/[<>]/.test(s.slice(last))) return null;
  return s;
}

/** An <img>-safe data URI; images never run scripts even if something slipped through. */
export const svgDataUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
