import { describe, expect, it } from "vitest";
import { emptyState } from "./state";
import { addAssumption, planTest, recordFinding } from "./evidence";
import { readiness, skillIds } from "./readiness";

const now = new Date(2026, 9, 24);

describe("readiness", () => {
  it("scores every skill out of 100 from named items", () => {
    const r = readiness(emptyState(), now);
    expect(r.skills.map((s) => s.id)).toEqual([...skillIds]);
    for (const s of r.skills) expect(s.items.reduce((sum, i) => sum + i.points, 0)).toBe(100);
    expect(r.stage).toBe("starting");
  });

  it("points to the biggest missing item", () => {
    const r = readiness(emptyState(), now);
    const customer = r.skills.find((s) => s.id === "customer")!;
    expect(customer.next?.id).toBe("c-test");
  });

  it("credits real field evidence", () => {
    let s = addAssumption(emptyState(), { statement: "People will pay 2 rials", impact: "high", category: "price", chapter: "customer" });
    s = planTest(s, { assumptionId: s.assumptions[0].id, belief: "x", action: "Ask 10 people", observe: "Yes count", decisionRule: "Under 5: lower" });
    s = recordFinding(s, s.tests[0].id, { outcome: "supports", finding: "7 of 10 said yes", limitations: "Friends" });
    const r = readiness(s, now);
    expect(r.skills.find((x) => x.id === "pricing")!.score).toBe(40);
    expect(r.skills.find((x) => x.id === "risk")!.items.find((i) => i.id === "r-high")!.earned).toBe(true);
    expect(r.overall).toBeGreaterThan(readiness(emptyState(), now).overall);
  });
});
