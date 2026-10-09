"use client";
import Link from "next/link";
import { Morph } from "@/components/ui/morph";
import Image from "next/image";
import { ArrowRight, Check, Clock } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress";
import { lessons, paths } from "@/content/lessons";
import { level, ranks } from "@/domain/state";
import { pathImages } from "@/content/imagery";


export default function LearnPage() {
  const { t, p, lang } = useI18n();
  const { state } = useWorkspace();
  const done = new Set(state.learning.completed);
  const lv = level(state);
  const next = lessons.find((l) => !done.has(l.id));
  return (
    <>
      <PageHeader
        eyebrow={t("Learning studio", "استوديو التعلّم")}
        title={t("Learn what the *next* decision needs.", "تعلّم ما يحتاجه قرارك *التالي*.")}
        description={t("Twelve short lessons across money, customers and leadership. Each ends with a check and an exercise for your own business.", "اثنا عشر درساً قصيراً في المال والعملاء والقيادة. ينتهي كل درس باختبار وتمرين لمشروعك.")}
      />
      <Panel className="learn-summary">
        <div>
          <span className="stat-label">{t("Founder level", "مستوى المؤسس")}</span>
          <p className="stat-value">{ranks[lv.index][lang === "ar" ? 1 : 0]}</p>
          <p className="stat-note num">{lv.xp} XP · {t(`${done.size} of ${lessons.length} lessons`, `${done.size} من ${lessons.length} دروس`)}</p>
        </div>
        <div className="flex-1 min-w-[180px]"><ProgressBar value={done.size / lessons.length} label={t("Lessons completed", "الدروس المكتملة")} /></div>
        {next && <Link href={`/learn/${next.id}`} className="btn btn-primary btn-md"><span className="btn-label">{t("Continue", "تابع")}: {p(next.title)}</span><ArrowRight size={16} className="flip-rtl" /></Link>}
      </Panel>

      {paths.map((path, pi) => {
        const items = lessons.filter((l) => l.path === pi);
        const count = items.filter((l) => done.has(l.id)).length;
        return (
          <section key={pi} className="learn-path" aria-labelledby={`path-${pi}`}>
            <div className="learn-path-head">
              <div className="learn-path-art"><Image src={pathImages[pi]} alt="" fill sizes="96px" /></div>
              <div>
                <h2 id={`path-${pi}`} className="panel-title">{p(path)}</h2>
                <p className="muted small">{t(`${count} of ${items.length} complete`, `${count} من ${items.length} مكتمل`)}</p>
              </div>
            </div>
            <ul className="lesson-grid">
              {items.map((l, i) => (
                <li key={l.id}>
                  <Link href={`/learn/${l.id}`} className={clsx("lesson-card panel", done.has(l.id) && "is-done")}>
                    <span className="lesson-index num">{done.has(l.id) ? <Check size={14} weight="bold" /> : i + 1}</span>
                    <span className="lesson-title"><Morph name={`lesson-${l.id}`} kind="morph-text"><span className="vt-text">{p(l.title)}</span></Morph></span>
                    <span className="lesson-meta"><Clock size={14} />{t(`${l.minutes} min`, `${l.minutes} دقائق`)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
