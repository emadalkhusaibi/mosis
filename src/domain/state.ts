import { z } from "zod";
import { sectors } from "@/content/sectors";
import { toBaisa, type Baisa } from "@/lib/money";
import { brandSchema } from "./brand";

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
  /** Monthly unit capacity. null means unlimited; 0 means no capacity at all. */
  capacity: z.number().int().min(0).max(10_000_000).nullable(),
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
  /** Where the entry came from, so history can explain itself. */
  source: z.enum(["manual", "setup", "scenario", "payroll", "reversal"]).optional(),
  /** For scenario/payroll entries: the decision or role id. */
  sourceId: z.string().max(100).optional(),
  /** For reversals: the entry this one cancels. An entry can be reversed once. */
  reverses: z.string().max(100).optional(),
});
export type Entry = z.infer<typeof entrySchema>;

export const assumptionCategories = ["demand", "price", "cost", "operations", "other"] as const;
export const evidenceStates = ["untested", "some", "contradicted", "review"] as const;
export const testOutcomes = ["supports", "contradicts", "inconclusive"] as const;
export const forecastKeys = ["price", "variable", "units", "fixed", "setup", "growth", "capacity"] as const;
export type ForecastKey = (typeof forecastKeys)[number];

const assumptionSchema = z.object({
  id: z.string().max(100),
  statement: z.string().min(1).max(400),
  chapter: z.string().max(40),
  category: z.enum(assumptionCategories),
  impact: z.enum(["high", "medium", "low"]),
  state: z.enum(evidenceStates),
  /** Optional link to one forecast input. Editing the note never edits the number. */
  forecastKey: z.enum(forecastKeys).optional(),
  reviewAt: z.string().max(30).optional(),
  created: isoDate,
});
export type Assumption = z.infer<typeof assumptionSchema>;

const fieldTestSchema = z.object({
  id: z.string().max(100),
  assumptionId: z.string().max(100).optional(),
  belief: z.string().max(600),
  action: z.string().max(600),
  observe: z.string().max(600),
  decisionRule: z.string().max(600),
  plannedFor: z.string().max(30).optional(),
  status: z.enum(["planned", "done"]),
  finding: z.string().max(2000),
  outcome: z.enum(testOutcomes).optional(),
  limitations: z.string().max(1000),
  sourceUrl: z.string().max(500).optional(),
  observedAt: z.string().max(30).optional(),
  created: isoDate,
});
export type FieldTest = z.infer<typeof fieldTestSchema>;

const revisionSchema = z.object({
  id: z.string().max(100),
  key: z.enum(forecastKeys),
  from: z.number().nullable(),
  to: z.number().nullable(),
  testId: z.string().max(100).optional(),
  reason: z.string().max(400),
  date: isoDate,
});
export type Revision = z.infer<typeof revisionSchema>;

const reviewSchema = z.object({
  id: z.string().max(100),
  date: isoDate,
  changed: z.string().max(2000),
  learned: z.string().max(2000),
  forecast: z.string().max(2000),
  next: z.string().max(600),
});
export type WeeklyReview = z.infer<typeof reviewSchema>;

export const stateSchema = z
  .object({
    version: z.literal(4),
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
      .array(
        z.object({
          id: z.string().max(80),
          choice: z.number().int().min(0).max(5),
          reflection: text,
          date: isoDate,
          /** The practice expense this decision created, if any. */
          entryId: z.string().max(100).optional(),
          cost: baisa.optional(),
          /** Assumptions as they stood when the decision was made. */
          snapshot: financeSchema.optional(),
        }),
      )
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
    assumptions: z.array(assumptionSchema).max(200),
    tests: z.array(fieldTestSchema).max(500),
    revisions: z.array(revisionSchema).max(2000),
    reviews: z.array(reviewSchema).max(520),
    /** Omani market calendar in the forecast. Undefined means on. */
    calendar: z.boolean().optional(),
    /** Daily five-minute decisions: one per day, reflection only, no money moves. */
    daily: z
      .array(z.object({ date: z.string().max(10), id: z.string().max(80), choice: z.number().int().min(0).max(5) }))
      .max(800)
      .optional(),
    /** Launch bridge: ids of real-world steps the founder has ticked off. */
    launch: z.array(z.string().max(40)).max(40).optional(),
    /** Brand studio. Optional so older workspaces load unchanged. */
    brand: brandSchema.optional(),
  })
  .superRefine((s, ctx) => {
    if (s.reserve > balance(s)) ctx.addIssue({ code: "custom", message: "Reserve exceeds balance", path: ["reserve"] });
    const reversed = new Set<string>();
    for (const e of s.entries) {
      if (!e.reverses) continue;
      if (reversed.has(e.reverses)) ctx.addIssue({ code: "custom", message: "Entry reversed twice", path: ["entries"] });
      reversed.add(e.reverses);
    }
  });
export type State = z.infer<typeof stateSchema>;

export const newId = () => crypto.randomUUID();

export function emptyState(): State {
  return {
    version: 4,
    venture: { name: "", founder: "", sector: "cafe", other: "", city: "Muscat", stage: "exploring", idea: "", capital: toBaisa(10_000), started: false },
    answers: {},
    finance: { price: 0, variable: 0, units: 0, fixed: 0, setup: 0, growth: 0, capacity: null },
    reserve: 0,
    entries: [],
    tasks: [],
    learning: { completed: [], notes: {}, answers: {} },
    decisions: [],
    team: [],
    clients: [],
    sessions: [],
    assumptions: [],
    tests: [],
    revisions: [],
    reviews: [],
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

/** XP is derived from unique completions, so retries and reloads can never farm it. */
export function level(s: State) {
  const xp = new Set(s.learning.completed).size * 100 + new Set(s.decisions.map((d) => d.id)).size * 100;
  const index = rankThresholds.findLastIndex((t) => xp >= t);
  const next = rankThresholds[index + 1];
  return { xp, index, next: next ?? null, toNext: next ? next - xp : 0, progress: next ? (xp - rankThresholds[index]) / (next - rankThresholds[index]) : 1 };
}
