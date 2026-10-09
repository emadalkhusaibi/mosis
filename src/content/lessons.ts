import { w, type Words } from "./words";
export type Lesson = {
  id: string;
  path: number;
  title: Words;
  minutes: number;
  body: Words[];
  example: Words;
  exercise: Words;
  question: Words;
  options: Words[];
  answer: number;
  explanation: Words;
};
export const paths = [
  w("Financial foundations", "الأسس المالية"),
  w("Customer & market", "العميل والسوق"),
  w("People & leadership", "الأفراد والقيادة"),
];
export const lessons: Lesson[] = [
  {
    id: "cash",
    path: 0,
    title: w("Cash is not profit", "النقد ليس الربح"),
    minutes: 8,
    body: [
      w(
        "Profit measures revenue minus expenses over a period. Cash measures what you can pay with today. A profitable sale on credit can leave you unable to pay next week’s rent.",
        "يقيس الربح الإيرادات ناقص النفقات خلال فترة. أما النقد فهو ما يمكنك الدفع به اليوم. قد تبيع بربح على الائتمان وتبقى عاجزاً عن دفع إيجار الأسبوع المقبل.",
      ),
      w(
        "Map when money enters and leaves. Customer deposits improve timing, while stock purchases and supplier deposits consume cash before sales. Keep the timing assumptions visible in your plan.",
        "حدّد مواعيد دخول المال وخروجه. تحسّن دفعات العملاء المقدمة توقيت النقد، بينما يستهلك المخزون وتأمين الموردين النقد قبل البيع. أظهر افتراضات التوقيت في خطتك.",
      ),
      w(
        "Review a rolling cash forecast weekly. A reserve is part of your balance set aside for uncertainty; moving money into reserve does not create a new expense.",
        "راجع توقعاً نقدياً متجدداً أسبوعياً. الاحتياطي جزء من رصيدك تخصصه لعدم اليقين؛ نقله إلى الاحتياطي لا ينشئ مصروفاً جديداً.",
      ),
    ],
    example: w(
      "You invoice 1,000, spend 600 and receive payment next month. The sale may produce 400 of profit, but it reduces current cash by 600 until you collect.",
      "تصدر فاتورة بقيمة ١٬٠٠٠ وتنفق ٦٠٠ وتحصّل الشهر المقبل. قد تحقق العملية ربحاً قدره ٤٠٠ لكنها تقلّل النقد الحالي بمقدار ٦٠٠ حتى التحصيل.",
    ),
    exercise: w(
      "Describe when your first customer pays, when your supplier is paid, and the cash gap between them.",
      "صِف موعد دفع عميلك الأول وموعد الدفع للمورّد والفجوة النقدية بينهما.",
    ),
    question: w(
      "A customer pays next month. What protects this month’s bills?",
      "سيدفع العميل الشهر المقبل. ما الذي يحمي قدرتك على دفع فواتير هذا الشهر؟",
    ),
    options: [
      w("The invoice total", "إجمالي الفاتورة"),
      w("Available cash and payment timing", "النقد المتاح وتوقيت الدفع"),
      w("The profit margin alone", "هامش الربح وحده"),
    ],
    answer: 1,
    explanation: w(
      "Bills need cash when due. Profit does not guarantee timely collection.",
      "تحتاج الفواتير إلى النقد عند استحقاقها. الربح لا يضمن التحصيل في الموعد.",
    ),
  },
  {
    id: "margin",
    path: 0,
    title: w("Price, margin & contribution", "السعر والهامش والمساهمة"),
    minutes: 9,
    body: [
      w(
        "Contribution per sale is selling price minus variable cost. It is the amount left to cover fixed costs and then profit. Include packaging, payment fees and delivery costs that change with each sale.",
        "المساهمة لكل عملية بيع هي السعر ناقص التكلفة المتغيرة. وهي ما يتبقى لتغطية التكاليف الثابتة ثم الربح. ضمّن التغليف ورسوم الدفع والتوصيل التي تتغير مع البيع.",
      ),
      w(
        "Margin and markup are different. Margin divides profit by price; markup divides profit by cost. A discount reduces contribution faster than it reduces revenue.",
        "يختلف الهامش عن الزيادة على التكلفة. يُحسب الهامش بقسمة الربح على السعر، والزيادة بقسمته على التكلفة. يقلّل الخصم المساهمة بوتيرة أسرع من الإيراد.",
      ),
      w(
        "A useful price must fit customer value, competitive alternatives and sustainable delivery. Validate willingness to pay with a real offer, then track the full unit cost.",
        "يجب أن يناسب السعر قيمة العرض للعميل والبدائل والتقديم المستدام. اختبر الاستعداد للدفع بعرض حقيقي ثم تتبّع تكلفة الوحدة كاملة.",
      ),
    ],
    example: w(
      "A sale priced at 5 with variable cost 3 contributes 2. A 20% discount cuts price to 4 and contribution to 1: half the original contribution.",
      "بيع بسعر ٥ وتكلفة متغيرة ٣ يساهم بـ٢. خصم ٢٠٪ يخفض السعر إلى ٤ والمساهمة إلى ١، أي نصف المساهمة الأصلية.",
    ),
    exercise: w(
      "List five costs attached to one sale in your business and identify which change with volume.",
      "اذكر خمس تكاليف مرتبطة بعملية بيع في مشروعك وحدّد ما يتغير منها مع الحجم.",
    ),
    question: w(
      "Price is 8 and variable cost is 5. What is contribution?",
      "السعر ٨ والتكلفة المتغيرة ٥. كم تبلغ المساهمة؟",
    ),
    options: [w("3", "٣"), w("5", "٥"), w("8", "٨")],
    answer: 0,
    explanation: w(
      "8 minus 5 leaves 3 to cover fixed costs and profit.",
      "٨ ناقص ٥ يترك ٣ لتغطية التكاليف الثابتة والربح.",
    ),
  },
  {
    id: "breakeven",
    path: 0,
    title: w("Find your break-even point", "حدّد نقطة التعادل"),
    minutes: 8,
    body: [
      w(
        "Break-even sales equal fixed monthly costs divided by contribution per sale. Round up to a whole sale. This is a volume threshold, not proof that customers will buy.",
        "مبيعات التعادل تساوي التكاليف الشهرية الثابتة مقسومة على المساهمة لكل عملية بيع. قرّب إلى عملية كاملة أعلى. هذا حد للحجم وليس دليلاً على وجود المشترين.",
      ),
      w(
        "Compare break-even with demand and operating capacity. A plan needing 2,000 orders cannot work with capacity for 900 unless price, cost, capacity or the model changes.",
        "قارن التعادل بالطلب والطاقة التشغيلية. لا تنجح خطة تحتاج ٢٬٠٠٠ طلب بطاقة ٩٠٠ إلا بتغيير السعر أو التكلفة أو الطاقة أو النموذج.",
      ),
      w(
        "If contribution is zero or negative, additional sales will not cover fixed costs. Fix the unit economics before focusing on growth.",
        "إذا كانت المساهمة صفراً أو سالبة، فلن تغطي المبيعات الإضافية التكاليف الثابتة. أصلح اقتصاديات الوحدة قبل التركيز على النمو.",
      ),
    ],
    example: w(
      "Fixed costs of 900 and contribution of 3 require 300 sales each month to break even, before costs excluded from the model.",
      "تكاليف ثابتة قدرها ٩٠٠ ومساهمة قدرها ٣ تتطلب ٣٠٠ عملية بيع شهرياً للتعادل، قبل أي تكاليف مستثناة من النموذج.",
    ),
    exercise: w(
      "Calculate your break-even volume and compare it with one month of realistic capacity.",
      "احسب حجم التعادل وقارنه بالطاقة الواقعية لشهر واحد.",
    ),
    question: w(
      "What if break-even exceeds your maximum capacity?",
      "ماذا لو تجاوز التعادل طاقتك القصوى؟",
    ),
    options: [
      w("Ignore capacity", "تجاهل الطاقة"),
      w("Assume faster growth", "افترض نمواً أسرع"),
      w("Revisit price, cost or capacity", "راجع السعر أو التكلفة أو الطاقة"),
    ],
    answer: 2,
    explanation: w(
      "The operating constraint must change or the economics must improve.",
      "يجب تغيير القيد التشغيلي أو تحسين الاقتصاديات.",
    ),
  },
  {
    id: "forecast",
    path: 0,
    title: w("Forecast under uncertainty", "التوقع في ظل عدم اليقين"),
    minutes: 10,
    body: [
      w(
        "A forecast is a set of assumptions expressed as numbers. Separate known commitments, researched estimates and untested guesses. Date your sources so you know what needs refreshing.",
        "التوقع مجموعة افتراضات تُعبّر عنها الأرقام. افصل الالتزامات المعروفة والتقديرات المدروسة والتخمينات غير المختبرة. أرّخ المصادر لتعرف ما يحتاج للتحديث.",
      ),
      w(
        "Change one important driver at a time. Lower sales, higher input costs or slower collection may reveal a risk that the base case hides. Do not treat a growth curve as market evidence.",
        "غيّر عاملاً مهماً واحداً في كل مرة. قد يكشف انخفاض المبيعات أو ارتفاع المدخلات أو بطء التحصيل خطراً يخفيه السيناريو الأساسي. لا تعتبر منحنى النمو دليلاً سوقياً.",
      ),
      w(
        "Set decision thresholds before launching: maximum loss, minimum conversions and the date to review. A smaller pilot buys information while limiting exposure.",
        "حدّد عتبات القرار قبل الإطلاق: أقصى خسارة وأدنى تحويلات وتاريخ المراجعة. تشتري التجربة الأصغر معلومات مع تقليل التعرض للخسارة.",
      ),
    ],
    example: w(
      "If sales are 30% lower, fixed costs do not automatically fall by 30%. Model the effect on cash, then decide which costs you can actually reduce.",
      "إذا انخفضت المبيعات ٣٠٪، فلا تنخفض التكاليف الثابتة تلقائياً بالنسبة نفسها. احسب الأثر على النقد ثم حدّد التكاليف القابلة للتخفيض فعلياً.",
    ),
    exercise: w(
      "Write a conservative assumption and the decision you would make if it happens.",
      "اكتب افتراضاً متحفظاً والقرار الذي ستتخذه إذا تحقق.",
    ),
    question: w(
      "What makes a forecast more useful?",
      "ما الذي يجعل التوقع أكثر فائدة؟",
    ),
    options: [
      w("More optimistic growth", "نمو أكثر تفاؤلاً"),
      w(
        "Visible assumptions and sensitivity tests",
        "افتراضات واضحة واختبارات حساسية",
      ),
      w("More decimal places", "منازل عشرية أكثر"),
    ],
    answer: 1,
    explanation: w(
      "A decision improves when you can see and challenge what drives the result.",
      "يتحسن القرار عندما تستطيع رؤية ما يقود النتيجة واختباره.",
    ),
  },
  {
    id: "interviews",
    path: 1,
    title: w("Listen before you build", "استمع قبل أن تبني"),
    minutes: 9,
    body: [
      w(
        "Ask about recent behaviour instead of hypothetical enthusiasm. “Tell me about the last time you had this problem” produces stronger evidence than “Would you use my app?”.",
        "اسأل عن سلوك حديث بدلاً من حماس افتراضي. سؤال «أخبرني عن آخر مرة واجهت فيها المشكلة» أقوى من «هل ستستخدم تطبيقي؟».",
      ),
      w(
        "Interview a specific customer group. Record their current workaround, time or money spent, buying authority and the trigger for seeking a solution. Avoid pitching while you are trying to learn.",
        "قابل شريحة محددة. سجّل البديل الحالي والوقت أو المال المنفق وصلاحية الشراء وما يدفعهم للبحث عن حل. تجنّب البيع أثناء محاولة التعلّم.",
      ),
      w(
        "Look for repeated patterns and contradictory evidence. Five interviews are a starting point, not a representative market study. Get consent before recording and keep personal information out of shared notes.",
        "ابحث عن الأنماط المتكررة والأدلة المخالفة. خمس مقابلات بداية وليست دراسة ممثلة للسوق. استأذن قبل التسجيل وأبعد البيانات الشخصية عن الملاحظات المشتركة.",
      ),
    ],
    example: w(
      "A customer saying “nice idea” is weaker than showing receipts for an expensive workaround they use every week.",
      "قول العميل «فكرة جميلة» أضعف من إظهاره إيصالات لبديل مكلف يستخدمه أسبوعياً.",
    ),
    exercise: w(
      "Write three neutral interview questions about a recent real problem.",
      "اكتب ثلاثة أسئلة محايدة عن مشكلة حقيقية حديثة.",
    ),
    question: w(
      "Which question produces stronger evidence?",
      "أي سؤال ينتج دليلاً أقوى؟",
    ),
    options: [
      w("Would you love this?", "هل ستحب هذا؟"),
      w(
        "Tell me how you solved it last time.",
        "أخبرني كيف حللت المشكلة آخر مرة.",
      ),
      w("Is my idea amazing?", "هل فكرتي رائعة؟"),
    ],
    answer: 1,
    explanation: w(
      "Past behaviour exposes actual needs, constraints and alternatives.",
      "يكشف السلوك السابق الاحتياجات والقيود والبدائل الفعلية.",
    ),
  },
  {
    id: "position",
    path: 1,
    title: w("A reason to choose you", "سبب لاختيارك"),
    minutes: 7,
    body: [
      w(
        "Customers compare your offer with everything else they could do, including doing nothing. A useful competitor map includes price, convenience, reliability and the job the customer needs done.",
        "يقارن العملاء عرضك بكل البدائل، حتى عدم فعل شيء. تشمل خريطة المنافسين المفيدة السعر والسهولة والموثوقية والمهمة التي يريد العميل إنجازها.",
      ),
      w(
        "Choose a first segment you can serve especially well. A broad promise for everyone makes pricing, marketing and product decisions harder. Focus can expand after you learn.",
        "اختر شريحة أولى تستطيع خدمتها جيداً. الوعد العام للجميع يصعّب التسعير والتسويق وقرارات المنتج. يمكن توسيع التركيز بعد التعلّم.",
      ),
      w(
        "State your difference in a way a customer can observe. Faster booking, predictable delivery or specialist expertise is more testable than “best quality”.",
        "عبّر عن تميّز يمكن للعميل ملاحظته. الحجز الأسرع أو التسليم الموثوق أو الخبرة المتخصصة أكثر قابلية للاختبار من «أفضل جودة».",
      ),
    ],
    example: w(
      "A café serving commuters in four minutes makes a clearer promise than “great coffee for everyone”.",
      "مقهى يخدم المتنقلين خلال أربع دقائق يقدم وعداً أوضح من «قهوة رائعة للجميع».",
    ),
    exercise: w(
      "Write: For [customer], we deliver [benefit], unlike [alternative], because [proof].",
      "اكتب: لِـ[العميل] نقدّم [الفائدة]، بخلاف [البديل]، لأن [الدليل].",
    ),
    question: w("What is a strong differentiator?", "ما التميّز القوي؟"),
    options: [
      w(
        "An observable benefit that matters to the customer",
        "فائدة قابلة للملاحظة تهم العميل",
      ),
      w("A longer slogan", "شعار أطول"),
      w("The lowest price at any cost", "أقل سعر مهما كانت التكلفة"),
    ],
    answer: 0,
    explanation: w(
      "Difference matters when the customer values it and can verify it.",
      "يهم التميّز عندما يقدّره العميل ويمكنه التحقق منه.",
    ),
  },
  {
    id: "experiment",
    path: 1,
    title: w("Design a useful pilot", "صمّم تجربة مفيدة"),
    minutes: 9,
    body: [
      w(
        "Start with the assumption that could most change your decision. Choose a test that creates observable behaviour: a booking, a paid pilot, a repeat visit or a completed task.",
        "ابدأ بالافتراض الأكثر تأثيراً على قرارك. اختر اختباراً يولّد سلوكاً يمكن ملاحظته: حجز أو تجربة مدفوعة أو زيارة متكررة أو مهمة مكتملة.",
      ),
      w(
        "Set a budget, duration, audience and success threshold before starting. If you change the threshold after seeing results, record why. A failed test can save a much larger investment.",
        "حدّد الميزانية والمدة والجمهور وعتبة النجاح قبل البدء. إذا غيّرت العتبة بعد النتائج فسجّل السبب. قد يوفر الاختبار الفاشل استثماراً أكبر بكثير.",
      ),
      w(
        "Keep the test ethical and transparent. Do not collect payment for an unavailable service without clear fulfilment and refund terms. Record what the test does not prove.",
        "اجعل الاختبار واضحاً وأخلاقياً. لا تجمع مدفوعات لخدمة غير متاحة دون شروط تنفيذ واسترداد واضحة. سجّل ما لا تثبته التجربة.",
      ),
    ],
    example: w(
      "A weekend menu pilot can measure orders and repeat intent, but cannot establish year-round demand or full restaurant profitability.",
      "تجربة قائمة في عطلة أسبوعية تقيس الطلب ونية العودة، لكنها لا تثبت الطلب السنوي أو ربحية مطعم كامل.",
    ),
    exercise: w(
      "Define one hypothesis, one metric, one threshold and a review date.",
      "حدّد فرضية ومقياساً وعتبة نجاح وتاريخ مراجعة.",
    ),
    question: w(
      "When should you define the success threshold?",
      "متى تحدّد عتبة النجاح؟",
    ),
    options: [
      w("Only after seeing the results", "بعد رؤية النتائج فقط"),
      w("Never", "أبداً"),
      w("Before running the experiment", "قبل تنفيذ التجربة"),
    ],
    answer: 2,
    explanation: w(
      "Predefined thresholds reduce the temptation to reinterpret every result as success.",
      "تقلّل العتبات المسبقة الميل لتفسير كل نتيجة كنجاح.",
    ),
  },
  {
    id: "channels",
    path: 1,
    title: w("Find customers sustainably", "اكتسب العملاء باستدامة"),
    minutes: 8,
    body: [
      w(
        "A channel is a repeatable route to customers: referrals, local partnerships, search or paid media. Track the journey from exposure to enquiry, purchase and repeat purchase.",
        "القناة طريق قابل للتكرار للوصول للعملاء: الإحالات أو الشراكات المحلية أو البحث أو الإعلان. تتبّع الرحلة من الظهور إلى الاستفسار والشراء والتكرار.",
      ),
      w(
        "Customer acquisition cost divides channel spending by new customers acquired. Include creative work and sales effort where relevant. Clicks and likes are not the same as profitable customers.",
        "تكلفة اكتساب العميل هي إنفاق القناة مقسوماً على العملاء الجدد. ضمّن العمل الإبداعي وجهد البيع عند الحاجة. النقرات والإعجابات ليست عملاء مربحين.",
      ),
      w(
        "Compare acquisition cost with the contribution you can reasonably expect to collect. Do not assume years of loyalty from one small campaign. Track retention separately.",
        "قارن تكلفة الاكتساب بالمساهمة المتوقع تحصيلها واقعياً. لا تفترض سنوات من الولاء من حملة صغيرة واحدة. تتبّع الاحتفاظ بالعملاء منفصلاً.",
      ),
    ],
    example: w(
      "Spending 120 to acquire 12 customers costs 10 each. If each contributes 4 and never returns, the campaign loses money before overhead.",
      "إنفاق ١٢٠ لاكتساب ١٢ عميلاً يكلف ١٠ لكل عميل. إذا ساهم كل منهم بـ٤ ولم يعد، تخسر الحملة قبل النفقات العامة.",
    ),
    exercise: w(
      "Choose one channel and explain how you will connect spending to actual new customers.",
      "اختر قناة واشرح كيف ستربط الإنفاق بالعملاء الجدد الفعليين.",
    ),
    question: w(
      "Which measure is closest to acquisition efficiency?",
      "أي مقياس أقرب لكفاءة اكتساب العملاء؟",
    ),
    options: [
      w("Follower count", "عدد المتابعين"),
      w("Cost per acquired customer", "تكلفة العميل المكتسب"),
      w("Number of posts", "عدد المنشورات"),
    ],
    answer: 1,
    explanation: w(
      "Acquisition cost connects spending to customers, though margin and retention still matter.",
      "تربط تكلفة الاكتساب الإنفاق بالعملاء، مع بقاء الهامش والاحتفاظ مهمّين.",
    ),
  },
  {
    id: "hiring",
    path: 2,
    title: w("Hire for a real constraint", "وظّف لحل قيد حقيقي"),
    minutes: 9,
    body: [
      w(
        "Define the work and the outcome before the job title. Identify which constraint a hire removes, the skills needed, the hours required and how you will know they succeeded.",
        "حدّد العمل والنتيجة قبل المسمى الوظيفي. ما القيد الذي يزيله التوظيف؟ وما المهارات والساعات المطلوبة وكيف تعرف نجاح الموظف؟",
      ),
      w(
        "Budget for more than salary: onboarding, equipment, supervision and applicable employer obligations. Check current local requirements with qualified sources before entering a real employment arrangement.",
        "خصّص أكثر من الراتب: التهيئة والمعدات والإشراف والتزامات صاحب العمل المعمول بها. تحقّق من المتطلبات المحلية الحالية قبل علاقة توظيف فعلية.",
      ),
      w(
        "Compare hiring with training, process changes and reduced scope. Give candidates a fair, relevant assessment and make responsibilities and feedback routines clear.",
        "قارن التوظيف بالتدريب وتحسين العمليات وتقليص النطاق. قيّم المرشحين بإنصاف وبما يخص العمل ووضّح المسؤوليات وآلية الملاحظات.",
      ),
    ],
    example: w(
      "If service slows because orders are entered twice, fixing the process may help more than adding another person to the same broken workflow.",
      "إذا بطؤت الخدمة لإدخال الطلبات مرتين، فقد يفيد إصلاح العملية أكثر من إضافة شخص إلى المسار نفسه.",
    ),
    exercise: w(
      "Write a role outcome, three responsibilities and a 30-day success measure.",
      "اكتب نتيجة الدور وثلاث مسؤوليات ومقياس نجاح بعد ٣٠ يوماً.",
    ),
    question: w(
      "What should come before deciding to hire?",
      "ما الذي يجب أن يسبق قرار التوظيف؟",
    ),
    options: [
      w("A clear constraint and role outcome", "قيد واضح ونتيجة للدور"),
      w("A fashionable title", "مسمى رائج"),
      w("Copying a competitor’s team", "نسخ فريق المنافس"),
    ],
    answer: 0,
    explanation: w(
      "A hire should solve a defined need with an affordable, measurable outcome.",
      "يجب أن يحل التوظيف احتياجاً محدداً بنتيجة قابلة للقياس والتحمل المالي.",
    ),
  },
  {
    id: "feedback",
    path: 2,
    title: w("Feedback that improves work", "ملاحظات تحسّن العمل"),
    minutes: 7,
    body: [
      w(
        "Describe an observed behaviour and its impact. Ask for the other person’s perspective before assuming intent. Keep the conversation specific and private when appropriate.",
        "صِف سلوكاً لاحظته وأثره. اطلب وجهة نظر الشخص قبل افتراض نيّته. اجعل الحديث محدداً وخاصاً عندما يلزم.",
      ),
      w(
        "Agree on a next action, support and a review date. Document commitments respectfully. A one-time mistake, unclear process and repeated performance issue call for different responses.",
        "اتفق على إجراء تالٍ ودعم وموعد مراجعة. وثّق الالتزامات باحترام. يختلف التعامل مع خطأ عابر وعملية غير واضحة ومشكلة أداء متكررة.",
      ),
      w(
        "Before ending a real working relationship, use appropriate advice and follow applicable obligations. This training teaches judgement, not jurisdiction-specific employment procedures.",
        "قبل إنهاء علاقة عمل فعلية، اطلب المشورة المناسبة والتزم بالواجبات المعمول بها. يعلّم هذا التدريب التقدير ولا يحدد إجراءات توظيف خاصة بدولة.",
      ),
    ],
    example: w(
      "“Three orders were late yesterday; customers waited 20 minutes. What got in the way?” opens a more useful discussion than “You are unreliable”.",
      "«تأخرت ثلاثة طلبات أمس وانتظر العملاء ٢٠ دقيقة. ما العائق؟» يفتح نقاشاً أنفع من «أنت غير موثوق».",
    ),
    exercise: w(
      "Write feedback using observation, impact, question and agreed next step.",
      "اكتب ملاحظة تشمل الملاحظة والأثر والسؤال والخطوة المتفق عليها.",
    ),
    question: w(
      "What makes feedback actionable?",
      "ما الذي يجعل الملاحظات قابلة للتطبيق؟",
    ),
    options: [
      w("A public accusation", "اتهام علني"),
      w("A vague personality judgement", "حكم عام على الشخصية"),
      w(
        "A specific observation and agreed next step",
        "ملاحظة محددة وخطوة تالية متفق عليها",
      ),
    ],
    answer: 2,
    explanation: w(
      "Specific behaviour and clear next actions give people something they can change.",
      "يمنح السلوك المحدد والإجراءات الواضحة الشخص أمراً يستطيع تغييره.",
    ),
  },
  {
    id: "partners",
    path: 2,
    title: w("Partnerships with clarity", "شراكات بوضوح"),
    minutes: 10,
    body: [
      w(
        "Discuss contributions, responsibilities, ownership, decision rights and time commitments before operating together. Friendship and trust do not remove the need for clarity.",
        "ناقش المساهمات والمسؤوليات والملكية وصلاحيات القرار والوقت قبل العمل معاً. لا تلغي الصداقة والثقة الحاجة للوضوح.",
      ),
      w(
        "Explore difficult scenarios early: more capital is needed, one person wants to leave, work is uneven, or the founders disagree. Use qualified advice to document real arrangements.",
        "ناقش السيناريوهات الصعبة مبكراً: الحاجة لرأس مال إضافي أو رغبة شخص في المغادرة أو تفاوت العمل أو اختلاف المؤسسين. استخدم مشورة مختصة لتوثيق الاتفاقات الفعلية.",
      ),
      w(
        "A trial collaboration with limited scope can reveal working compatibility. Keep promises explicit and avoid presenting an informal discussion as a completed investment commitment.",
        "قد يكشف تعاون تجريبي محدود النطاق ملاءمة العمل المشترك. اجعل الوعود صريحة ولا تعرض نقاشاً غير رسمي كالتزام استثماري مكتمل.",
      ),
    ],
    example: w(
      "Two founders contribute different amounts of money and time. A simple equal split does not answer who decides, who is paid or what happens if someone stops working.",
      "يساهم مؤسسان بمبالغ وأوقات مختلفة. لا تجيب القسمة المتساوية وحدها عمن يقرر أو يُدفع له أو ماذا يحدث إذا توقف أحدهما عن العمل.",
    ),
    exercise: w(
      "List five partnership questions you need to resolve before committing.",
      "اذكر خمسة أسئلة عن الشراكة تحتاج لحسمها قبل الالتزام.",
    ),
    question: w(
      "When should founders discuss exit and decision rights?",
      "متى يناقش المؤسسون الخروج وصلاحيات القرار؟",
    ),
    options: [
      w("Before committing together", "قبل الالتزام معاً"),
      w("Only after a conflict", "بعد النزاع فقط"),
      w("They are never necessary", "ليست ضرورية أبداً"),
    ],
    answer: 0,
    explanation: w(
      "Discussing hard cases early makes expectations clearer before conflict arises.",
      "مناقشة الحالات الصعبة مبكراً توضح التوقعات قبل الخلاف.",
    ),
  },
  {
    id: "decisions",
    path: 2,
    title: w("Lead with a decision record", "قُد بسجل للقرارات"),
    minutes: 8,
    body: [
      w(
        "Record the decision, alternatives, assumptions, expected outcome and review date. A good outcome can follow a weak decision, and a sound decision can face bad luck.",
        "سجّل القرار والبدائل والافتراضات والنتيجة المتوقعة وتاريخ المراجعة. قد تأتي نتيجة جيدة من قرار ضعيف، وقد يواجه قرار سليم حظاً سيئاً.",
      ),
      w(
        "Separate reversible experiments from costly commitments. Match the evidence and review effort to the consequence. Give one person responsibility for following up.",
        "افصل التجارب القابلة للتراجع عن الالتزامات المكلفة. اجعل مستوى الأدلة والمراجعة مناسباً للعواقب، وكلّف شخصاً بمتابعة القرار.",
      ),
      w(
        "Review what changed and update the plan. Leadership is a repeated practice of listening, choosing, communicating and learning; a course certificate does not establish professional competence.",
        "راجع ما تغير وحدّث الخطة. القيادة ممارسة متكررة للاستماع والاختيار والتواصل والتعلّم؛ شهادة الدورة لا تثبت الكفاءة المهنية.",
      ),
    ],
    example: w(
      "A founder tests a smaller launch for four weeks, caps spending and sets a minimum repeat-purchase rate. The review is more informative than simply asking whether the month felt good.",
      "يختبر مؤسس إطلاقاً أصغر لأربعة أسابيع ويحد الإنفاق ويضع حدّاً أدنى لتكرار الشراء. تكون المراجعة أنفع من سؤال ما إذا كان الشهر جيداً شعورياً.",
    ),
    exercise: w(
      "Record one decision, the evidence behind it, a loss limit and a review date.",
      "سجّل قراراً والأدلة التي تسنده وحدّ الخسارة وتاريخ المراجعة.",
    ),
    question: w("What belongs in a decision record?", "ماذا يتضمن سجل القرار؟"),
    options: [
      w("Only the final outcome", "النتيجة النهائية فقط"),
      w(
        "Assumptions, alternatives and a review date",
        "الافتراضات والبدائل وتاريخ المراجعة",
      ),
      w("Only who was right", "من كان محقاً فقط"),
    ],
    answer: 1,
    explanation: w(
      "Recording the reasoning makes later learning and accountability possible.",
      "يتيح تسجيل المنطق التعلّم والمساءلة لاحقاً.",
    ),
  },
];
