"use client";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { pick as pickWords, type Lang, type Words } from "@/content/words";

import { LANG_COOKIE } from "./lang-cookie";

type I18n = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  /** Inline bilingual copy: t("Wallet", "المحفظة"). */
  t: (en: string, ar: string) => string;
  /** Picks from a content tuple. */
  p: (w: Words) => string;
  /** Locale-aware date. */
  date: (iso: string, style?: "short" | "long") => string;
  number: (n: number, digits?: number) => string;
};

const Ctx = createContext<I18n | null>(null);

export function LanguageProvider({ initial, children }: { initial: Lang; children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initial);
  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    document.cookie = `${LANG_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  }, []);
  const value = useMemo<I18n>(() => {
    const locale = lang === "ar" ? "ar-OM-u-nu-latn" : "en-GB";
    return {
      lang,
      dir: lang === "ar" ? "rtl" : "ltr",
      setLang,
      t: (en, ar) => (lang === "ar" ? ar : en),
      p: (w) => pickWords(w, lang),
      date: (iso, style = "short") => {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleDateString(locale, style === "short" ? { day: "numeric", month: "short" } : { day: "numeric", month: "long", year: "numeric" });
      },
      number: (n, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(n),
    };
  }, [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("LanguageProvider missing");
  return v;
}
