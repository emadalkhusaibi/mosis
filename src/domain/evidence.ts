import { newId, type Assumption, type FieldTest, type Finance, type ForecastKey, type State, type WeeklyReview } from "./state";

/**
 * Evidence: assumptions the plan rests on, field tests that check them outside,
 * and the weekly review that turns what was learned into changes.
 *
 * Rules kept here so every screen follows them:
 * - A finding moves its assumption's state; it never edits forecast numbers by itself.
 * - Changing a forecast number because of a test is a separate, recorded revision.
 * - Review weeks run Sunday to Saturday, the Omani working week.
 */
export type Outcome = NonNullable<FieldTest["outcome"]>;

const today = () => new Date().toISOString();

export function addAssumption(s: State, a: Pick<Assumption, "statement" | "category" | "impact" | "chapter"> & { forecastKey?: ForecastKey }): State {
  const item: Assumption = { id: newId(), state: "untested", created: today(), ...a };
  return { ...s, assumptions: [item, ...s.assumptions] };
}

export function removeAssumption(s: State, id: string): State {
  return { ...s, assumptions: s.assumptions.filter((a) => a.id !== id), tests: s.tests.map((x) => (x.assumptionId === id ? { ...x, assumptionId: undefined } : x)) };
}

export function planTest(s: State, t: Pick<FieldTest, "belief" | "action" | "observe" | "decisionRule"> & { assumptionId?: string; plannedFor?: string }): State {
  const test: FieldTest = { id: newId(), status: "planned", finding: "", limitations: "", created: today(), ...t };
  return { ...s, tests: [test, ...s.tests] };
}

const stateFor: Record<Outcome, Assumption["state"]> = { supports: "some", contradicts: "contradicted", inconclusive: "review" };

/** Records what happened. The linked assumption follows the outcome. */
export function recordFinding(s: State, id: string, f: { outcome: Outcome; finding: string; limitations: string; sourceUrl?: string }): State {
  const test = s.tests.find((x) => x.id === id);
  if (!test) return s;
  const observedAt = today();
  return {
    ...s,
    tests: s.tests.map((x) => (x.id === id ? { ...x, ...f, status: "done", observedAt } : x)),
    assumptions: test.assumptionId ? s.assumptions.map((a) => (a.id === test.assumptionId ? { ...a, state: stateFor[f.outcome] } : a)) : s.assumptions,
  };
}

export function removeTest(s: State, id: string): State {
  return { ...s, tests: s.tests.filter((x) => x.id !== id) };
}

/** Changes one forecast number and records why, linked to the test that prompted it. */
export function reviseForecast(s: State, key: ForecastKey, to: Finance[ForecastKey], reason: string, testId?: string): State {
  const from = s.finance[key];
  if (from === to) return s;
  return {
    ...s,
    finance: { ...s.finance, [key]: to },
    revisions: [{ id: newId(), key, from, to, reason, testId, date: today() }, ...s.revisions],
  };
}

/** Sunday that starts the week holding `d`, as YYYY-MM-DD (local time). */
export function weekStart(d: Date = new Date()): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay());
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
}

export const reviewThisWeek = (s: Pick<State, "reviews">, now: Date = new Date()) => s.reviews.find((r) => weekStart(new Date(r.date)) === weekStart(now)) ?? null;

export function saveReview(s: State, r: Pick<WeeklyReview, "learned" | "changed" | "forecast" | "next">, now: Date = new Date()): State {
  const existing = reviewThisWeek(s, now);
  if (existing) return { ...s, reviews: s.reviews.map((x) => (x.id === existing.id ? { ...x, ...r } : x)) };
  return { ...s, reviews: [{ id: newId(), date: now.toISOString(), ...r }, ...s.reviews] };
}

/** Consecutive reviewed weeks ending this week (or last week, if this week isn't done yet). */
export function reviewStreak(s: Pick<State, "reviews">, now: Date = new Date()): number {
  const weeks = new Set(s.reviews.map((r) => weekStart(new Date(r.date))));
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  if (!weeks.has(weekStart(cursor))) cursor.setDate(cursor.getDate() - 7);
  let n = 0;
  while (weeks.has(weekStart(cursor))) {
    n++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return n;
}

export function evidenceSummary(s: Pick<State, "assumptions" | "tests" | "reviews" | "revisions">, now: Date = new Date()) {
  const done = s.tests.filter((x) => x.status === "done");
  const highUntested = s.assumptions.filter((a) => a.impact === "high" && a.state === "untested");
  return {
    assumptions: s.assumptions.length,
    untested: s.assumptions.filter((a) => a.state === "untested").length,
    supported: s.assumptions.filter((a) => a.state === "some").length,
    contradicted: s.assumptions.filter((a) => a.state === "contradicted").length,
    highUntested,
    planned: s.tests.filter((x) => x.status === "planned").length,
    done: done.length,
    revisions: s.revisions.length,
    streak: reviewStreak(s, now),
    reviewedThisWeek: Boolean(reviewThisWeek(s, now)),
  };
}
