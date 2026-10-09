"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { sectors, sectorOf } from "@/content/sectors";
import { places } from "@/content/places";
import { Origin } from "@/components/ui/origin";
import { Button } from "@/components/ui/button";
import { Field, Input, MoneyInput, TextArea } from "@/components/ui/field";
import { SectorIcon } from "@/components/ui/icons";
import { Money } from "@/components/ui/money";
import { newId, type Stage, type State } from "@/domain/state";
import { toBaisa, type Baisa } from "@/lib/money";

const STEPS = 5;
const capitalPresets = [5_000, 10_000, 25_000, 50_000].map(toBaisa);

export default function SetupPage() {
  const { t, p, dir } = useI18n();
  const router = useRouter();
  const ws = useWorkspace();
  const v = ws.state.venture;
  const editing = v.started;

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [founder, setFounder] = useState(v.founder || ws.user?.name || "");
  const [name, setName] = useState(v.name);
  const [sector, setSector] = useState<string>(v.sector);
  const [other, setOther] = useState(v.other);
  const [stage, setStage] = useState<Stage>(v.stage);
  const [idea, setIdea] = useState(v.idea);
  const [city, setCity] = useState(v.city || "Muscat");
  const [capital, setCapital] = useState<Baisa | null>(v.capital);
  const [protect, setProtect] = useState(true);
  const [tried, setTried] = useState(false);

  const s = sectorOf(sector);
  const suggestedReserve = useMemo(() => Math.min(toBaisa(s.fixed) * 3, Math.round((capital ?? 0) * 0.3)), [s, capital]);

  const errors = {
    0: !founder.trim() ? t("Tell us what to call you.", "أخبرنا باسمك.") : !name.trim() ? t("Give the business a working name. You can change it later.", "اختر اسماً مبدئياً للمشروع. يمكنك تغييره لاحقاً.") : null,
    1: sector === "other" && other.trim().length < 3 ? t("Describe your business type in a few words.", "صِف نوع مشروعك بكلمات قليلة.") : null,
    2: null,
    3: capital === null || capital < toBaisa(100) ? t("Choose at least 100 rials to practise with.", "اختر ١٠٠ ريال على الأقل للتدرّب.") : capital > toBaisa(10_000_000) ? t("Keep practice capital under 10 million rials.", "اجعل رأس المال التدريبي أقل من ١٠ ملايين ريال.") : null,
    4: null,
  } as Record<number, string | null>;

  const next = () => {
    setTried(true);
    if (errors[step]) return;
    setTried(false);
    setDirection(1);
    setStep((x) => Math.min(STEPS - 1, x + 1));
  };
  const back = () => {
    setTried(false);
    setDirection(-1);
    setStep((x) => Math.max(0, x - 1));
  };

  const finish = () => {
    const cap = capital ?? toBaisa(10_000);
    const now = new Date().toISOString();
    ws.update((cur): State => {
      const venture = { ...cur.venture, founder: founder.trim(), name: name.trim(), sector, other: other.trim(), stage, idea: idea.trim(), city, capital: cap, started: true };
      if (editing) {
        // Editing the profile never rewrites recorded money; capital changes go through the wallet.
        return { ...cur, venture: { ...venture, capital: cur.venture.capital } };
      }
      const reserve = protect ? suggestedReserve : 0;
      return {
        ...cur,
        venture,
        finance: { price: toBaisa(s.price), variable: toBaisa(s.variable), units: s.units, fixed: toBaisa(s.fixed), setup: toBaisa(s.setup), growth: 3, capacity: 0 },
        reserve,
        entries: [{ id: newId(), title: t("Practice capital", "رأس مال تدريبي"), amount: cap, category: "capital", date: now }],
        tasks: [{ id: newId(), title: p(s.test), due: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10), done: false }],
      };
    });
    router.replace(editing ? "/settings" : "/");
  };

  const stageOptions: { id: Stage; title: string; sub: string }[] = [
    { id: "exploring", title: t("Exploring an idea", "أستكشف فكرة"), sub: t("Still deciding what to build.", "ما زلت أحدد ما سأبنيه.") },
    { id: "validating", title: t("Testing with customers", "أختبرها مع العملاء"), sub: t("Talking to people, gathering evidence.", "أتحدث مع الناس وأجمع الأدلة.") },
    { id: "ready", title: t("Preparing to launch", "أستعد للإطلاق"), sub: t("Budget, location and permits next.", "الميزانية والموقع والتصاريح تالياً.") },
    { id: "operating", title: t("Already operating", "أعمل فعلاً"), sub: t("Rehearsing growth or a change.", "أتدرّب على النمو أو التغيير.") },
  ];

  const titles = [
    [t("A considered beginning.", "بداية مدروسة."), t("Practise your business before you commit your money. Start with a name; nothing here is permanent.", "تدرّب على مشروعك قبل أن تخاطر بمالك. ابدأ باسم؛ لا شيء هنا نهائي.")],
    [t("What kind of business?", "ما نوع المشروع؟"), t("Your choice shapes starting assumptions, guidance and the first field test.", "يحدد اختيارك الافتراضات الأولى والإرشاد وأول اختبار ميداني.")],
    [t("Where are you today?", "أين أنت اليوم؟"), t("Honest answers make the guidance more useful.", "الإجابات الصادقة تجعل الإرشاد أنفع.")],
    [t("Choose your practice capital.", "اختر رأس مالك التدريبي."), t("Virtual money to make decisions with. No real funds move, ever.", "أموال افتراضية لاتخاذ القرارات. لا تنتقل أي أموال حقيقية أبداً.")],
    [t("Ready to begin.", "جاهز للبدء."), t("Here's your starting point. You can edit any of it later.", "هذه نقطة انطلاقك. يمكنك تعديل أي شيء لاحقاً.")],
  ];

  const err = tried ? errors[step] : null;
  const variants = {
    enter: (d: number) => ({ opacity: 0, x: (dir === "rtl" ? -1 : 1) * d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: (dir === "rtl" ? -1 : 1) * d * -40 }),
  };

  return (
    <div className="setup">
      <div className="setup-art" aria-hidden="true">
        <div className="setup-art-media"><Image src="/images/founder-studio.webp" alt="" fill sizes="45vw" priority /></div>
        <div className="setup-art-caption">
          <Origin className="h-8 w-8" />
          <p>{t("Practice money. Real learning.", "مال تدريبي. تعلّم حقيقي.")}</p>
        </div>
      </div>

      <div className="setup-panel">
        <header className="setup-top">
          <span className="wordmark"><Origin className="wordmark-mark" /><span className="wordmark-text"><span className="wordmark-en">moasis</span><span className="wordmark-ar">مؤسس</span></span></span>
          <div className="setup-steps" role="progressbar" aria-label={t("Setup progress", "تقدّم الإعداد")} aria-valuemin={1} aria-valuemax={STEPS} aria-valuenow={step + 1}>
            {Array.from({ length: STEPS }, (_, i) => <span key={i} className={clsx(i <= step && "is-done")} />)}
          </div>
        </header>

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.form
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="setup-body"
            onSubmit={(e) => { e.preventDefault(); if (step === STEPS - 1) finish(); else next(); }}
            noValidate
          >
            <p className="eyebrow">{t(`Step ${step + 1} of ${STEPS}`, `الخطوة ${step + 1} من ${STEPS}`)}</p>
            <h1 className="setup-title">{titles[step][0]}</h1>
            <p className="setup-sub">{titles[step][1]}</p>

            {step === 0 && (
              <div className="setup-fields">
                <Field label={t("Your name", "اسمك")} error={err && !founder.trim() ? err : undefined}>
                  {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={founder} onChange={(e) => setFounder(e.target.value)} autoComplete="name" maxLength={100} autoFocus />}
                </Field>
                <Field label={t("Business name", "اسم المشروع")} hint={t("A working name is fine.", "يكفي اسم مبدئي.")} error={err && founder.trim() && !name.trim() ? err : undefined}>
                  {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} placeholder={t("e.g. Nook Coffee", "مثال: مقهى الركن")} />}
                </Field>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="choice-grid" role="radiogroup" aria-label={t("Business type", "نوع المشروع")}>
                  {sectors.map((x) => (
                    <button key={x.id} type="button" role="radio" aria-checked={sector === x.id} className="choice" onClick={() => setSector(x.id)}>
                      <span className="choice-icon"><SectorIcon name={x.icon} size={20} /></span>
                      <span className="choice-title">{p(x.name)}</span>
                    </button>
                  ))}
                </div>
                {sector === "other" && (
                  <Field label={t("Describe your business type", "صِف نوع مشروعك")} error={err ?? undefined} className="mt-5">
                    {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={other} onChange={(e) => setOther(e.target.value)} maxLength={120} autoFocus placeholder={t("e.g. Mobile car detailing", "مثال: تنظيف سيارات متنقل")} />}
                  </Field>
                )}
                {sector !== "other" && <p className="setup-note"><strong>{t("You'll focus on", "ستركّز على")}:</strong> {p(s.focus)}</p>}
              </>
            )}

            {step === 2 && (
              <div className="setup-fields">
                <div className="choice-grid choice-grid-2" role="radiogroup" aria-label={t("Stage", "المرحلة")}>
                  {stageOptions.map((o) => (
                    <button key={o.id} type="button" role="radio" aria-checked={stage === o.id} className="choice" onClick={() => setStage(o.id)}>
                      <span className="choice-title">{o.title}</span>
                      <span className="choice-sub">{o.sub}</span>
                    </button>
                  ))}
                </div>
                <Field label={t("Your idea in one sentence", "فكرتك في جملة واحدة")} optional>
                  {(f) => <TextArea id={f.id} value={idea} onChange={(e) => setIdea(e.target.value)} maxLength={600} rows={3} placeholder={t("Who it's for, what you'll offer, and why it matters.", "لمن هو، وماذا ستقدّم، ولماذا يهم.")} />}
                </Field>
                <Field label={t("Where will you start?", "أين ستبدأ؟")}>
                  {(f) => (
                    <>
                      <Input id={f.id} list="places" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} />
                      <datalist id="places">{places.map((pl) => <option key={pl[0]} value={p(pl)} />)}</datalist>
                    </>
                  )}
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="setup-fields">
                <div className="choice-grid choice-grid-4" role="radiogroup" aria-label={t("Capital presets", "مبالغ مقترحة")}>
                  {capitalPresets.map((c) => (
                    <button key={c} type="button" role="radio" aria-checked={capital === c} className="choice choice-compact" onClick={() => setCapital(c)}>
                      <span className="choice-title"><Money value={c} /></span>
                    </button>
                  ))}
                </div>
                <Field label={t("Or enter an amount", "أو أدخل مبلغاً")} error={err ?? undefined}>
                  {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} invalid={f.invalid} value={capital} onChange={(b) => setCapital(b)} />}
                </Field>
                {!editing && (
                  <label className="toggle-row">
                    <span className="toggle-icon"><ShieldCheck size={20} /></span>
                    <span className="min-w-0 flex-1">
                      <strong>{t("Protect a starting reserve", "احمِ احتياطياً أولياً")}</strong>
                      <span className="block muted small">{t("Set aside about three months of fixed costs so you practise with a safety net.", "خصّص ما يعادل ثلاثة أشهر من التكاليف الثابتة لتتدرّب بشبكة أمان.")} {capital ? <Money value={suggestedReserve} /> : null}</span>
                    </span>
                    <input type="checkbox" className="switch" checked={protect} onChange={(e) => setProtect(e.target.checked)} />
                  </label>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="review-card">
                <div className="review-head">
                  <span className="choice-icon"><SectorIcon name={s.icon} size={20} /></span>
                  <div className="min-w-0">
                    <strong>{name}</strong>
                    <span className="muted small block">{sector === "other" ? other : p(s.name)} · {city}</span>
                  </div>
                </div>
                <dl className="review-list">
                  <div><dt>{t("Founder", "المؤسس")}</dt><dd>{founder}</dd></div>
                  <div><dt>{t("Stage", "المرحلة")}</dt><dd>{stageOptions.find((o) => o.id === stage)?.title}</dd></div>
                  <div><dt>{t("Practice capital", "رأس المال التدريبي")}</dt><dd><Money value={editing ? v.capital : capital ?? 0} /></dd></div>
                  {!editing && protect && <div><dt>{t("Protected reserve", "الاحتياطي المحمي")}</dt><dd><Money value={suggestedReserve} /></dd></div>}
                  <div><dt>{t("First field test", "أول اختبار ميداني")}</dt><dd>{p(s.test)}</dd></div>
                </dl>
                <p className="muted small">{t("Starting assumptions come from a general sector profile, not local quotes. Replace them with your own evidence as you go.", "الافتراضات الأولية مأخوذة من ملف عام للقطاع وليست أسعاراً محلية. استبدلها بأدلتك الخاصة مع التقدّم.")}</p>
              </div>
            )}

            {err && step !== 0 && step !== 1 && step !== 3 && <p className="field-error" role="alert">{err}</p>}

            <div className="setup-actions">
              {step > 0 ? (
                <Button variant="ghost" icon={<ArrowLeft size={18} className="flip-rtl" />} onClick={back}>{t("Back", "رجوع")}</Button>
              ) : editing ? (
                <Button variant="ghost" onClick={() => router.back()}>{t("Cancel", "إلغاء")}</Button>
              ) : <span />}
              <Button type="submit" size="lg" trailing={step === STEPS - 1 ? <Check size={18} weight="bold" /> : <ArrowRight size={18} />}>
                {step === STEPS - 1 ? (editing ? t("Save changes", "حفظ التغييرات") : t("Open my workspace", "افتح مساحة عملي")) : t("Continue", "متابعة")}
              </Button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}
