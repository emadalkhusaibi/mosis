import { w, type Words } from "./words";

/**
 * Opportunities from Moasis partners: internships, jobs and one-to-one sessions
 * with people who run businesses. Listings are curated: each one is added here
 * when a partner signs up. Example listings are fictional, always labelled, and
 * cannot be applied to; remove them once real partners are live.
 */
export type OpportunityKind = "internship" | "job" | "session";
export type WorkMode = "onsite" | "remote" | "hybrid";

export type Opportunity = {
  id: string;
  kind: OpportunityKind;
  title: Words;
  /** The organisation, or for a session the person's business. */
  org: Words;
  /** For sessions: who you'd talk to, and their role. */
  person?: { name: Words; role: Words };
  about: Words;
  /** Sector ids this suits; "*" suits every business type. */
  sectors: string[];
  city: Words;
  mode: WorkMode;
  /** Length or format, e.g. "8 weeks, 4 days a week" or "45-minute call". */
  length: Words;
  paid?: boolean;
  /** Topics a session covers. */
  topics?: Words[];
  /** Where applications go. A listing with neither is not open yet. */
  contact?: { email?: string; url?: string };
  /** Fictional listing that shows how the hub works. */
  example?: true;
};

export const opportunities: Opportunity[] = [
  {
    id: "ex-cafe-intern",
    kind: "internship",
    title: w("Café operations intern", "متدرب عمليات في مقهى"),
    org: w("Example café group", "مجموعة مقاهٍ (مثال)"),
    about: w("Work the morning rush, run stock counts and see the weekly numbers with the owner. You leave knowing what a real café costs to run.", "اعمل في ذروة الصباح، وأجرِ جرد المخزون، واطّلع على الأرقام الأسبوعية مع المالك. تخرج وأنت تعرف كلفة تشغيل مقهى حقيقي."),
    sectors: ["cafe", "restaurant"],
    city: w("Muscat", "مسقط"),
    mode: "onsite",
    length: w("8 weeks, 4 mornings a week", "٨ أسابيع، ٤ صباحات أسبوعياً"),
    paid: true,
    example: true,
  },
  {
    id: "ex-shop-intern",
    kind: "internship",
    title: w("Online shop growth intern", "متدرب نمو لمتجر إلكتروني"),
    org: w("Example online store", "متجر إلكتروني (مثال)"),
    about: w("Help run listings, delivery and Instagram for a growing online shop, and learn which posts actually sell.", "ساعد في إدارة المنتجات والتوصيل وإنستغرام لمتجر إلكتروني ينمو، وتعلّم أي المنشورات تبيع فعلاً."),
    sectors: ["ecommerce", "retail"],
    city: w("Muscat", "مسقط"),
    mode: "hybrid",
    length: w("10 weeks, part time", "١٠ أسابيع، دوام جزئي"),
    paid: true,
    example: true,
  },
  {
    id: "ex-tour-intern",
    kind: "internship",
    title: w("Khareef season tourism intern", "متدرب سياحة لموسم الخريف"),
    org: w("Example tour operator", "شركة جولات (مثال)"),
    about: w("Join a small tour team for the busiest weeks of the year in Dhofar: bookings, guests and the cash that comes with a season.", "انضم إلى فريق جولات صغير في أكثر أسابيع السنة ازدحاماً في ظفار: الحجوزات والضيوف والنقد الذي يأتي مع الموسم."),
    sectors: ["tourism", "events"],
    city: w("Salalah", "صلالة"),
    mode: "onsite",
    length: w("6 weeks in summer", "٦ أسابيع في الصيف"),
    paid: true,
    example: true,
  },
  {
    id: "ex-tech-job",
    kind: "job",
    title: w("Junior product builder", "مطوّر منتجات مبتدئ"),
    org: w("Example software studio", "استوديو برمجيات (مثال)"),
    about: w("Build small tools for Omani businesses with a team of five. Founders who've tested an idea with real customers stand out.", "ابنِ أدوات صغيرة للمشاريع العُمانية مع فريق من خمسة. المؤسسون الذين اختبروا فكرة مع زبائن حقيقيين يتميّزون."),
    sectors: ["tech", "services", "education"],
    city: w("Muscat", "مسقط"),
    mode: "hybrid",
    length: w("Full time", "دوام كامل"),
    paid: true,
    example: true,
  },
  {
    id: "ex-retail-job",
    kind: "job",
    title: w("Assistant store manager", "مساعد مدير متجر"),
    org: w("Example retail chain", "سلسلة متاجر (مثال)"),
    about: w("Run a shift, a team and a till. A practical way to learn retail margins before opening your own shop.", "أدِر مناوبة وفريقاً وصندوقاً. طريقة عملية لتعلّم هوامش التجزئة قبل فتح متجرك."),
    sectors: ["retail", "ecommerce", "salon"],
    city: w("Sohar", "صحار"),
    mode: "onsite",
    length: w("Full time", "دوام كامل"),
    paid: true,
    example: true,
  },
  {
    id: "ex-session-cafe",
    kind: "session",
    title: w("Talk to a café founder", "تحدث مع مؤسس مقهى"),
    org: w("Example café group", "مجموعة مقاهٍ (مثال)"),
    person: { name: w("Example founder", "مؤسس (مثال)"), role: w("Founder and CEO", "المؤسس والرئيس التنفيذي") },
    about: w("Opened three cafés in eight years, and closed one. Ask about rent, staff and the first year's cash.", "افتتح ثلاثة مقاهٍ خلال ثماني سنوات، وأغلق واحداً. اسأل عن الإيجار والموظفين ونقد السنة الأولى."),
    sectors: ["cafe", "restaurant", "events"],
    city: w("Muscat", "مسقط"),
    mode: "remote",
    length: w("45-minute call", "مكالمة ٤٥ دقيقة"),
    topics: [w("Choosing a location", "اختيار الموقع"), w("Hiring the first barista", "توظيف أول باريستا"), w("Surviving Ramadan and summer", "تجاوز رمضان والصيف")],
    example: true,
  },
  {
    id: "ex-session-cfo",
    kind: "session",
    title: w("Check your numbers with a finance manager", "راجع أرقامك مع مدير مالي"),
    org: w("Example trading company", "شركة تجارية (مثال)"),
    person: { name: w("Example finance manager", "مدير مالي (مثال)"), role: w("Finance manager", "مدير مالي") },
    about: w("Bring your forecast. Twenty years in finance; will tell you kindly which number a bank will question first.", "أحضر توقعاتك. عشرون عاماً في المالية؛ سيخبرك بلطف بالرقم الذي سيسأل عنه البنك أولاً."),
    sectors: ["*"],
    city: w("Muscat", "مسقط"),
    mode: "remote",
    length: w("30-minute call", "مكالمة ٣٠ دقيقة"),
    topics: [w("Reading your forecast", "قراءة توقعاتك"), w("Pricing and margin", "التسعير والهامش"), w("Preparing for a loan", "الاستعداد لقرض")],
    example: true,
  },
  {
    id: "ex-session-tech",
    kind: "session",
    title: w("Ask a tech entrepreneur", "اسأل رائد أعمال تقني"),
    org: w("Example software studio", "استوديو برمجيات (مثال)"),
    person: { name: w("Example entrepreneur", "رائد أعمال (مثال)"), role: w("Co-founder", "شريك مؤسس") },
    about: w("Built and sold a small app business in the Gulf. Good on finding first customers and when to raise money.", "بنى وباع مشروع تطبيق صغير في الخليج. خبير في إيجاد أول الزبائن ومتى تجمع التمويل."),
    sectors: ["tech", "ecommerce", "education", "services"],
    city: w("Muscat", "مسقط"),
    mode: "remote",
    length: w("45-minute call", "مكالمة ٤٥ دقيقة"),
    topics: [w("First ten customers", "أول عشرة زبائن"), w("Raising money", "جمع التمويل"), w("Building a team", "بناء فريق")],
    example: true,
  },
];

export const kindNames: Record<OpportunityKind, Words> = {
  internship: w("Internship", "تدريب"),
  job: w("Job", "وظيفة"),
  session: w("1:1 session", "جلسة فردية"),
};

export const modeNames: Record<WorkMode, Words> = {
  onsite: w("On site", "حضوري"),
  remote: w("Remote", "عن بُعد"),
  hybrid: w("Hybrid", "مختلط"),
};

export const matches = (o: Opportunity, sector: string) => o.sectors.includes("*") || o.sectors.includes(sector);
export const isOpen = (o: Opportunity) => !o.example && Boolean(o.contact?.email || o.contact?.url);

/** Matching listings first, then the rest, keeping the curated order inside each group. */
export function forSector(list: Opportunity[], sector: string) {
  return [...list.filter((o) => matches(o, sector)), ...list.filter((o) => !matches(o, sector))];
}
