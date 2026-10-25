import type { Opportunity } from "@/content/opportunities";
import { sectorOf } from "@/content/sectors";
import { readiness, skillNames } from "./readiness";
import type { State } from "./state";

const connectOf = (s: State) => s.connect ?? { saved: [], sent: [] };

export function toggleSaved(s: State, id: string): State {
  const c = connectOf(s);
  const saved = c.saved.includes(id) ? c.saved.filter((x) => x !== id) : [...c.saved, id];
  return { ...s, connect: { ...c, saved } };
}

export function recordSent(s: State, id: string, note: string, now = new Date()): State {
  const c = connectOf(s);
  return { ...s, connect: { ...c, sent: [{ id, at: now.toISOString(), note }, ...c.sent].slice(0, 200) } };
}

/**
 * The message a founder sends with a request: their own note, then a short
 * summary of their Founder record. Only what's listed here leaves the device.
 */
export function applicationText(s: State, o: Opportunity, note: string, lang: "en" | "ar", now = new Date()) {
  const i = lang === "ar" ? 1 : 0;
  const v = s.venture;
  const r = readiness(s, now);
  const sector = v.sector === "other" ? v.other : sectorOf(v.sector).name[i];
  const tests = s.tests.filter((x) => x.status === "done").length;
  const skills = r.skills.map((k) => `${skillNames[k.id][i]}: ${k.score}`).join(" · ");
  const lines =
    lang === "ar"
      ? [note, "", "—", `من: ${v.founder}`, `المشروع: ${v.name || "—"} (${sector}، ${v.city})`, `الجاهزية في مؤسس: ${r.overall}/100`, skills, `اختبارات ميدانية منجزة: ${tests}`, "", `أُرسل عبر مؤسس بخصوص: ${o.title[1]}`]
      : [note, "", "—", `From: ${v.founder}`, `Business: ${v.name || "—"} (${sector}, ${v.city})`, `Moasis readiness: ${r.overall}/100`, skills, `Field tests completed: ${tests}`, "", `Sent through Moasis about: ${o.title[0]}`];
  return lines.join("\n");
}
