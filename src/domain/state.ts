import { z } from "zod";
import { sectors } from "@/content/sectors";
import { toBaisa, type Baisa } from "@/lib/money";

const MAX_BAISA = 100_000_000_000; // 100 million rials
const baisa = z.number().int().min(0).max(MAX_BAISA);
const signedBaisa = z.number().int().min(-MAX_BAISA).max(MAX_BAISA);
const text = z.string().max(4000);
const isoDate = z.string().max(40);
const sectorIds = sectors.map((s) => s.id) as [string, ...string[]];

export const entryCategories = ["capital", "operations", "equipment", "marketing", "people", "inventory", "research", "practice", "income"] as const;
export type EntryCategory = (typeof entryCategories)[number];

export const stages = ["exploring", "validating", "ready", "operating"] as const;
export type Stage = (typeof stages)[number];

export const financeSchema = z.object({
  /** Price per unit, baisa. */
  price: baisa,
  /** Variable cost per unit, baisa. */
  variable: baisa,
  /** Units sold in month one. */
  units: z.number().int().min(0).max(10_000_000),
  /** Fixed monthly cost, baisa. */
  fixed: baisa,
  /** One-off setup cost, baisa. */
  setup: baisa,
  /** Monthly unit growth, percent. */
  growth: z.number().min(-50).max(100),
  /** Monthly unit capacity; 0 means unlimited. */
  capacity: z.number().int().min(0).max(10_000_000),
});
export type Finance = z.infer<typeof financeSchema>;

export const entrySchema = z.object({
  id: z.string().max(100),
  title: z.string().min(1).max(160),
  /** Signed: income and capital are positive, spending is negative. */
  amount: signedBaisa,
  category: z.enum(entryCategories),
  date: isoDate,
  note: z.string().max(600).optional(),
});
export type Entry = z.infer<typeof entrySchema>;

export const stateSchema = z
  .object({
    version: z.literal(3),
    venture: z.object({
      name: z.string().max(100),
      founder: z.string().max(100),
      sector: z.enum(sectorIds),
      other: z.string().max(120),
      city: z.string().max(80),
      stage: z.enum(stages),
      idea: z.string().max(600),
      capital: baisa,
      started: z.boolean(),
    }),
    answers: z.record(z.string().max(80), text).refine((v) => Object.keys(v).length <= 120),
    finance: financeSchema,
    reserve: baisa,
    entries: z.array(entrySchema).max(5000),
    tasks: z
      .array(z.object({ id: z.string().max(100), title: z.string().max(300), due: z.string().max(30), done: z.boolean() }))
      .max(500),
    learning: z.object({
      completed: z.array(z.string().max(80)).max(200),
      notes: z.record(z.string().max(80), text),
      answers: z.record(z.string().max(80), z.number().int().min(0).max(10)),
    }),
    decisions: z
      .array(z.object({ id: z.string().max(80), choice: z.number().int().min(0).max(5), reflection: text, date: isoDate }))
      .max(200),
    team: z
      .array(z.object({ id: z.string().max(100), name: z.string().max(100), role: z.string().max(120), salary: baisa }))
      .max(100),
    clients: z
      .array(
        z.object({
          id: z.string().max(100),
          name: z.string().max(100),
          business: z.string().max(120),
          sector: z.string().max(80),
          stage: z.string().max(80),
          email: z.string().max(150),
          notes: text,
          review: text,
          evidence: z.number().int().min(1).max(5),
          economics: z.number().int().min(1).max(5),
          operations: z.number().int().min(1).max(5),
          reviewed: z.boolean(),
        }),
      )
      .max(300),
    sessions: z
      .array(z.object({ id: z.string().max(100), clientId: z.string().max(100), date: isoDate, agenda: z.string().max(300), done: z.boolean() }))
      .max(500),
  })
  .superRefine((s, ctx) => {
    if (s.reserve > balance(s)) ctx.addIssue({ code: "custom", message: "Reserve exceeds balance", path: ["reserve"] });
  });
export type State = z.infer<typeof stateSchema>;

export const newId = () => crypto.randomUUID();

export function emptyState(): State {
  return {
    version: 3,
    venture: { name: "", founder: "", sector: "cafe", other: "", city: "Muscat", stage: "exploring", idea: "", capital: toBaisa(10_000), started: false },
    answers: {},
    finance: { price: 0, variable: 0, units: 0, fixed: 0, setup: 0, growth: 0, capacity: 0 },
    reserve: 0,
    entries: [],
    tasks: [],
    learning: { completed: [], notes: {}, answers: {} },
    decisions: [],
    team: [],
    clients: [],
    sessions: [],
  };
}

export function balance(s: Pick<State, "entries">): Baisa {
  return s.entries.reduce((sum, e) => sum + e.amount, 0);
}
export function available(s: Pick<State, "entries" | "reserve">): Baisa {
  return balance(s) - s.reserve;
}
export function spent(s: Pick<State, "entries">): Baisa {
  return s.entries.reduce((sum, e) => (e.amount < 0 ? sum - e.amount : sum), 0);
}

export const ranks = [
  ["Explorer", "مستكشف"],
  ["Builder", "بانٍ"],
  ["Operator", "مدير مشروع"],
  ["Founder", "مؤسس"],
] as const;
const rankThresholds = [0, 300, 800, 1400];

export function level(s: State) {
  const xp = s.learning.completed.length * 100 + s.decisions.length * 100;
  const index = rankThresholds.findLastIndex((t) => xp >= t);
  const next = rankThresholds[index + 1];
  return { xp, index, next: next ?? null, toNext: next ? next - xp : 0, progress: next ? (xp - rankThresholds[index]) / (next - rankThresholds[index]) : 1 };
}
