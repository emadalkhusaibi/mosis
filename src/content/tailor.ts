import { sections as baseSections, type Question } from "./sections";
import { scenarios as baseScenarios, type Scenario } from "./scenarios";
import { lessons as baseLessons, type Lesson } from "./lessons";
import { applied } from "./applied";
import { lexiconOf } from "./lexicons";
import { sectorOf } from "./sectors";
import type { Lexicon } from "./lexicon";
import type { Words } from "./words";

/**
 * Plan questions, practice scenarios and lessons, rewritten for one kind of business.
 * Base content carries {tokens}; this fills them from the sector's lexicon and figures,
 * adds an example to each question, a concrete line to each scenario, an
 * "In your business" paragraph to each lesson, and the sector's own extra questions.
 */
type Ctx = { en: Record<string, string>; ar: Record<string, string> };

const AR_DIGITS = "٠١٢٣٤٥٦٧٨٩";
const arNum = (s: string) => s.replace(/\d/g, (d) => AR_DIGITS[+d]).replace(/\./g, "٫").replace(/,/g, "٬");
const rial = (n: number) => n.toFixed(3);
const count = (n: number) => Math.ceil(n).toLocaleString("en-US");

function context(sector: string): Ctx {
  const lex = lexiconOf(sector);
  const pack = sectorOf(sector);
  const nouns = ["customer", "customers", "product", "products", "place", "staff", "peak", "supply"] as const;
  const en: Record<string, string> = {};
  const ar: Record<string, string> = {};
  for (const k of nouns) [en[k], ar[k]] = lex[k];
  const margin = pack.price - pack.variable;
  const figures: Record<string, string> = {
    price: rial(pack.price),
    cost: rial(pack.variable),
    margin: rial(margin),
    fixed: count(pack.fixed),
    breakeven: margin > 0 ? count(pack.fixed / margin) : "—",
  };
  for (const [k, v] of Object.entries(figures)) {
    en[k] = v;
    ar[k] = arNum(v);
  }
  en.unit = pack.unit[0];
  ar.unit = pack.unit[1];
  return { en, ar };
}

const fillOne = (s: string, vars: Record<string, string>) => s.replace(/\{(\w+)\}/g, (m, k: string) => vars[k] ?? m);
export const fill = (words: Words, ctx: Ctx): Words => [fillOne(words[0], ctx.en), fillOne(words[1], ctx.ar)];

const isWords = (v: unknown): v is Words => Array.isArray(v) && v.length === 2 && typeof v[0] === "string" && typeof v[1] === "string";

/** Fills every Words pair inside a content object, leaving everything else as is. */
function deep<T>(v: T, ctx: Ctx): T {
  if (isWords(v)) return fill(v, ctx) as T;
  if (Array.isArray(v)) return v.map((x) => deep(x, ctx)) as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deep(x, ctx)])) as T;
  return v;
}

const join = (a: Words, b: Words): Words => [`${a[0]} ${b[0]}`, `${a[1]} ${b[1]}`];

export type Tailored = {
  sector: string;
  lexicon: Lexicon;
  sections: typeof baseSections;
  scenarios: Scenario[];
  lessons: Lesson[];
};

const cache = new Map<string, Tailored>();

export function tailored(sector: string): Tailored {
  const hit = cache.get(sector);
  if (hit) return hit;
  const lex = lexiconOf(sector);
  const ctx = context(sector);
  const ex = lex.ex as Record<string, Words>;
  const sections = baseSections.map((sec) => {
    const questions: Question[] = sec.questions.map((q) => ({ ...q, example: ex[q.key] }));
    for (const x of lex.extra) if (x.chapter === sec.id) questions.push({ key: x.key, label: x.label, hint: x.hint, optional: true, specific: true });
    return deep({ ...sec, questions }, ctx);
  });
  const scenarios = baseScenarios.map((sc) => {
    const line = (lex.sc as Record<string, Words>)[sc.id];
    return deep({ ...sc, intro: line ? join(line, sc.intro) : sc.intro }, ctx);
  });
  const lessons = baseLessons.map((l) => deep({ ...l, applied: applied[l.id] }, ctx));
  const out = { sector, lexicon: lex, sections, scenarios, lessons };
  cache.set(sector, out);
  return out;
}
