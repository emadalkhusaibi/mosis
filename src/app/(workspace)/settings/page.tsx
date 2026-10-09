"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { DownloadSimple, PencilSimple, SignOut, UploadSimple, Warning } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Money } from "@/components/ui/money";
import { sectorOf } from "@/content/sectors";
import { emptyState } from "@/domain/state";
import { migrate } from "@/domain/migrate";
import { signOut } from "@/lib/auth-client";

export default function SettingsPage() {
  const { t, p, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const ws = useWorkspace();
  const toast = useToast();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const v = ws.state.venture;

  const download = () => {
    const blob = new Blob([JSON.stringify(ws.state, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `moasis-${(v.name || "workspace").replace(/\W+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const restore = async (f: File) => {
    try {
      const next = migrate(JSON.parse(await f.text()));
      if (!next) throw new Error("invalid");
      ws.replace(next);
      toast({ message: t("Backup restored", "تمت استعادة النسخة الاحتياطية") });
    } catch {
      toast({ message: t("That file isn't a Moasis backup.", "هذا الملف ليس نسخة احتياطية من مؤسس.") });
    }
  };

  return (
    <>
      <PageHeader eyebrow={t("Settings", "الإعدادات")} title={t("Your *workspace*", "مساحة *عملك*")} />
      <div className="settings">
        <Panel>
          <PanelHeader title={t("Account", "الحساب")} />
          {ws.mode === "account" ? (
            <div className="settings-row">
              <div className="min-w-0"><strong>{ws.user?.name}</strong><p className="muted small" dir="ltr">{ws.user?.email}</p></div>
              <Button variant="secondary" icon={<SignOut size={18} className="flip-rtl" />} onClick={async () => { await signOut(); router.replace("/"); }}>{t("Sign out", "تسجيل الخروج")}</Button>
            </div>
          ) : (
            <div className="settings-row">
              <p className="muted min-w-0 flex-1">{t("You're practising as a guest. Your work is saved on this device only.", "أنت تتدرّب كضيف. يُحفظ عملك على هذا الجهاز فقط.")}</p>
              <div className="flex gap-2"><Button variant="secondary" href="/sign-in">{t("Sign in", "تسجيل الدخول")}</Button><Button href="/sign-up">{t("Create account", "إنشاء حساب")}</Button></div>
            </div>
          )}
        </Panel>

        <Panel id="business">
          <PanelHeader title={t("Business profile", "ملف المشروع")} action={<Button variant="secondary" size="sm" href="/setup" icon={<PencilSimple size={16} />}>{t("Edit", "تعديل")}</Button>} />
          <dl className="review-list">
            <div><dt>{t("Business", "المشروع")}</dt><dd>{v.name}</dd></div>
            <div><dt>{t("Type", "النوع")}</dt><dd>{v.sector === "other" ? v.other : p(sectorOf(v.sector).name)}</dd></div>
            <div><dt>{t("Location", "الموقع")}</dt><dd>{v.city}</dd></div>
            <div><dt>{t("Founder", "المؤسس")}</dt><dd>{v.founder}</dd></div>
            <div><dt>{t("Practice capital", "رأس المال التدريبي")}</dt><dd><Money value={v.capital} /></dd></div>
          </dl>
        </Panel>

        <Panel>
          <PanelHeader title={t("Language & appearance", "اللغة والمظهر")} />
          <div className="settings-row"><span>{t("Language", "اللغة")}</span><Segmented label={t("Language", "اللغة")} value={lang} onChange={setLang} options={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} /></div>
          <div className="settings-row"><span>{t("Appearance", "المظهر")}</span><Segmented label={t("Appearance", "المظهر")} value={(theme ?? "system") as "light" | "dark" | "system"} onChange={setTheme} options={[{ value: "light", label: t("Light", "فاتح") }, { value: "dark", label: t("Dark", "داكن") }, { value: "system", label: t("System", "النظام") }]} /></div>
        </Panel>

        <Panel>
          <PanelHeader title={t("Your data", "بياناتك")} subtitle={t("Download a full copy any time, or restore one.", "نزّل نسخة كاملة في أي وقت، أو استعد واحدة.")} />
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" icon={<DownloadSimple size={18} />} onClick={download}>{t("Download backup", "تنزيل نسخة احتياطية")}</Button>
            <Button variant="secondary" icon={<UploadSimple size={18} />} onClick={() => file.current?.click()}>{t("Restore backup", "استعادة نسخة احتياطية")}</Button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void restore(f); e.target.value = ""; }} />
            <Button variant="danger" icon={<Warning size={18} />} onClick={() => setConfirmReset(true)}>{t("Start over", "البدء من جديد")}</Button>
          </div>
          <p className="muted small mt-3">{t("Backups from the earlier Moasis apps can be restored here too.", "يمكن أيضاً استعادة النسخ الاحتياطية من تطبيقات مؤسس السابقة هنا.")}</p>
        </Panel>
      </div>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset} size="sm" title={t("Start over?", "البدء من جديد؟")} description={t("This clears your plan, wallet, lessons and decisions. Download a backup first if you might want them.", "سيؤدي هذا إلى مسح خطتك ومحفظتك ودروسك وقراراتك. نزّل نسخة احتياطية أولاً إن كنت قد تحتاجها.")}
        footer={<><Button variant="secondary" onClick={() => setConfirmReset(false)}>{t("Cancel", "إلغاء")}</Button><Button variant="danger" onClick={() => { ws.replace(emptyState()); setConfirmReset(false); router.replace("/setup"); }}>{t("Clear everything", "مسح كل شيء")}</Button></>}>
        <span />
      </Sheet>
    </>
  );
}
