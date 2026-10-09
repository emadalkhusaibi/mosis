/**
 * All money is stored as integer baisa (1 Omani rial = 1,000 baisa) so sums
 * and comparisons are exact. Convert only at the edges: input and display.
 */
export type Baisa = number;

export const BAISA_PER_RIAL = 1000;

export const toBaisa = (rials: number): Baisa => Math.round(rials * BAISA_PER_RIAL);
export const toRials = (baisa: Baisa): number => baisa / BAISA_PER_RIAL;

/** Parses user input like "1,250.5" or "١٢٥٠٫٥" into baisa. Returns null when invalid or above 3 decimals. */
export function parseRials(input: string): Baisa | null {
  const normalised = input
    .trim()
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")
    .replace(/[,٬\s]/g, "");
  if (!/^-?\d+(\.\d{1,3})?$/.test(normalised)) return null;
  const [whole, frac = ""] = normalised.replace("-", "").split(".");
  const value = Number(whole) * BAISA_PER_RIAL + Number(frac.padEnd(3, "0"));
  if (!Number.isSafeInteger(value)) return null;
  return normalised.startsWith("-") ? -value : value;
}

export function formatRials(
  baisa: Baisa,
  lang: "en" | "ar",
  opts: { decimals?: "auto" | 0 | 3; signed?: boolean; compact?: boolean } = {},
): string {
  const { decimals = "auto", signed = false, compact = false } = opts;
  const rials = toRials(baisa);
  const hasFraction = baisa % BAISA_PER_RIAL !== 0;
  const digits = decimals === "auto" ? (hasFraction ? 3 : 0) : decimals;
  const locale = lang === "ar" ? "ar-OM-u-nu-latn" : "en-OM";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: compact ? 0 : digits,
    maximumFractionDigits: compact ? 1 : digits,
    notation: compact ? "compact" : "standard",
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(rials);
  return formatted;
}
