import { sections } from "@/content/sections";
import { lessons } from "@/content/lessons";
import { scenarios } from "@/content/scenarios";
import type { State } from "./state";

/** An answer counts once it says something concrete (at least a short sentence). */
export const MIN_ANSWER = 12;
export const answered = (s: State, key: string) => (s.answers[key]?.trim().length ?? 0) >= MIN_ANSWER;

export function planProgress(s: State) {
  const per = sections.map((sec) => {
    const required = sec.questions.filter((q) => !q.optional);
    const done = required.filter((q) => answered(s, q.key)).length;
    return { id: sec.id, done, total: required.length, complete: done === required.length };
  });
  const done = per.reduce((a, x) => a + x.done, 0);
  const total = per.reduce((a, x) => a + x.total, 0);
  return { done, total, ratio: total ? done / total : 0, sections: per };
}

export type NextMove = { kind: "plan" | "learn" | "practice" | "forecast" | "launch"; href: string; sectionId?: string };

/** One useful next step, chosen from where the founder actually is. */
export function nextMove(s: State): NextMove {
  const plan = planProgress(s);
  const firstOpen = plan.sections.find((x) => !x.complete);
  if (firstOpen && plan.sections.indexOf(firstOpen) < 2) return { kind: "plan", href: `/plan/${firstOpen.id}`, sectionId: firstOpen.id };
  if (s.finance.price === 0 || s.finance.units === 0) return { kind: "forecast", href: "/forecast" };
  if (!s.learning.completed.includes("cash")) return { kind: "learn", href: "/learn/cash" };
  if (firstOpen) return { kind: "plan", href: `/plan/${firstOpen.id}`, sectionId: firstOpen.id };
  const nextScenario = scenarios.find((x) => !s.decisions.some((d) => d.id === x.id));
  if (nextScenario) return { kind: "practice", href: `/practice/${nextScenario.id}` };
  const nextLesson = lessons.find((l) => !s.learning.completed.includes(l.id));
  if (nextLesson) return { kind: "learn", href: `/learn/${nextLesson.id}` };
  return { kind: "launch", href: "/plan/launch" };
}

export function journey(s: State) {
  const plan = planProgress(s);
  const ideaDone = plan.sections.slice(0, 2).every((x) => x.complete);
  const practice = (s.decisions.length + s.learning.completed.length) / (scenarios.length + lessons.length);
  return [
    { id: "idea", value: plan.sections.slice(0, 2).reduce((a, x) => a + x.done, 0) / Math.max(1, plan.sections.slice(0, 2).reduce((a, x) => a + x.total, 0)) },
    { id: "plan", value: plan.ratio },
    { id: "practice", value: practice },
    { id: "launch", value: ideaDone && plan.ratio === 1 && practice >= 0.5 ? 1 : 0 },
  ] as const;
}
