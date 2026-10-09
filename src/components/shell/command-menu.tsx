"use client";
import { Dialog } from "radix-ui";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpenText, Gear, MagnifyingGlass, Notebook, Strategy, Users, type Icon } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { nav } from "./nav";
import { sections } from "@/content/sections";
import { lessons } from "@/content/lessons";
import { scenarios } from "@/content/scenarios";

type Item = { href: string; label: string; alt: string; group: string; icon: Icon };

export function CommandMenu({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { t, lang, dir } = useI18n();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo<Item[]>(() => {
    const L = (en: string, ar: string) => (lang === "ar" ? ar : en);
    const A = (en: string, ar: string) => (lang === "ar" ? en : ar);
    return [
      ...nav.map((n) => ({ href: n.href, label: L(n.en, n.ar), alt: A(n.en, n.ar), group: t("Pages", "الصفحات"), icon: n.icon })),
      { href: "/practice/team", label: L("Practice team", "الفريق التدريبي"), alt: A("Practice team", "الفريق التدريبي"), group: t("Pages", "الصفحات"), icon: Users },
      { href: "/settings", label: L("Settings", "الإعدادات"), alt: A("Settings", "الإعدادات"), group: t("Pages", "الصفحات"), icon: Gear },
      ...sections.map((s) => ({ href: `/plan/${s.id}`, label: L(...s.name), alt: A(...s.name), group: t("Business plan", "خطة العمل"), icon: Notebook })),
      ...lessons.map((l) => ({ href: `/learn/${l.id}`, label: L(...l.title), alt: A(...l.title), group: t("Lessons", "الدروس"), icon: BookOpenText })),
      ...scenarios.map((s) => ({ href: `/practice/${s.id}`, label: L(...s.title), alt: A(...s.title), group: t("CEO practice", "تدريب القيادة"), icon: Strategy })),
    ];
  }, [lang, t]);

  const results = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return needle ? items.filter((i) => i.label.toLocaleLowerCase().includes(needle) || i.alt.toLocaleLowerCase().includes(needle)) : items.slice(0, 10);
  }, [q, items]);

  const go = (href: string) => {
    onOpenChange(false);
    setQ("");
    router.push(href);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setQ(""); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="sheet-scrim" />
        <Dialog.Content className="command" dir={dir} aria-describedby={undefined}>
          <Dialog.Title className="sr-only">{t("Search your workspace", "ابحث في مساحة عملك")}</Dialog.Title>
          <div className="command-input">
            <MagnifyingGlass size={20} aria-hidden="true" />
            <input
              autoFocus
              value={q}
              role="combobox"
              aria-expanded="true"
              aria-controls="command-results"
              aria-activedescendant={results[active] ? `cmd-${active}` : undefined}
              placeholder={t("Search pages, lessons and scenarios", "ابحث في الصفحات والدروس والمواقف")}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
                if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
                if (e.key === "Enter" && results[active]) go(results[active].href);
              }}
            />
          </div>
          <ul id="command-results" role="listbox" className="command-list">
            {results.length === 0 && <li className="command-empty">{t("Nothing matches that yet.", "لا توجد نتائج مطابقة.")}</li>}
            {results.map((r, i) => (
              <li key={r.href} id={`cmd-${i}`} role="option" aria-selected={i === active} className="command-item" onMouseEnter={() => setActive(i)} onClick={() => go(r.href)}>
                <r.icon size={18} aria-hidden="true" />
                <span className="command-label">{r.label}</span>
                <span className="command-group">{r.group}</span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
