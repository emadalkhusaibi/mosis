"use client";
import { useState } from "react";
import clsx from "clsx";
import { PencilSimpleLine, DownloadSimple, Check } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Button } from "@/components/ui/button";
import { safeSvg, svgDataUri, type Brand, type Concept } from "@/domain/brand";

type Failure = "not_configured" | "key_rejected" | "no_credit" | "rate_limited" | "busy" | "declined" | "no_answer" | "offline" | "failed";

function downloadSvg(svg: string, name: string) {
  const a = Object.assign(document.createElement("a"), { href: svgDataUri(svg), download: `${name.replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase() || "logo"}.svg` });
  a.click();
}

/** Logo concepts drawn by Claude as vector artwork for this business. */
export function LogoConcepts({ brand, setBrand }: { brand: Brand; setBrand: (fn: (b: Brand) => Brand) => void }) {
  const { t, lang } = useI18n();
  const { state } = useWorkspace();
  const [brief, setBrief] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const concepts = brand.concepts ?? [];

  const draw = async () => {
    if (drawing) return;
    setDrawing(true);
    setFailure(null);
    try {
      const v = state.venture;
      const res = await fetch("/api/brand-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          brief: brief.trim().slice(0, 600),
          venture: { name: v.name, sector: v.sector, other: v.other, city: v.city, idea: v.idea },
          name: brand.name,
          nameAr: brand.nameAr,
          tagline: brand.tagline,
          colors: brand.colors,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = data.error as string | undefined;
        setFailure(e === "not_configured" || e === "key_rejected" || e === "no_credit" || e === "rate_limited" || e === "busy" || e === "declined" || e === "no_answer" ? e : "failed");
        return;
      }
      // Checked again here: only plain vector drawings are ever stored or shown.
      const next: Concept[] = (Array.isArray(data.concepts) ? data.concepts : [])
        .map((c: Concept) => ({ title: String(c.title ?? "").slice(0, 60), idea: String(c.idea ?? "").slice(0, 300), svg: safeSvg(String(c.svg ?? "")) }))
        .filter((c: { svg: string | null }) => c.svg)
        .slice(0, 4);
      if (!next.length) return setFailure("no_answer");
      setBrand((b) => ({ ...b, concepts: next }));
    } catch {
      setFailure("offline");
    } finally {
      setDrawing(false);
    }
  };

  const failureText: Record<Failure, string> = {
    key_rejected: t("The AI key on this site was rejected by Anthropic. The site owner needs to check the key.", "رفضت Anthropic مفتاح الذكاء الاصطناعي في هذا الموقع. على مالك الموقع التحقق من المفتاح."),
    no_credit: t("The AI account behind this site is out of credit. The site owner needs to add credit.", "نفد رصيد حساب الذكاء الاصطناعي لهذا الموقع. على مالك الموقع إضافة رصيد."),
    not_configured: t("Logo drawing isn't switched on for this site yet. You can still build a letter mark below.", "رسم الشعارات غير مفعّل في هذا الموقع بعد. ما زال بإمكانك تصميم علامة بالحروف في الأسفل."),
    rate_limited: t("That's a lot of drawings in a short time. Try again in a few minutes.", "رسومات كثيرة في وقت قصير. حاول مرة أخرى بعد دقائق."),
    busy: t("The brand partner is busy right now. Try again shortly.", "شريك الهوية مشغول الآن. حاول بعد قليل."),
    declined: t("The brand partner couldn't draw that. Try describing the logo differently.", "تعذّر على شريك الهوية رسم ذلك. جرّب وصف الشعار بطريقة أخرى."),
    no_answer: t("The drawings didn't come out cleanly. Try again; each attempt draws new ideas.", "لم تخرج الرسومات بشكل سليم. حاول مرة أخرى؛ كل محاولة ترسم أفكاراً جديدة."),
    offline: t("You seem to be offline. Try again when you're connected.", "يبدو أنك غير متصل. حاول مجدداً عند الاتصال."),
    failed: t("Something went wrong. Try again.", "حدث خطأ. حاول مرة أخرى."),
  };

  return (
    <div className="concepts">
      <div className="concepts-head">
        <h3 className="brand-sub-title">{t("Logo ideas drawn for your business", "أفكار شعارات مرسومة لمشروعك")}</h3>
        <p className="field-hint">{t("Your brand partner draws three different logo ideas from your business type, name and colours. Add a few words if you have something in mind.", "يرسم شريك الهوية ثلاث أفكار مختلفة للشعار بناءً على نوع مشروعك واسمه وألوانه. أضف بضع كلمات إن كانت لديك فكرة.")}</p>
      </div>
      <div className="concepts-brief">
        <label htmlFor="logo-brief" className="sr-only">{t("Describe the logo you want", "صِف الشعار الذي تريده")}</label>
        <textarea
          id="logo-brief"
          dir="auto"
          className="input textarea"
          rows={2}
          maxLength={600}
          value={brief}
          placeholder={t("For example: a coffee cup with steam shaped like a palm frond, modern and minimal", "مثال: كوب قهوة يتصاعد منه بخار على شكل سعفة نخيل، بأسلوب عصري وبسيط")}
          onChange={(e) => setBrief(e.target.value)}
        />
        <Button onClick={draw} disabled={drawing} icon={<PencilSimpleLine size={18} />} aria-describedby={drawing ? "concepts-wait" : undefined}>
          {drawing ? t("Drawing…", "يرسم…") : concepts.length ? t("Draw new ideas", "ارسم أفكاراً جديدة") : t("Draw logo ideas", "ارسم أفكار الشعار")}
        </Button>
      </div>
      <div aria-live="polite">
        {drawing && <p id="concepts-wait" className="field-hint">{t("Drawing three ideas. This usually takes under a minute.", "يرسم ثلاث أفكار. يستغرق ذلك عادةً أقل من دقيقة.")}</p>}
        {failure && <p className="brand-failure" role="status">{failureText[failure]}</p>}
      </div>
      {drawing && concepts.length === 0 && (
        <ul className="concept-grid" aria-hidden="true">{[0, 1, 2].map((i) => <li key={i} className="concept-card is-loading"><span className="concept-art" /></li>)}</ul>
      )}
      {concepts.length > 0 && (
        <ul className={clsx("concept-grid", drawing && "is-stale")}>
          {concepts.map((c, i) => {
            const chosen = brand.logo.custom === c.svg;
            return (
              <li key={i} className={clsx("concept-card", chosen && "is-on")}>
                <span className="concept-art" style={{ background: brand.colors.surface }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a data URI; an <img> also guarantees the SVG can't run anything. */}
                  <img src={svgDataUri(c.svg)} alt={c.title} width={160} height={160} />
                </span>
                <strong className="concept-title" dir="auto">{c.title}</strong>
                <p className="field-hint" dir="auto">{c.idea}</p>
                <div className="concept-actions">
                  <Button size="sm" variant={chosen ? "primary" : "secondary"} icon={chosen ? <Check size={16} weight="bold" /> : undefined} aria-pressed={chosen}
                    onClick={() => setBrand((b) => ({ ...b, logo: { ...b.logo, custom: chosen ? undefined : c.svg } }))}>
                    {chosen ? t("In use", "مستخدَم") : t("Use this logo", "استخدم هذا الشعار")}
                  </Button>
                  <Button size="sm" variant="ghost" icon={<DownloadSimple size={16} />} onClick={() => downloadSvg(c.svg, `${brand.name || "logo"}-${i + 1}`)}>
                    <span className="sr-only">{t(`Download ${c.title}`, `نزّل ${c.title}`)}</span>
                    <span aria-hidden="true">SVG</span>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
