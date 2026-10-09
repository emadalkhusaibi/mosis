"use client";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, ChartLineUp, Check, Exam, LockSimple, NotePencil, Translate, Wallet } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { Origin3D } from "@/components/three/origin-3d";
import { Tilt } from "@/components/ui/tilt";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { accent } from "@/components/ui/accent";
import { Origin, Wordmark } from "@/components/ui/origin";
import { Money } from "@/components/ui/money";
import { ProgressRing } from "@/components/ui/progress";

const ease = [0.22, 1, 0.36, 1] as const;

function useStarted() {
  return useSyncExternalStore(
    () => () => {},
    () => { try { return JSON.parse(localStorage.getItem("moasis-workspace") ?? "null")?.venture?.started === true; } catch { return false; } },
    () => false,
  );
}

export function Welcome() {
  const { t, lang, setLang } = useI18n();
  const started = useStarted();
  const primary = started ? { href: "/", label: t("Open my workspace", "افتح مساحة عملي") } : { href: "/setup", label: t("Start practising", "ابدأ التدرّب") };

  return (
    <div className="welcome">
      <SmoothScroll />
      <header className="w-nav glass">
        <Link href="/welcome" aria-label="Moasis"><Wordmark /></Link>
        <nav className="w-nav-actions">
          <button type="button" className="w-lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={t("Switch to Arabic", "التبديل إلى الإنجليزية")}>
            {lang === "ar" ? "English" : "العربية"}
          </button>
          <Link href="/sign-in" className="w-link">{t("Sign in", "تسجيل الدخول")}</Link>
          <Link href={primary.href} className="btn btn-primary btn-sm">{started ? t("Open", "افتح") : t("Start", "ابدأ")}</Link>
        </nav>
      </header>

      <Hero primary={primary} />
      <WalletShowcase />
      <Story />
      <Bilingual />
      <Principles />
      <Closing primary={primary} />

      <footer className="w-footer">
        <Wordmark />
        <p>{t("Moasis is a learning simulation for founders in Oman. Practice balances are not real money and nothing here is financial advice.", "مؤسس محاكاة تعليمية للمؤسسين في عُمان. أرصدة التدريب ليست أموالاً حقيقية ولا شيء هنا يُعد استشارة مالية.")}</p>
      </footer>
    </div>
  );
}

/* ---------- Hero ---------- */

function Words({ text, delay = 0, className }: { text: string; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={className}>
      {text.split(" ").map((raw, i) => {
        const accented = raw.startsWith("*");
        const word = raw.replace(/\*/g, "");
        return (
          <motion.span
            key={`${word}-${i}`}
            className={clsx("w-word", accented && "accent")}
            initial={reduce ? false : { opacity: 0, y: "0.5em", filter: "blur(12px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease, delay: delay + i * 0.07 }}
          >
            {word}{" "}
          </motion.span>
        );
      })}
    </span>
  );
}

function Hero({ primary }: { primary: { href: string; label: string } }) {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.5 });
  const copyOpacity = useTransform(progress, [0, 0.32], [1, 0]);
  const copyY = useTransform(progress, [0, 0.4], [0, -70]);
  const copyBlur = useTransform(progress, [0, 0.32], ["blur(0px)", "blur(10px)"]);
  const stageScale = useTransform(progress, [0, 0.6], [1, 1.25]);
  const stageY = useTransform(progress, [0, 0.6], ["0vh", "-34vh"]);
  const haloOpacity = useTransform(progress, [0, 0.5], [0.9, 0.35]);

  return (
    <section ref={ref} className="w-hero">
      <div className="w-hero-sticky">
        <motion.div className="w-hero-copy" style={{ opacity: copyOpacity, y: copyY, filter: copyBlur }}>
          <motion.p className="w-eyebrow" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}>
            {t("The founder practice studio · Oman", "استوديو تدريب المؤسسين · عُمان")}
          </motion.p>
          <h1 className="w-title">
            <Words text={t("Practise the business", "تدرّب على مشروعك")} delay={0.3} />
            <br />
            <Words text={t("*before* you risk the money.", "*قبل* أن تخاطر بمالك.")} delay={0.55} className="w-title-soft" />
          </h1>
          <motion.p className="w-lede" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.9, ease }}>
            {t("Plan it, fund it with practice capital, forecast the year and make the hard calls. One calm workspace, in Arabic and English.", "خطّط له، وموّله برأس مال تدريبي، وتوقّع سنته، واتخذ القرارات الصعبة. مساحة عمل هادئة واحدة، بالعربية والإنجليزية.")}
          </motion.p>
          <motion.div className="w-ctas" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.9, ease }}>
            <Magnetic><Link href={primary.href} className="btn btn-primary btn-lg">{primary.label}<ArrowRight size={18} className="flip-rtl" /></Link></Magnetic>
            <Link href="/sign-up" className="btn btn-glass btn-lg">{t("Create a free account", "أنشئ حساباً مجانياً")}</Link>
          </motion.div>
        </motion.div>
        <motion.div className="w-hero-stage" style={{ scale: stageScale, y: stageY }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1.4, ease }}>
          <motion.span className="w-halo" style={{ opacity: haloOpacity }} aria-hidden="true" />
          <Origin3D scroll={progress} className="w-origin-3d" />
        </motion.div>
        <motion.p className="w-scroll-cue" style={{ opacity: copyOpacity }} aria-hidden="true"><span />{t("Scroll", "مرّر")}</motion.p>
      </div>
    </section>
  );
}

/** Buttons that lean toward the cursor a few pixels before you reach them. */
function Magnetic({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 260, damping: 18 });
  const y = useSpring(0, { stiffness: 260, damping: 18 });
  return (
    <motion.span
      className="magnetic"
      style={{ x, y }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3);
      }}
      onPointerLeave={() => { x.set(0); y.set(0); }}
    >
      {children}
    </motion.span>
  );
}

/* ---------- Wallet showcase ---------- */

function WalletShowcase() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.5 });
  const lay = useTransform(p, [0.08, 0.42], [62, 0]);
  const rise = useTransform(p, [0.08, 0.42], [120, 0]);
  const spread = useTransform(p, [0.3, 0.55], [0, 1]);
  const backT = useTransform(spread, (s) => `translate3d(${s * -64}px, ${s * -150}px, -60px) rotate(${s * -10}deg)`);
  const midT = useTransform(spread, (s) => `translate3d(${s * 40}px, ${s * -78}px, -30px) rotate(${s * 6}deg)`);

  return (
    <section ref={ref} className="w-wallet" aria-label={t("Practice wallet", "المحفظة التدريبية")}>
      <Reveal className="w-wallet-copy">
        <p className="w-eyebrow">{t("Practice wallet", "المحفظة التدريبية")}</p>
        <h2 className="w-section-title">{accent(t("Money you can *feel*, without the risk.", "مال *تشعر* به، بلا مخاطرة."))}</h2>
        <p className="w-wallet-text">{t("Start with practice capital. Protect a reserve. Record every purchase to the baisa and undo a mistake with one tap. The cards move like the real thing.", "ابدأ برأس مال تدريبي. احمِ احتياطياً. سجّل كل عملية شراء بالبيسة وتراجع عن أي خطأ بلمسة واحدة. تتحرك البطاقات كأنها حقيقية.")}</p>
        <dl className="w-facts">
          <div><dt>{t("Exact to", "دقيق حتى")}</dt><dd>0.001 <span className="rial-inline" aria-label={t("Omani rial", "ريال عُماني")} /></dd></div>
          <div><dt>{t("Undo", "تراجع")}</dt><dd>{t("Every action", "كل إجراء")}</dd></div>
          <div><dt>{t("Export", "تصدير")}</dt><dd>CSV</dd></div>
        </dl>
      </Reveal>
      <motion.div className="w-wallet-stage" style={{ rotateX: lay, y: rise, transformPerspective: 1400 }}>
        <motion.div className="w-wallet-card" style={{ transform: backT }}>
          <Tilt className="wcard wcard-pass">
            <div className="wcard-top"><span className="wcard-brand">{t("Founder pass", "بطاقة المؤسس")}</span><Origin className="wcard-mark" /></div>
            <div className="wcard-mid"><span className="wcard-label">{t("Level 2", "المستوى 2")}</span><span className="wcard-amount wcard-rank">{t("Operator", "مشغّل")}</span></div>
            <div className="wcard-foot wcard-foot-pass"><span className="wcard-progress"><span style={{ inlineSize: "62%" }} /></span><span className="num">540 XP</span></div>
          </Tilt>
        </motion.div>
        <motion.div className="w-wallet-card" style={{ transform: midT }}>
          <Tilt className="wcard wcard-reserve">
            <div className="wcard-top"><span className="wcard-brand">{t("Reserve", "الاحتياطي")}</span><Origin className="wcard-mark" /></div>
            <div className="wcard-mid"><span className="wcard-label">{t("Protected for uncertainty", "محمي لمواجهة المجهول")}</span><Money value={1_500_000} className="wcard-amount" /></div>
            <div className="wcard-foot"><span>{t("Covers 2.0 months of fixed costs", "يغطي شهرين من التكاليف الثابتة")}</span></div>
          </Tilt>
        </motion.div>
        <div className="w-wallet-card is-front">
          <Tilt className="wcard wcard-capital" max={12}>
            <div className="wcard-top"><span className="wcard-brand">moasis</span><Origin className="wcard-mark" /></div>
            <div className="wcard-mid"><span className="wcard-label">{t("Available to spend", "المتاح للإنفاق")}</span><Money value={7_150_000} className="wcard-amount" animate /></div>
            <div className="wcard-foot"><span className="wcard-holder">{t("Your name here", "اسمك هنا")}</span><span>{t("Simulation", "محاكاة")}</span></div>
            <span className="wcard-chip" aria-hidden="true" />
          </Tilt>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- Scroll story ---------- */

function Story() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setStep(Math.min(3, Math.max(0, Math.floor(v * 4)))));
  const steps = [
    { icon: NotePencil, title: t("Write the plan you'd defend.", "اكتب خطة تستطيع الدفاع عنها."), body: t("Seven chapters, one honest question at a time, with guidance for your sector.", "سبعة فصول، سؤال صادق تلو الآخر، مع إرشاد مخصص لقطاعك.") },
    { icon: Wallet, title: t("Spend practice money like it's real.", "أنفق مال التدريب وكأنه حقيقي."), body: t("A wallet with capital, a protected reserve and every expense recorded to the baisa.", "محفظة برأس مال واحتياطي محمي وكل مصروف مسجّل بالبيسة.") },
    { icon: ChartLineUp, title: t("See the year before you live it.", "شاهد السنة قبل أن تعيشها."), body: t("Move price, cost and demand and watch cash, break-even and runway respond instantly.", "حرّك السعر والتكلفة والطلب وشاهد النقد ونقطة التعادل والمدى تستجيب فوراً.") },
    { icon: Exam, title: t("Make the calls a CEO makes.", "اتخذ قرارات الرئيس التنفيذي."), body: t("Realistic scenarios with trade-offs that cost you, so the lesson sticks.", "سيناريوهات واقعية بمقايضات لها ثمن، كي يبقى الدرس.") },
  ];
  return (
    <section ref={ref} className="w-story" aria-label={t("How Moasis works", "كيف يعمل مؤسس")}>
      <div className="w-story-sticky">
        <div className="w-story-copy">
          <p className="w-eyebrow">{t("One workspace. Four habits.", "مساحة عمل واحدة. أربع عادات.")}</p>
          <ol className="w-steps">
            {steps.map((s, i) => {
              const I = s.icon;
              return (
                <li key={i} className={clsx("w-step", i === step && "is-active", i < step && "is-past")}>
                  <span className="w-step-icon"><I size={20} weight={i === step ? "fill" : "regular"} /></span>
                  <div>
                    <h3>{s.title}</h3>
                    <motion.p initial={false} animate={{ height: i === step ? "auto" : 0, opacity: i === step ? 1 : 0 }} transition={{ duration: 0.45, ease }}>{s.body}</motion.p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
        <div className="w-story-stage panel" aria-hidden="true">
          {[<PlanVisual key="p" />, <WalletVisual key="w" />, <ForecastVisual key="f" active={step === 2} />, <DecisionVisual key="d" />].map((v, i) => (
            <motion.div key={i} className="w-stage-layer" initial={false}
              animate={{ opacity: i === step ? 1 : 0, scale: i === step ? 1 : 0.94, y: i === step ? 0 : i < step ? -24 : 24, filter: i === step ? "blur(0px)" : "blur(8px)" }}
              transition={{ duration: 0.6, ease }}>
              {v}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlanVisual() {
  const { t } = useI18n();
  const rows = [t("Idea & purpose", "الفكرة والهدف"), t("Customer & demand", "العميل والطلب"), t("Market & positioning", "السوق والتميّز"), t("Financial model", "النموذج المالي")];
  return (
    <div className="v-plan">
      <div className="v-plan-head"><ProgressRing value={0.58} size={84} stroke={7} /><div><strong className="v-big">58%</strong><span className="muted">{t("17 of 29 answers", "17 من 29 إجابة")}</span></div></div>
      {rows.map((r, i) => (
        <div key={r} className="v-row"><span className={clsx("v-check", i < 2 && "is-done")}>{i < 2 && <Check size={12} weight="bold" />}</span><span>{r}</span><span className="v-bar"><span style={{ inlineSize: `${[100, 100, 60, 20][i]}%` }} /></span></div>
      ))}
    </div>
  );
}

function WalletVisual() {
  const { t } = useI18n();
  const items = [
    { title: t("Espresso machine deposit", "عربون آلة الإسبريسو"), amount: -850_000 },
    { title: t("Weekend pop-up sales", "مبيعات ركن نهاية الأسبوع"), amount: 312_500 },
    { title: t("Cup & lid samples", "عينات الأكواب والأغطية"), amount: -46_250 },
  ];
  return (
    <div className="v-wallet">
      <div className="wcard wcard-capital v-mini-card"><div className="wcard-top"><span className="wcard-brand">moasis</span><Origin className="wcard-mark" /></div><div className="wcard-mid"><span className="wcard-label">{t("Available to spend", "المتاح للإنفاق")}</span><Money value={6_916_250} className="wcard-amount" /></div></div>
      <ul className="v-list">{items.map((it) => <li key={it.title}><span>{it.title}</span><Money value={it.amount} signed tone /></li>)}</ul>
    </div>
  );
}

function ForecastVisual({ active }: { active: boolean }) {
  const { t } = useI18n();
  const d = "M10 30 C 40 32, 60 120, 90 128 S 150 120, 190 100 S 260 60, 330 22";
  return (
    <div className="v-forecast">
      <div className="v-kpis"><div><span className="muted">{t("Break-even", "التعادل")}</span><strong>{t("Month 3", "الشهر 3")}</strong></div><div><span className="muted">{t("Lowest cash", "أدنى نقد")}</span><Money value={1_050_000} /></div></div>
      <svg viewBox="0 0 340 150" className="v-chart">
        <line x1="0" y1="140" x2="340" y2="140" className="v-axis" />
        <motion.path d={d} className="v-line" fill="none" initial={false} animate={{ pathLength: active ? 1 : 0 }} transition={{ duration: 1.4, ease }} />
        <motion.circle cx="330" cy="22" r="5" className="v-dot" initial={false} animate={{ scale: active ? 1 : 0 }} transition={{ delay: active ? 1.2 : 0, type: "spring", stiffness: 400, damping: 15 }} />
      </svg>
      <div className="v-verdict"><Check size={14} weight="bold" />{t("Cash stays positive all year.", "يبقى النقد موجباً طوال السنة.")}</div>
    </div>
  );
}

function DecisionVisual() {
  const { t } = useI18n();
  return (
    <div className="v-decision">
      <p className="v-q">{t("Demand is stretching the team.", "الطلب يضغط على الفريق.")}</p>
      {[t("Run a short staffing trial", "جرّب دعماً مؤقتاً للطاقم"), t("Improve the process first", "حسّن العملية أولاً"), t("Limit new orders", "حدّ الطلبات الجديدة")].map((o, i) => (
        <div key={o} className={clsx("v-option", i === 1 && "is-selected")}><span className="v-radio" />{o}</div>
      ))}
      <p className="v-consequence">{t("Lower cost now, but customers wait longer while you fix the bottleneck.", "تكلفة أقل الآن، لكن العملاء ينتظرون أطول حتى تعالج الاختناق.")}</p>
    </div>
  );
}

/* ---------- Bilingual band ---------- */

function Bilingual() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x1 = useTransform(scrollYProgress, [0, 1], ["-12%", "6%"]);
  const x2 = useTransform(scrollYProgress, [0, 1], ["10%", "-8%"]);
  return (
    <section ref={ref} className="w-bilingual">
      <motion.p className="w-giant" style={{ x: x1 }} lang="en" dir="ltr">moasis · moasis · moasis</motion.p>
      <motion.p className="w-giant w-giant-ar" style={{ x: x2 }} lang="ar" dir="rtl">مؤسس · مؤسس · مؤسس</motion.p>
      <Reveal className="w-bilingual-copy">
        <Translate size={28} />
        <h2>{t("Designed in Arabic and English, not translated into one.", "صُمّم بالعربية والإنجليزية، لا مترجماً إلى إحداهما.")}</h2>
        <p>{t("Right-to-left layouts, Arabic typography and the Omani rial sign are built in from the first pixel.", "تخطيطات من اليمين إلى اليسار وطباعة عربية ورمز الريال العُماني مدمجة منذ البكسل الأول.")}</p>
      </Reveal>
    </section>
  );
}

/* ---------- Principles ---------- */

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 32, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-12% 0px" }} transition={{ duration: 0.9, ease, delay }}>
      {children}
    </motion.div>
  );
}

function Principles() {
  const { t } = useI18n();
  const items = [
    { icon: Wallet, title: t("Practice money, real habits", "مال تدريبي، عادات حقيقية"), body: t("Every rial is simulated. The discipline of recording, reserving and reviewing is not.", "كل ريال هنا افتراضي. أما انضباط التسجيل والادخار والمراجعة فحقيقي.") },
    { icon: LockSimple, title: t("Your work stays yours", "عملك يبقى لك"), body: t("Practise as a guest on this device, or sign in to keep it everywhere. Download a full copy any time.", "تدرّب كضيف على هذا الجهاز، أو سجّل الدخول لتحتفظ به في كل مكان. نزّل نسخة كاملة في أي وقت.") },
    { icon: ChartLineUp, title: t("Numbers you can trust", "أرقام يمكنك الوثوق بها"), body: t("Money is stored to the exact baisa and every forecast assumption stays visible and editable.", "تُحفظ الأموال بدقة البيسة، وتبقى كل افتراضات التوقعات ظاهرة وقابلة للتعديل.") },
  ];
  return (
    <section className="w-principles">
      <Reveal><h2 className="w-section-title">{t("Calm by design.", "هادئ بالتصميم.")}</h2></Reveal>
      <div className="w-principle-grid">
        {items.map((it, i) => {
          const I = it.icon;
          return (
            <Reveal key={it.title} delay={i * 0.08}>
              <Tilt className="w-principle panel" max={6}>
              <span className="w-principle-icon"><I size={22} /></span>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              </Tilt>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function Closing({ primary }: { primary: { href: string; label: string } }) {
  const { t } = useI18n();
  return (
    <section className="w-closing">
      <Reveal className="w-closing-inner">
        <Origin className="w-closing-mark" />
        <h2>{t("Your first business deserves a rehearsal.", "مشروعك الأول يستحق تدريباً.")}</h2>
        <Link href={primary.href} className="btn btn-primary btn-lg">{primary.label}<ArrowRight size={18} className="flip-rtl" /></Link>
      </Reveal>
    </section>
  );
}
