import { available, newId, type State } from "./state";
import type { Baisa } from "@/lib/money";

export type CommitResult =
  | { ok: true; state: State; replayed: boolean }
  | { ok: false; error: "insufficient_funds" | "invalid_choice" };

/**
 * Commits a CEO decision. Selecting an option elsewhere is only a preview; this
 * is the one place a decision and its practice expense are written, together.
 * Idempotent per scenario: a retry or second click returns the existing
 * decision and never charges twice. Revisiting only updates the reflection.
 */
export function commitDecision(
  s: State,
  input: { scenarioId: string; choice: number; options: number; reflection: string; cost: Baisa; title: string },
): CommitResult {
  const { scenarioId, choice, options, reflection, cost, title } = input;
  if (!Number.isInteger(choice) || choice < 0 || choice >= options) return { ok: false, error: "invalid_choice" };
  const existing = s.decisions.find((d) => d.id === scenarioId);
  if (existing) {
    if (existing.reflection === reflection.trim()) return { ok: true, state: s, replayed: true };
    return { ok: true, replayed: true, state: { ...s, decisions: s.decisions.map((d) => (d.id === scenarioId ? { ...d, reflection: reflection.trim() } : d)) } };
  }
  if (cost > available(s)) return { ok: false, error: "insufficient_funds" };
  const date = new Date().toISOString();
  const entryId = cost > 0 ? newId() : undefined;
  return {
    ok: true,
    replayed: false,
    state: {
      ...s,
      decisions: [...s.decisions, { id: scenarioId, choice, reflection: reflection.trim(), date, entryId, cost, snapshot: s.finance }],
      entries: entryId
        ? [{ id: entryId, title, amount: -cost, category: "practice", date, source: "scenario", sourceId: scenarioId }, ...s.entries]
        : s.entries,
    },
  };
}
