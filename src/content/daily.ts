import { w, type Words } from "./words";

/**
 * Five-minute daily decisions. Each is a small, common situation from running a
 * business in Oman, with two or three reasonable choices and what each one costs.
 * They move no practice money: the point is the habit of weighing trade-offs.
 */
export type DailyDecision = { id: string; prompt: Words; options: { label: Words; weigh: Words }[] };

export const dailyDecisions: DailyDecision[] = [
  {
    id: "supplier-rise",
    prompt: w("Your main supplier raises prices by 8% from next month.", "مورّدك الرئيسي يرفع أسعاره ٨٪ من الشهر القادم."),
    options: [
      { label: w("Raise your own price", "ارفع سعرك"), weigh: w("Protects margin, but regulars notice. Small, explained rises usually land better than big sudden ones.", "يحمي الهامش، لكن الزبائن الدائمين يلاحظون. الزيادات الصغيرة المبرَّرة تُقبل عادة أكثر من الكبيرة المفاجئة.") },
      { label: w("Get two other quotes first", "اطلب عرضين آخرين أولاً"), weigh: w("Costs a few days, and tells you whether 8% is the market or just this supplier.", "يكلّف أياماً قليلة، ويخبرك إن كانت ٨٪ هي السوق أم هذا المورّد فقط.") },
      { label: w("Absorb it for now", "تحمّلها مؤقتاً"), weigh: w("Keeps customers happy, but check your break-even: a thin margin gets thinner every month you wait.", "يُرضي الزبائن، لكن راجع نقطة التعادل: الهامش الضيق يضيق أكثر كل شهر تنتظره.") },
    ],
  },
  {
    id: "late-payer",
    prompt: w("A good client is 45 days late paying a 600-rial invoice.", "عميل جيد متأخر ٤٥ يوماً في دفع فاتورة بقيمة ٦٠٠ ريال."),
    options: [
      { label: w("Call them today", "اتصل به اليوم"), weigh: w("A polite call usually works better than a third email, and keeps the relationship.", "المكالمة المهذبة تنجح عادة أكثر من رسالة ثالثة، وتحفظ العلاقة.") },
      { label: w("Pause new work until paid", "أوقف العمل الجديد حتى الدفع"), weigh: w("Protects your cash, but say it clearly and kindly or you may lose the client.", "يحمي نقدك، لكن قلها بوضوح ولطف وإلا قد تخسر العميل.") },
      { label: w("Wait another month", "انتظر شهراً آخر"), weigh: w("Only if your forecast shows you can carry 600 rials. Late payments are how profitable businesses run out of cash.", "فقط إن أظهرت توقعاتك أنك تتحمل ٦٠٠ ريال. التأخر في الدفع هو كيف تنفد سيولة مشاريع رابحة.") },
    ],
  },
  {
    id: "ramadan-hours",
    prompt: w("Say Ramadan is three weeks away. What happens to your opening hours?", "لنفترض أن رمضان بعد ثلاثة أسابيع. ماذا يحدث لساعات العمل؟"),
    options: [
      { label: w("Shift to evenings", "انتقل إلى المساء"), weigh: w("Follows where demand moves, but staff need new shifts and rest before Iftar.", "يتبع انتقال الطلب، لكن الموظفين يحتاجون مناوبات جديدة وراحة قبل الإفطار.") },
      { label: w("Keep normal hours", "أبقِ الساعات المعتادة"), weigh: w("Simple, but daytime costs keep running while daytime sales drop for many sectors.", "بسيط، لكن تكاليف النهار تستمر بينما تنخفض مبيعات النهار في قطاعات كثيرة.") },
      { label: w("Add a Ramadan offer", "أضف عرضاً رمضانياً"), weigh: w("Can lift sales, if the offer still covers its own costs. Price it before you print it.", "قد يرفع المبيعات إن غطّى العرض تكاليفه. سعّره قبل أن تطبعه.") },
    ],
  },
  {
    id: "discount-ask",
    prompt: w("A customer asks for 20% off a large order.", "زبون يطلب خصم ٢٠٪ على طلب كبير."),
    options: [
      { label: w("Agree", "وافق"), weigh: w("Check the unit margin first. If it's 30%, a 20% discount cuts your profit on this order by two-thirds.", "راجع هامش الوحدة أولاً. إن كان ٣٠٪، فخصم ٢٠٪ يقتطع ثلثي ربحك من هذا الطلب.") },
      { label: w("Offer 10% for paying upfront", "اعرض ١٠٪ مقابل الدفع مقدماً"), weigh: w("You give less and get cash sooner. Trading discount for terms is often the better deal.", "تعطي أقل وتحصل على النقد أسرع. مقايضة الخصم بشروط الدفع غالباً أفضل.") },
      { label: w("Add something instead", "أضف شيئاً بدل الخصم"), weigh: w("An extra item costs you its variable cost, not its price.", "الإضافة تكلّفك تكلفتها المتغيرة، لا سعرها.") },
    ],
  },
  {
    id: "staff-sick",
    prompt: w("Your only trained staff member calls in sick on your busiest day.", "موظفك المدرَّب الوحيد يعتذر مريضاً في أكثر أيامك ازدحاماً."),
    options: [
      { label: w("Cover it yourself", "غطِّ مكانه بنفسك"), weigh: w("Works today. If it keeps happening, the real problem is that one person holds all the know-how.", "ينجح اليوم. إن تكرر، فالمشكلة الحقيقية أن شخصاً واحداً يملك كل المعرفة.") },
      { label: w("Open with a shorter menu", "افتح بقائمة مختصرة"), weigh: w("Less revenue, but quality stays up and the queue stays short.", "إيراد أقل، لكن الجودة تبقى والطابور قصير.") },
      { label: w("Start cross-training someone", "ابدأ تدريب شخص آخر"), weigh: w("Doesn't help today, but it's the decision that stops this happening again.", "لا يفيد اليوم، لكنه القرار الذي يمنع تكرار ذلك.") },
    ],
  },
  {
    id: "instagram-ad",
    prompt: w("An agency offers a 150-rial Instagram campaign for your launch.", "وكالة تعرض حملة إنستغرام بـ١٥٠ ريالاً لإطلاقك."),
    options: [
      { label: w("Buy it", "اشترِها"), weigh: w("Ask how they'll measure it. Without a code or a tracked link you won't know if it worked.", "اسأل كيف سيقيسونها. دون رمز خصم أو رابط متتبَّع لن تعرف إن نجحت.") },
      { label: w("Spend 30 rials on a test first", "أنفق ٣٠ ريالاً كتجربة أولاً"), weigh: w("Smaller and measurable. If it brings customers, scale it up.", "أصغر وقابل للقياس. إن جلب زبائن، وسّعه.") },
      { label: w("Ask early customers to post", "اطلب من أوائل الزبائن النشر"), weigh: w("Costs little and is trusted more, but it's slower and harder to control.", "قليل التكلفة وأكثر ثقة، لكنه أبطأ وأصعب في التحكم.") },
    ],
  },
  {
    id: "rent-renewal",
    prompt: w("The landlord offers a 3-year lease at 5% less rent, or 1 year at today's rent.", "المالك يعرض عقداً لثلاث سنوات بإيجار أقل ٥٪، أو سنة بإيجار اليوم."),
    options: [
      { label: w("Take 3 years", "خذ ثلاث سنوات"), weigh: w("Cheaper if the location keeps working. Costly if you need to move or close.", "أرخص إن بقي الموقع ناجحاً. مكلف إن احتجت أن تنتقل أو تغلق.") },
      { label: w("Take 1 year", "خذ سنة واحدة"), weigh: w("Pays a little more for the freedom to change. Sensible while demand is still unproven.", "تدفع قليلاً أكثر مقابل حرية التغيير. منطقي ما دام الطلب غير مثبت.") },
    ],
  },
  {
    id: "big-order",
    prompt: w("A company wants an order three times your normal weekly volume, in one week.", "شركة تريد طلباً يعادل ثلاثة أضعاف حجمك الأسبوعي، خلال أسبوع."),
    options: [
      { label: w("Accept it", "اقبله"), weigh: w("Great revenue, if you can buy the materials upfront and still serve regulars.", "إيراد ممتاز، إن استطعت شراء المواد مقدماً وخدمة زبائنك الدائمين.") },
      { label: w("Accept with a deposit", "اقبله مع عربون"), weigh: w("A 30–50% deposit pays for materials and shows the client is serious.", "عربون ٣٠–٥٠٪ يغطي المواد ويُظهر جدية العميل.") },
      { label: w("Offer a two-week timeline", "اعرض مدة أسبوعين"), weigh: w("Less pressure on quality and cash. Many clients accept a clear, honest date.", "ضغط أقل على الجودة والنقد. كثير من العملاء يقبلون موعداً واضحاً وصادقاً.") },
    ],
  },
  {
    id: "summer-dip",
    prompt: w("It's June and sales are 15% below May.", "إنه يونيو والمبيعات أقل ١٥٪ من مايو."),
    options: [
      { label: w("Cut a shift until September", "ألغِ مناوبة حتى سبتمبر"), weigh: w("Saves fixed cost through the slow months. Tell staff early.", "يوفّر تكلفة ثابتة خلال الأشهر البطيئة. أخبر الموظفين مبكراً.") },
      { label: w("Push delivery and online orders", "ركّز على التوصيل والطلبات الإلكترونية"), weigh: w("Follows customers indoors, but delivery fees eat into each order.", "يتبع الزبائن إلى داخل البيوت، لكن رسوم التوصيل تأكل من كل طلب.") },
      { label: w("Hold steady", "اثبت كما أنت"), weigh: w("Fine if your reserve covers it. Check how many months it pays for.", "مقبول إن غطّاه احتياطيك. تحقق من عدد الأشهر التي يغطيها.") },
    ],
  },
  {
    id: "cofounder-hours",
    prompt: w("Your friend wants to join as a partner, working weekends only.", "صديقك يريد الانضمام شريكاً، يعمل في عطلة نهاية الأسبوع فقط."),
    options: [
      { label: w("Equal partnership", "شراكة متساوية"), weigh: w("Simple now, painful later if the work isn't equal. Write down who does what.", "بسيطة الآن، ومؤلمة لاحقاً إن لم يكن العمل متساوياً. اكتب من يفعل ماذا.") },
      { label: w("Shares that grow with time", "حصة تنمو مع الوقت"), weigh: w("Fairer: ownership is earned over a year or two of real work.", "أعدل: تُكتسب الملكية خلال سنة أو سنتين من العمل الفعلي.") },
      { label: w("Paid help, not a partner", "مساعدة مدفوعة لا شراكة"), weigh: w("Keeps ownership clear while you both find out how it works.", "يُبقي الملكية واضحة بينما تكتشفان كيف يسير الأمر.") },
    ],
  },
  {
    id: "complaint-online",
    prompt: w("A customer posts an angry review about a late order.", "زبون ينشر تقييماً غاضباً عن طلب متأخر."),
    options: [
      { label: w("Reply publicly and fix it", "ردّ علناً وأصلح الخطأ"), weigh: w("Others read your reply more than the complaint. Calm and specific wins.", "الآخرون يقرؤون ردك أكثر من الشكوى. الهدوء والوضوح ينتصران.") },
      { label: w("Message them privately", "راسله بشكل خاص"), weigh: w("Good for resolving it, but a short public reply still shows you care.", "جيد لحل المشكلة، لكن رداً علنياً قصيراً يُظهر اهتمامك.") },
    ],
  },
  {
    id: "equipment-buy",
    prompt: w("A better machine costs 1,200 rials and would cut each unit's cost by 80 baisa.", "آلة أفضل تكلّف ١٬٢٠٠ ريال وتخفض تكلفة كل وحدة ٨٠ بيسة."),
    options: [
      { label: w("Buy it now", "اشترِها الآن"), weigh: w("At 1,000 units a month it pays back in 15 months. Can your cash wait that long?", "بـ١٬٠٠٠ وحدة شهرياً تسترد قيمتها في ١٥ شهراً. هل يحتمل نقدك الانتظار؟") },
      { label: w("Lease or pay in instalments", "استأجرها أو ادفع بالأقساط"), weigh: w("Keeps cash in hand. Compare the total paid with the cash price.", "يُبقي النقد في يدك. قارن المجموع المدفوع بالسعر النقدي.") },
      { label: w("Wait until volume is proven", "انتظر حتى يثبت الحجم"), weigh: w("Safest if your sales numbers are still guesses.", "الأكثر أماناً إن كانت أرقام مبيعاتك ما زالت تخمينات.") },
    ],
  },
  {
    id: "family-help",
    prompt: w("Family offer to lend you 3,000 rials, with no paperwork.", "العائلة تعرض إقراضك ٣٬٠٠٠ ريال دون أوراق."),
    options: [
      { label: w("Accept, and write it down anyway", "اقبل واكتبه مع ذلك"), weigh: w("A simple written note of amount and repayment protects the relationship.", "ورقة بسيطة بالمبلغ وطريقة السداد تحمي العلاقة.") },
      { label: w("Decline for now", "اعتذر مؤقتاً"), weigh: w("Keeps family out of the risk until the idea is tested.", "يُبعد العائلة عن المخاطرة حتى تُختبر الفكرة.") },
      { label: w("Take part of it", "خذ جزءاً منه"), weigh: w("Borrow only what the forecast shows you need for the low point.", "اقترض فقط ما تُظهر التوقعات أنك تحتاجه لأدنى نقطة.") },
    ],
  },
  {
    id: "price-test",
    prompt: w("You're not sure whether to price at 2.5 or 3 rials.", "لست متأكداً هل تسعّر بـ٢٫٥ أم ٣ ريالات."),
    options: [
      { label: w("Start at 3", "ابدأ بـ٣"), weigh: w("Easier to discount later than to raise. Watch whether people walk away.", "الخصم لاحقاً أسهل من الرفع. راقب هل ينصرف الناس.") },
      { label: w("Start at 2.5", "ابدأ بـ٢٫٥"), weigh: w("Easier first sale, but check the forecast: at the lower price you need more volume to break even.", "بيع أول أسهل، لكن راجع التوقعات: بالسعر الأقل تحتاج حجماً أكبر للتعادل.") },
      { label: w("Test both for a week", "اختبر الاثنين لأسبوع"), weigh: w("The honest answer. Plan it as a field test in Prove.", "الإجابة الصادقة. خطط لها كاختبار ميداني في أثبِت.") },
    ],
  },
];

/** Days since 1 Jan 2026 in the founder's local time, so the decision changes at local midnight. */
export function dayIndex(d: Date = new Date()) {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 864e5);
}

export function localDay(d: Date = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const dailyFor = (d: Date = new Date()) => dailyDecisions[((dayIndex(d) % dailyDecisions.length) + dailyDecisions.length) % dailyDecisions.length];
