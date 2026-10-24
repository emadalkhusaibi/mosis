import { BookOpenText, Briefcase, Certificate, Flask, RocketLaunch, PaintBrush, ChartLineUp, Gear, House, Notebook, Strategy, Users, UsersThree, Wallet, type Icon } from "@phosphor-icons/react";

export type NavItem = { href: string; en: string; ar: string; icon: Icon; descEn?: string; descAr?: string };

/** The five primary destinations: sidebar on desktop, bottom dock on phones. */
export const primaryNav: NavItem[] = [
  { href: "/", en: "Today", ar: "اليوم", icon: House },
  { href: "/plan", en: "Plan", ar: "الخطة", icon: Notebook },
  { href: "/wallet", en: "Wallet", ar: "المحفظة", icon: Wallet },
  { href: "/practice", en: "Practice", ar: "التدريب", icon: Strategy },
  { href: "/prove", en: "Prove", ar: "أثبِت", icon: Flask },
];

/** Everything else, always reachable from the labelled workspace menu, never only from search. */
export const workspaceNav: NavItem[] = [
  { href: "/learn", en: "Learn", ar: "التعلّم", icon: BookOpenText, descEn: "Short lessons with practice questions", descAr: "دروس قصيرة مع أسئلة تدريبية" },
  { href: "/opportunities", en: "Opportunities", ar: "الفرص", icon: Briefcase, descEn: "Internships, jobs and 1:1s with business leaders", descAr: "تدريب ووظائف وجلسات فردية مع قادة الأعمال" },
  { href: "/record", en: "Founder record", ar: "سجلّ المؤسس", icon: Certificate, descEn: "Your readiness and proof on one printable page", descAr: "جاهزيتك وأدلتك في صفحة واحدة قابلة للطباعة" },
  { href: "/launch", en: "Launch steps", ar: "خطوات الانطلاق", icon: RocketLaunch, descEn: "From plan to a registered business in Oman", descAr: "من الخطة إلى مشروع مسجّل في عُمان" },
  { href: "/brand", en: "Brand studio", ar: "استوديو الهوية", icon: PaintBrush, descEn: "Name, colours and logo, with an AI partner", descAr: "الاسم والألوان والشعار، مع مساعد ذكي" },
  { href: "/forecast", en: "Forecast", ar: "التوقعات", icon: ChartLineUp, descEn: "Your year under named assumptions", descAr: "سنتك وفق افتراضات مسمّاة" },
  { href: "/practice/team", en: "Practice team", ar: "الفريق التدريبي", icon: Users, descEn: "Planned roles and payroll", descAr: "الأدوار والرواتب المخططة" },
  { href: "/consultant", en: "Consultant desk", ar: "مكتب المستشار", icon: UsersThree, descEn: "A separate mode for reviewing founders", descAr: "وضع منفصل لمراجعة المؤسسين" },
  { href: "/settings", en: "Settings", ar: "الإعدادات", icon: Gear, descEn: "Account, business, language and data", descAr: "الحساب والمشروع واللغة والبيانات" },
];

/** Active for nested routes, but Practice doesn't light up while you're on the team page (which has its own entry). */
export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/practice" && pathname.startsWith("/practice/team")) return false;
  if (href === "/wallet" && pathname === "/forecast") return false;
  return pathname === href || pathname.startsWith(href + "/");
}
