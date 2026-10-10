import { describe, expect, it } from "vitest";
import { formatCoverage, reserveCoverage, suggestReserve } from "./reserve";

const t = (en: string) => en;
const n = (v: number, d = 0) => v.toFixed(d);

describe("reserve", () => {
  it("covers months of fixed costs from one calculation", () => {
    expect(reserveCoverage(3_000_000, 1_000_000)).toEqual({ kind: "months", months: 3 });
    expect(reserveCoverage(3_000_000, 0)).toEqual({ kind: "no-fixed-costs" });
  });

  it("says honestly when the three-month target is capped by capital", () => {
    // Café profile: 1,500 a month fixed, 10,000 capital → target 4,500, cap 30% = 3,000.
    const r = suggestReserve(10_000_000, 1_500_000);
    expect(r).toMatchObject({ target: 4_500_000, funded: 3_000_000, capped: true });
    expect(formatCoverage(r.coverage, t, n)).toBe("2.0 months of fixed costs");
  });

  it("funds the full target when capital allows", () => {
    const r = suggestReserve(50_000_000, 1_500_000);
    expect(r).toMatchObject({ target: 4_500_000, funded: 4_500_000, capped: false });
  });

  it("never shows a misleading 0 months when there are no fixed costs", () => {
    expect(formatCoverage(suggestReserve(10_000_000, 0).coverage, t, n)).toBe("No fixed costs entered");
  });

  it("rounds coverage down so it never overstates", () => {
    expect(formatCoverage(reserveCoverage(2_999_000, 1_000_000), t, n)).toBe("2.9 months of fixed costs");
  });
});
