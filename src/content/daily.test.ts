import { describe, expect, it } from "vitest";
import { dailyDecisions, dailyFor, localDay } from "./daily";

describe("daily decisions", () => {
  it("changes each local day and cycles through every decision", () => {
    const seen = new Set<string>();
    for (let i = 0; i < dailyDecisions.length; i++) seen.add(dailyFor(new Date(2026, 9, 1 + i)).id);
    expect(seen.size).toBe(dailyDecisions.length);
    expect(dailyFor(new Date(2026, 9, 24, 0, 1)).id).toBe(dailyFor(new Date(2026, 9, 24, 23, 59)).id);
  });

  it("has unique ids and two or three options each", () => {
    expect(new Set(dailyDecisions.map((d) => d.id)).size).toBe(dailyDecisions.length);
    for (const d of dailyDecisions) expect(d.options.length).toBeGreaterThanOrEqual(2);
    expect(localDay(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
