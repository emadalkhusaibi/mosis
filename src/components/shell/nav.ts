import { BookOpenText, ChartLineUp, House, Notebook, Strategy, UsersThree, Wallet, type Icon } from "@phosphor-icons/react";

export type NavItem = { href: string; en: string; ar: string; icon: Icon; mobile?: boolean; match?: string[] };

export const nav: NavItem[] = [
  { href: "/", en: "Today", ar: "اليوم", icon: House, mobile: true },
  { href: "/plan", en: "Plan", ar: "الخطة", icon: Notebook, mobile: true },
  { href: "/wallet", en: "Wallet", ar: "المحفظة", icon: Wallet, mobile: true },
  { href: "/forecast", en: "Forecast", ar: "التوقعات", icon: ChartLineUp },
  { href: "/practice", en: "CEO practice", ar: "تدريب القيادة", icon: Strategy, mobile: true },
  { href: "/learn", en: "Learn", ar: "التعلّم", icon: BookOpenText, mobile: true },
  { href: "/consultant", en: "Consultant desk", ar: "مكتب المستشار", icon: UsersThree },
];

export const isActive = (pathname: string, href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
