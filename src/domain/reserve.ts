import type { Baisa } from "@/lib/money";

/** The target the product suggests: three months of fixed costs. */
export const RESERVE_TARGET_MONTHS = 3;
/** New workspaces never lock away more than this share of practice capital by default. */
export const RESERVE_CAP_SHARE = 0.3;

export type Coverage = { kind: "months"; months: number } | { kind: "no-fixed-costs" };

/** How many months of fixed costs a reserve covers. One authoritative calculation for setup, wallet and forecast. */
export function reserveCoverage(reserve: Baisa, fixedPerMonth: Baisa): Coverage {
  if (fixedPerMonth <= 0) return { kind: "no-fixed-costs" };
  return { kind: "months", months: reserve / fixedPerMonth };
}

/**
 * The default reserve for a new workspace and the honest story behind it:
 * the three-month target, what was actually funded, and whether the cap bit.
 */
export function suggestReserve(capital: Baisa, fixedPerMonth: Baisa) {
  const target = fixedPerMonth * RESERVE_TARGET_MONTHS;
  const cap = Math.round(capital * RESERVE_CAP_SHARE);
  const funded = Math.max(0, Math.min(target, cap));
  return { target, funded, capped: funded < target, coverage: reserveCoverage(funded, fixedPerMonth) };
}

export function formatCoverage(c: Coverage, t: (en: string, ar: string) => string, n: (v: number, d?: number) => string) {
  if (c.kind === "no-fixed-costs") return t("No fixed costs entered", "لم تُدخل تكاليف ثابتة");
  const v = n(Math.floor(c.months * 10) / 10, 1);
  return t(`${v} months of fixed costs`, `${v} أشهر من التكاليف الثابتة`);
}
