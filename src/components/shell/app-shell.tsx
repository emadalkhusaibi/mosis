"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { motion } from "motion/react";
import { DropdownMenu } from "radix-ui";
import { useTheme } from "next-themes";
import clsx from "clsx";
import {
  CloudArrowUp, CloudCheck, CloudSlash, Desktop, Gear, HardDrives, MagnifyingGlass, Moon, SignOut, SunDim, Translate, UserCircle, Warning, Check,
} from "@phosphor-icons/react";
import { Wordmark, Origin } from "@/components/ui/origin";
import { AnimatedOrigin } from "@/components/ui/origin-animated";
import { SectorIcon } from "@/components/ui/icons";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { sectorOf } from "@/content/sectors";
import { signOut } from "@/lib/auth-client";
import { nav, isActive } from "./nav";
import { CommandMenu } from "./command-menu";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useI18n();
  const ws = useWorkspace();
  const [search, setSearch] = useState(false);

  // First-run founders go straight to setup; everyone else lands in their workspace.
  useEffect(() => {
    if (ws.ready && !ws.state.venture.started && pathname !== "/setup") router.replace("/welcome");
  }, [ws.ready, ws.state.venture.started, pathname, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!ws.ready) return <LoadingScreen />;
  if (pathname === "/setup") return <main id="main">{children}</main>;

  const sector = sectorOf(ws.state.venture.sector);

  return (
    <div className="shell">
      <a href="#main" className="skip-link">{t("Skip to content", "انتقل إلى المحتوى")}</a>
      <aside className="sidebar glass" aria-label={t("Workspace", "مساحة العمل")}>
        <Link href="/" className="sidebar-brand" aria-label={t("Moasis home", "الرئيسية")}>
          <Wordmark />
        </Link>
        <nav aria-label={t("Main navigation", "التنقل الرئيسي")} className="sidebar-nav">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const I = item.icon;
            return (
              <Link key={item.href} href={item.href} className={clsx("side-link", active && "is-active")} aria-current={active ? "page" : undefined}>
                {active && <motion.span layoutId="side-active" className="side-link-bg" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                <I size={20} weight={active ? "fill" : "regular"} aria-hidden="true" />
                <span>{lang === "ar" ? item.ar : item.en}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-foot">
          <Link href="/settings" className={clsx("side-link", pathname === "/settings" && "is-active")}>
            <Gear size={20} aria-hidden="true" />
            <span>{t("Settings", "الإعدادات")}</span>
          </Link>
          <SaveIndicator />
        </div>
      </aside>

      <header className="topbar glass">
        <Link href="/" className="topbar-mark" aria-label={t("Moasis home", "الرئيسية")}>
          <Origin className="h-6 w-6" />
        </Link>
        <Link href="/settings#business" className="venture-chip" title={t("Edit business", "تعديل المشروع")}>
          <span className="venture-chip-icon"><SectorIcon name={sector.icon} size={16} /></span>
          <span className="venture-chip-name" dir="auto">{ws.state.venture.name || t("Your business", "مشروعك")}</span>
          <span className="venture-chip-city">{ws.state.venture.city}</span>
        </Link>
        <div className="topbar-actions">
          <button type="button" className="search-trigger" onClick={() => setSearch(true)} aria-label={t("Search", "بحث")}>
            <MagnifyingGlass size={18} aria-hidden="true" />
            <span className="search-trigger-text">{t("Search", "بحث")}</span>
            <kbd className="search-trigger-kbd">⌘K</kbd>
          </button>
          <LanguageToggle />
          <AppearanceMenu />
          <AccountMenu />
        </div>
      </header>

      <main id="main" className="main" tabIndex={-1}>
        {ws.mode === "guest" && <GuestBanner />}
        {ws.status === "conflict" && <ConflictBanner />}
        {children}
      </main>

      <nav className="tabbar glass" aria-label={t("Main navigation", "التنقل الرئيسي")}>
        {nav.filter((n) => n.mobile).map((item) => {
          const active = isActive(pathname, item.href);
          const I = item.icon;
          return (
            <Link key={item.href} href={item.href} className={clsx("tab", active && "is-active")} aria-current={active ? "page" : undefined}>
              {active && <motion.span layoutId="tab-active" className="tab-bg" transition={{ type: "spring", stiffness: 520, damping: 40 }} />}
              <I size={22} weight={active ? "fill" : "regular"} aria-hidden="true" />
              <span>{lang === "ar" ? item.ar : item.en.replace("CEO practice", "Practice")}</span>
            </Link>
          );
        })}
      </nav>

      <CommandMenu open={search} onOpenChange={setSearch} />
    </div>
  );
}

const noop = () => () => {};

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <AnimatedOrigin className="loading-mark" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

function SaveIndicator() {
  const { t } = useI18n();
  const { status, mode, retry } = useWorkspace();
  const map = {
    loading: { icon: CloudArrowUp, text: t("Opening…", "جارٍ الفتح…") },
    saving: { icon: CloudArrowUp, text: t("Saving…", "جارٍ الحفظ…") },
    saved: { icon: CloudCheck, text: t("Saved to your account", "محفوظ في حسابك") },
    local: { icon: HardDrives, text: t("Saved on this device", "محفوظ على هذا الجهاز") },
    error: { icon: Warning, text: t("Couldn't save", "تعذّر الحفظ") },
    offline: { icon: CloudSlash, text: t("Offline, will retry", "غير متصل، ستتم إعادة المحاولة") },
    conflict: { icon: Warning, text: t("Newer version elsewhere", "توجد نسخة أحدث") },
  } as const;
  const s = map[status];
  const I = s.icon;
  return (
    <div className={clsx("save-indicator", (status === "error" || status === "conflict") && "is-warning")} role="status" aria-live="polite">
      <I size={16} aria-hidden="true" />
      <span>{s.text}</span>
      {status === "error" && mode === "account" && (
        <button type="button" className="link-btn" onClick={retry}>{t("Retry", "إعادة")}</button>
      )}
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang, t } = useI18n();
  return (
    <button type="button" className="icon-btn icon-btn-plain icon-btn-md lang-toggle" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={t("Switch to Arabic", "التبديل إلى الإنجليزية")} title={t("العربية", "English")}>
      <Translate size={19} aria-hidden="true" className="lang-toggle-icon" />
      <span className="lang-toggle-text" lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "EN" : "ع"}</span>
    </button>
  );
}

function AppearanceMenu() {
  const { theme, setTheme } = useTheme();
  const { t, dir } = useI18n();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const options = [
    { value: "light", label: t("Light", "فاتح"), icon: SunDim },
    { value: "dark", label: t("Dark", "داكن"), icon: Moon },
    { value: "system", label: t("Match system", "حسب النظام"), icon: Desktop },
  ];
  const Current = !mounted ? SunDim : theme === "dark" ? Moon : theme === "light" ? SunDim : Desktop;
  return (
    <DropdownMenu.Root dir={dir}>
      <DropdownMenu.Trigger className="icon-btn icon-btn-plain icon-btn-md" aria-label={t("Appearance", "المظهر")}>
        <Current size={19} aria-hidden="true" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
          <DropdownMenu.Label className="menu-label">{t("Appearance", "المظهر")}</DropdownMenu.Label>
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            {options.map((o) => (
              <DropdownMenu.RadioItem key={o.value} value={o.value} className="menu-item">
                <o.icon size={18} aria-hidden="true" />
                <span>{o.label}</span>
                <DropdownMenu.ItemIndicator className="menu-check"><Check size={14} weight="bold" /></DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function AccountMenu() {
  const { t, dir } = useI18n();
  const { mode, user } = useWorkspace();
  const router = useRouter();
  const initial = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  return (
    <DropdownMenu.Root dir={dir}>
      <DropdownMenu.Trigger className="avatar-btn" aria-label={t("Account", "الحساب")}>
        {mode === "account" ? <span className="avatar">{initial}</span> : <UserCircle size={26} aria-hidden="true" />}
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
          {mode === "account" ? (
            <>
              <div className="menu-identity">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
              </div>
              <DropdownMenu.Separator className="menu-sep" />
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/settings")}><Gear size={18} aria-hidden="true" />{t("Settings", "الإعدادات")}</DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={async () => { await signOut(); router.replace("/"); }}>
                <SignOut size={18} aria-hidden="true" className="flip-rtl" />{t("Sign out", "تسجيل الخروج")}
              </DropdownMenu.Item>
            </>
          ) : (
            <>
              <div className="menu-identity">
                <strong>{t("Practising as a guest", "تتدرّب كضيف")}</strong>
                <span>{t("Progress stays on this device.", "يبقى تقدّمك على هذا الجهاز.")}</span>
              </div>
              <DropdownMenu.Separator className="menu-sep" />
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/sign-up")}><UserCircle size={18} aria-hidden="true" />{t("Create account", "إنشاء حساب")}</DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/sign-in")}><SignOut size={18} aria-hidden="true" className="flip-rtl rotate-180" />{t("Sign in", "تسجيل الدخول")}</DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/settings")}><Gear size={18} aria-hidden="true" />{t("Settings", "الإعدادات")}</DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function GuestBanner() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(() => {
    try { return sessionStorage.getItem("moasis-guest-banner") === "0"; } catch { return false; }
  });
  if (hidden) return null;
  return (
    <div className="banner">
      <HardDrives size={18} aria-hidden="true" />
      <p>{t("You're practising as a guest. Create a free account to keep your work across devices.", "أنت تتدرّب كضيف. أنشئ حساباً مجانياً للاحتفاظ بعملك على كل أجهزتك.")}</p>
      <Link href="/sign-up" className="banner-action">{t("Create account", "إنشاء حساب")}</Link>
      <button type="button" className="link-btn" onClick={() => { setHidden(true); try { sessionStorage.setItem("moasis-guest-banner", "0"); } catch {} }}>{t("Not now", "ليس الآن")}</button>
    </div>
  );
}

function ConflictBanner() {
  const { t } = useI18n();
  const { reloadFromServer } = useWorkspace();
  return (
    <div className="banner is-warning" role="alert">
      <Warning size={18} aria-hidden="true" />
      <p>{t("This workspace was changed on another device. Your latest edit here wasn't saved.", "تم تعديل مساحة العمل من جهاز آخر. لم يُحفظ آخر تعديل هنا.")}</p>
      <button type="button" className="banner-action" onClick={() => void reloadFromServer()}>{t("Load latest", "تحميل الأحدث")}</button>
    </div>
  );
}
