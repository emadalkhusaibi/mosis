import { w, type Words } from "@/content/words";
import { planProgress } from "./progress";
import { forecastFor } from "./forecast";
import { available, type State } from "./state";

/**
 * The readiness score: six founder skills, each scored 0–100 from work the
 * founder actually did in Moasis. Every point comes from a named, checkable item,
 * so the score always explains itself and shows what's missing. It is a guide
 * for the founder and their mentor, never a ranking against other people.
 */
export const skillIds = ["customer", "pricing", "cash", "operations", "risk", "pitch"] as const;
export type SkillId = (typeof skillIds)[number];

export const skillNames: Record<SkillId, Words> = {
  customer: w("Customer understanding", "فهم الزبون"),
  pricing: w("Pricing", "التسعير"),
  cash: w("Cash control", "إدارة النقد"),
  operations: w("Operations", "التشغيل"),
  risk: w("Risk", "المخاطر"),
  pitch: w("Telling the story", "عرض الفكرة"),
};

export type Item = { id: string; label: Words; points: number; earned: boolean; href: string };
export type Skill = { id: SkillId; score: number; items: Item[]; next: Item | null };

const item = (id: string, label: Words, points: number, earned: boolean, href: string): Item => ({ id, label, points, earned, href });

export function readiness(s: State, now: Date = new Date()) {
  const plan = planProgress(s);
  const section = (id: string) => plan.sections.find((x) => x.id === id)?.complete ?? false;
  const lesson = (id: string) => s.learning.completed.includes(id);
  const decided = (id: string) => s.decisions.some((d) => d.id === id);
  const doneTests = s.tests.filter((t) => t.status === "done");
  const testedIn = (category: string) =>
    doneTests.filter((t) => s.assumptions.find((a) => a.id === t.assumptionId)?.category === category).length;
  const hasForecast = s.finance.price > 0 && s.finance.units > 0;
  const f = forecastFor(s, available(s), "base", now);

  const skills: Record<SkillId, Item[]> = {
    customer: [
      item("c-plan", w("Write the idea and customer chapters", "اكتب فصلي الفكرة والزبون"), 30, section("idea") && section("customer"), "/plan/customer"),
      item("c-lesson", w("Finish the customer interviews lesson", "أكمل درس مقابلات الزبائن"), 10, lesson("interviews"), "/learn/interviews"),
      item("c-test", w("Record a field test on demand", "سجّل اختباراً ميدانياً عن الطلب"), 40, testedIn("demand") >= 1, "/prove"),
      item("c-tests", w("Record three field tests in total", "سجّل ثلاثة اختبارات ميدانية إجمالاً"), 20, doneTests.length >= 3, "/prove"),
    ],
    pricing: [
      item("p-price", w("Set a price in the forecast", "حدّد سعراً في التوقعات"), 20, s.finance.price > 0, "/forecast"),
      item("p-margin", w("Finish the margin lesson", "أكمل درس الهامش"), 20, lesson("margin"), "/learn/margin"),
      item("p-scenario", w("Make the pricing decision in Practice", "اتخذ قرار التسعير في التدريب"), 20, decided("pricing"), "/practice/pricing"),
      item("p-test", w("Test your price with real people", "اختبر سعرك مع أناس حقيقيين"), 40, testedIn("price") >= 1, "/prove"),
    ],
    cash: [
      item("k-forecast", w("Build a forecast", "ابنِ توقعات"), 20, hasForecast, "/forecast"),
      item("k-lesson", w("Finish the cash lesson", "أكمل درس النقد"), 15, lesson("cash"), "/learn/cash"),
      item("k-breakeven", w("Finish the break-even lesson", "أكمل درس التعادل"), 15, lesson("breakeven"), "/learn/breakeven"),
      item("k-reserve", w("Protect a reserve in the wallet", "احمِ احتياطياً في المحفظة"), 20, s.reserve > 0, "/wallet"),
      item("k-positive", w("Keep forecast cash above zero all year", "أبقِ النقد المتوقع فوق الصفر طوال السنة"), 30, hasForecast && f.lowestCash >= 0, "/forecast"),
    ],
    operations: [
      item("o-plan", w("Write the operations chapter", "اكتب فصل التشغيل"), 40, section("operations"), "/plan/operations"),
      item("o-capacity", w("Set a monthly capacity", "حدّد الطاقة الشهرية"), 20, s.finance.capacity !== null, "/forecast"),
      item("o-capacity-call", w("Make the capacity decision in Practice", "اتخذ قرار الطاقة في التدريب"), 20, decided("capacity"), "/practice/capacity"),
      item("o-supplier", w("Make the supplier decision in Practice", "اتخذ قرار المورّد في التدريب"), 20, decided("supplier"), "/practice/supplier"),
    ],
    risk: [
      item("r-plan", w("Write the risks chapter", "اكتب فصل المخاطر"), 30, section("risk"), "/plan/risk"),
      item("r-assumptions", w("Write down three assumptions", "اكتب ثلاثة افتراضات"), 30, s.assumptions.length >= 3, "/prove"),
      item("r-high", w("Test a high-impact assumption", "اختبر افتراضاً عالي الأثر"), 40, doneTests.some((t) => s.assumptions.find((a) => a.id === t.assumptionId)?.impact === "high"), "/prove"),
    ],
    pitch: [
      item("s-plan", w("Answer every plan chapter", "أجب عن كل فصول الخطة"), 50, plan.ratio === 1, "/plan"),
      item("s-brand", w("Name your business in the Brand studio", "سمِّ مشروعك في استوديو الهوية"), 20, Boolean(s.brand?.name?.trim()), "/brand"),
      item("s-reviews", w("Write two weekly reviews", "اكتب مراجعتين أسبوعيتين"), 30, s.reviews.length >= 2, "/prove/review"),
    ],
  };

  const list: Skill[] = skillIds.map((id) => {
    const items = skills[id];
    const score = items.reduce((sum, i) => sum + (i.earned ? i.points : 0), 0);
    const next = items.filter((i) => !i.earned).sort((a, b) => b.points - a.points)[0] ?? null;
    return { id, score, items, next };
  });
  const overall = Math.round(list.reduce((sum, x) => sum + x.score, 0) / list.length);
  const weakest = [...list].sort((a, b) => a.score - b.score)[0];
  return { skills: list, overall, weakest, stage: overall >= 70 ? "ready" : overall >= 40 ? "building" : "starting" } as const;
}
export type Readiness = ReturnType<typeof readiness>;
