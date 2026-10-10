"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";

/** Wallet and Forecast are siblings: one records what happened, the other models what might. */
export function FinanceSubnav() {
  const { t } = useI18n();
  const path = usePathname();
  const items = [
    { href: "/wallet", label: t("Wallet", "المحفظة") },
    { href: "/forecast", label: t("Forecast", "التوقعات") },
  ];
  return (
    <nav className="subnav" aria-label={t("Money", "المال")}>
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path.startsWith(i.href) ? "page" : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
