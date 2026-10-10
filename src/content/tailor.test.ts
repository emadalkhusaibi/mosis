import { describe, expect, it } from "vitest";
import { tailored } from "./tailor";
import { sectors } from "./sectors";
import { lexicons } from "./lexicons";

describe("tailored content", () => {
  it.each(sectors.map((s) => s.id))("fills every token for %s", (id) => {
    const t = tailored(id);
    expect(JSON.stringify([t.sections, t.scenarios, t.lessons])).not.toMatch(/\{[a-z]+\}/);
  });
  it("has a lexicon with examples and scenario lines for every sector", () => {
    for (const s of sectors) {
      const lex = lexicons[s.id];
      expect(lex, s.id).toBeDefined();
      if (s.id === "other") continue;
      expect(lex.extra.length, s.id).toBe(2);
      for (const x of lex.extra) expect(x.key.startsWith(`${s.id}_`), x.key).toBe(true);
    }
  });
  it("adds examples and keeps extra questions optional, so progress totals don't change", () => {
    const t = tailored("salon");
    const q = t.sections.flatMap((s) => s.questions);
    expect(q.find((x) => x.key === "problem")?.example?.[0]).toBeTruthy();
    expect(q.filter((x) => x.specific).every((x) => x.optional)).toBe(true);
  });
  it("uses Arabic digits for figures in Arabic", () => {
    const l = tailored("cafe").lessons.find((x) => x.id === "breakeven")!;
    expect(l.applied![1]).toMatch(/[٠-٩]/);
    expect(l.applied![1]).not.toMatch(/[0-9]/);
  });
});
