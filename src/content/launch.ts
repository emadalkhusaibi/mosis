import { w, type Words } from "./words";

/**
 * From plan to a registered business in Oman. General guidance gathered from
 * public sources in October 2026, not legal advice: requirements depend on the
 * activity and the legal form, so each step links to where to check.
 */
export type LaunchStep = { id: string; title: Words; body: Words; when: Words; source?: { label: string; url: string } };

export const launchSteps: LaunchStep[] = [
  {
    id: "form",
    title: w("Choose the legal form", "اختر الشكل القانوني"),
    body: w("Most first businesses start as a sole proprietorship or a limited liability company (LLC). An LLC separates your personal money from the business, but has more paperwork.", "تبدأ معظم المشاريع الأولى كمؤسسة فردية أو شركة ذات مسؤولية محدودة. الشركة تفصل مالك الشخصي عن مال المشروع، لكن أوراقها أكثر."),
    when: w("Before registering", "قبل التسجيل"),
  },
  {
    id: "cr",
    title: w("Reserve a trade name and get your commercial registration", "احجز الاسم التجاري واستخرج السجل التجاري"),
    body: w("Both are done on the Invest Easy portal of the Ministry of Commerce, Industry and Investment Promotion. You'll need ID, your activity, and a lease for the registered address.", "يتم الأمران عبر بوابة استثمر بسهولة التابعة لوزارة التجارة والصناعة وترويج الاستثمار. ستحتاج الهوية والنشاط وعقد إيجار للعنوان المسجل."),
    when: w("First official step", "أول خطوة رسمية"),
    source: { label: "tejarah.gov.om", url: "https://tejarah.gov.om" },
  },
  {
    id: "premises",
    title: w("Licence your premises", "رخّص موقعك"),
    body: w("If customers visit you, check the municipality licence for your activity and location before signing a long lease. Food businesses have extra health requirements.", "إن كان الزبائن سيزورونك، تحقق من ترخيص البلدية لنشاطك وموقعك قبل توقيع إيجار طويل. لأنشطة الأغذية متطلبات صحية إضافية."),
    when: w("Before you fit out a shop", "قبل تجهيز المحل"),
  },
  {
    id: "riyada",
    title: w("Apply for the Riyada Entrepreneurship Card", "تقدّم لبطاقة ريادة"),
    body: w("For Omanis who run their business full time, among other groups. It's applied for online, costs 5 rials for 12 months, and opens Riyada's support programmes and incentives.", "للعُمانيين المتفرغين لإدارة مشاريعهم، ضمن فئات أخرى. يُقدَّم عليها إلكترونياً برسوم ٥ ريالات لمدة ١٢ شهراً، وتفتح برامج ريادة وحوافزها."),
    when: w("After the commercial registration", "بعد السجل التجاري"),
    source: { label: "gov.om", url: "https://gov.om/en/w/issuance-or-renewal-of-riyada-card-completed-in-one-day" },
  },
  {
    id: "bank",
    title: w("Open a business bank account", "افتح حساباً مصرفياً للمشروع"),
    body: w("Keep business money apart from personal money from day one. Banks ask for the commercial registration. Your Moasis wallet habits carry straight over.", "افصل مال المشروع عن مالك الشخصي من اليوم الأول. تطلب البنوك السجل التجاري. عاداتك في محفظة مؤسس تنتقل معك مباشرة."),
    when: w("Before the first sale", "قبل أول عملية بيع"),
  },
  {
    id: "people",
    title: w("Register staff before they start", "سجّل الموظفين قبل بدء عملهم"),
    body: w("Omani employees are registered for social insurance with the Social Protection Fund. Work permits for non-Omani staff go through the Ministry of Labour.", "يُسجَّل الموظفون العُمانيون في التأمينات لدى صندوق الحماية الاجتماعية. وتصاريح العمل لغير العُمانيين عبر وزارة العمل."),
    when: w("When you hire", "عند التوظيف"),
  },
  {
    id: "vat",
    title: w("Watch the VAT threshold", "راقب حد ضريبة القيمة المضافة"),
    body: w("Registration with the Tax Authority becomes mandatory once yearly taxable sales pass 38,500 rials. Your forecast shows when you might cross it.", "يصبح التسجيل لدى جهاز الضرائب إلزامياً عندما تتجاوز المبيعات الخاضعة للضريبة ٣٨٬٥٠٠ ريال سنوياً. توقعاتك تُظهر متى قد تتجاوزه."),
    when: w("As sales grow", "مع نمو المبيعات"),
    source: { label: "cms.law", url: "https://cms.law/en/omn/legal-updates/the-introduction-of-vat-in-the-sultanate-of-oman-a-brief-legal-guide" },
  },
  {
    id: "pack",
    title: w("Prepare your plan for a lender or mentor", "جهّز خطتك لجهة تمويل أو مرشد"),
    body: w("Your Founder record and printable plan show the plan, the forecast and the evidence together. Bring them to Riyada, a bank or an incubator.", "سجلّ المؤسس والخطة القابلة للطباعة يعرضان الخطة والتوقعات والأدلة معاً. خذهما إلى ريادة أو بنك أو حاضنة أعمال."),
    when: w("Before asking for money", "قبل طلب التمويل"),
  },
];

/**
 * What the premises step means for one kind of business. Kept to what to check
 * and with whom, never a promise about the outcome.
 */
export function premisesNote(sector: string, channel?: string): Words | null {
  if (channel === "online" || channel === "home") return w("You said customers won't come to a shop, so you may not need one. Check whether your activity can be registered from home or a shared office before you sign a lease.", "ذكرت أن العملاء لن يأتوا إلى محل، فقد لا تحتاج إليه. تحقق إن كان نشاطك يمكن تسجيله من المنزل أو مكتب مشترك قبل توقيع أي إيجار.");
  switch (sector) {
    case "cafe":
    case "restaurant":
      return w("Food premises need the municipality's health licence, and staff who handle food usually need health certificates. Check both before you fit out the kitchen.", "تحتاج منشآت الأغذية ترخيصاً صحياً من البلدية، ويحتاج العاملون في تداول الأغذية عادةً إلى شهادات صحية. تحقق من الأمرين قبل تجهيز المطبخ.");
    case "ecommerce":
    case "tech":
    case "services":
    case "studio":
      return w("You may not need a shopfront at all. Check whether your activity can be registered from home or a shared office before you sign a lease.", "قد لا تحتاج محلاً على الإطلاق. تحقق إن كان نشاطك يمكن تسجيله من المنزل أو مكتب مشترك قبل توقيع أي إيجار.");
    case "retail":
    case "salon":
    case "fitness":
    case "automotive":
      return w("Customers come to you, so the location, the activity and any shop sign need the municipality's approval. Ask before you commit to the unit.", "الزبائن يأتون إليك، لذا يحتاج الموقع والنشاط واللوحة الإعلانية إلى موافقة البلدية. اسأل قبل الالتزام بالمحل.");
    case "tourism":
      return w("Tourism activities can need a licence from the Ministry of Heritage and Tourism as well as the commercial registration. Check which applies to yours.", "قد تحتاج الأنشطة السياحية ترخيصاً من وزارة التراث والسياحة إضافة إلى السجل التجاري. تحقق مما ينطبق على نشاطك.");
    case "education":
      return w("Training centres and nurseries need approval from the ministry that covers the activity before they open. Check which one is yours on Invest Easy.", "تحتاج مراكز التدريب ودور الحضانة موافقة الوزارة المختصة بالنشاط قبل الافتتاح. تحقق من الجهة المختصة عبر استثمر بسهولة.");
    case "manufacturing":
      return w("Production can need an industrial location and an environmental permit. Check the zoning before you lease a workshop.", "قد يحتاج الإنتاج موقعاً صناعياً وتصريحاً بيئياً. تحقق من التصنيف قبل استئجار ورشة.");
    case "logistics":
      return w("Vehicles used for business need the right registration and permits for their type. Check before you buy or lease one.", "تحتاج المركبات المستخدمة تجارياً تسجيلاً وتصاريح تناسب نوعها. تحقق قبل شرائها أو استئجارها.");
    case "events":
      return w("Each event venue may need its own permit from the municipality. Check the rules for the venues you plan to use.", "قد يحتاج كل موقع فعالية تصريحاً خاصاً من البلدية. تحقق من القواعد للمواقع التي تخطط لاستخدامها.");
    default:
      return null;
  }
}
