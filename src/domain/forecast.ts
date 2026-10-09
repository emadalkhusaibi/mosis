import type { Finance } from "./state";
import type { Baisa } from "@/lib/money";

export type ScenarioKey = "base" | "low" | "high";
export const scenarioFactor: Record<ScenarioKey, number> = { base: 1, low: 0.7, high: 1.3 };

export type Month = { month: number; units: number; revenue: Baisa; cost: Baisa; profit: Baisa; cash: Baisa };

/** Twelve-month forward projection. A plan, not a ledger: it never touches recorded wallet activity. */
export function projection(f: Finance, startingCash: Baisa, scenario: ScenarioKey = "base") {
  const factor = scenarioFactor[scenario];
  const unitMargin = f.price - f.variable;
  let cash = startingCash - f.setup;
  const months: Month[] = Array.from({ length: 12 }, (_, i) => {
    const demand = Math.round(f.units * factor * Math.pow(1 + f.growth / 100, i));
    const units = f.capacity > 0 ? Math.min(f.capacity, demand) : demand;
    const revenue = units * f.price;
    const cost = units * f.variable + f.fixed;
    const profit = revenue - cost;
    cash += profit;
    return { month: i + 1, units, revenue, cost, profit, cash };
  });
  const lowest = months.reduce((min, m) => Math.min(min, m.cash), startingCash - f.setup);
  return {
    unitMargin,
    marginPercent: f.price ? (unitMargin / f.price) * 100 : 0,
    breakEvenUnits: unitMargin > 0 ? Math.ceil(f.fixed / unitMargin) : null,
    breakEvenMonth: months.find((m) => m.profit >= 0 && m.units > 0)?.month ?? null,
    months,
    totalRevenue: months.reduce((a, m) => a + m.revenue, 0),
    totalProfit: months.reduce((a, m) => a + m.profit, 0),
    firstNegativeMonth: months.find((m) => m.cash < 0)?.month ?? null,
    initialCash: startingCash - f.setup,
    lowestCash: lowest,
    endingCash: months[11].cash,
  };
}
export type Projection = ReturnType<typeof projection>;
