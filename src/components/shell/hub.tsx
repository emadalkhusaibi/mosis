"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { CaretRight } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { spaces, type SpaceId } from "./nav";

/**
 * A space's home: a large title, an optional summary, and its pages as one
 * grouped list. Each row says what's inside and, where useful, where you are.
 */
export function Hub({ id, values, children, after }: { id: SpaceId; values?: Record<string, ReactNode>; children?: ReactNode; after?: ReactNode }) {
  const { lang } = useI18n();
  const space = spaces.find((s) => s.id === id)!;
  const L = (en?: string, ar?: string) => (lang === "ar" ? ar : en);
  return (
    <>
      <header className="page-heading hub-heading">
        <div className="page-heading-text">
          <h1 className="page-title large-title">{L(space.en, space.ar)}</h1>
          <p className="page-description">{L(space.descEn, space.descAr)}</p>
        </div>
      </header>
      <div className="hub-stack">
        {children}
        <ul className="grouped glass" aria-label={L(space.en, space.ar)}>
          {space.items.map((item) => {
            const I = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} className="grouped-row">
                  <span className="grouped-icon" aria-hidden="true"><I size={20} weight="fill" /></span>
                  <span className="grouped-main">
                    <span className="grouped-title">{L(item.en, item.ar)}</span>
                    <span className="grouped-sub">{L(item.descEn, item.descAr)}</span>
                  </span>
                  {values?.[item.href] != null && <span className="grouped-value">{values[item.href]}</span>}
                  <CaretRight size={16} weight="bold" className="grouped-chevron flip-rtl" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
        {after}
      </div>
    </>
  );
}
