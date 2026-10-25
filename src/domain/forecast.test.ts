import { describe, expect, it } from "vitest";
import { breakEven, demandFor, projection } from "./forecast";
import { reserveCoverage, suggestReserve } from "./reserve";
import { toBaisa } from "@/lib/money";

const f = { price: toBaisa(5), variable: toBaisa(3), units: 400, fixed: toBaisa(600), setup: toBaisa(1000), growth: 0, capacity: 600 as number | null };
/** The default café profile a new workspace starts with. */
const cafe = { price: 2_500, variable: 900, units: 900, fixed: 1_500_000, setup: 6_000_000, growth: 3, capacity: null };

describe("projection", () => {
  it("matches the audited café fixture exactly", () => {
    const r = projection(cafe, 7_000_000);
    expect(r.months[0].cash).toBe(940_000);
    expect(r.months[1].cash).toBe(923_200);
    expect(r.months[11].cash).toBe(3_436_800);
  });
  it("matches the original domain checks, in baisa", () => {
    const r = projection(f, toBaisa(5000));
    expect(r.unitMargin).toBe(toBaisa(2));
    expect(r.breakEvenUnits).toBe(300);
    expect(r.months[0].profit).toBe(toBaisa(200));
    expect(r.months[11].cash).toBe(toBaisa(6400));
    expect(r.totalRevenue).toBe(toBaisa(24000));
  });
  it("applies scenarios and capacity", () => {
    expect(projection(f, toBaisa(5000), "low").months[0].units).toBe(280);
    expect(projection(f, toBaisa(5000), "high").months[0].units).toBe(520);
    expect(projection({ ...f, units: 1000 }, toBaisa(5000)).months[0].units).toBe(600);
    expect(projection({ ...f, units: 1000 }, toBaisa(5000)).capacityLimited).toBe(true);
    expect(projection({ ...f, capacity: null, units: 1000 }, toBaisa(5000)).months[0].units).toBe(1000);
    expect(projection({ ...f, capacity: 0, units: 1000 }, toBaisa(5000)).months[0].units).toBe(0);
  });
  it("flags shortfalls and edge cases without NaN or Infinity", () => {
    expect(projection({ ...f, price: toBaisa(3) }, toBaisa(5000)).breakEvenUnits).toBeNull();
    expect(projection({ ...f, setup: toBaisa(6000) }, toBaisa(5000)).firstNegativeMonth).toBe(0);
    expect(projection({ ...f, units: 0, setup: toBaisa(5000) }, toBaisa(5000)).firstNegativeMonth).toBe(1);
    expect(projection({ ...f, growth: -50 }, toBaisa(5000)).months[1].units).toBe(200);
    const zero = projection({ ...f, price: 0 }, 0);
    expect(zero.marginPercent).toBeNull();
    expect(Number.isFinite(zero.lowestCash)).toBe(true);
  });
  it("rounds demand half-up with exact integers", () => {
    expect(demandFor(900, 3, 10_000, 1)).toBe(927);
    expect(demandFor(1, 50, 10_000, 1)).toBe(2); // 1.5 rounds up
    expect(demandFor(5, 0, 7_000, 0)).toBe(4); // 3.5 rounds up
  });
});

describe("break-even and reserve", () => {
  it("computes break-even volume or an explicit state", () => {
    expect(breakEven({ price: 2_500, variable: 900, fixed: 1_500_000 })).toEqual({ kind: "units", units: 938 });
    expect(breakEven({ price: 900, variable: 900, fixed: 1 })).toEqual({ kind: "no-margin" });
    expect(breakEven({ price: 2, variable: 1, fixed: 0 })).toEqual({ kind: "no-fixed" });
  });
  it("reports reserve coverage honestly", () => {
    expect(reserveCoverage(3_000_000, 1_500_000)).toEqual({ kind: "months", months: 2 });
    expect(reserveCoverage(3_000_000, 0)).toEqual({ kind: "no-fixed-costs" });
    const s = suggestReserve(10_000_000, 1_500_000);
    expect(s).toMatchObject({ target: 4_500_000, funded: 3_000_000, capped: true });
    expect(suggestReserve(50_000_000, 1_500_000)).toMatchObject({ funded: 4_500_000, capped: false });
  });
});
