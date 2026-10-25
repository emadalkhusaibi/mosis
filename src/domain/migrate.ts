import { emptyState, entryCategories, stateSchema, type EntryCategory, type State } from "./state";
import { sectors } from "@/content/sectors";
import { toBaisa } from "@/lib/money";

const sectorIds = new Set<string>(sectors.map((s) => s.id));
const conceptSectorMap: Record<string, string> = { online: "ecommerce" };
const categorySet = new Set<string>(entryCategories);
const asCategory = (c: unknown, fallback: EntryCategory): EntryCategory =>
  typeof c === "string" && categorySet.has(c.toLowerCase()) ? (c.toLowerCase() as EntryCategory) : fallback;
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
type Loose = any;

/** Converts a version-2 workspace (rials as JS numbers) from the original "/" app. */
function fromV2(d: Loose): State {
  const base = emptyState();
  const sector = sectorIds.has(d.venture?.category) ? d.venture.category : "other";
  return {
    ...base,
    venture: {
      ...base.venture,
      name: str(d.venture?.name, 100),
      founder: str(d.venture?.founder, 100),
      sector,
      other: str(d.venture?.other, 120),
      city: str(d.venture?.city, 80) || "Muscat",
      capital: toBaisa(num(d.venture?.budget)),
      started: Boolean(d.venture?.started),
    },
    answers: d.answers ?? {},
    finance: {
      price: toBaisa(num(d.finance?.price)),
      variable: toBaisa(num(d.finance?.variable)),
      units: Math.round(num(d.finance?.units)),
      fixed: toBaisa(num(d.finance?.fixed)),
      setup: toBaisa(num(d.finance?.setup)),
      growth: num(d.finance?.growth),
      // Older apps used 0 for "unlimited"; v4 makes that explicit.
      capacity: num(d.finance?.capacity) > 0 ? Math.round(num(d.finance?.capacity)) : null,
    },
    reserve: toBaisa(num(d.reserve)),
    entries: (d.transactions ?? []).map((t: Loose) => ({
      id: str(t.id, 100),
      title: str(t.title, 160) || "Entry",
      amount: toBaisa(num(t.amount)),
      category: asCategory(t.category, num(t.amount) >= 0 ? "income" : "operations"),
      date: str(t.date, 40),
    })),
    tasks: d.tasks ?? [],
    learning: d.learning ?? base.learning,
    decisions: d.decisions ?? [],
    team: (d.team ?? []).map((m: Loose) => ({ ...m, salary: toBaisa(num(m.salary)) })),
    clients: (d.clients ?? []).map((c: Loose) => ({ ...c, sector: str(c.category, 80), category: undefined })),
    sessions: d.sessions ?? [],
  };
}

/** Converts the browser-only "/concept" practice state (key moasis-liquid-v1). */
function fromConcept(d: Loose): State {
  const base = emptyState();
  const raw = conceptSectorMap[d.business?.sector] ?? d.business?.sector;
  const sector = sectorIds.has(raw) ? raw : "other";
  const capital = toBaisa(num(d.business?.budget));
  const now = new Date().toISOString();
  return {
    ...base,
    venture: {
      ...base.venture,
      name: str(d.business?.name, 100),
      sector,
      other: str(d.business?.other, 120),
      city: str(d.business?.location, 80) || "Muscat",
      idea: str(d.business?.idea, 600),
      capital,
      started: true,
    },
    reserve: toBaisa(num(d.reserve)),
    entries: [
      { id: crypto.randomUUID(), title: "Practice capital", amount: capital, category: "capital", date: now },
      ...(d.transactions ?? []).map((t: Loose) => ({
        id: str(t.id, 100),
        title: str(t.label, 160) || "Expense",
        amount: -toBaisa(num(t.amount)),
        category: asCategory(t.category, "operations"),
        date: now,
      })),
    ],
    answers: d.answers ?? {},
  };
}

/** v3 → v4: explicit unlimited capacity and the evidence collections. Everything else carries over. */
function fromV3(d: Loose): unknown {
  const cap = d.finance?.capacity;
  return {
    ...d,
    version: 4,
    finance: { ...d.finance, capacity: typeof cap === "number" && cap > 0 ? cap : null },
    assumptions: [],
    tests: [],
    revisions: [],
    reviews: [],
  };
}

/** Accepts any known workspace shape and returns a valid v4 state, or null. Never throws. */
export function migrate(input: unknown): State | null {
  if (!input || typeof input !== "object") return null;
  const d = input as Loose;
  let candidate: unknown;
  try {
    if (d.version === 4) candidate = d;
    else if (d.version === 3) candidate = fromV3(d);
    else if (d.version === 2) candidate = fromV2(d);
    else if (d.business && Array.isArray(d.transactions)) candidate = fromConcept(d);
    else return null;
  } catch {
    return null;
  }
  const parsed = stateSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
