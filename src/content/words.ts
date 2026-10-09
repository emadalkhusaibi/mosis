export type Lang = "en" | "ar";
/** A bilingual string: [English, Arabic]. */
export type Words = readonly [string, string];
export const w = (en: string, ar: string): Words => [en, ar];
export const pick = (v: Words, lang: Lang) => v[lang === "ar" ? 1 : 0];
