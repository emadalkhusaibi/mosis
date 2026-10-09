import { describe, expect, it } from "vitest";
import { formatRials, parseRials, toBaisa } from "./money";

describe("money", () => {
  it("parses rial input to exact baisa", () => {
    expect(parseRials("1,250.5")).toBe(1_250_500);
    expect(parseRials("0.1")).toBe(100);
    expect(parseRials("٢٥٠٫٧٥")).toBe(250_750);
    expect(parseRials("-3.005")).toBe(-3_005);
    expect(parseRials("1.2345")).toBeNull();
    expect(parseRials("abc")).toBeNull();
    expect(parseRials("")).toBeNull();
  });
  it("adds without float drift", () => {
    expect(toBaisa(0.1) + toBaisa(0.2)).toBe(toBaisa(0.3));
  });
  it("formats with three decimals only when needed", () => {
    expect(formatRials(6_730_000, "en")).toBe("6,730");
    expect(formatRials(2_500, "en")).toBe("2.500");
    expect(formatRials(-850_000, "en", { signed: true })).toBe("-850");
    expect(formatRials(240_000, "en", { signed: true })).toBe("+240");
  });
});
