import { describe, expect, it } from "vitest";
import { migrate } from "./migrate";
import { balance, available, emptyState } from "./state";

describe("migrate", () => {
  it("converts a v2 workspace to exact baisa", () => {
    const s = migrate({
      version: 2,
      venture: { name: "Nook", founder: "Emad", category: "cafe", other: "", city: "Muscat", budget: 10000, started: true },
      answers: { problem: "Hard to find quiet study space" },
      finance: { price: 2.5, variable: 0.9, units: 900, fixed: 1500, setup: 6000, growth: 2, capacity: 0 },
      reserve: 0.1,
      transactions: [
        { id: "1", title: "Capital", amount: 0.3, category: "capital", date: "2026-09-01" },
        { id: "2", title: "Beans", amount: -0.1, category: "inventory", date: "2026-09-02" },
      ],
      tasks: [], learning: { completed: ["cash"], notes: {}, answers: {} }, decisions: [], team: [], clients: [], sessions: [],
    });
    expect(s).not.toBeNull();
    expect(balance(s!)).toBe(200);
    expect(available(s!)).toBe(100);
    expect(s!.finance.price).toBe(2500);
    expect(s!.learning.completed).toEqual(["cash"]);
    expect(s!.finance.capacity).toBeNull();
  });
  it("upgrades v3 and keeps the founder's data", () => {
    const v3 = { ...emptyState(), version: 3, finance: { ...emptyState().finance, capacity: 0 }, answers: { problem: "Late-night study space" } } as Record<string, unknown>;
    delete v3.assumptions; delete v3.tests; delete v3.revisions; delete v3.reviews;
    const s = migrate(v3);
    expect(s?.version).toBe(4);
    expect(s?.finance.capacity).toBeNull();
    expect(s?.answers.problem).toBe("Late-night study space");
    expect(migrate({ ...v3, finance: { ...emptyState().finance, capacity: 450 } })?.finance.capacity).toBe(450);
  });
  it("converts concept state", () => {
    const s = migrate({
      business: { name: "Kiosk", sector: "online", other: "", idea: "", customers: "", location: "Sohar", budget: 12000, experience: "first" },
      reserve: 2500,
      transactions: [{ id: "a", label: "Equipment deposit", amount: 1500, category: "Equipment" }],
      answers: {}, lessons: [], decisions: {},
    });
    expect(s!.venture.sector).toBe("ecommerce");
    expect(balance(s!)).toBe(10_500_000);
    expect(s!.entries[1].category).toBe("equipment");
  });
  it("rejects junk", () => {
    expect(migrate(null)).toBeNull();
    expect(migrate({ version: 9 })).toBeNull();
    expect(migrate({ version: 3, venture: {} })).toBeNull();
  });
});
