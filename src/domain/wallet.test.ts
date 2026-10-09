import { describe, expect, it } from "vitest";
import { adjustCapital, recordExpense, setReserve } from "./wallet";
import { available, balance, emptyState, stateSchema, type State } from "./state";

function funded(): State {
  const s = emptyState();
  return { ...s, venture: { ...s.venture, capital: 10_000_000, started: true }, entries: [{ id: "c", title: "Capital", amount: 10_000_000, category: "capital", date: "2026-10-01" }] };
}

describe("wallet", () => {
  it("records expenses exactly and refuses overspend", () => {
    let s = funded();
    const r = setReserve(s, 2_500_000);
    expect(r.ok).toBe(true);
    s = (r as { state: State }).state;
    const e = recordExpense(s, "Coffee machine", 7_500_000, "equipment");
    expect(e.ok).toBe(true);
    s = (e as { state: State }).state;
    expect(available(s)).toBe(0);
    expect(recordExpense(s, "Beans", 1, "inventory")).toEqual({ ok: false, error: "insufficient_funds" });
    expect(stateSchema.safeParse(s).success).toBe(true);
  });
  it("keeps the reserve within balance", () => {
    expect(setReserve(funded(), 10_000_001)).toEqual({ ok: false, error: "reserve_exceeds_balance" });
  });
  it("adjusts capital by recording the difference", () => {
    const r = adjustCapital(funded(), 12_000_000, "Capital adjusted");
    expect(r.ok && balance(r.state)).toBe(12_000_000);
    const s = (setReserve(funded(), 9_000_000) as { state: State }).state;
    expect(adjustCapital(s, 5_000_000, "x")).toEqual({ ok: false, error: "capital_below_spent" });
  });
});
