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

import { safeSvg } from "./brand";
describe("safeSvg", () => {
  const ok = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g"><stop offset="0" stop-color="#fff"/></linearGradient></defs><circle cx="100" cy="100" r="80" fill="url(#g)"/><text x="100" y="110" text-anchor="middle">Sidr</text></svg>';
  it("accepts plain vector drawing", () => expect(safeSvg(ok)).toBe(ok));
  it.each([
    '<svg><script>alert(1)</script></svg>',
    '<svg onload="alert(1)"><circle r="1"/></svg>',
    '<svg><image href="https://x.test/a.png"/></svg>',
    '<svg><a href="javascript:alert(1)"><circle r="1"/></a></svg>',
    '<svg><circle r="1" fill="url(https://x.test/a)"/></svg>',
    '<svg><style>*{}</style></svg>',
    '<svg><foreignObject><div/></foreignObject></svg>',
    '<svg><circle r="1" style="fill:red"/></svg>',
    '<svg><!-- x --></svg>',
    '<svg><text>&#60;script&#62;</text></svg>',
  ])("rejects %s", (bad) => expect(safeSvg(bad)).toBeNull());
});
