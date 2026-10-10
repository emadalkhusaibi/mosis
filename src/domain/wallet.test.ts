import { describe, expect, it } from "vitest";
import { adjustCapital, recordExpense, reverseEntry, setReserve } from "./wallet";
import { commitDecision } from "./decisions";
import { available, balance, emptyState, level, stateSchema, type State } from "./state";

function funded(): State {
  const s = emptyState();
  return { ...s, venture: { ...s.venture, capital: 10_000_000, started: true }, entries: [{ id: "c", title: "Capital", amount: 10_000_000, category: "capital", date: "2026-10-01", source: "setup" }] };
}
const must = (r: { ok: boolean; state?: State }) => {
  if (!r.ok || !r.state) throw new Error("expected ok");
  return r.state;
};

describe("wallet", () => {
  it("separates reserve from spending", () => {
    const s = must(setReserve(funded(), 3_000_000));
    expect(balance(s)).toBe(10_000_000);
    expect(available(s)).toBe(7_000_000);
  });
  it("records expenses exactly and refuses overspend", () => {
    let s = must(setReserve(funded(), 2_500_000));
    s = must(recordExpense(s, "Coffee machine", 7_500_000, "equipment"));
    expect(available(s)).toBe(0);
    expect(recordExpense(s, "Beans", 1, "inventory")).toEqual({ ok: false, error: "insufficient_funds" });
    expect(stateSchema.safeParse(s).success).toBe(true);
  });
  it("records a 0.001 expense", () => {
    expect(balance(must(recordExpense(funded(), "Stamp", 1, "operations")))).toBe(9_999_999);
  });
  it("keeps the reserve within balance", () => {
    expect(setReserve(funded(), 10_000_001)).toEqual({ ok: false, error: "reserve_exceeds_balance" });
  });
  it("adjusts capital by recording the difference", () => {
    const r = adjustCapital(funded(), 12_000_000, "Capital adjusted");
    expect(r.ok && balance(r.state)).toBe(12_000_000);
    const s = must(setReserve(funded(), 9_000_000));
    expect(adjustCapital(s, 5_000_000, "x")).toEqual({ ok: false, error: "capital_below_spent" });
  });
  it("reverses an entry once, keeping history", () => {
    const r = recordExpense(funded(), "Sign", 400_000, "marketing");
    const s = must(r);
    const id = (r as { entryId: string }).entryId;
    const undone = must(reverseEntry(s, id, "Undo: Sign"));
    expect(balance(undone)).toBe(10_000_000);
    expect(undone.entries).toHaveLength(3);
    expect(reverseEntry(undone, id, "again")).toEqual({ ok: false, error: "already_reversed" });
    expect(reverseEntry(undone, undone.entries[0].id, "x")).toEqual({ ok: false, error: "already_reversed" });
    expect(reverseEntry(undone, "c", "x")).toEqual({ ok: false, error: "linked_entry" });
  });
  it("won't reverse income below the reserve", () => {
    const r = adjustCapital(funded(), 10_000_000, "noop");
    expect(r.ok).toBe(true);
    const withIncome = { ...funded(), entries: [{ id: "i", title: "Sale", amount: 1_000_000, category: "income" as const, date: "", source: "manual" as const }, ...funded().entries] };
    const s = must(setReserve(withIncome, 10_500_000));
    expect(reverseEntry(s, "i", "x")).toEqual({ ok: false, error: "reversal_breaks_reserve" });
  });
});

describe("decisions", () => {
  const input = { scenarioId: "pricing", choice: 1, options: 3, reflection: "Watch repeat orders", cost: 500_000, title: "Run a promotion" };
  it("creates one decision and one linked expense, even when retried", () => {
    const first = commitDecision(funded(), input);
    const s = must(first);
    expect(s.decisions).toHaveLength(1);
    expect(balance(s)).toBe(9_500_000);
    expect(s.entries[0]).toMatchObject({ source: "scenario", sourceId: "pricing", amount: -500_000 });
    expect(s.decisions[0].entryId).toBe(s.entries[0].id);
    const again = commitDecision(s, input);
    expect(again.ok && again.replayed).toBe(true);
    expect(must(again)).toBe(s);
    expect(level(s).xp).toBe(100);
  });
  it("refuses an unaffordable or invalid option", () => {
    expect(commitDecision(funded(), { ...input, cost: 20_000_000 })).toEqual({ ok: false, error: "insufficient_funds" });
    expect(commitDecision(funded(), { ...input, choice: 3 })).toEqual({ ok: false, error: "invalid_choice" });
  });
  it("counts lesson XP once", () => {
    const s = { ...funded(), learning: { completed: ["cash", "cash"], notes: {}, answers: {} } };
    expect(level(s).xp).toBe(100);
  });
});
