import { describe, expect, it } from "vitest";
import { addBaisa, formatRials, parseMoney, parseRials, toBaisa, toDecimal } from "./money";

const ok = (raw: string) => {
  const r = parseMoney(raw);
  if (!r.ok) throw new Error(`${raw}: ${r.error}`);
  return r.value;
};
const err = (raw: string, opts?: { allowNegative?: boolean }) => {
  const r = parseMoney(raw, opts);
  return r.ok ? null : r.error;
};

describe("parseMoney", () => {
  it("parses exact baisa", () => {
    expect(ok("0.001")).toBe(1);
    expect(ok("1250.5")).toBe(1_250_500);
    expect(ok("0.1")).toBe(100);
  });
  it("accepts grouped and Arabic or Persian digits", () => {
    expect(ok("1,234.567")).toBe(1_234_567);
    expect(ok("١٬٢٣٤٫٥٦٧")).toBe(1_234_567);
    expect(ok("۱۲۳۴٫۵۶۷")).toBe(1_234_567);
    expect(ok(" ‏٢٥٠٫٧٥ ")).toBe(250_750);
  });
  it("rejects ambiguity instead of guessing", () => {
    expect(err("")).toBe("blank");
    expect(err("   ")).toBe("blank");
    expect(err("1e3")).toBe("format");
    expect(err("abc")).toBe("format");
    expect(err("12,34")).toBe("grouping");
    expect(err("1,2345")).toBe("grouping");
    expect(err("1.2345")).toBe("precision");
    expect(err("-3")).toBe("negative");
    expect(err("99999999999999999")).toBe("range");
  });
  it("keeps negatives when asked", () => {
    expect(parseMoney("-3.005", { allowNegative: true })).toEqual({ ok: true, value: -3_005 });
    expect(parseRials("-3.005")).toBe(-3_005);
    expect(parseRials("1.2345")).toBeNull();
  });
});

describe("exact arithmetic", () => {
  it("adds without float drift and refuses unsafe sums", () => {
    expect(toBaisa(0.1) + toBaisa(0.2)).toBe(toBaisa(0.3));
    expect(addBaisa(1, 2, -3)).toBe(0);
    expect(() => addBaisa(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
  });
  it("writes exact decimals", () => {
    expect(toDecimal(1_234_567)).toBe("1234.567");
    expect(toDecimal(-5)).toBe("-0.005");
    expect(toDecimal(0)).toBe("0.000");
  });
});

describe("formatRials", () => {
  it("formats with three decimals only when needed", () => {
    expect(formatRials(6_730_000, "en")).toBe("6,730");
    expect(formatRials(2_500, "en")).toBe("2.500");
    expect(formatRials(-850_000, "en", { signed: true })).toBe("-850");
    expect(formatRials(240_000, "en", { signed: true })).toBe("+240");
  });
});
