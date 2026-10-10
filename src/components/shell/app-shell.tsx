"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { DropdownMenu } from "radix-ui";
import { useTheme } from "next-themes";
import {
  ArrowsClockwise, CloudCheck, CloudSlash, Desktop, DotsNine, Gear, HardDrives, MagnifyingGlass, Moon, SignOut, SunDim, UserCircle, Warning, Check, X,
} from "@phosphor-icons/react";
import { Wordmark, Origin } from "@/components/ui/origin";
import { SectorIcon } from "@/components/ui/icons";
import { Sheet } from "@/components/ui/sheet";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { sectorOf } from "@/content/sectors";
import { signOut } from "@/lib/auth-client";
import { primaryNav, workspaceNav, isActive } from "./nav";
import { CommandMenu } from "./command-menu";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, lang } = useI18n();
  const ws = useWorkspace();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);

  // First-run founders see the welcome page; everyone else lands in their workspace.
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

  // Close the workspace menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (menu) setMenu(false);
  }

  if (!ws.ready) return <LoadingScreen />;
  if (pathname === "/setup") return <main id="main">{children}</main>;

  const sector = sectorOf(ws.state.venture.sector);
  const label = (n: { en: string; ar: string }) => (lang === "ar" ? n.ar : n.en);

  return (
    <div className="app-shell">
      <a href="#main" className="skip-link">{t("Skip to content", "انتقل إلى المحتوى")}</a>

      <aside className="app-sidebar" aria-label={t("Workspace", "مساحة العمل")}>
        <Link href="/" className="sidebar-brand" aria-label={t("Moasis, Today", "مؤسس، اليوم")}>
          <Wordmark />
        </Link>
        <nav aria-label={t("Main", "الرئيسية")} className="sidebar-nav">
          {primaryNav.map((item) => <SideLink key={item.href} item={item} label={label(item)} active={isActive(pathname, item.href)} />)}
        </nav>
        <nav aria-label={t("Workspace tools", "أدوات مساحة العمل")} className="sidebar-nav sidebar-group">
          <p className="sidebar-group-label">{t("Workspace", "مساحة العمل")}</p>
          {workspaceNav.filter((n) => n.href !== "/settings").map((item) => <SideLink key={item.href} item={item} label={label(item)} active={isActive(pathname, item.href)} />)}
        </nav>
        <div className="sidebar-foot">
          <SideLink item={workspaceNav[3]} label={label(workspaceNav[3])} active={pathname === "/settings"} />
          <div className="px-3 pt-2"><StorageStatus /></div>
        </div>
      </aside>

      <div className="app-column">
        <header className="app-topbar">
          <Link href="/" className="topbar-mark" aria-label={t("Moasis, Today", "مؤسس، اليوم")}>
            <Origin className="h-6 w-6" />
          </Link>
          <Link href="/settings#business" className="venture-chip" title={t("Edit business", "تعديل المشروع")}>
            <span className="venture-chip-icon"><SectorIcon name={sector.icon} size={16} /></span>
            <bdi className="venture-chip-name">{ws.state.venture.name || t("Your business", "مشروعك")}</bdi>
            <span className="venture-chip-city">{ws.state.venture.city}</span>
          </Link>
          <div className="topbar-actions">
            <button type="button" className="search-trigger" onClick={() => setSearch(true)} aria-label={t("Search", "بحث")} aria-keyshortcuts="Control+K Meta+K">
              <MagnifyingGlass size={18} aria-hidden="true" />
              <span className="search-trigger-text">{t("Search", "بحث")}</span>
              <kbd className="search-trigger-kbd">⌘K</kbd>
            </button>
            <LanguageToggle />
            <AppearanceMenu />
            <AccountMenu />
            <button type="button" className="btn btn-ghost btn-sm topbar-menu-btn" aria-haspopup="dialog" aria-expanded={menu} onClick={() => setMenu(true)}>
              <DotsNine size={18} aria-hidden="true" />
              <span>{t("Menu", "القائمة")}</span>
            </button>
          </div>
        </header>

        <main id="main" className="app-main" tabIndex={-1}>
          <div className="content-width">
            {ws.status === "conflict" && <ConflictNotice />}
            {ws.status === "error" && <SaveErrorNotice />}
            {children}
          </div>
        </main>
      </div>

      <nav className="mobile-nav" aria-label={t("Main", "الرئيسية")}>
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href);
          const I = item.icon;
          return (
            <Link key={item.href} href={item.href} className="mobile-tab" aria-current={active ? "page" : undefined}>
              <I size={22} weight={active ? "fill" : "regular"} aria-hidden="true" />
              <span>{label(item)}</span>
            </Link>
          );
        })}
      </nav>

      <Sheet open={menu} onOpenChange={setMenu} title={t("Workspace", "مساحة العمل")} size="sm">
        <nav className="workspace-menu" aria-label={t("Workspace tools", "أدوات مساحة العمل")}>
          {workspaceNav.map((item) => {
            const I = item.icon;
            return (
              <Link key={item.href} href={item.href} aria-current={isActive(pathname, item.href) ? "page" : undefined}>
                <I size={20} aria-hidden="true" />
                <span className="flex flex-col">
                  <span>{label(item)}</span>
                  <span className="workspace-menu-sub">{lang === "ar" ? item.descAr : item.descEn}</span>
                </span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4"><StorageStatus /></div>
      </Sheet>

      <CommandMenu open={search} onOpenChange={setSearch} />
    </div>
  );
}

function SideLink({ item, label, active }: { item: (typeof primaryNav)[number]; label: string; active: boolean }) {
  const I = item.icon;
  return (
    <Link href={item.href} className="side-link" aria-current={active ? "page" : undefined}>
      <I size={20} weight={active ? "fill" : "regular"} aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

const noop = () => () => {};

function LoadingScreen() {
  return (
    <div className="loading-screen" role="status" aria-live="polite">
      <Origin className="loading-mark" />
      <span className="sr-only">Loading</span>
    </div>
  );
}

const GUEST_NOTE_KEY = "moasis-guest-note-dismissed";

/**
 * Where work is saved, stated precisely. Guests are told their work stays on
 * this device; the offer to save across devices is quiet and remembers dismissal.
 */
export function StorageStatus() {
  const { t } = useI18n();
  const { status, mode, retry } = useWorkspace();
  const dismissed = useSyncExternalStore(noop, () => { try { return localStorage.getItem(GUEST_NOTE_KEY) === "1"; } catch { return false; } }, () => true);
  const [hide, setHide] = useState(false);
  const map = {
    loading: { icon: ArrowsClockwise, text: t("Opening…", "جارٍ الفتح…") },
    saving: { icon: ArrowsClockwise, text: t("Saving…", "جارٍ الحفظ…") },
    saved: { icon: CloudCheck, text: t("Saved to your account", "محفوظ في حسابك") },
    local: { icon: HardDrives, text: t("Saved on this device", "محفوظ على هذا الجهاز") },
    error: { icon: Warning, text: t("Couldn't save", "تعذّر الحفظ") },
    offline: { icon: CloudSlash, text: t("Offline, will retry", "غير متصل، ستتم إعادة المحاولة") },
    conflict: { icon: Warning, text: t("Newer version elsewhere", "توجد نسخة أحدث") },
  } as const;
  const s = map[status];
  const I = s.icon;
  return (
    <div className="stack-sm">
      <p className={`save-status${status === "error" || status === "conflict" ? " is-error" : ""}`} role="status">
        <I size={16} aria-hidden="true" />
        <span>{s.text}</span>
        {status === "error" && mode === "account" && <button type="button" className="link" onClick={retry}>{t("Retry", "إعادة")}</button>}
      </p>
      {mode === "guest" && !dismissed && !hide && (
        <p className="small muted flex items-start gap-1">
          <span>
            <Link href="/sign-up" className="link">{t("Save across devices", "احفظ عبر الأجهزة")}</Link>{" "}
            {t("with a free account.", "بحساب مجاني.")}
          </span>
          <button type="button" className="icon-btn icon-btn-sm -my-2" aria-label={t("Dismiss", "إخفاء")} onClick={() => { setHide(true); try { localStorage.setItem(GUEST_NOTE_KEY, "1"); } catch {} }}>
            <X size={14} />
          </button>
        </p>
      )}
    </div>
  );
}

function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button type="button" className="icon-btn lang-btn" onClick={() => setLang(lang === "ar" ? "en" : "ar")} aria-label={lang === "ar" ? "Switch to English" : "التبديل إلى العربية"}>
      <span lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "EN" : "عربي"}</span>
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
      <DropdownMenu.Trigger className="icon-btn" aria-label={t("Appearance", "المظهر")}>
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
      <DropdownMenu.Trigger className="icon-btn" aria-label={t("Account", "الحساب")}>
        {mode === "account" ? <span className="avatar">{initial}</span> : <UserCircle size={24} aria-hidden="true" />}
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
              <DropdownMenu.Item className="menu-item" onSelect={async () => { await signOut(); router.replace("/welcome"); }}>
                <SignOut size={18} aria-hidden="true" className="flip-rtl" />{t("Sign out", "تسجيل الخروج")}
              </DropdownMenu.Item>
            </>
          ) : (
            <>
              <div className="menu-identity">
                <strong>{t("Practising as a guest", "تتدرّب كضيف")}</strong>
                <span>{t("Your work is stored on this device only.", "عملك محفوظ على هذا الجهاز فقط.")}</span>
              </div>
              <DropdownMenu.Separator className="menu-sep" />
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/sign-up")}><UserCircle size={18} aria-hidden="true" />{t("Create account", "إنشاء حساب")}</DropdownMenu.Item>
              <DropdownMenu.Item className="menu-item" onSelect={() => router.push("/sign-in")}><SignOut size={18} aria-hidden="true" className="flip-rtl rotate-180" />{t("Sign in", "تسجيل الدخول")}</DropdownMenu.Item>
            </>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function ConflictNotice() {
  const { t } = useI18n();
  const { reloadFromServer } = useWorkspace();
  return (
    <div className="notice notice-warning" role="alert">
      <Warning size={18} aria-hidden="true" />
      <p>{t("This workspace was changed on another device, so your latest edit here wasn't saved.", "تم تعديل مساحة العمل من جهاز آخر، لذا لم يُحفظ آخر تعديل هنا.")}</p>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => void reloadFromServer()}>{t("Load latest", "تحميل الأحدث")}</button>
    </div>
  );
}

function SaveErrorNotice() {
  const { t } = useI18n();
  const { mode, retry } = useWorkspace();
  return (
    <div className="notice notice-danger" role="alert">
      <Warning size={18} aria-hidden="true" />
      <p>
        {mode === "guest"
          ? t("This browser refused to save your latest change (storage may be full or blocked). Your edits are still on screen; download a backup in Settings before closing.", "رفض هذا المتصفح حفظ آخر تغيير (قد تكون مساحة التخزين ممتلئة أو محظورة). تعديلاتك ما زالت على الشاشة؛ نزّل نسخة احتياطية من الإعدادات قبل الإغلاق.")
          : t("Your latest change couldn't reach your account. It's still on screen.", "تعذّر وصول آخر تغيير إلى حسابك. ما زال ظاهراً على الشاشة.")}
      </p>
      {mode === "account" && <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>{t("Retry", "إعادة المحاولة")}</button>}
    </div>
  );
}
