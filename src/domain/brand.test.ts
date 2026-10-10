import { describe, expect, it } from "vitest";
import { brandSchema, contrast, emptyBrand, initials, nameIdeas, onColor, palettes } from "./brand";

describe("brand", () => {
  it("computes WCAG contrast", () => {
    expect(contrast("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrast("#ffffff", "#ffffff")).toBeCloseTo(1, 5);
  });
  it("keeps every preset palette readable", () => {
    for (const p of palettes) {
      expect(contrast(p.colors.primary, onColor(p.colors.primary)), p.id).toBeGreaterThanOrEqual(4.5);
      expect(contrast(p.colors.primary, p.colors.surface), p.id).toBeGreaterThanOrEqual(4.5);
    }
  });
  it("takes initials in either script", () => {
    expect(initials("Sidr Salon")).toBe("SS");
    expect(initials("السدر للتجميل")).toBe("س");
  });
  it("makes valid offline name ideas and an empty brand", () => {
    expect(nameIdeas("cafe", 3, "ar")).toHaveLength(6);
    expect(brandSchema.safeParse(emptyBrand("Test")).success).toBe(true);
  });
});
