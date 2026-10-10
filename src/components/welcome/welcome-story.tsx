"use client";
import Link from "next/link";
import { Tabs } from "radix-ui";
import {
  ArrowCounterClockwise, ArrowRight, CalendarCheck, Calculator, ClipboardText, ChalkboardTeacher, CheckCircle, Eye, GraduationCap, HandCoins,
  LockKey, Plant, Scales, ShieldCheck, Storefront,
} from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { formatRials, type Baisa } from "@/lib/money";
import { projection } from "@/domain/forecast";
import { sectors } from "@/content/sectors";
import { sections } from "@/content/sections";
import { lessons } from "@/content/lessons";
import { scenarios } from "@/content/scenarios";

/* Example figures: the default café profile run through the real forecast engine. Always labelled as an example. */
const CAFE = { price: 2_500, variable: 900, units: 900, fixed: 1_500_000, setup: 6_000_000, growth: 3, capacity: null };
export const RUN = projection(CAFE, 7_000_000);
const LOW = projection(CAFE, 7_000_000, "low");
export const EXAMPLE = { capital: 10_000_000, reserve: 3_000_000, available: 7_000_000, lowest: RUN.lowestCash, lowMonth: RUN.lowestMonth, final: RUN.endingCash };
export const EXAMPLE_CASH = [RUN.initialCash, ...RUN.months.map((m) => m.cash)];

const COUNTS = {
  sectors: sectors.filter((s) => s.id !== "other").length,
  chapters: sections.length,
  questions: sections.reduce((n, s) => n + s.questions.filter((q) => !q.optional).length, 0),
  lessons: lessons.length,
  scenarios: scenarios.length,
};

export function Amount({ v, signed }: { v: Baisa; signed?: boolean }) {
  const { lang, t } = useI18n();
  return (
    <span className="money" dir="ltr">
      <span>{formatRials(v, lang, { signed })}</span>
      <span className="rial" role="img" aria-label={t("Omani rials", "ريال عُماني")} />
    </span>
  );
}

/** Western digits in English, Arabic-Indic in Arabic, for plain counts. */
function useCount() {
  const { lang } = useI18n();
  return (n: number) => n.toLocaleString(lang === "ar" ? "ar-OM" : "en-GB");
}

/* ---------- What's inside, by the numbers ---------- */
export function NumbersStrip() {
  const { t } = useI18n();
  const n = useCount();
  const items = [
    [n(COUNTS.sectors), t("business types, plus your own", "نوع مشروع، إضافة إلى مشروعك الخاص")],
    [n(COUNTS.chapters), t("plan chapters", "فصول في الخطة")],
    [n(COUNTS.questions), t("guided questions", "سؤالاً موجّهاً")],
    [n(COUNTS.lessons), t("short lessons", "درساً قصيراً")],
    [n(COUNTS.scenarios), t("decision scenarios", "مواقف لاتخاذ القرار")],
    [n(2), t("languages, built equally", "لغتان بالقدر نفسه")],
  ];
  return (
    <section className="w-numbers" aria-label={t("What's inside", "ما الذي تجده")}>
      <div className="w-container">
        <dl className="w-numbers-list">
          {items.map(([k, v]) => <div key={v}><dt>{v}</dt><dd>{k}</dd></div>)}
        </dl>
      </div>
    </section>
  );
}

/* ---------- Why Moasis exists ---------- */
export function WhySection() {
  const { t } = useI18n();
  return (
    <section className="w-section" aria-labelledby="w-why-title">
      <div className="w-container w-why">
        <div className="w-why-head">
          <p className="w-eyebrow">{t("Why Moasis exists", "لماذا وُجد مؤسس")}</p>
          <h2 id="w-why-title" className="w-h2">{t("The expensive lessons usually come after the money is spent.", "الدروس المكلفة تأتي عادةً بعد أن يُنفق المال.")}</h2>
          <p className="w-section-lede">{t(
            "Many first businesses start from personal savings. A slow month, a supplier price rise or a price customers won't pay is often discovered only once the lease is signed. Moasis moves those moments earlier, to a place where they cost nothing.",
            "كثير من المشاريع الأولى تبدأ من المدخرات الشخصية. الشهر البطيء، أو ارتفاع سعر المورّد، أو سعر لا يقبله العملاء، كثيراً ما يُكتشف بعد توقيع عقد الإيجار. مؤسس يقدّم هذه اللحظات إلى مكان لا تكلّف فيه شيئاً.",
          )}</p>
        </div>
        <ol className="w-why-flow">
          <li>
            <span className="w-why-k">{t("Before", "قبل")}</span>
            <h3 className="w-h3">{t("An idea and some savings", "فكرة وبعض المدخرات")}</h3>
            <p>{t("A sense that it could work, a rough number in mind, and nobody to rehearse with.", "شعور بأنها قد تنجح، ورقم تقريبي في الذهن، ولا أحد تتدرّب معه.")}</p>
          </li>
          <li>
            <span className="w-why-k">{t("With Moasis", "مع مؤسس")}</span>
            <h3 className="w-h3">{t("Practise with consequences, not losses", "تدرّب بعواقب، لا بخسائر")}</h3>
            <p>{t("Spend practice rials, watch the cash move, and make decisions that change your numbers for real inside the simulation.", "أنفق ريالات تدريبية، وراقب حركة النقد، واتخذ قرارات تغيّر أرقامك فعلاً داخل المحاكاة.")}</p>
          </li>
          <li>
            <span className="w-why-k">{t("After", "بعد")}</span>
            <h3 className="w-h3">{t("A plan you can defend", "خطة يمكنك الدفاع عنها")}</h3>
            <p>{t("A written plan, a twelve-month cash picture, your decision record, and a short list of what to test with real customers.", "خطة مكتوبة، وصورة للنقد على اثني عشر شهراً، وسجل قراراتك، وقائمة قصيرة بما يجب اختباره مع عملاء حقيقيين.")}</p>
          </li>
        </ol>
      </div>
    </section>
  );
}

/* ---------- Who it's for ---------- */
export function AudienceSection() {
  const { t } = useI18n();
  const people = [
    { icon: <Plant size={20} />, title: t("First-time founders", "المؤسسون لأول مرة"), body: t("You have an idea and savings, and want to know what to check before you commit either.", "لديك فكرة ومدخرات، وتريد أن تعرف ما يجب التحقق منه قبل أن تلتزم بأي منهما.") },
    { icon: <Storefront size={20} />, title: t("Side businesses ready to grow", "مشاريع جانبية جاهزة للنمو"), body: t("You already sell a little. Test what a shop, a hire or a bigger order would do to your cash.", "تبيع قليلاً بالفعل. اختبر ما سيفعله محل أو توظيف أو طلبية أكبر بنقدك.") },
    { icon: <GraduationCap size={20} />, title: t("Students and programmes", "الطلاب والبرامج"), body: t("Turn entrepreneurship lessons into practice with real Omani numbers and a plan to hand in.", "حوّل دروس ريادة الأعمال إلى تدريب بأرقام عُمانية حقيقية وخطة جاهزة للتسليم.") },
    { icon: <ChalkboardTeacher size={20} />, title: t("Mentors and consultants", "المرشدون والمستشارون"), body: t("Keep client notes and readiness checks on the consultant desk, next to the founder's own plan.", "احتفظ بملاحظات العملاء وتقييمات الجاهزية في مكتب الاستشارة، بجوار خطة المؤسس نفسها.") },
  ];
  return (
    <section className="w-section w-section-alt" aria-labelledby="w-who-title">
      <div className="w-container">
        <p className="w-eyebrow">{t("Who it's for", "لمن صُمّم")}</p>
        <h2 id="w-who-title" className="w-h2">{t("For anyone about to put real money behind an idea", "لكل من يوشك أن يضع مالاً حقيقياً خلف فكرة")}</h2>
        <ul className="w-who">
          {people.map((p) => (
            <li key={p.title} className="w-who-item">
              <span className="w-step-icon" aria-hidden="true">{p.icon}</span>
              <h3 className="w-h3">{p.title}</h3>
              <p>{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Inside the workspace (tabbed tour) ---------- */
export function TourSection() {
  const { t, dir } = useI18n();
  const be = RUN.breakEvenUnits ?? 0;
  const tabs = [
    {
      id: "today", label: t("Today", "اليوم"),
      title: t("Every visit starts with one next decision", "كل زيارة تبدأ بقرار واحد تالٍ"),
      points: [
        t("The most useful next step, with the reason it was chosen", "الخطوة التالية الأكثر فائدة، مع سبب اختيارها"),
        t("Money at a glance: available, reserve and the lowest cash ahead", "المال بنظرة: المتاح والاحتياطي وأدنى نقد قادم"),
        t("Field tasks with dates, so learning turns into real checks", "مهام ميدانية بتواريخ، ليتحوّل التعلّم إلى تحقق فعلي"),
      ],
      mock: (
        <div className="w-mock">
          <p className="w-mock-k">{t("Next decision", "قرارك التالي")}</p>
          <p className="w-mock-title">{t("Write the Idea & purpose chapter.", "اكتب فصل الفكرة والهدف.")}</p>
          <p className="w-mock-sub">{t("Answer 2 of 4 questions to start. Your plan has no customer evidence yet.", "أجب عن سؤالين من أربعة للبدء. خطتك لا تستند إلى دليل من العملاء بعد.")}</p>
          <div className="w-mock-rows">
            <div><span>{t("Available to spend", "المتاح للإنفاق")}</span><strong><Amount v={EXAMPLE.available} /></strong></div>
            <div><span>{t("Protected reserve", "الاحتياطي المحمي")}</span><strong><Amount v={EXAMPLE.reserve} /></strong></div>
            <div><span>{t(`Lowest forecast cash, month ${EXAMPLE.lowMonth}`, `أدنى نقد متوقع، الشهر ${EXAMPLE.lowMonth}`)}</span><strong><Amount v={EXAMPLE.lowest} /></strong></div>
          </div>
        </div>
      ),
    },
    {
      id: "wallet", label: t("Wallet", "المحفظة"),
      title: t("A practice wallet that behaves like real money", "محفظة تدريبية تتصرف كالمال الحقيقي"),
      points: [
        t("Exact to the baisa, in Omani rials, with nothing rounded away", "دقيقة حتى البيسة، بالريال العُماني، دون تقريب يضيّع شيئاً"),
        t("A protected reserve you can't spend by accident", "احتياطي محمي لا يمكنك إنفاقه بالخطأ"),
        t("Undo leaves a visible reversal, so the history stays honest", "التراجع يترك حركة عكسية ظاهرة، فيبقى السجل صادقاً"),
      ],
      mock: (
        <div className="w-mock">
          <p className="w-mock-k">{t("Activity", "الحركات")}</p>
          <ul className="w-mock-ledger">
            <li><span><b>{t("Espresso machine deposit", "عربون آلة الإسبريسو")}</b><small>{t("Equipment", "معدات")}</small></span><strong className="is-out"><Amount v={-450_000} signed /></strong></li>
            <li><span><b>{t("Pilot weekend sales", "مبيعات عطلة التجربة")}</b><small>{t("Income", "دخل")}</small></span><strong className="is-in"><Amount v={126_500} signed /></strong></li>
            <li><span><b>{t("Cups and lids, first order", "أكواب وأغطية، أول طلبية")}</b><small>{t("Inventory · Reversed", "مخزون · معكوسة")}</small></span><strong><Amount v={-82_750} signed /></strong></li>
          </ul>
        </div>
      ),
    },
    {
      id: "forecast", label: t("Forecast", "التوقعات"),
      title: t("Twelve months of cash, under assumptions you can see", "اثنا عشر شهراً من النقد، وفق افتراضات تراها"),
      points: [
        t("Price, cost per unit, monthly sales, growth and capacity, each labelled as a sector default or your estimate", "السعر وتكلفة الوحدة والمبيعات الشهرية والنمو والطاقة، وكل منها موسوم كافتراض قطاع أو تقديرك"),
        t("A slower-sales scenario next to your base case", "سيناريو مبيعات أبطأ بجانب حالتك الأساسية"),
        t("Break-even, lowest cash and first profitable month, worked out for you", "نقطة التعادل وأدنى نقد وأول شهر مربح، محسوبة لك"),
      ],
      mock: (
        <div className="w-mock">
          <p className="w-mock-k">{t("Example café · base case", "مقهى مثال · الحالة الأساسية")}</p>
          <TourChart />
          <div className="w-mock-rows">
            <div><span>{t("Margin per cup", "الهامش لكل كوب")}</span><strong><Amount v={RUN.unitMargin} /></strong></div>
            <div><span>{t("Break-even", "نقطة التعادل")}</span><strong>{t(`${be.toLocaleString("en-GB")} cups a month`, `${be.toLocaleString("ar-OM")} كوب شهرياً`)}</strong></div>
            <div><span>{t("Month 12, if sales are 30% slower", "الشهر ١٢ إن كانت المبيعات أبطأ ٣٠٪")}</span><strong><Amount v={LOW.endingCash} /></strong></div>
          </div>
        </div>
      ),
    },
    {
      id: "plan", label: t("Plan", "الخطة"),
      title: t("A business plan written one honest answer at a time", "خطة عمل تُكتب بإجابة صادقة في كل مرة"),
      points: [
        t(`${COUNTS.questions} focused questions across ${COUNTS.chapters} chapters, from idea to launch`, `${COUNTS.questions} سؤالاً مركّزاً في ${COUNTS.chapters} فصول، من الفكرة إلى الإطلاق`),
        t("Autosaves as you type and shows what's still unanswered", "يحفظ تلقائياً أثناء الكتابة ويُظهر ما لم تُجب عنه بعد"),
        t("Prints as one clean document to share with a mentor", "يُطبع كوثيقة واحدة نظيفة لمشاركتها مع مرشد"),
      ],
      mock: (
        <div className="w-mock">
          <p className="w-mock-k">{t("Customer & demand · 2 of 4", "العميل والطلب · ٢ من ٤")}</p>
          <p className="w-mock-q">{t("Who will buy first, and how do you know?", "من سيشتري أولاً، وكيف تعرف؟")}</p>
          <p className="w-mock-answer">{t("Staff from the three office towers on Al Khuwair street. I counted about 40 people waiting at the nearest café at 7:30.", "موظفو الأبراج المكتبية الثلاثة في شارع الخوير. عددت نحو ٤٠ شخصاً ينتظرون في أقرب مقهى عند ٧:٣٠.")}</p>
          <p className="w-mock-sub"><CheckCircle size={14} weight="fill" aria-hidden="true" /> {t("Saved on this device", "محفوظ على هذا الجهاز")}</p>
        </div>
      ),
    },
    {
      id: "practice", label: t("Practice", "التدريب"),
      title: t("Rehearse the calls founders actually face", "تدرّب على القرارات التي يواجهها المؤسسون فعلاً"),
      points: [
        t("Situations like a competitor cutting prices or demand outgrowing your team", "مواقف مثل منافس يخفّض أسعاره أو طلب يفوق طاقة فريقك"),
        t("See the trade-off and the cost before you commit", "شاهد المفاضلة والتكلفة قبل أن تعتمد"),
        t("Each decision is recorded once, with your reasoning", "كل قرار يُسجَّل مرة واحدة، مع أسبابك"),
      ],
      mock: (
        <div className="w-mock">
          <p className="w-mock-k">{t("Demand is stretching the team", "الطلب يُرهق الفريق")}</p>
          <ul className="w-mock-options">
            <li className="is-selected"><span>{t("Improve the process first", "حسّن العملية أولاً")}</span><Amount v={-120_000} signed /></li>
            <li><span>{t("Run a short staffing trial", "جرّب توظيفاً قصيراً")}</span><Amount v={-250_000} signed /></li>
            <li><span>{t("Limit new orders for now", "قلّل الطلبات الجديدة مؤقتاً")}</span><span className="muted">{t("No cost", "بلا تكلفة")}</span></li>
          </ul>
          <p className="w-mock-sub">{t("Trade-off: cheaper now, slower relief if demand keeps rising.", "المفاضلة: أرخص الآن، وراحة أبطأ إن استمر الطلب في الارتفاع.")}</p>
        </div>
      ),
    },
  ];
  return (
    <section className="w-section w-section-alt" aria-labelledby="w-tour-title">
      <div className="w-container">
        <p className="w-eyebrow">{t("Inside the workspace", "داخل مساحة العمل")}</p>
        <h2 id="w-tour-title" className="w-h2">{t("Five places, one business", "خمسة أماكن، مشروع واحد")}</h2>
        <p className="w-section-lede">{t("Example figures from a café in Muscat, calculated by the same engine your own numbers use.", "أرقام مثال من مقهى في مسقط، محسوبة بالمحرّك نفسه الذي تستخدمه أرقامك.")}</p>
        <Tabs.Root defaultValue="today" dir={dir} className="w-tour">
          <Tabs.List className="w-tour-tabs" aria-label={t("Workspace areas", "أقسام مساحة العمل")}>
            {tabs.map((tb) => <Tabs.Trigger key={tb.id} value={tb.id} className="w-tour-tab">{tb.label}</Tabs.Trigger>)}
          </Tabs.List>
          {tabs.map((tb) => (
            <Tabs.Content key={tb.id} value={tb.id} className="w-tour-panel">
              <div className="w-tour-copy">
                <h3 className="w-tour-title">{tb.title}</h3>
                <ul className="w-tour-points">
                  {tb.points.map((p) => <li key={p}><CheckCircle size={18} weight="fill" aria-hidden="true" />{p}</li>)}
                </ul>
              </div>
              <div className="w-tour-visual" aria-hidden="true">
                <span className="w-tag w-tour-tag">{t("Example", "مثال")}</span>
                {tb.mock}
              </div>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </div>
    </section>
  );
}

function TourChart() {
  const all = [...EXAMPLE_CASH, LOW.initialCash, ...LOW.months.map((m) => m.cash)];
  const max = Math.max(...all, 0), min = Math.min(...all, 0);
  const y = (v: number) => 4 + ((max - v) / (max - min || 1)) * 52;
  const line = (vals: number[]) => vals.map((v, i) => `${(i / 12) * 100},${y(v)}`).join(" ");
  const lowVals = [LOW.initialCash, ...LOW.months.map((m) => m.cash)];
  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="w-mock-chart">
      <line x1="0" x2="100" y1={y(0)} y2={y(0)} className="w-mock-zero" vectorEffect="non-scaling-stroke" />
      <polyline points={line(lowVals)} className="w-mock-low" vectorEffect="non-scaling-stroke" />
      <polyline points={line(EXAMPLE_CASH)} className="w-mock-base" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* ---------- A suggested first week ---------- */
export function FirstWeekSection() {
  const { t } = useI18n();
  const days = [
    [t("Set up", "الإعداد"), t("Pick your business type, city and practice capital. Moasis suggests a reserve and tells you how many months it covers.", "اختر نوع مشروعك ومدينتك ورأس مالك التدريبي. يقترح مؤسس احتياطياً ويخبرك بعدد الأشهر التي يغطيها.")],
    [t("Describe the idea", "صِف الفكرة"), t("Answer the Idea and Customer chapters in your own words. Short, specific answers beat long ones.", "أجب عن فصلي الفكرة والعميل بكلماتك. الإجابات القصيرة المحددة أفضل من الطويلة.")],
    [t("Spend on paper", "أنفق على الورق"), t("Record the first costs you expect: deposit, equipment, first stock. Watch what's left to spend.", "سجّل أولى التكاليف المتوقعة: العربون والمعدات وأول مخزون. وراقب ما يتبقى للإنفاق.")],
    [t("Stress the forecast", "اختبر التوقعات"), t("Lower the price, slow the growth, cap capacity. Find the month your cash is tightest.", "خفّض السعر، وأبطئ النمو، وحدّد الطاقة. اعرف الشهر الذي يكون فيه نقدك في أضيق حالاته.")],
    [t("Make a hard call", "اتخذ قراراً صعباً"), t("Work through a scenario, choose an option and write down why. The cost lands in your wallet.", "اعمل على موقف، واختر خياراً، واكتب السبب. تُخصم التكلفة من محفظتك.")],
    [t("Learn one idea", "تعلّم فكرة واحدة"), t("Read a short lesson such as Cash is not profit, then try its exercise on your own numbers.", "اقرأ درساً قصيراً مثل «النقد ليس الربح»، ثم جرّب تمرينه على أرقامك.")],
    [t("Take it outside", "اخرج به إلى الواقع"), t("Print your plan and pick one field test, like asking three real customers about your price.", "اطبع خطتك واختر اختباراً ميدانياً واحداً، مثل سؤال ثلاثة عملاء حقيقيين عن سعرك.")],
  ];
  return (
    <section className="w-section" aria-labelledby="w-week-title">
      <div className="w-container w-week">
        <div className="w-week-head">
          <p className="w-eyebrow">{t("A suggested first week", "أسبوع أول مقترح")}</p>
          <h2 id="w-week-title" className="w-h2">{t("Seven small steps from idea to first real test", "سبع خطوات صغيرة من الفكرة إلى أول اختبار حقيقي")}</h2>
          <p className="w-section-lede">{t("Go at your own pace. Each step takes one sitting, and Today always shows where you are.", "تقدّم بالسرعة التي تناسبك. كل خطوة تحتاج جلسة واحدة، وصفحة اليوم تُظهر دائماً أين أنت.")}</p>
        </div>
        <ol className="w-week-list">
          {days.map(([title, body], i) => (
            <li key={title} className="w-week-item">
              <span className="w-week-day">{t(`Day ${i + 1}`, `اليوم ${(i + 1).toLocaleString("ar-OM")}`)}</span>
              <div><h3 className="w-week-title">{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- How Moasis treats your numbers ---------- */
export function PrinciplesSection() {
  const { t } = useI18n();
  const items = [
    { icon: <Calculator size={20} />, title: t("Exact rial maths", "حساب دقيق بالريال"), body: t("Every amount is stored in baisa, so 0.100 plus 0.200 is always exactly 0.300.", "كل مبلغ يُخزَّن بالبيسة، فيكون ٠٫١٠٠ زائد ٠٫٢٠٠ دائماً ٠٫٣٠٠ بالضبط.") },
    { icon: <ShieldCheck size={20} />, title: t("A reserve that stays protected", "احتياطي يبقى محمياً"), body: t("Money you set aside for emergencies is kept out of what you can spend.", "المال الذي تخصصه للطوارئ يبقى خارج ما يمكنك إنفاقه.") },
    { icon: <ArrowCounterClockwise size={20} />, title: t("Undo without erasing", "تراجع دون محو"), body: t("Reversing a mistake adds a linked entry instead of deleting history.", "تصحيح الخطأ يضيف حركة مرتبطة بدلاً من حذف السجل.") },
    { icon: <Scales size={20} />, title: t("Forecasts stay forecasts", "التوقعات تبقى توقعات"), body: t("Projections never move money in your wallet. Only your decisions do.", "التوقعات لا تحرّك المال في محفظتك أبداً. قراراتك وحدها تفعل.") },
    { icon: <Eye size={20} />, title: t("Examples are labelled", "الأمثلة موسومة"), body: t("Sector defaults and sample figures are marked as such, never passed off as local prices.", "افتراضات القطاع والأرقام النموذجية موسومة بذلك، ولا تُقدَّم كأسعار محلية.") },
    { icon: <LockKey size={20} />, title: t("Your work stays yours", "عملك يبقى لك"), body: t("As a guest, everything stays in your browser. Download a full backup any time.", "كضيف، يبقى كل شيء في متصفحك. نزّل نسخة احتياطية كاملة في أي وقت.") },
  ];
  return (
    <section className="w-section w-section-alt" aria-labelledby="w-trust-title">
      <div className="w-container">
        <p className="w-eyebrow">{t("How Moasis treats your numbers", "كيف يتعامل مؤسس مع أرقامك")}</p>
        <h2 id="w-trust-title" className="w-h2">{t("Practice money, handled with real-money care", "مال تدريبي، يُعامل بعناية المال الحقيقي")}</h2>
        <ul className="w-principles">
          {items.map((it) => (
            <li key={it.title}>
              <span className="w-principle-icon" aria-hidden="true">{it.icon}</span>
              <div><h3 className="w-principle-title">{it.title}</h3><p>{it.body}</p></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- Questions ---------- */
export function FaqSection() {
  const { t } = useI18n();
  const qa = [
    [t("Is any of this real money?", "هل أي من هذا مال حقيقي؟"), t("No. Every balance is practice money. Nothing connects to a bank, and nothing you do here moves real funds.", "لا. كل الأرصدة مال تدريبي. لا شيء متصل بمصرف، ولا شيء تفعله هنا يحرّك أموالاً حقيقية.")],
    [t("Do I need an account?", "هل أحتاج إلى حساب؟"), t("No. You can start as a guest and your work is saved in this browser. Create a free account later and your guest work comes with you.", "لا. يمكنك البدء كضيف ويُحفظ عملك في هذا المتصفح. أنشئ حساباً مجانياً لاحقاً وسينتقل عملك معك.")],
    [t("Is this financial advice?", "هل هذه استشارة مالية؟"), t("No. Moasis is an educational simulation. Forecasts show what your own assumptions imply, not what will happen.", "لا. مؤسس محاكاة تعليمية. التوقعات تُظهر ما تعنيه افتراضاتك أنت، لا ما سيحدث.")],
    [t("What if my business type isn't listed?", "ماذا لو لم يكن نوع مشروعي مدرجاً؟"), t(`Choose "Other" and describe it. There are ${COUNTS.sectors} ready-made types with starting assumptions you can change.`, `اختر «أخرى» وصِفه. هناك ${COUNTS.sectors} نوعاً جاهزاً بافتراضات أولية يمكنك تغييرها.`)],
    [t("Are the sector numbers accurate for Oman?", "هل أرقام القطاعات دقيقة لعُمان؟"), t("They are general starting points, not quotes. Replace them with prices you've checked yourself, and the forecast labels each one as yours.", "هي نقاط بداية عامة، وليست عروض أسعار. استبدلها بأسعار تحققت منها بنفسك، وستُوسم كل واحدة في التوقعات على أنها تقديرك.")],
    [t("Can I use it in Arabic?", "هل يمكنني استخدامه بالعربية؟"), t("Yes. Arabic and English are equal. Switch any time and your work stays exactly where it was.", "نعم. العربية والإنجليزية متساويتان. بدّل في أي وقت ويبقى عملك كما هو تماماً.")],
  ];
  return (
    <section className="w-section w-section-alt" aria-labelledby="w-faq-title">
      <div className="w-container w-faq">
        <div>
          <p className="w-eyebrow">{t("Questions", "أسئلة")}</p>
          <h2 id="w-faq-title" className="w-h2">{t("Before you start", "قبل أن تبدأ")}</h2>
        </div>
        <div className="w-faq-list">
          {qa.map(([q, a]) => (
            <details key={q} className="w-faq-item">
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- What's next (planned, clearly marked) ---------- */
export function NextSection() {
  const { t } = useI18n();
  const items = [
    { icon: <HandCoins size={20} />, title: t("Field tests", "اختبارات ميدانية"), body: t("Plan small real-world checks, like a price test or a pilot weekend, and record what you learned.", "خطّط لاختبارات واقعية صغيرة، مثل اختبار سعر أو عطلة تجريبية، وسجّل ما تعلّمته.") },
    { icon: <ClipboardText size={20} />, title: t("Evidence", "الأدلة"), body: t("Attach what customers actually said or did to the plan answers it supports.", "اربط ما قاله العملاء أو فعلوه فعلاً بإجابات الخطة التي يدعمها.") },
    { icon: <CalendarCheck size={20} />, title: t("Weekly review and founder brief", "مراجعة أسبوعية وموجز المؤسس"), body: t("A short weekly check-in and a one-page summary to share with a mentor or partner.", "مراجعة أسبوعية قصيرة وملخص من صفحة واحدة لمشاركته مع مرشد أو شريك.") },
  ];
  return (
    <section className="w-section" aria-labelledby="w-next-title">
      <div className="w-container">
        <p className="w-eyebrow">{t("Coming next", "قادم قريباً")}</p>
        <h2 id="w-next-title" className="w-h2">{t("From practice to proof", "من التدريب إلى الإثبات")}</h2>
        <p className="w-section-lede">{t("These are planned and not in the app yet.", "هذه مخطط لها وليست في التطبيق بعد.")}</p>
        <ul className="w-next">
          {items.map((it) => (
            <li key={it.title}>
              <span className="w-step-icon" aria-hidden="true">{it.icon}</span>
              <h3 className="w-h3">{it.title}</h3>
              <p>{it.body}</p>
              <span className="w-next-tag">{t("Planned", "مخطط")}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function CloseLink({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="btn btn-primary btn-lg">{label}<ArrowRight size={18} className="flip-rtl" aria-hidden="true" /></Link>;
}
