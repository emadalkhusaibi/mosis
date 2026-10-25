"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck, Sparkle } from "@phosphor-icons/react";
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
import { channels, experiences, needs, newId, times, worries, type Need, type Profile, type Stage, type State } from "@/domain/state";
import { needDescriptions, needFromStage, needNames } from "@/domain/path";
import { channelOptions, experienceOptions, timeOptions, worryOptions } from "@/domain/profile";
import { formatCoverage, suggestReserve, RESERVE_TARGET_MONTHS } from "@/domain/reserve";
import { moneyErrorText, toBaisa, type Baisa, type MoneyError } from "@/lib/money";
import type { Words } from "@/content/words";

const DRAFT_KEY = "moasis-setup-draft-v2";
const capitalPresets = [5_000, 10_000, 25_000, 50_000].map(toBaisa);

/**
 * The first thing a new visitor sees: one question per screen, so the answers
 * can shape the workspace before it opens. Single-choice questions move on as
 * soon as you tap; everything can be changed later from Settings.
 */
type StepId = "intro" | "you" | "type" | "stage" | "need" | "experience" | "channel" | "time" | "worry" | "business" | "capital" | "review";
const allSteps: StepId[] = ["intro", "you", "type", "stage", "need", "experience", "channel", "time", "worry", "business", "capital", "review"];
const autoAdvance: StepId[] = ["stage", "need", "experience", "channel", "time", "worry"];

type Draft = { step: number; founder: string; name: string; sector: string; other: string; stage: Stage; need?: Need; idea: string; city: string; capital: Baisa | null; protect: boolean } & Profile;

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
  const flow = editing ? allSteps.filter((x) => x !== "intro") : allSteps;

  // A new setup survives Back and refresh; editing always starts from the saved profile.
  const [d, setD] = useState<Draft>(() => ({
    step: 0, founder: v.founder || ws.user?.name || "", name: v.name, sector: v.sector, other: v.other, stage: v.stage, need: v.need, idea: v.idea, city: v.city || "Muscat", capital: v.capital, protect: true,
    ...v.profile,
    ...(editing ? null : readDraft()),
  }));
  const [capitalErr, setCapitalErr] = useState<MoneyError | null>(null);
  const [tried, setTried] = useState(false);
  const finishing = useRef(false);
  const advancing = useRef<number | null>(null);
  const form = useRef<HTMLFormElement>(null);
  const set = (patch: Partial<Draft>) => setD((x) => ({ ...x, ...patch }));
  const step = flow[Math.min(d.step, flow.length - 1)];
  const questions: StepId[] = flow.filter((x) => x !== "intro" && x !== "review");
  const qIndex = questions.indexOf(step);

  useEffect(() => {
    if (editing) return;
    try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch {}
  }, [d, editing]);
  useEffect(() => () => { if (advancing.current) window.clearTimeout(advancing.current); }, []);

  const s = sectorOf(d.sector);
  const fixed = toBaisa(s.fixed);
  const reserve = suggestReserve(d.capital ?? 0, fixed);
  const need = d.need ?? needFromStage[d.stage];

  const errors: Partial<Record<StepId, Partial<Record<"founder" | "name" | "other" | "capital", string>>>> = {
    you: !d.founder.trim() ? { founder: t("Tell us what to call you.", "أخبرنا باسمك.") } : {},
    type: d.sector === "other" && d.other.trim().length < 3 ? { other: t("Describe your business type in a few words.", "صِف نوع مشروعك بكلمات قليلة.") } : {},
    business: !d.name.trim() ? { name: t("Give the business a working name. You can change it later.", "اختر اسماً مبدئياً للمشروع. يمكنك تغييره لاحقاً.") } : {},
    capital: editing ? {} : capitalErr ? { capital: moneyErrorText(capitalErr, t) }
      : d.capital === null ? { capital: moneyErrorText("blank", t) }
      : d.capital < toBaisa(100) ? { capital: t("Choose at least 100 rials to practise with.", "اختر ١٠٠ ريال على الأقل للتدرّب.") }
      : d.capital > toBaisa(10_000_000) ? { capital: t("Keep practice capital under 10 million rials.", "اجعل رأس المال التدريبي أقل من ١٠ ملايين ريال.") } : {},
  };
  const stepErrors = errors[step] ?? {};
  const err = tried ? stepErrors : {};

  // Move focus to the first invalid field after a failed Continue.
  useEffect(() => {
    if (tried) form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  }, [tried, d.step]);

  const go = (i: number) => { setTried(false); set({ step: i }); window.scrollTo({ top: 0 }); };
  const goTo = (id: StepId) => go(flow.indexOf(id));
  const next = () => {
    if (Object.keys(stepErrors).length) return setTried(true);
    go(Math.min(flow.length - 1, d.step + 1));
  };
  // A tap on a single-choice answer moves on after a beat, so the choice is seen before the screen changes.
  const pick = (patch: Partial<Draft>) => {
    set(patch);
    if (!autoAdvance.includes(step)) return;
    if (advancing.current) window.clearTimeout(advancing.current);
    advancing.current = window.setTimeout(() => go(Math.min(flow.length - 1, d.step + 1)), 260);
  };

  const finish = () => {
    if (finishing.current) return; // double-clicks never add capital twice
    finishing.current = true;
    const cap = d.capital ?? toBaisa(10_000);
    const profile: Profile = { experience: d.experience, channel: d.channel, time: d.time, worry: d.worry };
    const ok = ws.update((cur): State => {
      const venture = { ...cur.venture, founder: d.founder.trim(), name: d.name.trim(), sector: d.sector, other: d.other.trim(), stage: d.stage, need, profile, idea: d.idea.trim(), city: d.city.trim() };
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
  const optionCards = <K extends string>(ids: readonly K[], opts: Record<K, { title: Words; sub: Words }>) =>
    ids.map((id) => ({ value: id, node: <><span className="choice-title">{p(opts[id].title)}</span><span className="choice-sub">{p(opts[id].sub)}</span></> }));
  const answer = <K extends string>(value: K | undefined, opts: Record<K, { title: Words }>) => (value ? p(opts[value].title) : t("Skipped", "تم التخطي"));

  const titles: Record<StepId, [string, string]> = {
    intro: [t("Let's shape Moasis around you.", "لنصمّم مؤسس على مقاسك."), t("Ten quick questions, about two minutes. Your answers decide what you see first, the examples you get and the numbers you start with.", "عشرة أسئلة سريعة، نحو دقيقتين. إجاباتك تحدد ما تراه أولاً والأمثلة التي تصلك والأرقام التي تبدأ بها.")],
    you: [t("First, what should we call you?", "أولاً، بماذا نناديك؟"), t("Just a first name is fine.", "يكفي الاسم الأول.")],
    type: [t("What kind of business?", "ما نوع المشروع؟"), t("This sets your starting price, costs and volume, your examples and your first field test. They're general examples, not local quotes.", "يحدد هذا السعر والتكاليف والحجم الأوليّة، وأمثلتك، وأول اختبار ميداني. هي أمثلة عامة وليست أسعاراً محلية.")],
    stage: [t("Where are you with it?", "أين وصلت فيه؟"), t("Honest answers make the suggestions more useful.", "الإجابات الصادقة تجعل الاقتراحات أنفع.")],
    need: [t("What do you need most right now?", "ما الذي تحتاجه أكثر الآن؟"), t("This orders your path on Today.", "هذا يرتّب مسارك في صفحة اليوم.")],
    experience: [t("Have you run a business before?", "هل أدرت مشروعاً من قبل؟"), t("First-timers get the money basics early; experienced founders skip ahead.", "يحصل المبتدئون على أساسيات المال مبكراً، ويتجاوزها أصحاب الخبرة.")],
    channel: [t("How will customers reach you?", "كيف سيصل إليك العملاء؟"), t("This changes your launch steps, like whether you need a shop at all.", "هذا يغيّر خطوات انطلاقك، مثل حاجتك إلى محل أصلاً.")],
    time: [t("How much time can you give it?", "كم من الوقت تستطيع منحه؟"), t("We'll suggest a pace that fits.", "سنقترح وتيرة تناسبك.")],
    worry: [t("What worries you most?", "ما أكثر ما يقلقك؟"), t("You'll get a lesson and a next step aimed right at it.", "ستحصل على درس وخطوة تالية موجّهين له تحديداً.")],
    business: [t("Name it and place it.", "سمِّه وحدّد مكانه."), t("A working name is fine. Nothing here is permanent.", "يكفي اسم مبدئي. لا شيء هنا نهائي.")],
    capital: editing
      ? [t("Practice capital", "رأس المال التدريبي"), t("Capital is changed from the wallet, so the history explains every rial.", "يُعدَّل رأس المال من المحفظة، ليشرح السجل كل ريال.")]
      : [t("How much will you practise with?", "بكم ستتدرّب؟"), t("Virtual money for making decisions. No real funds move, ever.", "أموال افتراضية لاتخاذ القرارات. لا تنتقل أي أموال حقيقية أبداً.")],
    review: [editing ? t("Check your answers.", "راجع إجاباتك.") : t("Here's your Moasis.", "هذا مؤسس الخاص بك."), t("Edit any answer before you start. You can change them later in Settings.", "عدّل أي إجابة قبل أن تبدأ. يمكنك تغييرها لاحقاً من الإعدادات.")],
  };
  const isLast = d.step === flow.length - 1;

  return (
    <div className="setup">
      <header className="setup-top">
        <span className="wordmark"><Origin className="wordmark-mark" /><span className="wordmark-text"><span className="wordmark-en">moasis</span><span className="wordmark-ar">مؤسس</span></span></span>
        <LanguageToggle />
      </header>

      <form ref={form} className="setup-body" noValidate onSubmit={(e) => { e.preventDefault(); if (isLast) finish(); else next(); }}>
        {qIndex >= 0 && (
          <div className="setup-progress">
            <p className="setup-step">{t(`Question ${qIndex + 1} of ${questions.length}`, `السؤال ${number(qIndex + 1)} من ${number(questions.length)}`)}</p>
            <div className="bar" role="progressbar" aria-label={t("Setup progress", "تقدّم الإعداد")} aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={qIndex + 1}><span style={{ inlineSize: `${((qIndex + 1) / questions.length) * 100}%` }} /></div>
          </div>
        )}
        <div className="setup-screen" key={step}>
          {step === "intro" && <span className="setup-hero-mark" aria-hidden="true"><Sparkle size={28} weight="fill" /></span>}
          <h1 className="setup-title">{titles[step][0]}</h1>
          <p className="setup-sub">{titles[step][1]}</p>

          {step === "intro" && (
            <ul className="setup-promises">
              <li><Check size={18} weight="bold" aria-hidden="true" />{t("A path built for your business and what you need", "مسار مبني لمشروعك ولما تحتاجه")}</li>
              <li><Check size={18} weight="bold" aria-hidden="true" />{t("Examples and numbers from your kind of business", "أمثلة وأرقام من نوع مشروعك")}</li>
              <li><Check size={18} weight="bold" aria-hidden="true" />{t("Practice money only. Nothing real is spent", "مال تدريبي فقط. لا يُنفق شيء حقيقي")}</li>
            </ul>
          )}

          {step === "you" && (
            <Field label={t("Your name", "اسمك")} error={err.founder}>
              {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={d.founder} onChange={(e) => set({ founder: e.target.value })} autoComplete="given-name" maxLength={100} autoFocus />}
            </Field>
          )}

          {step === "type" && (
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

          {step === "stage" && (
            <RadioCards label={t("Stage", "المرحلة")} className="choice-grid choice-grid-2" value={d.stage} onChange={(stage) => set({ stage: stage as Stage })} onPick={(stage) => pick({ stage: stage as Stage })}
              options={stageOptions.map((o) => ({ value: o.id, node: <><span className="choice-title">{o.title}</span><span className="choice-sub">{o.sub}</span></> }))} />
          )}
          {step === "need" && (
            <RadioCards label={titles.need[0]} className="choice-grid choice-grid-2" value={need} onChange={(n) => set({ need: n as Need })} onPick={(n) => pick({ need: n as Need })}
              options={needs.map((n) => ({ value: n, node: <><span className="choice-title">{p(needNames[n])}</span><span className="choice-sub">{p(needDescriptions[n])}</span></> }))} />
          )}
          {step === "experience" && (
            <RadioCards label={titles.experience[0]} className="choice-grid choice-grid-2" value={d.experience ?? ""} onChange={(x) => set({ experience: x as Draft["experience"] })} onPick={(x) => pick({ experience: x as Draft["experience"] })} options={optionCards(experiences, experienceOptions)} />
          )}
          {step === "channel" && (
            <RadioCards label={titles.channel[0]} className="choice-grid choice-grid-2" value={d.channel ?? ""} onChange={(x) => set({ channel: x as Draft["channel"] })} onPick={(x) => pick({ channel: x as Draft["channel"] })} options={optionCards(channels, channelOptions)} />
          )}
          {step === "time" && (
            <RadioCards label={titles.time[0]} className="choice-grid choice-grid-2" value={d.time ?? ""} onChange={(x) => set({ time: x as Draft["time"] })} onPick={(x) => pick({ time: x as Draft["time"] })} options={optionCards(times, timeOptions)} />
          )}
          {step === "worry" && (
            <RadioCards label={titles.worry[0]} className="choice-grid choice-grid-2" value={d.worry ?? ""} onChange={(x) => set({ worry: x as Draft["worry"] })} onPick={(x) => pick({ worry: x as Draft["worry"] })} options={optionCards(worries, worryOptions)} />
          )}

          {step === "business" && (
            <div className="form-stack">
              <Field label={t("Business name", "اسم المشروع")} hint={t("A working name is fine.", "يكفي اسم مبدئي.")} error={err.name}>
                {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={d.name} onChange={(e) => set({ name: e.target.value })} maxLength={100} placeholder={t("e.g. Nook Coffee", "مثال: مقهى الركن")} />}
              </Field>
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

          {step === "capital" && (editing ? (
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

          {step === "review" && (
            <div className="review panel">
              <ReviewRow label={t("You and your business", "أنت ومشروعك")} onEdit={() => goTo("business")}><bdi>{d.founder}</bdi> · <bdi>{d.name}</bdi> · <bdi>{d.city}</bdi></ReviewRow>
              <ReviewRow label={t("Business type", "نوع المشروع")} onEdit={() => goTo("type")}>{d.sector === "other" ? d.other : p(s.name)}</ReviewRow>
              <ReviewRow label={t("Stage and need", "المرحلة والحاجة")} onEdit={() => goTo("stage")}>{stageOptions.find((o) => o.id === d.stage)?.title} · {p(needNames[need])}</ReviewRow>
              <ReviewRow label={t("Experience and time", "الخبرة والوقت")} onEdit={() => goTo("experience")}>{answer(d.experience, experienceOptions)} · {answer(d.time, timeOptions)}</ReviewRow>
              <ReviewRow label={t("Customers and worry", "العملاء والقلق")} onEdit={() => goTo("channel")}>{answer(d.channel, channelOptions)} · {answer(d.worry, worryOptions)}</ReviewRow>
              <ReviewRow label={t("Practice capital", "رأس المال التدريبي")} onEdit={() => goTo("capital")}><Money value={editing ? v.capital : d.capital ?? 0} />{!editing && d.protect && <> · {t("reserve", "احتياطي")} <Money value={reserve.funded} /></>}</ReviewRow>
              {!editing && <ReviewRow label={t("Your first field test", "أول اختبار ميداني")}>{p(s.test)}</ReviewRow>}
            </div>
          )}
        </div>

        <div className="setup-actions">
          {d.step > 0 ? (
            <Button variant="ghost" icon={<ArrowLeft size={18} className="flip-rtl" />} onClick={() => go(d.step - 1)}>{t("Back", "رجوع")}</Button>
          ) : editing ? (
            <Button variant="ghost" onClick={() => router.back()}>{t("Cancel", "إلغاء")}</Button>
          ) : <Link href="/welcome" className="link-quiet">{t("What is Moasis?", "ما هو مؤسس؟")}</Link>}
          <Button type="submit" size="lg" trailing={isLast ? <Check size={18} weight="bold" /> : <ArrowRight size={18} className="flip-rtl" />}>
            {isLast ? (editing ? t("Save changes", "حفظ التغييرات") : t("Open my workspace", "افتح مساحة عملي"))
              : step === "intro" ? t("Start", "ابدأ")
              : autoAdvance.includes(step) && !(step === "stage" || step === "need") && !d[step as "experience"] ? t("Skip", "تخطَّ") : t("Continue", "متابعة")}
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
function RadioCards({ label, value, onChange, onPick, options, className, compact }: { label: string; value: string; onChange: (v: string) => void; onPick?: (v: string) => void; options: { value: string; node: React.ReactNode }[]; className?: string; compact?: boolean }) {
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
          <button key={o.value} type="button" role="radio" aria-checked={checked} tabIndex={focusable ? 0 : -1} data-value={o.value} className={compact ? "choice choice-compact" : "choice"} onClick={() => (onPick ?? onChange)(o.value)}>
            {o.node}
          </button>
        );
      })}
    </div>
  );
}
