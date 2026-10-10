"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { sectors, sectorOf } from "@/content/sectors";
import { places } from "@/content/places";
import { Origin } from "@/components/ui/origin";
import { Button } from "@/components/ui/button";
import { Field, Input, MoneyInput, TextArea } from "@/components/ui/field";
import { SectorIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { LanguageToggle } from "@/components/shell/app-shell";
import { newId, type Stage, type State } from "@/domain/state";
import { formatCoverage, suggestReserve, RESERVE_TARGET_MONTHS } from "@/domain/reserve";
import { moneyErrorText, toBaisa, type Baisa, type MoneyError } from "@/lib/money";

const STEPS = 5;
const DRAFT_KEY = "moasis-setup-draft";
const capitalPresets = [5_000, 10_000, 25_000, 50_000].map(toBaisa);

type Draft = { step: number; founder: string; name: string; sector: string; other: string; stage: Stage; idea: string; city: string; capital: Baisa | null; protect: boolean };

export default function SetupPage() {
  const ws = useWorkspace();
  // The form starts from the saved profile, so wait until the workspace has loaded.
  if (!ws.ready) return <div className="setup" aria-busy="true" />;
  return <SetupForm />;
}

function readDraft(): Partial<Draft> | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "null") as Draft | null;
    return saved && typeof saved.step === "number" ? saved : null;
  } catch {
    return null;
  }
}

function SetupForm() {
  const { t, p, number } = useI18n();
  const router = useRouter();
  const ws = useWorkspace();
  const v = ws.state.venture;
  const editing = v.started;

  // A new setup survives Back and refresh; editing always starts from the saved profile.
  const [d, setD] = useState<Draft>(() => ({
    step: 0, founder: v.founder || ws.user?.name || "", name: v.name, sector: v.sector, other: v.other, stage: v.stage, idea: v.idea, city: v.city || "Muscat", capital: v.capital, protect: true,
    ...(editing ? null : readDraft()),
  }));
  const [capitalErr, setCapitalErr] = useState<MoneyError | null>(null);
  const [tried, setTried] = useState(false);
  const finishing = useRef(false);
  const form = useRef<HTMLFormElement>(null);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));

  useEffect(() => {
    if (editing) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [d, editing]);

  const s = sectorOf(d.sector);
  const fixed = toBaisa(s.fixed);
  const reserve = suggestReserve(d.capital ?? 0, fixed);

  const errors: Record<number, Partial<Record<"founder" | "name" | "other" | "capital", string>>> = {
    0: {
      ...(!d.founder.trim() && { founder: t("Tell us what to call you.", "أخبرنا باسمك.") }),
      ...(!d.name.trim() && { name: t("Give the business a working name. You can change it later.", "اختر اسماً مبدئياً للمشروع. يمكنك تغييره لاحقاً.") }),
    },
    1: d.sector === "other" && d.other.trim().length < 3 ? { other: t("Describe your business type in a few words.", "صِف نوع مشروعك بكلمات قليلة.") } : {},
    2: {},
    3: editing ? {} : capitalErr ? { capital: moneyErrorText(capitalErr, t) }
      : d.capital === null ? { capital: moneyErrorText("blank", t) }
      : d.capital < toBaisa(100) ? { capital: t("Choose at least 100 rials to practise with.", "اختر ١٠٠ ريال على الأقل للتدرّب.") }
      : d.capital > toBaisa(10_000_000) ? { capital: t("Keep practice capital under 10 million rials.", "اجعل رأس المال التدريبي أقل من ١٠ ملايين ريال.") } : {},
    4: {},
  };
  const err = tried ? errors[d.step] : {};

  // Move focus to the first invalid field after a failed Continue.
  useEffect(() => {
    if (tried) form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [tried, d.step]);

  const go = (step: number) => { setTried(false); set({ step }); window.scrollTo({ top: 0 }); };
  const next = () => {
    if (Object.keys(errors[d.step]).length) return setTried(true);
    go(Math.min(STEPS - 1, d.step + 1));
  };

  const finish = () => {
    if (finishing.current) return; // double-clicks never add capital twice
    finishing.current = true;
    const cap = d.capital ?? toBaisa(10_000);
    const ok = ws.update((cur): State => {
      const venture = { ...cur.venture, founder: d.founder.trim(), name: d.name.trim(), sector: d.sector, other: d.other.trim(), stage: d.stage, idea: d.idea.trim(), city: d.city.trim() };
      // Editing the profile never rewrites money, history or assumptions.
      if (editing) return { ...cur, venture: { ...cur.venture, ...venture } };
      // Idempotent: a workspace that has already started is left as it is.
      if (cur.venture.started) return cur;
      const r = suggestReserve(cap, fixed);
      return {
        ...cur,
        venture: { ...venture, capital: cap, started: true },
        finance: { price: toBaisa(s.price), variable: toBaisa(s.variable), units: s.units, fixed, setup: toBaisa(s.setup), growth: 3, capacity: null },
        reserve: d.protect ? r.funded : 0,
        entries: [{ id: newId(), title: t("Practice capital", "رأس مال تدريبي"), amount: cap, category: "capital", date: new Date().toISOString(), source: "setup" }],
        tasks: [{ id: newId(), title: p(s.test), due: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), done: false }],
      };
    });
    if (!ok) { finishing.current = false; return; }
    try { sessionStorage.removeItem(DRAFT_KEY); } catch {}
    router.replace(editing ? "/settings" : "/");
  };

  const stageOptions: { id: Stage; title: string; sub: string }[] = [
    { id: "exploring", title: t("Exploring an idea", "أستكشف فكرة"), sub: t("Still deciding what to build.", "ما زلت أحدد ما سأبنيه.") },
    { id: "validating", title: t("Testing with customers", "أختبرها مع العملاء"), sub: t("Talking to people, gathering evidence.", "أتحدث مع الناس وأجمع الأدلة.") },
    { id: "ready", title: t("Preparing to launch", "أستعد للإطلاق"), sub: t("Budget, location and permits next.", "الميزانية والموقع والتصاريح تالياً.") },
    { id: "operating", title: t("Already operating", "أعمل فعلاً"), sub: t("Rehearsing growth or a change.", "أتدرّب على النمو أو التغيير.") },
  ];

  const stepNames = [t("Names", "الأسماء"), t("Business type", "نوع المشروع"), t("Stage and place", "المرحلة والمكان"), editing ? t("Capital", "رأس المال") : t("Capital and reserve", "رأس المال والاحتياطي"), t("Review", "المراجعة")];
  const titles = [
    [t("Start with a name.", "ابدأ باسم."), t("Nothing here is permanent. You can rename anything later.", "لا شيء هنا نهائي. يمكنك تغيير أي اسم لاحقاً.")],
    [t("What kind of business?", "ما نوع المشروع؟"), t("This sets your starting price, costs and volume in the forecast, and your first field test. They're general examples, not local quotes.", "يحدد هذا السعر والتكاليف والحجم الأوليّة في التوقعات، وأول اختبار ميداني. هي أمثلة عامة وليست أسعاراً محلية.")],
    [t("Where are you today?", "أين أنت اليوم؟"), t("Honest answers make the suggestions more useful.", "الإجابات الصادقة تجعل الاقتراحات أنفع.")],
    editing
      ? [t("Practice capital", "رأس المال التدريبي"), t("Capital is changed from the wallet, so the history explains every rial.", "يُعدَّل رأس المال من المحفظة، ليشرح السجل كل ريال.")]
      : [t("How much will you practise with?", "بكم ستتدرّب؟"), t("Virtual money for making decisions. No real funds move, ever.", "أموال افتراضية لاتخاذ القرارات. لا تنتقل أي أموال حقيقية أبداً.")],
    [t("Check and begin.", "راجع وابدأ."), t("Edit any part before you start.", "عدّل أي جزء قبل أن تبدأ.")],
  ];

  return (
    <div className="setup">
      <header className="setup-top">
        <span className="wordmark"><Origin className="wordmark-mark" /><span className="wordmark-text"><span className="wordmark-en">moasis</span><span className="wordmark-ar">مؤسس</span></span></span>
        <LanguageToggle />
      </header>

      <form ref={form} className="setup-body" noValidate onSubmit={(e) => { e.preventDefault(); if (d.step === STEPS - 1) finish(); else next(); }}>
        <div className="setup-progress">
          <p className="setup-step">{t(`Step ${d.step + 1} of ${STEPS}`, `الخطوة ${d.step + 1} من ${STEPS}`)} · <strong>{stepNames[d.step]}</strong></p>
          <div className="bar" role="progressbar" aria-label={t("Setup progress", "تقدّم الإعداد")} aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={d.step + 1} aria-valuetext={stepNames[d.step]}><span style={{ inlineSize: `${((d.step + 1) / STEPS) * 100}%` }} /></div>
        </div>
        <h1 className="setup-title">{titles[d.step][0]}</h1>
        <p className="setup-sub">{titles[d.step][1]}</p>

        {d.step === 0 && (
          <div className="form-stack">
            <Field label={t("Your name", "اسمك")} error={err.founder}>
              {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={d.founder} onChange={(e) => set({ founder: e.target.value })} autoComplete="name" maxLength={100} />}
            </Field>
            <Field label={t("Business name", "اسم المشروع")} hint={t("A working name is fine.", "يكفي اسم مبدئي.")} error={err.name}>
              {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={d.name} onChange={(e) => set({ name: e.target.value })} maxLength={100} placeholder={t("e.g. Nook Coffee", "مثال: مقهى الركن")} />}
            </Field>
          </div>
        )}

        {d.step === 1 && (
          <div className="form-stack">
            <RadioCards label={t("Business type", "نوع المشروع")} className="choice-grid sector-grid" value={d.sector} onChange={(sector) => set({ sector })}
              options={sectors.map((x) => ({ value: x.id, node: <><span className="choice-icon"><SectorIcon name={x.icon} size={20} /></span><span className="choice-title">{p(x.name)}</span></> }))} />
            {d.sector === "other" ? (
              <Field label={t("Describe your business type", "صِف نوع مشروعك")} error={err.other}>
                {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={d.other} onChange={(e) => set({ other: e.target.value })} maxLength={120} placeholder={t("e.g. Mobile car detailing", "مثال: تنظيف سيارات متنقل")} />}
              </Field>
            ) : <p className="setup-note"><strong>{t("You'll focus on", "ستركّز على")}:</strong> {p(s.focus)}</p>}
            {editing && d.sector !== v.sector && <p className="notice notice-warning">{t("Changing the type updates your profile only. Your forecast assumptions and wallet stay as they are; use “Use sector defaults” in Forecast if you want the new starting numbers.", "تغيير النوع يحدّث ملفك فقط. تبقى افتراضات التوقعات والمحفظة كما هي؛ استخدم «استخدام افتراضات القطاع» في التوقعات إن أردت الأرقام الجديدة.")}</p>}
          </div>
        )}

        {d.step === 2 && (
          <div className="form-stack">
            <RadioCards label={t("Stage", "المرحلة")} className="choice-grid choice-grid-2" value={d.stage} onChange={(stage) => set({ stage: stage as Stage })}
              options={stageOptions.map((o) => ({ value: o.id, node: <><span className="choice-title">{o.title}</span><span className="choice-sub">{o.sub}</span></> }))} />
            <Field label={t("Your idea in one sentence", "فكرتك في جملة واحدة")} optional>
              {(f) => <TextArea id={f.id} value={d.idea} onChange={(e) => set({ idea: e.target.value })} maxLength={600} rows={3} placeholder={t("Who it's for, what you'll offer, and why it matters.", "لمن هو، وماذا ستقدّم، ولماذا يهم.")} />}
            </Field>
            <Field label={t("Where will you start?", "أين ستبدأ؟")}>
              {(f) => (
                <>
                  <Input id={f.id} list="places" value={d.city} onChange={(e) => set({ city: e.target.value })} maxLength={80} />
                  <datalist id="places">{places.map((pl) => <option key={pl[0]} value={p(pl)} />)}</datalist>
                </>
              )}
            </Field>
          </div>
        )}

        {d.step === 3 && (editing ? (
          <div className="form-stack">
            <dl className="balance-list panel panel-pad"><div><dt>{t("Practice capital", "رأس المال التدريبي")}</dt><dd><Money value={v.capital} /></dd></div></dl>
            <Button variant="secondary" href="/wallet">{t("Adjust in the wallet", "التعديل من المحفظة")}</Button>
          </div>
        ) : (
          <div className="form-stack">
            <RadioCards label={t("Quick amounts", "مبالغ سريعة")} className="choice-grid choice-grid-4" value={d.capital !== null && capitalPresets.includes(d.capital) ? String(d.capital) : ""} onChange={(c) => { set({ capital: Number(c) }); setCapitalErr(null); }}
              options={capitalPresets.map((c) => ({ value: String(c), node: <span className="choice-title"><Money value={c} /></span> }))} compact />
            <Field label={t("Practice capital", "رأس المال التدريبي")} hint={t("The quick amounts are shortcuts, not advice on how much to invest.", "المبالغ السريعة اختصارات، وليست نصيحة بقدر ما تستثمره.")} error={err.capital}>
              {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} invalid={f.invalid} value={d.capital} onChange={(b, _r, e) => { set({ capital: b }); setCapitalErr(e); }} />}
            </Field>
            <div className="toggle-row reserve-toggle">
              <span className="choice-icon"><ShieldCheck size={20} aria-hidden="true" /></span>
              <span className="reserve-toggle-text">
                <label htmlFor="protect" className="field-label">{t("Protect a starting reserve", "احمِ احتياطياً أولياً")}</label>
                <span className="field-hint" id="protect-hint">
                  {fixed === 0 ? t("This business type has no fixed costs in its starting profile, so there's nothing to cover yet.", "لا توجد تكاليف ثابتة في الملف الأولي لهذا النوع، فلا شيء لتغطيته بعد.")
                    : reserve.capped
                      ? <>{t(`Aiming for ${RESERVE_TARGET_MONTHS} months of fixed costs would need`, `تغطية ${RESERVE_TARGET_MONTHS} أشهر من التكاليف الثابتة تحتاج إلى`)} <Money value={reserve.target} />{t(", more than 30% of your capital. You'd start with", "، أي أكثر من ٣٠٪ من رأس مالك. ستبدأ بـ")} <Money value={reserve.funded} />{t(", covering", "، تغطي")} {formatCoverage(reserve.coverage, t, number)}.</>
                      : <><Money value={reserve.funded} /> {t("set aside, covering", "مخصصة، تغطي")} {formatCoverage(reserve.coverage, t, number)}.</>}
                </span>
              </span>
              <input id="protect" type="checkbox" role="switch" className="switch" aria-describedby="protect-hint" checked={d.protect} onChange={(e) => set({ protect: e.target.checked })} />
            </div>
          </div>
        ))}

        {d.step === 4 && (
          <div className="review panel">
            <ReviewRow label={t("Founder and business", "المؤسس والمشروع")} onEdit={() => go(0)}><bdi>{d.founder}</bdi> · <bdi>{d.name}</bdi></ReviewRow>
            <ReviewRow label={t("Business type", "نوع المشروع")} onEdit={() => go(1)}>{d.sector === "other" ? d.other : p(s.name)}</ReviewRow>
            <ReviewRow label={t("Stage and place", "المرحلة والمكان")} onEdit={() => go(2)}>{stageOptions.find((o) => o.id === d.stage)?.title} · <bdi>{d.city}</bdi></ReviewRow>
            <ReviewRow label={t("Practice capital", "رأس المال التدريبي")} onEdit={() => go(3)}><Money value={editing ? v.capital : d.capital ?? 0} /></ReviewRow>
            {!editing && <ReviewRow label={t("Protected reserve", "الاحتياطي المحمي")} onEdit={() => go(3)}>{d.protect ? <><Money value={reserve.funded} /> · {formatCoverage(reserve.coverage, t, number)}</> : t("None", "لا يوجد")}</ReviewRow>}
            {!editing && <ReviewRow label={t("First field test", "أول اختبار ميداني")}>{p(s.test)}</ReviewRow>}
          </div>
        )}

        <div className="setup-actions">
          {d.step > 0 ? (
            <Button variant="ghost" icon={<ArrowLeft size={18} className="flip-rtl" />} onClick={() => go(d.step - 1)}>{t("Back", "رجوع")}</Button>
          ) : editing ? (
            <Button variant="ghost" onClick={() => router.back()}>{t("Cancel", "إلغاء")}</Button>
          ) : <Button variant="ghost" href="/welcome">{t("Cancel", "إلغاء")}</Button>}
          <Button type="submit" size="lg" trailing={d.step === STEPS - 1 ? <Check size={18} weight="bold" /> : <ArrowRight size={18} />}>
            {d.step === STEPS - 1 ? (editing ? t("Save changes", "حفظ التغييرات") : t("Open my workspace", "افتح مساحة عملي")) : t("Continue", "متابعة")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function ReviewRow({ label, children, onEdit }: { label: string; children: React.ReactNode; onEdit?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="review-row">
      <div className="min-w-0"><p className="stat-label">{label}</p><p className="review-value">{children}</p></div>
      {onEdit && <button type="button" className="link small" onClick={onEdit}>{t("Edit", "تعديل")}<span className="sr-only"> {label}</span></button>}
    </div>
  );
}

/** Radio cards with arrow-key movement that follows reading direction. */
function RadioCards({ label, value, onChange, options, className, compact }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; node: React.ReactNode }[]; className?: string; compact?: boolean }) {
  return (
    <div role="radiogroup" aria-label={label} className={className}
      onKeyDown={(e) => {
        const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
        const step = e.key === (rtl ? "ArrowLeft" : "ArrowRight") || e.key === "ArrowDown" ? 1 : e.key === (rtl ? "ArrowRight" : "ArrowLeft") || e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const i = Math.max(0, options.findIndex((o) => o.value === value));
        const n = options[(i + step + options.length) % options.length];
        onChange(n.value);
        e.currentTarget.querySelector<HTMLElement>(`[data-value="${CSS.escape(n.value)}"]`)?.focus();
      }}>
      {options.map((o, i) => {
        const checked = o.value === value;
        const focusable = checked || (!options.some((x) => x.value === value) && i === 0);
        return (
          <button key={o.value} type="button" role="radio" aria-checked={checked} tabIndex={focusable ? 0 : -1} data-value={o.value} className={compact ? "choice choice-compact" : "choice"} onClick={() => onChange(o.value)}>
            {o.node}
          </button>
        );
      })}
    </div>
  );
}
