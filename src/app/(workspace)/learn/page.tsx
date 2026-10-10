"use client";
import Link from "next/link";
import { ArrowRight, Check } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { lessons, paths } from "@/content/lessons";
import { level, ranks } from "@/domain/state";
import { nextMove } from "@/domain/progress";

export default function LearnPage() {
  const { t, p, lang } = useI18n();
  const { state } = useWorkspace();
  const done = new Set(state.learning.completed);
  const lv = level(state);
  const move = nextMove(state);
  // Prefer the lesson the next decision points at; otherwise the first unfinished one.
  const next = (move.kind === "learn" && lessons.find((l) => `/learn/${l.id}` === move.href && !done.has(l.id))) || lessons.find((l) => !done.has(l.id));
  const why = next && move.kind === "learn" && `/learn/${next.id}` === move.href
    ? t("Suggested because it comes before your next money decision.", "مقترح لأنه يسبق قرارك المالي التالي.")
    : t("The next lesson you haven't finished.", "الدرس التالي الذي لم تُكمله.");

  return (
    <>
      <PageHeader
        title={t("Learn", "تعلّم")}
        description={t("Twelve short lessons across money, customers and leadership. Each ends with a check and an exercise for your own business.", "اثنا عشر درساً قصيراً في المال والعملاء والقيادة. ينتهي كل درس باختبار وتمرين لمشروعك.")}
      />

      {next ? (
        <Panel className="next-decision learn-continue" aria-labelledby="continue-title">
          <p className="page-kicker">{t("Continue", "تابع")} · {p(paths[next.path])}</p>
          <h2 id="continue-title" className="next-title">{p(next.title)}</h2>
          <p className="next-reason">{why}</p>
          <div className="cluster next-actions"><Button href={`/learn/${next.id}`} trailing={<ArrowRight size={18} />}>{t("Open lesson", "افتح الدرس")}</Button><span className="field-hint">{t(`${next.minutes} min including the exercise`, `${next.minutes} دقائق مع التمرين`)}</span></div>
        </Panel>
      ) : <Panel className="next-decision"><h2 className="next-title">{t("You've completed every lesson.", "أكملت جميع الدروس.")}</h2></Panel>}

      <div className="learn-progress">
        <p className="field-hint">{t(`${done.size} of ${lessons.length} lessons`, `${done.size} من ${lessons.length} دروس`)} · {ranks[lv.index][lang === "ar" ? 1 : 0]} · <span className="num">{lv.xp} XP</span></p>
        <ProgressBar value={done.size / lessons.length} label={t("Lessons completed", "الدروس المكتملة")} />
      </div>

      <div className="practice-sections">
        {paths.map((path, pi) => {
          const items = lessons.filter((l) => l.path === pi);
          const count = items.filter((l) => done.has(l.id)).length;
          return (
            <section key={pi} aria-labelledby={`path-${pi}`}>
              <div className="section-head"><h2 id={`path-${pi}`} className="section-title">{p(path)}</h2><span className="field-hint">{t(`${count} of ${items.length}`, `${count} من ${items.length}`)}</span></div>
              <Panel padded={false}>
                <ul className="chapter-list">
                  {items.map((l, i) => (
                    <li key={l.id}>
                      <Link href={`/learn/${l.id}`} className={clsx("chapter-row", done.has(l.id) && "is-done")}>
                        <span className="chapter-row-icon" aria-hidden="true">{done.has(l.id) ? <Check size={18} weight="bold" /> : i + 1}</span>
                        <span className="chapter-row-main"><span className="chapter-row-title">{p(l.title)}</span><span className="chapter-row-intro">{p(l.exercise)}</span></span>
                        <span className="chapter-row-meta"><span className="chapter-row-count">{t(`${l.minutes} min`, `${l.minutes} دقائق`)}</span>{done.has(l.id) && <span className="chip chip-positive">{t("Done", "مكتمل")}</span>}</span>
                        <ArrowRight size={18} className="flip-rtl chapter-row-arrow" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Panel>
            </section>
          );
        })}
      </div>
    </>
  );
}
