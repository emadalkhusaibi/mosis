import { w, type Words } from "./words";

export type Scenario = {
  id: string;
  title: Words;
  intro: Words;
  options: { title: Words; detail: Words; cost: number; lesson: Words }[];
};
export const scenarios: Scenario[] = [
  {
    id: "capacity",
    title: w("Demand is stretching the team", "الطلب يضغط على الفريق"),
    intro: w(
      "More {customers} are arriving, but delivery is slowing and mistakes are increasing. You need a response that fits your cash and capacity.",
      "يزداد {customers} لكن التنفيذ يتباطأ والأخطاء تتزايد. تحتاج لاستجابة تناسب النقد والطاقة لديك.",
    ),
    options: [
      {
        title: w("Run a short staffing trial", "جرّب دعماً مؤقتاً للطاقم"),
        detail: w(
          "Use a limited trial to measure whether extra capacity improves service.",
          "استخدم تجربة محدودة لقياس أثر زيادة الطاقة على الخدمة.",
        ),
        cost: 0.025,
        lesson: w(
          "Extra capacity has a recurring cost if retained. Define the role and success measure before making a longer commitment.",
          "للقدرة الإضافية تكلفة متكررة إذا استمرت. حدّد الدور ومعيار النجاح قبل التزام أطول.",
        ),
      },
      {
        title: w("Improve the process first", "حسّن العملية أولاً"),
        detail: w(
          "Invest in training and remove a bottleneck before hiring.",
          "استثمر في التدريب وأزل عائقاً قبل التوظيف.",
        ),
        cost: 0.012,
        lesson: w(
          "A better process can help the whole team, but only if the bottleneck is understood. Measure service time and error rate.",
          "قد تحسّن العملية أداء الفريق كله إذا فُهم العائق. قِس وقت الخدمة ومعدل الخطأ.",
        ),
      },
      {
        title: w("Limit new orders temporarily", "حدّ الطلبات الجديدة مؤقتاً"),
        detail: w(
          "Protect service quality while you investigate the constraint.",
          "احمِ الجودة ريثما تبحث في القيد.",
        ),
        cost: 0,
        lesson: w(
          "Limiting demand protects quality but may lose sales. Communicate availability honestly and set a date to review capacity.",
          "يحمي تقييد الطلب الجودة لكنه قد يفقد مبيعات. وضّح التوفر بصدق وحدّد موعداً لمراجعة الطاقة.",
        ),
      },
    ],
  },
  {
    id: "pricing",
    title: w("A competitor lowers prices", "منافس يخفض أسعاره"),
    intro: w(
      "A nearby competitor announces a discount. Some {customers} mention it. You must respond without confusing attention with sustainable demand.",
      "يعلن منافس خصماً ويذكره بعض {customers}. عليك الاستجابة دون الخلط بين الاهتمام والطلب المستدام.",
    ),
    options: [
      {
        title: w("Test a targeted offer", "اختبر عرضاً موجهاً"),
        detail: w(
          "Spend a small amount testing an offer with a defined customer group.",
          "أنفق مبلغاً صغيراً لاختبار عرض لشريحة محددة.",
        ),
        cost: 0.01,
        lesson: w(
          "A targeted experiment limits exposure. Compare contribution and repeat purchase, not just the number of orders.",
          "تحدّ التجربة الموجهة من التعرض. قارن المساهمة وتكرار الشراء، وليس عدد الطلبات فقط.",
        ),
      },
      {
        title: w("Explain your distinct value", "وضّح قيمتك المختلفة"),
        detail: w(
          "Keep prices and make the benefits and service promise clearer.",
          "أبقِ الأسعار ووضّح الفوائد ووعد الخدمة.",
        ),
        cost: 0,
        lesson: w(
          "Value must be observable and relevant. Listen to price objections to distinguish affordability from an unclear offer.",
          "يجب أن تكون القيمة ملحوظة وذات صلة. استمع للاعتراضات لتفصل ضعف القدرة الشرائية عن غموض العرض.",
        ),
      },
      {
        title: w("Match the discount briefly", "جارِ الخصم لفترة قصيرة"),
        detail: w(
          "Fund a short promotion with a capped budget.",
          "موّل عرضاً قصيراً بميزانية محدودة.",
        ),
        cost: 0.02,
        lesson: w(
          "Discounts reduce contribution. Set a stop limit and compare the result with what would have sold at the original price.",
          "تقلّل الخصومات المساهمة. ضع حدّ توقف وقارن النتيجة بما كان سيباع بالسعر الأصلي.",
        ),
      },
    ],
  },
  {
    id: "supplier",
    title: w("A supplier wants a bigger order", "مورد يطلب طلبية أكبر"),
    intro: w(
      "A supplier offers a lower unit price if you order more now. It could improve margin, but cash would be tied up before demand is proven.",
      "يعرض المورد سعراً أقل للوحدة إذا طلبت كمية أكبر الآن. قد يتحسن الهامش لكن النقد سيتجمّد قبل إثبات الطلب.",
    ),
    options: [
      {
        title: w("Buy the larger batch", "اشترِ الدفعة الأكبر"),
        detail: w(
          "Accept the lower unit price and carry more stock.",
          "اقبل السعر الأقل واحتفظ بمخزون أكبر.",
        ),
        cost: 0.06,
        lesson: w(
          "A unit discount can hide storage, damage and expiry costs. Check sell-through time and cash exposure before committing.",
          "قد يخفي خصم الوحدة تكاليف التخزين والتلف والانتهاء. افحص مدة بيع المخزون والتعرض النقدي قبل الالتزام.",
        ),
      },
      {
        title: w(
          "Negotiate a smaller pilot batch",
          "فاوض على دفعة تجريبية أصغر",
        ),
        detail: w(
          "Pay more per unit while learning actual demand.",
          "ادفع أكثر للوحدة أثناء تعلّم الطلب الفعلي.",
        ),
        cost: 0.025,
        lesson: w(
          "A smaller batch buys flexibility. Record the value of what you learn and a reorder trigger.",
          "تمنحك الدفعة الأصغر مرونة. سجّل قيمة ما تتعلمه وحدّ إعادة الطلب.",
        ),
      },
      {
        title: w("Seek a second supplier", "ابحث عن مورد ثانٍ"),
        detail: w(
          "Spend on samples and compare reliability as well as price.",
          "أنفق على عينات وقارن الموثوقية مع السعر.",
        ),
        cost: 0.008,
        lesson: w(
          "Supplier resilience has value. Compare quality, lead time, minimum order and payment terms consistently.",
          "لمرونة التوريد قيمة. قارن الجودة والمدة والحد الأدنى وشروط الدفع بصورة متسقة.",
        ),
      },
    ],
  },
  {
    id: "marketing",
    title: w("Choose your first growth channel", "اختر أول قناة للنمو"),
    intro: w(
      "You have a small marketing budget. You need {customers} and a way to learn whether your spending works.",
      "لديك ميزانية تسويق صغيرة. تحتاج إلى {customers} وطريقة لمعرفة أثر إنفاقك.",
    ),
    options: [
      {
        title: w(
          "Run a measured paid campaign",
          "نفّذ حملة مدفوعة قابلة للقياس",
        ),
        detail: w(
          "Track leads through to purchases with a spending cap.",
          "تتبّع العملاء المحتملين حتى الشراء مع سقف إنفاق.",
        ),
        cost: 0.025,
        lesson: w(
          "Measure acquired customers and contribution, not only clicks. Stop or revise when acquisition cost is unsustainable.",
          "قِس العملاء المكتسبين والمساهمة، لا النقرات وحدها. أوقف أو عدّل عندما لا تستدام تكلفة الاكتساب.",
        ),
      },
      {
        title: w("Test a local partnership", "اختبر شراكة محلية"),
        detail: w(
          "Build a small referral experiment with a complementary business.",
          "ابنِ تجربة إحالة صغيرة مع نشاط مكمّل.",
        ),
        cost: 0.006,
        lesson: w(
          "A partnership needs a clear mutual benefit and a way to attribute referrals. Avoid unclear promises about customer data.",
          "تحتاج الشراكة لفائدة متبادلة واضحة وطريقة لإسناد الإحالات. تجنّب الوعود الغامضة عن بيانات العملاء.",
        ),
      },
      {
        title: w("Start with direct outreach", "ابدأ بالتواصل المباشر"),
        detail: w(
          "Use founder time to speak to a small relevant audience.",
          "استخدم وقت المؤسس للتحدث مع جمهور صغير مناسب.",
        ),
        cost: 0,
        lesson: w(
          "Founder time still has a cost. Track responses, objections and sales so the learning can inform a repeatable channel.",
          "لوقت المؤسس تكلفة أيضاً. تتبّع الردود والاعتراضات والمبيعات لتطوير قناة قابلة للتكرار.",
        ),
      },
    ],
  },
  {
    id: "partner",
    title: w("A potential partner wants in", "شريك محتمل يريد الانضمام"),
    intro: w(
      "Someone offers money and contacts in exchange for a share. The enthusiasm is real, but roles, ownership and decision rights remain unclear.",
      "يعرض شخص مالاً وعلاقات مقابل حصة. الحماس موجود لكن الأدوار والملكية وصلاحيات القرار غير واضحة.",
    ),
    options: [
      {
        title: w("Clarify terms with advice", "وضّح الشروط بمشورة مختصة"),
        detail: w(
          "Budget for professional advice before a commitment.",
          "خصّص ميزانية للمشورة قبل الالتزام.",
        ),
        cost: 0.015,
        lesson: w(
          "A clear agreement should address contributions, decisions, exits and disputes. This scenario does not create an actual investment.",
          "ينبغي أن يعالج الاتفاق المساهمات والقرارات والخروج والخلافات. لا ينشئ هذا السيناريو استثماراً فعلياً.",
        ),
      },
      {
        title: w("Try a limited collaboration", "جرّب تعاوناً محدوداً"),
        detail: w(
          "Test working compatibility through a small shared project.",
          "اختبر ملاءمة العمل بمشروع مشترك صغير.",
        ),
        cost: 0.007,
        lesson: w(
          "A trial can reveal how people work together. Define scope and boundaries; a trial does not settle ownership.",
          "تكشف التجربة أسلوب العمل المشترك. حدّد النطاق والحدود؛ التجربة لا تحسم الملكية.",
        ),
      },
      {
        title: w("Pause until expectations align", "تريّث حتى تتوافق التوقعات"),
        detail: w(
          "Keep the conversation open and document unanswered questions.",
          "أبقِ النقاش مفتوحاً ووثّق الأسئلة غير المحسومة.",
        ),
        cost: 0,
        lesson: w(
          "Pausing preserves options. A respectful list of unresolved questions is more useful than vague agreement.",
          "يحفظ التريّث الخيارات. قائمة محترمة بالأسئلة المفتوحة أنفع من اتفاق غامض.",
        ),
      },
    ],
  },
  {
    id: "service",
    title: w("A customer raises a serious complaint", "عميل يقدّم شكوى جدية"),
    intro: w(
      "A customer says the service failed their expectations and posts publicly. Your response affects trust, cost and what the team learns.",
      "يقول عميل إن الخدمة خالفت توقعاته وينشر شكواه. تؤثر استجابتك على الثقة والتكلفة وتعلّم الفريق.",
    ),
    options: [
      {
        title: w("Resolve and investigate", "عالِج المشكلة وحقّق فيها"),
        detail: w(
          "Offer a reasonable remedy and examine the root cause.",
          "قدّم معالجة مناسبة وابحث عن السبب الجذري.",
        ),
        cost: 0.008,
        lesson: w(
          "A remedy can restore trust, but recurring problems need process changes. Record facts and protect customer privacy.",
          "قد تعيد المعالجة الثقة لكن التكرار يحتاج لتغيير العمليات. وثّق الوقائع واحمِ خصوصية العميل.",
        ),
      },
      {
        title: w(
          "Listen before choosing a remedy",
          "استمع قبل اختيار المعالجة",
        ),
        detail: w(
          "Speak privately and gather the missing facts.",
          "تحدّث على انفراد واجمع الحقائق الناقصة.",
        ),
        cost: 0,
        lesson: w(
          "Listening reduces assumptions. Set a prompt response deadline so investigation does not become avoidance.",
          "يقلّل الاستماع الافتراضات. حدّد مهلة قريبة للرد حتى لا يصبح التحقيق تجنباً.",
        ),
      },
      {
        title: w("Offer a capped service credit", "قدّم رصيد خدمة محدوداً"),
        detail: w(
          "Provide a defined credit and check whether it addresses the problem.",
          "قدّم رصيداً محدداً وتحقق من معالجته للمشكلة.",
        ),
        cost: 0.003,
        lesson: w(
          "A credit is only useful if the customer values returning. Check whether the remedy fits the actual harm and fix the cause.",
          "يفيد الرصيد إذا أراد العميل العودة. تحقّق من مناسبة المعالجة للضرر وأصلح السبب.",
        ),
      },
    ],
  },
];
