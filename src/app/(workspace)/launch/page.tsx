"use client";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { launchSteps, premisesNote } from "@/content/launch";
import { sectorOf } from "@/content/sectors";

/** From plan to a registered business: the real-world steps, ticked off as they happen. */
export default function LaunchPage() {
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  const done = new Set(state.launch ?? []);
  const note = premisesNote(state.venture.sector);
  const sectorName = state.venture.sector === "other" ? state.venture.other : p(sectorOf(state.venture.sector).name);
  const toggle = (id: string) =>
    update((s) => {
      const set = new Set(s.launch ?? []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...s, launch: launchSteps.map((x) => x.id).filter((x) => set.has(x)) };
    });

  return (
    <>
      <PageHeader
        title={t("Launch steps", "خطوات الانطلاق")}
        description={t("When practice turns into a real business: the official steps in Oman, in the usual order. Tick them off as you go.", "عندما يتحول التدريب إلى مشروع حقيقي: الخطوات الرسمية في عُمان بترتيبها المعتاد. علّمها كلما أنجزت واحدة.")}
      />
      <Panel aria-labelledby="steps-title">
        <PanelHeader id="steps-title" title={t(`${done.size} of ${launchSteps.length} done`, `أُنجز ${done.size} من ${launchSteps.length}`)}
          subtitle={t("General guidance gathered in October 2026, not legal advice. Requirements depend on your activity and legal form, so check with the official service.", "إرشادات عامة جُمعت في أكتوبر ٢٠٢٦، وليست استشارة قانونية. تختلف المتطلبات حسب النشاط والشكل القانوني، فتحقق من الجهة الرسمية.")} />
        <ol className="launch-steps">
          {launchSteps.map((s, i) => {
            const checked = done.has(s.id);
            return (
              <li key={s.id} className={clsx("launch-step", checked && "is-done")}>
                <input type="checkbox" className="task-check" id={`launch-${s.id}`} checked={checked} onChange={() => toggle(s.id)} />
                <div className="launch-step-main">
                  <label htmlFor={`launch-${s.id}`} className="launch-step-title"><span className="launch-step-n num" aria-hidden="true">{i + 1}</span>{p(s.title)}</label>
                  <p className="launch-step-body">{p(s.body)}</p>
                  {s.id === "premises" && note && <p className="launch-step-note"><strong>{t(`For a ${sectorName.toLowerCase()}:`, `في ${sectorName}:`)}</strong> {p(note)}</p>}
                  <p className="launch-step-meta">
                    <span className="chip">{p(s.when)}</span>
                    {s.source && <a className="link small" href={s.source.url} target="_blank" rel="noreferrer">{s.source.label} <ArrowSquareOut size={12} className="inline-icon" aria-hidden="true" /></a>}
                    {s.id === "pack" && <Link className="link small" href="/record">{t("Open your Founder record", "افتح سجلّ المؤسس")}</Link>}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </Panel>
    </>
  );
}
