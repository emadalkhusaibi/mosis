/**
 * All money is stored as integer baisa (1 Omani rial = 1,000 baisa) so sums
 * and comparisons are exact. Convert only at the edges: input and display.
 */
export type Baisa = number;

export const BAISA_PER_RIAL = 1000;

export const toBaisa = (rials: number): Baisa => Math.round(rials * BAISA_PER_RIAL);
export const toRials = (baisa: Baisa): number => baisa / BAISA_PER_RIAL;

export type MoneyError = "blank" | "format" | "grouping" | "precision" | "negative" | "range";
export type MoneyParse = { ok: true; value: Baisa } | { ok: false; error: MoneyError };

/**
 * Parses typed rial amounts into exact baisa. Accepts ASCII, Arabic-Indic and
 * Persian digits, the Arabic decimal separator, and correctly grouped thousands
 * ("1,234.5" or "١٬٢٣٤٫٥"). Anything ambiguous is rejected rather than guessed:
 * malformed grouping, more than three decimals, exponents, or values outside
 * the safe integer range.
 */
export function parseMoney(raw: string, { allowNegative = false } = {}): MoneyParse {
  if (typeof raw !== "string" || raw.length > 100) return { ok: false, error: "format" };
  const normalised = raw
    .trim()
    .replace(/[؜‎‏  ]/g, "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",")
    .replace(/−/g, "-");
  if (normalised === "") return { ok: false, error: "blank" };
  const match = /^([+-]?)(?:(\d{1,3}(?:,\d{3})+)|(\d+))(?:\.(\d+))?$/.exec(normalised);
  if (!match) return { ok: false, error: /\d,\d/.test(normalised) ? "grouping" : "format" };
  if ((match[4] ?? "").length > 3) return { ok: false, error: "precision" };
  if (match[1] === "-" && !allowNegative) return { ok: false, error: "negative" };
  const whole = (match[2] ?? match[3]).replace(/,/g, "");
  const magnitude = BigInt(whole) * 1000n + BigInt((match[4] ?? "").padEnd(3, "0"));
  if (magnitude > BigInt(Number.MAX_SAFE_INTEGER)) return { ok: false, error: "range" };
  const value = Number(magnitude);
  return { ok: true, value: match[1] === "-" ? -value : value };
}

/** Lenient wrapper kept for callers that only need a value or nothing. Allows negatives. */
export function parseRials(input: string): Baisa | null {
  const r = parseMoney(input, { allowNegative: true });
  return r.ok ? r.value : null;
}

/** Exact decimal string for exports and tables: 1234567 → "1234.567". Never rounds. */
export function toDecimal(baisa: Baisa): string {
  if (!Number.isSafeInteger(baisa)) throw new RangeError("baisa must be a safe integer");
  const v = BigInt(baisa);
  const m = v < 0n ? -v : v;
  return `${v < 0n ? "-" : ""}${m / 1000n}.${String(m % 1000n).padStart(3, "0")}`;
}

/** Adds baisa amounts, refusing any result that would lose precision. */
export function addBaisa(...values: Baisa[]): Baisa {
  const sum = values.reduce((a, v) => {
    if (!Number.isSafeInteger(v)) throw new RangeError("baisa must be a safe integer");
    return a + BigInt(v);
  }, 0n);
  if (sum > BigInt(Number.MAX_SAFE_INTEGER) || sum < -BigInt(Number.MAX_SAFE_INTEGER)) throw new RangeError("sum exceeds safe range");
  return Number(sum);
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
  // Arabic UI deliberately uses Latin digits throughout so a measure never mixes systems.
  const locale = lang === "ar" ? "ar-OM-u-nu-latn" : "en-OM";
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: compact ? 0 : digits,
    maximumFractionDigits: compact ? 1 : digits,
    notation: compact ? "compact" : "standard",
    signDisplay: signed ? "exceptZero" : "auto",
  }).format(rials);
}

export function moneyErrorText(e: MoneyError, t: (en: string, ar: string) => string): string {
  switch (e) {
    case "blank": return t("Enter an amount.", "أدخل مبلغاً.");
    case "format": return t("Use digits only, like 1250.500.", "استخدم الأرقام فقط، مثل 1250.500.");
    case "grouping": return t("Thousands separators look off. Try 1,250 or 1250.", "فواصل الآلاف غير صحيحة. جرّب 1,250 أو 1250.");
    case "precision": return t("Rials have at most three decimals (baisa).", "للريال ثلاث خانات عشرية كحد أقصى (بيسة).");
    case "negative": return t("Enter an amount above zero.", "أدخل مبلغاً أكبر من صفر.");
    case "range": return t("That amount is too large.", "المبلغ كبير جداً.");
  }
}
