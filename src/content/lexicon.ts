import { w, type Words } from "./words";

/**
 * Business-specific vocabulary and examples. Plan questions, scenarios and lessons
 * contain {tokens}; tailor.ts fills them from the lexicon of the founder's business type.
 *
 * Conventions:
 * - English nouns are lowercase and plural where named so; Arabic nouns are definite (with ال)
 *   so they read naturally mid-sentence.
 * - Examples (`ex`) are one short, concrete sentence a real founder in Oman might write,
 *   without real people's names. They appear as "For example: …" under a question.
 * - Scenario lines (`sc`) are one sentence that makes a generic situation specific.
 */
export type ExampleKey =
  | "problem" | "offer" | "goal" | "customer" | "alternatives" | "test"
  | "area" | "competitors" | "difference" | "channels"
  | "delivery" | "suppliers" | "people" | "location" | "risks" | "pilot";

export type ScenarioLine = "capacity" | "pricing" | "supplier" | "marketing" | "partner" | "service";

export type ExtraQuestion = { key: string; chapter: "idea" | "customer" | "market" | "finance" | "operations" | "risk" | "launch"; label: Words; hint: Words };

export type Lexicon = {
  /** "guest" / "الضيف" */
  customer: Words;
  /** "guests" / "الضيوف" */
  customers: Words;
  /** "drink" / "المشروب" */
  product: Words;
  /** "drinks" / "المشروبات" */
  products: Words;
  /** "café" / "المقهى" */
  place: Words;
  /** "barista" / "الباريستا" */
  staff: Words;
  /** "the 7am rush" / "زحمة السابعة صباحاً" */
  peak: Words;
  /** "coffee beans and milk" / "البن والحليب" */
  supply: Words;
  ex: Record<ExampleKey, Words>;
  sc: Record<ScenarioLine, Words>;
  /** Two questions only this kind of business needs to answer. Keys are prefixed with the sector id. */
  extra: ExtraQuestion[];
};

export const cafe: Lexicon = {
  customer: w("customer", "الزبون"),
  customers: w("customers", "الزبائن"),
  product: w("drink", "المشروب"),
  products: w("drinks", "المشروبات"),
  place: w("café", "المقهى"),
  staff: w("barista", "الباريستا"),
  peak: w("the morning rush before 8am", "زحمة الصباح قبل الثامنة"),
  supply: w("coffee beans, milk and cups", "البن والحليب والأكواب"),
  ex: {
    problem: w("Office staff on our street wait 15 minutes for coffee before work and often leave without buying.", "موظفو المكاتب في شارعنا ينتظرون ١٥ دقيقة للقهوة قبل الدوام وكثيراً ما يغادرون دون شراء."),
    offer: w("Six espresso drinks and two pastries, sold per cup, with pre-orders through WhatsApp.", "ستة مشروبات إسبريسو ونوعان من المعجنات، تُباع بالكوب، مع طلب مسبق عبر واتساب."),
    goal: w("Sell 120 cups a day by month 9, with at least 40% from repeat customers.", "بيع ١٢٠ كوباً يومياً بحلول الشهر التاسع، على أن يكون ٤٠٪ منها على الأقل من زبائن متكررين."),
    customer: w("Office workers aged 25 to 40 in Al Khuwair who buy coffee on the way in and pay by card.", "موظفو مكاتب بين ٢٥ و٤٠ عاماً في الخوير يشترون القهوة في طريقهم ويدفعون بالبطاقة."),
    alternatives: w("The chain café two streets away, instant coffee at the office, or skipping coffee.", "المقهى التابع لسلسلة على بعد شارعين، أو القهوة سريعة التحضير في المكتب، أو الاستغناء عن القهوة."),
    test: w("Sell from a cart outside the towers for three mornings at 1.200 a cup; pass if 60 cups sell.", "البيع من عربة أمام الأبراج ثلاثة صباحات بسعر ١٫٢٠٠ للكوب؛ النجاح إن بيع ٦٠ كوباً."),
    area: w("The three office towers within a five-minute walk of our unit in Al Khuwair.", "الأبراج المكتبية الثلاثة على بعد خمس دقائق سيراً من محلنا في الخوير."),
    competitors: w("A chain café at 1.900 a latte, a karak stall at 0.200, and a specialty café with no seating.", "مقهى سلسلة بسعر ١٫٩٠٠ للاتيه، وكشك كرك بسعر ٠٫٢٠٠، ومقهى مختص بلا جلسات."),
    difference: w("Ready in under three minutes with a pre-order, and a loyalty card that works across both shifts.", "جاهز في أقل من ثلاث دقائق مع الطلب المسبق، وبطاقة ولاء تعمل في الفترتين."),
    channels: w("Free tasting cups at the tower entrances and a WhatsApp pre-order number on every cup.", "أكواب تذوق مجانية عند مداخل الأبراج ورقم واتساب للطلب المسبق على كل كوب."),
    delivery: w("Order by WhatsApp, pay at the counter, drink ready in three minutes, checked against the order slip.", "الطلب عبر واتساب، الدفع عند الكاونتر، المشروب جاهز خلال ثلاث دقائق ويُطابق مع ورقة الطلب."),
    suppliers: w("A local roaster for beans with weekly delivery, and a second roaster as backup.", "محمصة محلية للبن بتوصيل أسبوعي، ومحمصة ثانية احتياطية."),
    people: w("I run the morning shift; one part-time barista covers 11am to 7pm.", "أدير الفترة الصباحية؛ وباريستا بدوام جزئي يغطي من ١١ صباحاً حتى ٧ مساءً."),
    location: w("A 25 m² ground-floor unit with street access, one espresso machine and a card terminal.", "محل أرضي بمساحة ٢٥ م² بمدخل على الشارع، وآلة إسبريسو واحدة، وجهاز دفع بالبطاقة."),
    risks: w("The morning crowd may not come back after the first week; the machine could break during the rush.", "قد لا يعود زبائن الصباح بعد الأسبوع الأول؛ وقد تتعطل الآلة وقت الزحمة."),
    pilot: w("A two-week pop-up with a menu of four drinks, measuring cups per morning and repeat visits.", "متجر مؤقت لأسبوعين بقائمة من أربعة مشروبات، مع قياس الأكواب كل صباح وتكرار الزيارات."),
  },
  sc: {
    capacity: w("The queue at the morning rush now reaches the door and some customers leave before ordering.", "صار الطابور في زحمة الصباح يصل إلى الباب، وبعض الزبائن يغادرون قبل الطلب."),
    pricing: w("The chain café nearby is selling lattes at half price for the month.", "المقهى التابع للسلسلة القريب يبيع اللاتيه بنصف السعر طوال الشهر."),
    supplier: w("Your roaster offers 15% off beans if you take three months' supply at once.", "تعرض عليك المحمصة خصم ١٥٪ على البن إن أخذت كمية ثلاثة أشهر دفعة واحدة."),
    marketing: w("You could pay for Instagram ads, partner with the gym upstairs, or hand out tasting cups.", "يمكنك الدفع لإعلانات إنستغرام، أو الشراكة مع النادي في الطابق العلوي، أو توزيع أكواب تذوق."),
    partner: w("A regular who owns a bakery offers to invest if you sell only his pastries.", "زبون دائم يملك مخبزاً يعرض الاستثمار بشرط أن تبيع معجناته فقط."),
    service: w("A customer posts that their order was wrong twice in one week.", "زبون ينشر أن طلبه كان خاطئاً مرتين في أسبوع واحد."),
  },
  extra: [
    { key: "cafe_menu", chapter: "idea", label: w("Which drink will earn you the most per cup?", "أي مشروب سيحقق لك أعلى ربح في الكوب؟"), hint: w("Compare price with the cost of beans, milk, cup and lid.", "قارن السعر بتكلفة البن والحليب والكوب والغطاء.") },
    { key: "cafe_hours", chapter: "operations", label: w("Which hours will you open, and why those?", "ما ساعات العمل، ولماذا هذه الساعات؟"), hint: w("Match your hours to when your customers actually pass by.", "طابق ساعاتك مع أوقات مرور زبائنك فعلاً.") },
  ],
};

/** Used for "Other" and as a safety net. {place} becomes the founder's own description. */
export const generic: Lexicon = {
  customer: w("customer", "العميل"),
  customers: w("customers", "العملاء"),
  product: w("sale", "عملية البيع"),
  products: w("products or services", "المنتجات أو الخدمات"),
  place: w("business", "المشروع"),
  staff: w("team member", "عضو الفريق"),
  peak: w("your busiest days", "أكثر أيامك ازدحاماً"),
  supply: w("the materials you depend on", "المواد التي تعتمد عليها"),
  ex: {
    problem: w("Describe one moment when your customer is frustrated, and what it costs them.", "صِف لحظة واحدة يشعر فيها عميلك بالإحباط، وما الذي تكلّفه إياه."),
    offer: w("Name what you sell, what's included, and how you charge for it.", "سمِّ ما تبيعه وما يشمله وكيف تحتسب سعره."),
    goal: w("One number you can check in 12 months, such as monthly sales or repeat customers.", "رقم واحد يمكنك التحقق منه بعد ١٢ شهراً، مثل المبيعات الشهرية أو العملاء المتكررين."),
    customer: w("Who they are, where they are, and how they prefer to pay.", "من هم، وأين هم، وكيف يفضّلون الدفع."),
    alternatives: w("What they do today instead, including doing nothing.", "ما يفعلونه اليوم بدلاً من ذلك، بما في ذلك عدم فعل شيء."),
    test: w("A small offer to real people, with a price, a date and a number that counts as a pass.", "عرض صغير لأشخاص حقيقيين، بسعر وتاريخ ورقم يُعدّ نجاحاً."),
    area: w("One neighbourhood, city or online group you can reach this month.", "حي أو مدينة أو مجموعة على الإنترنت يمكنك الوصول إليها هذا الشهر."),
    competitors: w("Three options your customer already knows, with their prices.", "ثلاثة خيارات يعرفها عميلك بالفعل، مع أسعارها."),
    difference: w("A reason to choose you that a competitor can't copy next week.", "سبب لاختيارك لا يستطيع منافس نسخه الأسبوع المقبل."),
    channels: w("Where your first ten customers will hear about you, and what it costs.", "أين سيسمع عنك أول عشرة عملاء، وكم يكلّف ذلك."),
    delivery: w("The steps from order to delivery, with a quality check.", "الخطوات من الطلب إلى التسليم، مع فحص للجودة."),
    suppliers: w("Your main supplier, their lead time, and a backup.", "مورّدك الرئيسي ومدة توريده وبديل احتياطي."),
    people: w("What you do yourself, and the first role you'd hire for.", "ما تقوم به بنفسك، وأول دور ستوظّف له."),
    location: w("Where you work from and the tools you need on day one.", "مكان عملك والأدوات التي تحتاجها من اليوم الأول."),
    risks: w("Three things that could go wrong, and the early sign of each.", "ثلاثة أمور قد تسوء، والعلامة المبكرة لكل منها."),
    pilot: w("The smallest version you can sell for two weeks and learn from.", "أصغر نسخة يمكنك بيعها لأسبوعين والتعلّم منها."),
  },
  sc: {
    capacity: w("Orders are arriving faster than you can deliver them well.", "الطلبات تصل أسرع مما تستطيع تسليمه بجودة."),
    pricing: w("A competitor your customers know has announced a discount.", "منافس يعرفه عملاؤك أعلن عن خصم."),
    supplier: w("Your main supplier offers a better price for a much larger order.", "مورّدك الرئيسي يعرض سعراً أفضل مقابل طلبية أكبر بكثير."),
    marketing: w("You have a small budget and three ways to spend it.", "لديك ميزانية صغيرة وثلاث طرق لإنفاقها."),
    partner: w("Someone you know offers money and contacts for a share of the business.", "شخص تعرفه يعرض مالاً وعلاقات مقابل حصة في المشروع."),
    service: w("A customer is unhappy and has said so publicly.", "عميل غير راضٍ وقد صرّح بذلك علناً."),
  },
  extra: [],
};
