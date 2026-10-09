import { w, type Words } from "./words";

export type Question = {
  key: string;
  label: Words;
  hint: Words;
  optional?: boolean;
};
export const sections: {
  id: string;
  name: Words;
  intro: Words;
  questions: Question[];
}[] = [
  {
    id: "idea",
    name: w("Idea & purpose", "الفكرة والهدف"),
    intro: w(
      "Make the business specific enough to test.",
      "اجعل فكرة المشروع واضحة بما يكفي لاختبارها.",
    ),
    questions: [
      {
        key: "problem",
        label: w(
          "What problem will you solve?",
          "ما المشكلة التي ستحلّها؟",
        ),
        hint: w(
          "Describe a situation your customer faces today.",
          "صِف موقفاً يواجهه عميلك اليوم.",
        ),
      },
      {
        key: "offer",
        label: w("What exactly will you sell?", "ماذا ستبيع تحديداً؟"),
        hint: w(
          "Name the product or service, what is included, and the unit of sale.",
          "حدّد المنتج أو الخدمة وما يشمله العرض ووحدة البيع.",
        ),
      },
      {
        key: "why",
        label: w(
          "Why are you the right founder?",
          "لماذا أنت الشخص المناسب لتأسيسه؟",
        ),
        hint: w(
          "Relevant skills, experience, access or motivation.",
          "المهارات أو الخبرة أو العلاقات أو الدافع المرتبط بالمشروع.",
        ),
      },
      {
        key: "goal",
        label: w(
          "What would success in 12 months look like?",
          "كيف يبدو النجاح بعد ١٢ شهراً؟",
        ),
        hint: w(
          "Choose one measurable outcome and a realistic deadline.",
          "اختر نتيجة قابلة للقياس وموعداً واقعياً.",
        ),
      },
    ],
  },
  {
    id: "customer",
    name: w("Customer & demand", "العميل والطلب"),
    intro: w(
      "Separate customer evidence from your assumptions.",
      "افصل أدلة العملاء عن افتراضاتك.",
    ),
    questions: [
      {
        key: "customer",
        label: w("Who is your first customer?", "من هو عميلك الأول؟"),
        hint: w(
          "Be specific about location, needs, habits and ability to pay.",
          "حدّد الموقع والاحتياجات والعادات والقدرة على الدفع.",
        ),
      },
      {
        key: "alternatives",
        label: w(
          "What do they use instead today?",
          "ما البديل الذي يستخدمه اليوم؟",
        ),
        hint: w(
          "Include doing nothing, informal services and direct competitors.",
          "اذكر المنافسين والخدمات غير الرسمية وحتى عدم اتخاذ إجراء.",
        ),
      },
      {
        key: "evidence",
        label: w(
          "What have you actually learned from customers?",
          "ماذا تعلّمت فعلياً من العملاء؟",
        ),
        hint: w(
          "Record interview count, date, observations and buying behaviour. Avoid names or sensitive details.",
          "سجّل عدد المقابلات والتاريخ والملاحظات وسلوك الشراء. تجنّب الأسماء والبيانات الحساسة.",
        ),
      },
      {
        key: "test",
        label: w(
          "How will you test willingness to pay?",
          "كيف ستختبر الاستعداد للدفع؟",
        ),
        hint: w(
          "Define an experiment, budget, pass/fail threshold and date.",
          "حدّد تجربة وميزانية ومعيار نجاح أو فشل وتاريخاً.",
        ),
      },
      {
        key: "source",
        label: w("Evidence links or references", "روابط الأدلة أو المراجع"),
        hint: w(
          "Add public sources, survey summaries or dates of research.",
          "أضف مصادر عامة أو ملخصات استطلاع أو تواريخ البحث.",
        ),
        optional: true,
      },
    ],
  },
  {
    id: "market",
    name: w("Market & positioning", "السوق والتميّز"),
    intro: w(
      "Start with a reachable customer group in Oman.",
      "ابدأ بشريحة عملاء يمكنك الوصول إليها في عُمان.",
    ),
    questions: [
      {
        key: "area",
        label: w(
          "Which area will you serve first?",
          "أي منطقة ستخدم أولاً؟",
        ),
        hint: w(
          "Neighbourhood, city or a specific online audience.",
          "حي أو مدينة أو جمهور محدد عبر الإنترنت.",
        ),
      },
      {
        key: "competitors",
        label: w(
          "Who are three relevant competitors?",
          "من هم ثلاثة منافسين مناسبين للمقارنة؟",
        ),
        hint: w(
          "Compare prices, location, strengths and gaps you observed.",
          "قارن الأسعار والموقع ونقاط القوة والفجوات التي لاحظتها.",
        ),
      },
      {
        key: "difference",
        label: w(
          "Why would customers choose you?",
          "لماذا سيختارك العملاء؟",
        ),
        hint: w(
          "Explain a useful, credible difference beyond lower prices.",
          "وضّح اختلافاً مفيداً وموثوقاً يتجاوز خفض الأسعار.",
        ),
      },
      {
        key: "reach",
        label: w(
          "How many customers can you realistically reach?",
          "كم عميلاً يمكنك الوصول إليه واقعياً؟",
        ),
        hint: w(
          "Show your calculation and where each input came from.",
          "اعرض الحساب ومصدر كل معلومة فيه.",
        ),
      },
      {
        key: "channels",
        label: w(
          "How will you acquire your first ten customers?",
          "كيف ستكسب أول عشرة عملاء؟",
        ),
        hint: w(
          "Choose channels, expected cost and a way to track conversion.",
          "اختر قنوات وتكلفة متوقعة وطريقة لقياس التحويل.",
        ),
      },
    ],
  },
  {
    id: "finance",
    name: w("Financial model", "النموذج المالي"),
    intro: w(
      "Build a forecast from editable assumptions, then test its sensitivity.",
      "ابنِ توقعاً من افتراضات قابلة للتعديل ثم اختبر حساسيته.",
    ),
    questions: [
      {
        key: "financeEvidence",
        label: w(
          "Where did your costs and prices come from?",
          "ما مصادر تكاليفك وأسعارك؟",
        ),
        hint: w(
          "Supplier quotes, observed prices, pilot results and dates. Templates are illustrative.",
          "عروض الموردين والأسعار المرصودة ونتائج التجارب وتواريخها. القوالب توضيحية.",
        ),
      },
      {
        key: "funding",
        label: w("How will you fund the business?", "كيف ستموّل المشروع؟"),
        hint: w(
          "Savings, partners or finance; state commitments and uncertainty.",
          "مدخرات أو شركاء أو تمويل؛ حدّد الالتزامات وما لم يتأكد بعد.",
        ),
      },
      {
        key: "cashCycle",
        label: w(
          "When will customers pay and suppliers be paid?",
          "متى سيدفع العملاء ومتى ستدفع للموردين؟",
        ),
        hint: w(
          "The forecast assumes sales and costs are paid in the same month. Record credit terms separately.",
          "يفترض التوقع تحصيل المبيعات ودفع التكاليف في الشهر نفسه. سجّل شروط الائتمان بشكل منفصل.",
        ),
      },
    ],
  },
  {
    id: "operations",
    name: w("Operations & people", "التشغيل والأفراد"),
    intro: w(
      "Plan how you will deliver consistently, not just launch once.",
      "خطّط لتقديم الخدمة باستمرار وبجودة ثابتة.",
    ),
    questions: [
      {
        key: "delivery",
        label: w(
          "How will an order become a delivered product or service?",
          "كيف يتحول الطلب إلى منتج أو خدمة مسلّمة؟",
        ),
        hint: w(
          "List the steps, lead times and quality checks.",
          "اذكر الخطوات والمدة وفحوص الجودة.",
        ),
      },
      {
        key: "suppliers",
        label: w("Who will supply what you need?", "من سيورّد احتياجاتك؟"),
        hint: w(
          "Lead times, minimum orders and a backup supplier.",
          "مدة التوريد والحد الأدنى للطلب ومورّد بديل.",
        ),
      },
      {
        key: "people",
        label: w(
          "What work will you do and what will you delegate?",
          "ما العمل الذي ستنجزه وما الذي ستفوّضه؟",
        ),
        hint: w(
          "Roles, weekly hours, skills and hiring triggers.",
          "الأدوار والساعات الأسبوعية والمهارات ومتى تحتاج للتوظيف.",
        ),
      },
      {
        key: "location",
        label: w(
          "What location, tools and systems do you need?",
          "ما الموقع والأدوات والأنظمة التي تحتاجها؟",
        ),
        hint: w(
          "Consider access, capacity, records and customer support.",
          "فكّر في سهولة الوصول والسعة والسجلات وخدمة العملاء.",
        ),
      },
      {
        key: "permissions",
        label: w(
          "Which registrations and permissions must you confirm?",
          "ما التسجيلات والتصاريح التي يجب تأكيدها؟",
        ),
        hint: w(
          "Check your exact activity with the Oman Business Platform and relevant authorities. Record the source and date.",
          "تحقق من نشاطك المحدد لدى منصة عُمان للأعمال والجهات المعنية، وسجّل المصدر والتاريخ.",
        ),
      },
    ],
  },
  {
    id: "risk",
    name: w("Risks & partnerships", "المخاطر والشراكات"),
    intro: w(
      "Identify what could change your decision before committing capital.",
      "حدّد ما قد يغيّر قرارك قبل الالتزام برأس المال.",
    ),
    questions: [
      {
        key: "risks",
        label: w(
          "What are the three biggest risks?",
          "ما أكبر ثلاثة مخاطر؟",
        ),
        hint: w(
          "For each, record likelihood, impact, early warning and mitigation.",
          "لكل خطر، حدّد الاحتمال والأثر والإنذار المبكر وخطة التخفيف.",
        ),
      },
      {
        key: "partners",
        label: w(
          "How will partners make decisions?",
          "كيف سيتخذ الشركاء القرارات؟",
        ),
        hint: w(
          "Contributions, ownership discussions, responsibilities and dispute process.",
          "المساهمات ومناقشات الملكية والمسؤوليات وآلية حل الخلافات.",
        ),
      },
      {
        key: "stop",
        label: w(
          "What would make you pause or stop?",
          "ما الذي سيدفعك للتوقف أو التريّث؟",
        ),
        hint: w(
          "A maximum loss, minimum demand or specific unresolvable risk.",
          "حد أقصى للخسارة أو حد أدنى للطلب أو خطر لا يمكن معالجته.",
        ),
      },
      {
        key: "contingency",
        label: w("What is your fallback plan?", "ما خطتك البديلة؟"),
        hint: w(
          "A smaller launch, different offer, reserve or alternative supplier.",
          "إطلاق أصغر أو عرض مختلف أو احتياطي أو مورد بديل.",
        ),
      },
    ],
  },
  {
    id: "launch",
    name: w("Launch & review", "الإطلاق والمراجعة"),
    intro: w(
      "Turn the plan into a small, testable next step.",
      "حوّل الخطة إلى خطوة تالية صغيرة وقابلة للاختبار.",
    ),
    questions: [
      {
        key: "milestones",
        label: w(
          "What are your next three milestones?",
          "ما إنجازاتك الثلاثة التالية؟",
        ),
        hint: w(
          "Give each an owner, date, cost and completion criterion.",
          "حدّد لكل منها مسؤولاً وتاريخاً وتكلفة ومعيار إتمام.",
        ),
      },
      {
        key: "pilot",
        label: w(
          "What is the smallest launch you can learn from?",
          "ما أصغر إطلاق يمكنك التعلّم منه؟",
        ),
        hint: w(
          "Define who joins, what is sold and what you will measure.",
          "حدّد المشاركين وما سيباع وما ستقيسه.",
        ),
      },
      {
        key: "review",
        label: w(
          "What should a consultant challenge in your plan?",
          "ما الذي تريد من المستشار مراجعته في خطتك؟",
        ),
        hint: w(
          "Choose specific uncertainties and the evidence you can share.",
          "اختر نقاطاً محددة غير مؤكدة والأدلة التي يمكنك مشاركتها.",
        ),
      },
      {
        key: "decision",
        label: w(
          "What is your current decision and why?",
          "ما قرارك الحالي ولماذا؟",
        ),
        hint: w(
          "Proceed with a pilot, revise the idea, research further or pause.",
          "ابدأ تجربة أو عدّل الفكرة أو ابحث أكثر أو تريّث.",
        ),
      },
    ],
  },
];
