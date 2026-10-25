import { describe, expect, it } from "vitest";
import { emptyState, stateSchema } from "./state";
import { addAssumption, evidenceSummary, planTest, recordFinding, reviewStreak, reviseForecast, saveReview, weekStart } from "./evidence";

const base = () => addAssumption(emptyState(), { statement: "40 people a day will buy", impact: "high", category: "demand", chapter: "customer" });

describe("evidence", () => {
  it("moves the linked assumption with the finding, and nothing else", () => {
    let s = base();
    const a = s.assumptions[0];
    s = planTest(s, { assumptionId: a.id, belief: a.statement, action: "Count footfall", observe: "People per hour", decisionRule: "Under 20: rethink" });
    const finance = s.finance;
    s = recordFinding(s, s.tests[0].id, { outcome: "contradicts", finding: "Only 12 an hour", limitations: "One morning" });
    expect(s.assumptions[0].state).toBe("contradicted");
    expect(s.tests[0]).toMatchObject({ status: "done", outcome: "contradicts" });
    expect(s.finance).toBe(finance);
    expect(stateSchema.safeParse(s).success).toBe(true);
  });

  it("records every forecast revision with its reason", () => {
    const s = reviseForecast(emptyState(), "units", 500, "Footfall was lower", "t1");
    expect(s.finance.units).toBe(500);
    expect(s.revisions[0]).toMatchObject({ key: "units", from: 0, to: 500, testId: "t1" });
    expect(reviseForecast(s, "units", 500, "same")).toBe(s);
  });

  it("uses Sunday-to-Saturday weeks", () => {
    expect(weekStart(new Date(2026, 9, 24))).toBe("2026-10-18"); // Saturday
    expect(weekStart(new Date(2026, 9, 25))).toBe("2026-10-25"); // Sunday
  });

  it("keeps one review per week and counts the streak", () => {
    const now = new Date(2026, 9, 22);
    let s = saveReview(emptyState(), { learned: "a", changed: "", forecast: "", next: "" }, new Date(2026, 9, 8));
    s = saveReview(s, { learned: "b", changed: "", forecast: "", next: "" }, new Date(2026, 9, 15));
    expect(reviewStreak(s, now)).toBe(2); // this week not done yet: counts back from last week
    s = saveReview(s, { learned: "c", changed: "", forecast: "", next: "" }, now);
    s = saveReview(s, { learned: "c2", changed: "", forecast: "", next: "" }, now);
    expect(s.reviews).toHaveLength(3);
    expect(s.reviews[0].learned).toBe("c2");
    expect(reviewStreak(s, now)).toBe(3);
    expect(evidenceSummary(s, now).reviewedThisWeek).toBe(true);
  });
});
