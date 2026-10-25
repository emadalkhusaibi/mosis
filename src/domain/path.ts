import { sectorOf } from "@/content/sectors";
import { lexiconOf } from "@/content/lexicons";
import { matches, opportunities } from "@/content/opportunities";
import { w, type Words } from "@/content/words";
import { toBaisa, toRials } from "@/lib/money";
import { planProgress } from "./progress";
import type { Need, Stage, State } from "./state";

/**
 * The founder's path: four steps chosen and ordered for what they told us they
 * need, worded for their kind of business. Today leads with the first step not
 * yet done, so two founders with different businesses or needs see different
 * work first.
 */
export type StepId = "idea" | "numbers" | "test" | "mentor" | "reserve" | "practice" | "record" | "launch" | "basics";
export type PathStep = { id: StepId; href: string; title: Words; sub: Words; done: boolean; sectionId?: string };

/** Founders who set up before we asked get a need inferred from their stage. */
export const needFromStage: Record<Stage, Need> = { exploring: "plan", validating: "demand", ready: "launch", operating: "money" };
export const needOf = (s: State): Need => s.venture.need ?? needFromStage[s.venture.stage];

export const needNames: Record<Need, Words> = {
  demand: w("Find out if people will buy", "أعرف إن كان الناس سيشترون"),
  money: w("Get the money right", "أضبط الأرقام والمال"),
  plan: w("Write a plan I can show", "أكتب خطة أعرضها"),
  people: w("Learn from people who've done it", "أتعلّم ممن سبقوني"),
  launch: w("Get registered and open", "أسجّل المشروع وأفتتح"),
};

export const needDescriptions: Record<Need, Words> = {
  demand: w("Field tests come first, before you spend.", "الاختبارات الميدانية أولاً، قبل أن تنفق."),
  money: w("Price, break-even, reserve and cash.", "السعر ونقطة التعادل والاحتياطي والنقد."),
  plan: w("A clear plan and a record to share.", "خطة واضحة وسجلّ تشاركه."),
  people: w("Internships, jobs and 1:1s with leaders.", "تدريب ووظائف وجلسات مع القادة."),
  launch: w("Registration, premises and a bank account.", "التسجيل والموقع والحساب المصرفي."),
};

const order: Record<Need, StepId[]> = {
  demand: ["idea", "test", "numbers", "mentor"],
  money: ["numbers", "reserve", "practice", "record"],
  plan: ["idea", "numbers", "record", "mentor"],
  people: ["idea", "mentor", "record", "test"],
  launch: ["numbers", "launch", "reserve", "record"],
};

const one = (unit: string) => unit.replace(/ies$/, "y").replace(/s$/, "");
const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 3 });
const AR = "٠١٢٣٤٥٦٧٨٩";
const ar = (s: string) => s.replace(/\d/g, (d) => AR[+d]).replace(/,/g, "٬").replace(/\./g, "٫");

export function pathFor(s: State): PathStep[] {
  const sector = sectorOf(s.venture.sector);
  const lex = lexiconOf(s.venture.sector);
  const name: Words = s.venture.sector === "other" && s.venture.other.trim() ? [s.venture.other.trim(), s.venture.other.trim()] : sector.name;
  const plan = planProgress(s);
  const firstOpen = plan.sections.slice(0, 2).find((x) => !x.complete);
  const price = toRials(s.finance.price);
  const margin = toRials(s.finance.price - s.finance.variable);
  const breakEven = margin > 0 ? Math.ceil(toRials(s.finance.fixed) / margin) : 0;
  const fits = opportunities.filter((o) => matches(o, s.venture.sector) && !o.sectors.includes("*")).length;
  const months = s.finance.fixed > 0 ? s.reserve / s.finance.fixed : 0;
  const tests = s.tests.filter((t) => t.status === "done").length;

  const steps: Record<StepId, PathStep> = {
    idea: {
      id: "idea", href: `/plan/${firstOpen?.id ?? "idea"}`, sectionId: firstOpen?.id ?? "idea", done: !firstOpen,
      title: w("Say who it's for and why they'd choose you", "حدّد لمن مشروعك ولماذا سيختارونك"),
      sub: [`The idea and customer chapters, with ${name[0].toLowerCase()} examples`, `فصلا الفكرة والعملاء، مع أمثلة من ${name[1]}`],
    },
    numbers: {
      id: "numbers", href: "/forecast", done: s.finance.price !== toBaisa(sector.price) || s.finance.units !== sector.units || s.revisions.length > 0,
      title: [`Check your price of ${fmt(price)} rials per ${one(sector.unit[0])}`, `راجع سعرك: ${ar(fmt(price))} ريال للوحدة`],
      sub: breakEven
        ? [`You'd need about ${fmt(breakEven)} ${sector.unit[0]} a month to cover costs`, `تحتاج نحو ${ar(fmt(breakEven))} من ${sector.unit[1]} شهرياً لتغطية التكاليف`]
        : w("Your price doesn't cover the cost of each sale yet", "سعرك لا يغطي تكلفة كل عملية بيع بعد"),
    },
    test: {
      id: "test", href: "/prove/tests", done: tests > 0,
      title: sector.test,
      sub: [`One afternoon with real ${lex.customers[0]} beats a week of guessing`, `ظهيرة واحدة مع ${lex.customers[1]} الحقيقيين خير من أسبوع من التخمين`],
    },
    mentor: {
      id: "mentor", href: "/opportunities", done: (s.connect?.sent.length ?? 0) > 0 || (s.connect?.saved.length ?? 0) > 0,
      title: w("Find someone who has run one", "ابحث عمّن أدار مشروعاً مثله"),
      sub: fits
        ? [`${fits} picked for ${name[0].toLowerCase()}: internships, jobs and 1:1s`, `${ar(String(fits))} مختارة لـ${name[1]}: تدريب ووظائف وجلسات فردية`]
        : w("Internships, jobs and 1:1s with business leaders", "تدريب ووظائف وجلسات فردية مع قادة الأعمال"),
    },
    reserve: {
      id: "reserve", href: "/wallet", done: months >= 2,
      title: w("Protect two months of fixed costs", "احمِ تكاليف شهرين ثابتة"),
      sub: s.finance.fixed > 0
        ? [`That's ${fmt(toRials(s.finance.fixed * 2))} rials for a ${name[0].toLowerCase()}`, `أي ${ar(fmt(toRials(s.finance.fixed * 2)))} ريال لـ${name[1]}`]
        : w("Set money aside before you spend it", "خصّص مالاً قبل أن تنفقه"),
    },
    practice: {
      id: "practice", href: "/practice", done: s.decisions.length > 0,
      title: w("Rehearse a hard call with practice money", "تدرّب على قرار صعب بمال تدريبي"),
      sub: [`Pricing, suppliers and staff, set in a ${name[0].toLowerCase()}`, `التسعير والموردون والموظفون، في ${name[1]}`],
    },
    record: {
      id: "record", href: "/record", done: plan.ratio >= 0.5 && tests > 0,
      title: w("Build a Founder record worth showing", "ابنِ سجلّ مؤسس يستحق العرض"),
      sub: w("Half your plan and one field test get you there", "نصف خطتك واختبار ميداني واحد يوصلانك"),
    },
    launch: {
      id: "launch", href: "/launch", done: (s.launch?.length ?? 0) >= 3,
      title: w("Work through the launch steps for Oman", "أنجز خطوات الانطلاق في عُمان"),
      sub: s.venture.profile?.channel === "online" || s.venture.profile?.channel === "home"
        ? [`Registration for a ${name[0].toLowerCase()} you can run without a shopfront`, `التسجيل لـ${name[1]} يمكن إدارته دون محل`]
        : [`Registration and premises for a ${name[0].toLowerCase()}`, `التسجيل والموقع لـ${name[1]}`],
    },
    basics: {
      id: "basics", href: "/learn/margin", done: s.learning.completed.includes("margin"),
      title: w("Learn price, margin and break-even", "تعلّم السعر والهامش ونقطة التعادل"),
      sub: [`Ten minutes, with ${name[0].toLowerCase()} numbers`, `عشر دقائق، بأرقام ${name[1]}`],
    },
  };
  let ids = order[needOf(s)];
  const experience = s.venture.profile?.experience;
  // A first business gets the money basics early; someone who has run one skips the opening chapters.
  if (experience === "first" && !ids.includes("basics")) ids = [ids[0], "basics", ...ids.slice(1, 3)];
  if (experience === "experienced" && ids[0] === "idea" && needOf(s) !== "plan") ids = [...ids.slice(1), ids.includes("practice") ? "record" : "practice"];
  return ids.map((id) => steps[id]);
}

/** The first step on the path not yet done, or null when the path is complete. */
export const nextStep = (s: State) => pathFor(s).find((x) => !x.done) ?? null;
