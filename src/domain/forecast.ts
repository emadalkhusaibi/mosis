import type { Finance } from "./state";
import { addBaisa, type Baisa } from "@/lib/money";

/**
 * The forecast model, version 2.
 *
 * Assumptions, stated so the numbers can be checked by hand:
 * - All modelled sales and operating costs hit cash in the same month.
 * - The one-off setup cost is paid once, before month one.
 * - Demand compounds from the month-one baseline and is rounded half-up to
 *   whole units each month, using exact integer arithmetic (no float drift).
 * - Capacity caps fulfilled units. null means unlimited; 0 means none.
 * - Scenarios scale demand only (Cautious 70%, Base 100%, Strong 130%).
 *   They are named what-ifs, not probabilities.
 */
export const FORECAST_MODEL = "v2-exact-half-up";

export type ScenarioKey = "base" | "low" | "high";
export const scenarioBps: Record<ScenarioKey, number> = { base: 10_000, low: 7_000, high: 13_000 };

export type Month = { month: number; units: number; demand: number; revenue: Baisa; cost: Baisa; profit: Baisa; cash: Baisa };

const MAX = BigInt(Number.MAX_SAFE_INTEGER);
const safe = (v: bigint) => {
  if (v > MAX || v < -MAX) throw new RangeError("forecast value exceeds safe range");
  return Number(v);
};

/** Units demanded in month `index` (0-based), exact: round(units × bps/10⁴ × (1+g)^index). */
export function demandFor(units: number, growthPercent: number, scenario: number, index: number): number {
  const growthBps = BigInt(10_000 + Math.round(growthPercent * 100));
  const numerator = BigInt(units) * BigInt(scenario) * growthBps ** BigInt(index);
  const denominator = 10_000n ** BigInt(index + 1);
  return safe((numerator + denominator / 2n) / denominator);
}

export type BreakEven = { kind: "units"; units: number } | { kind: "no-margin" } | { kind: "no-fixed" };

export function breakEven(f: Pick<Finance, "price" | "variable" | "fixed">): BreakEven {
  const margin = f.price - f.variable;
  if (margin <= 0) return { kind: "no-margin" };
  if (f.fixed === 0) return { kind: "no-fixed" };
  return { kind: "units", units: Math.ceil(f.fixed / margin) };
}

/** Twelve-month forward projection. A plan, not a ledger: it never touches recorded wallet activity. */
export function projection(f: Finance, startingCash: Baisa, scenario: ScenarioKey = "base") {
  const bps = scenarioBps[scenario];
  const unitMargin = f.price - f.variable;
  const initialCash = addBaisa(startingCash, -f.setup);
  let cash = initialCash;
  const months: Month[] = Array.from({ length: 12 }, (_, i) => {
    const demand = demandFor(f.units, f.growth, bps, i);
    const units = f.capacity === null ? demand : Math.min(f.capacity, demand);
    const revenue = safe(BigInt(units) * BigInt(f.price));
    const cost = safe(BigInt(units) * BigInt(f.variable) + BigInt(f.fixed));
    const profit = revenue - cost;
    cash = addBaisa(cash, profit);
    return { month: i + 1, units, demand, revenue, cost, profit, cash };
  });
  const be = breakEven(f);
  return {
    model: FORECAST_MODEL,
    unitMargin,
    /** null when there is no price to compare against. */
    marginPercent: f.price > 0 ? (unitMargin / f.price) * 100 : null,
    breakEven: be,
    breakEvenUnits: be.kind === "units" ? be.units : null,
    /** First month whose operating profit is strictly positive. */
    firstPositiveMonth: months.find((m) => m.profit > 0)?.month ?? null,
    capacityLimited: months.some((m) => m.units < m.demand),
    months,
    totalRevenue: addBaisa(...months.map((m) => m.revenue)),
    totalProfit: addBaisa(...months.map((m) => m.profit)),
    /** 0 means the setup cost alone already takes cash below zero. */
    firstNegativeMonth: initialCash < 0 ? 0 : (months.find((m) => m.cash < 0)?.month ?? null),
    initialCash,
    lowestCash: Math.min(initialCash, ...months.map((m) => m.cash)),
    lowestMonth: months.reduce((lo, m) => (m.cash < lo.cash ? m : lo), { month: 0, cash: initialCash }).month,
    endingCash: months[11].cash,
  };
}
export type Projection = ReturnType<typeof projection>;
