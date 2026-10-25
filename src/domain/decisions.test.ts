import { describe, expect, it } from "vitest";
import { commitDecision } from "./decisions";
import { available, emptyState, type State } from "./state";

function started(): State {
  const s = emptyState();
  return { ...s, venture: { ...s.venture, started: true }, reserve: 2_000_000, entries: [{ id: "cap", title: "Capital", amount: 10_000_000, category: "capital", date: "2026-10-01T00:00:00.000Z", source: "setup" }] };
}
const input = { scenarioId: "capacity", choice: 1, options: 3, reflection: "Watch error rate", cost: 120_000, title: "Improve the process first" };

describe("commitDecision", () => {
  it("writes one decision and one linked expense together", () => {
    const r = commitDecision(started(), input);
    expect(r.ok && !r.replayed).toBe(true);
    if (!r.ok) return;
    expect(r.state.decisions).toHaveLength(1);
    const entry = r.state.entries[0];
    expect(entry).toMatchObject({ amount: -120_000, source: "scenario", sourceId: "capacity" });
    expect(r.state.decisions[0]).toMatchObject({ entryId: entry.id, cost: 120_000 });
    expect(available(r.state)).toBe(8_000_000 - 120_000);
  });

  it("is idempotent: a retry never charges twice", () => {
    const first = commitDecision(started(), input);
    if (!first.ok) throw new Error("expected ok");
    const again = commitDecision(first.state, input);
    expect(again.ok && again.replayed).toBe(true);
    if (!again.ok) return;
    expect(again.state).toBe(first.state);
    expect(again.state.entries.filter((e) => e.source === "scenario")).toHaveLength(1);
  });

  it("only updates the reflection when revisited", () => {
    const first = commitDecision(started(), input);
    if (!first.ok) throw new Error("expected ok");
    const edit = commitDecision(first.state, { ...input, choice: 0, reflection: "Changed my mind about timing" });
    if (!edit.ok) throw new Error("expected ok");
    expect(edit.state.decisions[0]).toMatchObject({ choice: 1, reflection: "Changed my mind about timing" });
    expect(edit.state.entries).toHaveLength(first.state.entries.length);
  });

  it("refuses options that would dip into the reserve", () => {
    expect(commitDecision(started(), { ...input, cost: 8_000_001 })).toEqual({ ok: false, error: "insufficient_funds" });
  });

  it("rejects invalid choices", () => {
    expect(commitDecision(started(), { ...input, choice: 3 })).toEqual({ ok: false, error: "invalid_choice" });
  });

  it("records a free option without a wallet entry", () => {
    const r = commitDecision(started(), { ...input, cost: 0 });
    if (!r.ok) throw new Error("expected ok");
    expect(r.state.entries).toHaveLength(1);
    expect(r.state.decisions[0].entryId).toBeUndefined();
  });
});
