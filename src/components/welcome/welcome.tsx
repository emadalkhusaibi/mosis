"use client";
import { accountsEnabled } from "@/lib/features";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowRight, ChartLineUp, Notebook, Strategy, Wallet } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { BrandSculpture } from "@/components/three/origin-3d";
import { Wordmark } from "@/components/ui/origin";
import { formatRials } from "@/lib/money";
import { Amount, AudienceSection, EXAMPLE, EXAMPLE_CASH, FaqSection, FirstWeekSection, NextSection, NumbersStrip, PrinciplesSection, TourSection, WhySection } from "./welcome-story";

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
      <a href="#welcome-main" className="skip-link">{t("Skip to content", "انتقل إلى المحتوى")}</a>
      <header className="w-nav">
        <div className="w-container w-nav-inner">
          <Link href="/welcome" aria-label="Moasis"><Wordmark /></Link>
          <nav className="w-nav-actions" aria-label={t("Site", "الموقع")}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <Link href="/partners" className="btn btn-ghost btn-sm w-nav-partners">{t("For companies", "للشركات")}</Link>
            {accountsEnabled && <Link href="/sign-in" className="btn btn-ghost btn-sm w-nav-signin">{t("Sign in", "تسجيل الدخول")}</Link>}
            <Link href={primary.href} className="btn btn-primary btn-sm">{started ? t("Open", "افتح") : t("Start", "ابدأ")}</Link>
          </nav>
        </div>
      </header>

      <main id="welcome-main">
        <section className="w-hero" aria-labelledby="w-hero-title">
          <div className="w-container w-hero-grid">
            <div className="w-hero-copy">
              <p className="w-eyebrow">{t("A founder practice studio for Oman", "استوديو تدريب للمؤسسين في عُمان")}</p>
              <h1 id="w-hero-title" className="w-title">
                {lang === "ar" ? "تدرّب على المشروع قبل أن تخاطر بالمال." : <>Practise the business <span className="editorial-emphasis">before</span> you risk the money.</>}
              </h1>
              <p className="w-lede">{t("Test an idea, rehearse the numbers, and decide what to do next. Everything uses practice money, in English or Arabic.", "اختبر فكرة، وتدرّب على الأرقام، وقرّر خطوتك التالية. كل شيء بمال تدريبي، بالعربية أو الإنجليزية.")}</p>
              <div className="w-cta">
                <Link href={primary.href} className="btn btn-primary btn-lg">
                  {primary.label}<ArrowRight size={18} className="flip-rtl" aria-hidden="true" />
                </Link>
                {!started && <p className="small muted">{t("No account needed. Your work is saved on this device.", "لا تحتاج إلى حساب. يُحفظ عملك على هذا الجهاز.")}{accountsEnabled && <> <Link href="/sign-up" className="link">{t("Create an account", "أنشئ حساباً")}</Link></>}</p>}
              </div>
            </div>

            <div className="w-hero-visual" aria-label={t("Example workspace preview", "معاينة مثال لمساحة العمل")} role="img">
              <ExampleCard />
              <ExampleForecast />
              <BrandSculpture className="w-sculpture" size={176} />
            </div>
          </div>
        </section>

        <NumbersStrip />
        <WhySection />
        <AudienceSection />

        <section className="w-section" aria-labelledby="w-loop-title">
          <div className="w-container">
            <p className="w-eyebrow">{t("How it works", "كيف يعمل")}</p>
            <h2 id="w-loop-title" className="w-h2">{t("One loop, from idea to decision", "حلقة واحدة، من الفكرة إلى القرار")}</h2>
            <p className="w-section-lede">{t("Each part feeds the next, so a change to your plan or numbers shows up where you decide.", "كل جزء يغذّي التالي، فيظهر أي تغيير في خطتك أو أرقامك حيث تتخذ قرارك.")}</p>
            <ol className="w-steps">
              <Step n={1} icon={<Notebook size={20} />} title={t("Plan", "خطّط")} body={t("Answer focused questions across seven chapters. Gaps stay visible.", "أجب عن أسئلة مركّزة في سبعة فصول. تبقى الفجوات ظاهرة.")}>
                <div className="w-extract">
                  <p className="w-extract-q">{t("What problem will you solve?", "ما المشكلة التي ستحلها؟")}</p>
                  <p className="w-extract-a">{t("Office workers nearby need a reliable coffee pickup before 8am.", "يحتاج موظفو المكاتب القريبة إلى قهوة جاهزة يُعتمد عليها قبل الثامنة صباحاً.")}</p>
                  <p className="w-extract-meta">{t("Saved on this device", "محفوظ على هذا الجهاز")}</p>
                </div>
              </Step>
              <Step n={2} icon={<Wallet size={20} />} title={t("Practise money", "تدرّب على المال")} body={t("Spend from a practice wallet. A protected reserve stays separate from what you can spend.", "أنفق من محفظة تدريبية. يبقى الاحتياطي المحمي منفصلاً عمّا يمكنك إنفاقه.")}>
                <dl className="w-extract w-extract-dl">
                  <div><dt>{t("Available", "المتاح")}</dt><dd><Amount v={EXAMPLE.available} /></dd></div>
                  <div><dt>{t("Protected reserve", "الاحتياطي المحمي")}</dt><dd><Amount v={EXAMPLE.reserve} /></dd></div>
                </dl>
              </Step>
              <Step n={3} icon={<ChartLineUp size={20} />} title={t("Forecast", "توقّع")} body={t("See twelve months under named assumptions. Forecasts never touch your wallet.", "شاهد اثني عشر شهراً وفق افتراضات مسمّاة. التوقعات لا تمسّ محفظتك أبداً.")}>
                <div className="w-extract">
                  <p className="w-extract-meta">{t("Lowest cash", "أدنى نقد")}</p>
                  <p className="w-extract-num"><Amount v={EXAMPLE.lowest} /> <span className="muted small">{t(`in month ${EXAMPLE.lowMonth}`, `في الشهر ${EXAMPLE.lowMonth}`)}</span></p>
                </div>
              </Step>
              <Step n={4} icon={<Strategy size={20} />} title={t("Decide", "قرّر")} body={t("Rehearse real trade-offs, then commit one decision with its cost and your reasoning.", "تدرّب على مقايضات واقعية، ثم اعتمد قراراً واحداً بتكلفته وأسبابك.")}>
                <div className="w-extract">
                  <p className="w-extract-q">{t("A competitor cuts prices", "منافس يخفّض أسعاره")}</p>
                  <p className="w-extract-a">{t("Hold price, add a loyalty card", "حافظ على السعر وأضف بطاقة ولاء")}</p>
                </div>
              </Step>
            </ol>
          </div>
        </section>

        <TourSection />
        <FirstWeekSection />
        <PrinciplesSection />

        <section className="w-section" aria-labelledby="w-lang-title">
          <div className="w-container w-bilingual">
            <div>
              <h2 id="w-lang-title" className="w-h2">{t("Designed in both languages", "مصمّم باللغتين")}</h2>
              <p className="w-section-lede">{t("Arabic is laid out right to left with its own type, not a mirrored copy. Switch at any time; your work stays put.", "العربية تُعرض من اليمين إلى اليسار بخطها الخاص، لا كنسخة معكوسة. بدّل في أي وقت؛ يبقى عملك كما هو.")}</p>
            </div>
            <div className="w-bi-pair">
              <BiCard lang="en" />
              <BiCard lang="ar" />
            </div>
          </div>
        </section>

        <FaqSection />
        <NextSection />

        <section className="w-section w-section-alt" aria-labelledby="w-close-title">
          <div className="w-container w-close">
            <h2 id="w-close-title" className="w-h2">{t("Find what to test before you spend.", "اعرف ما يجب اختباره قبل أن تنفق.")}</h2>
            <Link href={primary.href} className="btn btn-primary btn-lg">
              {primary.label}<ArrowRight size={18} className="flip-rtl" aria-hidden="true" />
            </Link>
            <p className="w-fineprint">
              {t(
                "Moasis is an educational simulation. Balances are practice money, forecasts are model outputs under your assumptions, and sector defaults are general examples, not local quotes. As a guest, your work is stored only in this browser.",
                "مؤسس محاكاة تعليمية. الأرصدة مال تدريبي، والتوقعات نتائج نموذج وفق افتراضاتك، وافتراضات القطاع أمثلة عامة وليست أسعاراً محلية. كضيف، يُحفظ عملك في هذا المتصفح فقط.",
              )}
            </p>
          </div>
        </section>
      </main>

      <footer className="w-footer">
        <div className="w-container w-footer-inner">
          <Wordmark />
          <p className="small muted">{t("Practice simulation. Not a bank, lender or financial adviser.", "محاكاة تدريبية. ليست مصرفاً أو جهة تمويل أو مستشاراً مالياً.")}{accountsEnabled && <> <Link href="/sign-in" className="link">{t("Sign in", "تسجيل الدخول")}</Link></>}</p>
        </div>
      </footer>
    </div>
  );
}

function Step({ n, icon, title, body, children }: { n: number; icon: React.ReactNode; title: string; body: string; children: React.ReactNode }) {
  return (
    <li className="w-step">
      <div className="w-step-head">
        <span className="w-step-icon" aria-hidden="true">{icon}</span>
        <span className="w-step-n">{n}</span>
      </div>
      <h3 className="w-h3">{title}</h3>
      <p className="w-step-body">{body}</p>
      <div className="w-step-extract" aria-hidden="true">{children}</div>
    </li>
  );
}

function ExampleCard() {
  const { t } = useI18n();
  return (
    <div className="w-card" aria-hidden="true">
      <div className="w-card-top">
        <span className="w-card-label">{t("Practice capital", "رأس المال التدريبي")}</span>
        <span className="w-tag">{t("Example", "مثال")}</span>
      </div>
      <p className="w-card-balance"><Amount v={EXAMPLE.capital} /></p>
      <div className="w-card-split">
        <span><span className="w-card-k">{t("Available", "المتاح")}</span><Amount v={EXAMPLE.available} /></span>
        <span><span className="w-card-k">{t("Reserve", "الاحتياطي")}</span><Amount v={EXAMPLE.reserve} /></span>
      </div>
    </div>
  );
}

function ExampleForecast() {
  const { t } = useI18n();
  const max = Math.max(...EXAMPLE_CASH);
  const pts = EXAMPLE_CASH.map((v, i) => `${(i / 12) * 100},${36 - (v / max) * 32}`).join(" ");
  return (
    <div className="w-forecast" aria-hidden="true">
      <div className="w-card-top">
        <span className="w-forecast-title">{t("Cash, 12 months", "النقد، ١٢ شهراً")}</span>
        <span className="w-tag">{t("Simulation", "محاكاة")}</span>
      </div>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-spark" aria-hidden="true">
        <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      </svg>
      <div className="w-forecast-row">
        <span><span className="w-card-k">{t("Lowest", "الأدنى")}</span><Amount v={EXAMPLE.lowest} /></span>
        <span><span className="w-card-k">{t("Month 12", "الشهر ١٢")}</span><Amount v={EXAMPLE.final} /></span>
      </div>
    </div>
  );
}

function BiCard({ lang }: { lang: "en" | "ar" }) {
  const L = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return (
    <div className="w-bi" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} aria-hidden="true">
      <p className="w-bi-k">{L("Next decision", "قرارك التالي")}</p>
      <p className="w-bi-title">{L("Your price has no customer evidence yet.", "سعرك لا يستند إلى دليل من العملاء بعد.")}</p>
      <p className="w-bi-body">{L("Test it with three people who match your customer.", "اختبره مع ثلاثة أشخاص يشبهون عميلك.")}</p>
      <p className="w-bi-meta"><bdi>مقهى Moasis 2026</bdi> · <span dir="ltr">{formatRials(2_500, lang)}</span></p>
    </div>
  );
}
