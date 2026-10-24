import { describe, expect, it } from "vitest";
import { emptyState, stateSchema } from "./state";
import { applicationText, recordSent, toggleSaved } from "./connect";
import { forSector, isOpen, opportunities } from "@/content/opportunities";

const now = new Date(2026, 9, 24);

describe("opportunities", () => {
  it("saves and unsaves, and logs sent requests", () => {
    let s = toggleSaved(emptyState(), "ex-cafe-intern");
    expect(s.connect?.saved).toEqual(["ex-cafe-intern"]);
    s = recordSent(toggleSaved(s, "ex-cafe-intern"), "ex-session-cfo", "Is my rent too high?", now);
    expect(s.connect?.saved).toEqual([]);
    expect(s.connect?.sent[0]).toMatchObject({ id: "ex-session-cfo", note: "Is my rent too high?" });
    expect(stateSchema.safeParse(s).success).toBe(true);
  });

  it("puts listings that fit the founder's business first", () => {
    const list = forSector(opportunities, "tech");
    const firstMiss = list.findIndex((o) => !o.sectors.includes("tech") && !o.sectors.includes("*"));
    expect(list.slice(firstMiss).every((o) => !o.sectors.includes("tech") && !o.sectors.includes("*"))).toBe(true);
  });

  it("never opens example listings", () => {
    expect(opportunities.filter((o) => o.example).every((o) => !isOpen(o))).toBe(true);
  });

  it("sends the note and a record summary, and nothing else", () => {
    const s = { ...emptyState(), venture: { ...emptyState().venture, founder: "Aisha", name: "Nook Coffee", sector: "cafe", city: "Muscat" } };
    const text = applicationText(s, opportunities[0], "I run a pop-up stall.", "en", now);
    expect(text.startsWith("I run a pop-up stall.")).toBe(true);
    expect(text).toContain("From: Aisha");
    expect(text).toMatch(/Moasis readiness: \d+\/100/);
    expect(text).not.toContain("Capital");
  });
});
