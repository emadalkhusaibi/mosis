import { w, type Words } from "@/content/words";

/**
 * The Omani market calendar.
 *
 * Seasonality is a rehearsal assumption, not measured market data: each sector
 * carries a stated percentage change in demand for each season, the founder can
 * see every one and switch the calendar off, and the forecast stays exact.
 *
 * Islamic dates follow the lunar calendar and are announced on moon sighting, so
 * the table below is accurate to a day or two. Month 1 of the forecast is the
 * calendar month after "today".
 */
export const seasonIds = ["ramadan", "eid", "summer", "khareef", "school", "national", "winter"] as const;
export type SeasonId = (typeof seasonIds)[number];

export const seasonNames: Record<SeasonId, Words> = {
  ramadan: w("Ramadan", "رمضان"),
  eid: w("Eid", "العيد"),
  summer: w("Summer slowdown", "ركود الصيف"),
  khareef: w("Khareef in Dhofar", "خريف ظفار"),
  school: w("Back to school", "العودة إلى المدارس"),
  national: w("National Day", "العيد الوطني"),
  winter: w("Winter visitor season", "موسم الزوار الشتوي"),
};

/** Ramadan start and end (inclusive) and Eid al-Adha, as YYYY-MM-DD. */
const lunar: Record<number, { ramadan: [string, string]; adha: string }> = {
  2026: { ramadan: ["2026-02-18", "2026-03-19"], adha: "2026-05-27" },
  2027: { ramadan: ["2027-02-08", "2027-03-09"], adha: "2027-05-16" },
  2028: { ramadan: ["2028-01-28", "2028-02-26"], adha: "2028-05-05" },
  2029: { ramadan: ["2029-01-16", "2029-02-14"], adha: "2029-04-24" },
  2030: { ramadan: ["2030-01-06", "2030-02-04"], adha: "2030-04-13" },
};

/** Percent change in demand per season, by sector. Missing means no effect. */
type Profile = Partial<Record<SeasonId, number>>;
const profiles: Record<string, Profile> = {
  cafe: { ramadan: -20, eid: 15, summer: -15, khareef: 30, national: 5, winter: 5 },
  restaurant: { ramadan: -10, eid: 20, summer: -15, khareef: 30, national: 5, winter: 5 },
  retail: { ramadan: 15, eid: 30, summer: -10, khareef: 20, school: 15, national: 10 },
  ecommerce: { ramadan: 20, eid: 25, summer: -5, school: 15, national: 10 },
  salon: { ramadan: -15, eid: 40, summer: -10, khareef: 15, national: 10 },
  fitness: { ramadan: -30, summer: -20, school: 10, winter: 10 },
  services: { ramadan: -15, eid: -10, summer: -15, school: 5 },
  studio: { ramadan: 10, eid: -10, summer: -15, national: 15 },
  tech: { ramadan: -10, summer: -10, school: 5 },
  education: { ramadan: -20, summer: -40, school: 35 },
  tourism: { ramadan: -30, eid: 20, summer: -35, khareef: 60, winter: 35 },
  logistics: { ramadan: 10, eid: 20, summer: -10, national: 5 },
  automotive: { ramadan: -10, eid: 15, summer: 10 },
  events: { ramadan: -40, eid: 35, summer: -30, khareef: 25, national: 30, winter: 25 },
  manufacturing: { ramadan: -10, summer: -10 },
  other: { ramadan: -10, eid: 10, summer: -10 },
};

const dhofar = /salalah|صلالة|dhofar|ظفار|taqah|طاقة|mirbat|مرباط/i;

const ym = (iso: string) => ({ y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) });
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** The month (1-12) holding most of Ramadan that year, if known. */
function ramadanMonth(y: number): number | null {
  const r = lunar[y]?.ramadan;
  if (!r) return null;
  const a = ym(r[0]);
  const daysFirst = daysIn(a.y, a.m) - Number(r[0].slice(8, 10)) + 1;
  return daysFirst >= 15 ? a.m : ym(r[1]).m;
}

/** Seasons that touch a calendar month. */
export function seasonsFor(year: number, month: number, city: string): SeasonId[] {
  const out: SeasonId[] = [];
  if (ramadanMonth(year) === month) out.push("ramadan");
  const l = lunar[year];
  if (l) {
    const fitr = new Date(`${l.ramadan[1]}T00:00:00Z`);
    fitr.setUTCDate(fitr.getUTCDate() + 1);
    if (fitr.getUTCMonth() + 1 === month || ym(l.adha).m === month) out.push("eid");
  }
  const inDhofar = dhofar.test(city);
  if (month >= 6 && month <= 8 && !inDhofar) out.push("summer");
  if (month >= 7 && month <= 9 && inDhofar) out.push("khareef");
  if (month === 9) out.push("school");
  if (month === 11) out.push("national");
  if (month === 12 || month <= 2) out.push("winter");
  return out;
}

export type SeasonMonth = { year: number; month: number; seasons: SeasonId[]; percent: number; bps: number };

/**
 * Demand multipliers (basis points) for the twelve forecast months after `from`.
 * Effects of overlapping seasons add up, capped between -60% and +80%.
 */
export function marketCalendar(sector: string, city: string, from: Date = new Date()): SeasonMonth[] {
  const profile = profiles[sector] ?? profiles.other;
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1 + i, 1));
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const seasons = seasonsFor(year, month, city).filter((s) => profile[s] !== undefined);
    const percent = Math.max(-60, Math.min(80, seasons.reduce((sum, s) => sum + (profile[s] ?? 0), 0)));
    return { year, month, seasons, percent, bps: 10_000 + percent * 100 };
  });
}

/** The stated effect of one season on one sector, in percent. */
export const seasonEffect = (sector: string, season: SeasonId) => (profiles[sector] ?? profiles.other)[season] ?? 0;
