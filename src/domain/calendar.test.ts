import { describe, expect, it } from "vitest";
import { marketCalendar, seasonsFor } from "./calendar";
import { projection } from "./forecast";
import { toBaisa } from "@/lib/money";

describe("Omani market calendar", () => {
  it("places Ramadan in the month that holds most of it", () => {
    expect(seasonsFor(2027, 2, "Muscat")).toContain("ramadan");
    expect(seasonsFor(2027, 3, "Muscat")).not.toContain("ramadan");
    expect(seasonsFor(2026, 3, "Muscat")).toContain("ramadan"); // 18 Feb – 19 Mar: 19 days in March
  });

  it("marks both Eids", () => {
    expect(seasonsFor(2027, 3, "Muscat")).toContain("eid"); // Eid al-Fitr, 10 March
    expect(seasonsFor(2027, 5, "Muscat")).toContain("eid"); // Eid al-Adha, 16 May
  });

  it("gives Dhofar the Khareef instead of the summer slowdown", () => {
    expect(seasonsFor(2027, 8, "Salalah")).toContain("khareef");
    expect(seasonsFor(2027, 8, "Salalah")).not.toContain("summer");
    expect(seasonsFor(2027, 8, "صلالة")).toContain("khareef");
    expect(seasonsFor(2027, 8, "Muscat")).toContain("summer");
  });

  it("starts the year with next month and returns twelve months", () => {
    const cal = marketCalendar("cafe", "Muscat", new Date(Date.UTC(2026, 9, 24)));
    expect(cal).toHaveLength(12);
    expect(cal[0]).toMatchObject({ year: 2026, month: 11 });
    expect(cal[11]).toMatchObject({ year: 2027, month: 10 });
  });

  it("states each month as a capped percentage", () => {
    const cal = marketCalendar("tourism", "Salalah", new Date(Date.UTC(2027, 5, 1)));
    for (const m of cal) {
      expect(m.percent).toBeGreaterThanOrEqual(-60);
      expect(m.percent).toBeLessThanOrEqual(80);
      expect(m.bps).toBe(10_000 + m.percent * 100);
    }
    expect(cal.find((m) => m.month === 8)?.percent).toBe(60);
  });

  it("scales forecast demand exactly, and changes nothing at 100%", () => {
    const f = { price: toBaisa(2.5), variable: toBaisa(0.9), units: 900, fixed: toBaisa(1500), setup: 0, growth: 0, capacity: null };
    const flat = projection(f, toBaisa(5000));
    expect(projection(f, toBaisa(5000), "base", Array(12).fill(10_000)).months).toEqual(flat.months);
    const seasonal = projection(f, toBaisa(5000), "base", [8_000, ...Array(11).fill(10_000)]);
    expect(seasonal.months[0].demand).toBe(720);
    expect(seasonal.months[1].demand).toBe(900);
    expect(seasonal.months[0].revenue).toBe(720 * toBaisa(2.5));
  });
});
