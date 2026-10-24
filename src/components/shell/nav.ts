import { BookOpenText, Briefcase, CalendarCheck, Certificate, ChartLineUp, Flask, Gear, Handshake, House, Notebook, PaintBrush, RocketLaunch, Stack, Strategy, Users, UsersThree, Wallet, type Icon } from "@phosphor-icons/react";

export type NavItem = { href: string; en: string; ar: string; icon: Icon; descEn?: string; descAr?: string };
export type SpaceId = "today" | "build" | "prove" | "connect";
export type Space = NavItem & { id: SpaceId; items: NavItem[] };

/**
 * Four spaces, one per stage of the founder's work. Every page belongs to exactly
 * one space, so the tab bar always says where you are and the back button where
 * you came from.
 */
export const spaces: Space[] = [
  { id: "today", href: "/", en: "Today", ar: "اليوم", icon: House, items: [] },
  {
    id: "build", href: "/build", en: "Build", ar: "ابنِ", icon: Stack,
    descEn: "Write the plan and run the numbers", descAr: "اكتب الخطة وشغّل الأرقام",
    items: [
      { href: "/plan", en: "Business plan", ar: "خطة العمل", icon: Notebook, descEn: "Seven chapters, one question at a time", descAr: "سبعة فصول، سؤال تلو الآخر" },
      { href: "/forecast", en: "Forecast", ar: "التوقعات", icon: ChartLineUp, descEn: "Your year under named assumptions", descAr: "سنتك وفق افتراضات مسمّاة" },
      { href: "/wallet", en: "Wallet", ar: "المحفظة", icon: Wallet, descEn: "Practice money, spent and protected", descAr: "المال التدريبي، مصروفاً ومحمياً" },
      { href: "/brand", en: "Brand studio", ar: "استوديو الهوية", icon: PaintBrush, descEn: "Name, colours and logo", descAr: "الاسم والألوان والشعار" },
      { href: "/practice/team", en: "Team", ar: "الفريق", icon: Users, descEn: "Planned roles and payroll", descAr: "الأدوار والرواتب المخططة" },
    ],
  },
  {
    id: "prove", href: "/prove", en: "Prove", ar: "أثبِت", icon: Flask,
    descEn: "Test what you believe, and practise the hard calls", descAr: "اختبر ما تعتقده، وتدرّب على القرارات الصعبة",
    items: [
      { href: "/prove/tests", en: "Field tests", ar: "الاختبارات الميدانية", icon: Flask, descEn: "Assumptions and the evidence behind them", descAr: "الافتراضات والأدلة وراءها" },
      { href: "/prove/review", en: "Weekly review", ar: "المراجعة الأسبوعية", icon: CalendarCheck, descEn: "Five minutes, every week", descAr: "خمس دقائق كل أسبوع" },
      { href: "/practice", en: "Practice decisions", ar: "قرارات تدريبية", icon: Strategy, descEn: "Rehearse real trade-offs with practice money", descAr: "تدرّب على مفاضلات حقيقية بمال تدريبي" },
      { href: "/learn", en: "Learn", ar: "التعلّم", icon: BookOpenText, descEn: "Short lessons with practice questions", descAr: "دروس قصيرة مع أسئلة تدريبية" },
    ],
  },
  {
    id: "connect", href: "/connect", en: "Connect", ar: "تواصل", icon: Handshake,
    descEn: "Your record, and the people who can open doors", descAr: "سجلّك، والأشخاص الذين يفتحون الأبواب",
    items: [
      { href: "/opportunities", en: "Opportunities", ar: "الفرص", icon: Briefcase, descEn: "Internships, jobs and 1:1s with business leaders", descAr: "تدريب ووظائف وجلسات فردية مع قادة الأعمال" },
      { href: "/record", en: "Founder record", ar: "سجلّ المؤسس", icon: Certificate, descEn: "Your readiness and proof on one page", descAr: "جاهزيتك وأدلتك في صفحة واحدة" },
      { href: "/launch", en: "Launch steps", ar: "خطوات الانطلاق", icon: RocketLaunch, descEn: "From plan to a registered business in Oman", descAr: "من الخطة إلى مشروع مسجّل في عُمان" },
      { href: "/consultant", en: "Consultant desk", ar: "مكتب المستشار", icon: UsersThree, descEn: "A separate mode for reviewing founders", descAr: "وضع منفصل لمراجعة المؤسسين" },
    ],
  },
];

export const settingsItem: NavItem = { href: "/settings", en: "Settings", ar: "الإعدادات", icon: Gear, descEn: "Business, language and data", descAr: "المشروع واللغة والبيانات" };

/** Every destination, for search. */
export const allPages: NavItem[] = [...spaces, ...spaces.flatMap((s) => s.items), settingsItem];

const within = (pathname: string, href: string) => pathname === href || pathname.startsWith(href + "/");

/** The space a page belongs to. The most specific match wins (/practice/team is Build, /practice is Prove). */
export function spaceOf(pathname: string): Space {
  let best: { space: Space; len: number } | null = null;
  for (const space of spaces) {
    for (const href of [space.href, ...space.items.map((i) => i.href)]) {
      if (href === "/" ? pathname === "/" : within(pathname, href)) {
        if (!best || href.length > best.len) best = { space, len: href.length };
      }
    }
  }
  return best?.space ?? spaces[0];
}

/** The sub-page a path is in, if any: used to light up the sidebar and to name the back button. */
export function itemOf(pathname: string): NavItem | null {
  const items = spaces.flatMap((s) => s.items).filter((i) => within(pathname, i.href));
  return items.sort((a, b) => b.href.length - a.href.length)[0] ?? null;
}
