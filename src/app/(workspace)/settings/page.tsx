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
import { emptyState, type State } from "@/domain/state";
import { migrate } from "@/domain/migrate";
import { signOut } from "@/lib/auth-client";
import { accountsEnabled } from "@/lib/features";

const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const PRE_RESTORE_KEY = "moasis-before-restore";

function backupName(s: State) {
  return `moasis-${(s.venture.name || "workspace").replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
}
function downloadJson(s: State, name = backupName(s)) {
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: name });
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function SettingsPage() {
  const { t, p, lang, setLang } = useI18n();
  const { theme, setTheme } = useTheme();
  const ws = useWorkspace();
  const toast = useToast();
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [incoming, setIncoming] = useState<State | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const v = ws.state.venture;

  const readBackup = async (f: File) => {
    setRestoreError(null);
    if (f.size > MAX_BACKUP_BYTES) return setRestoreError(t("That file is larger than 5 MB, so it isn't a Moasis backup.", "حجم الملف أكبر من ٥ ميغابايت، لذا ليس نسخة احتياطية من مؤسس."));
    if (!/\.json$/i.test(f.name) && f.type !== "application/json") return setRestoreError(t("Choose a .json backup file.", "اختر ملف نسخة احتياطية بصيغة ‎.json."));
    try {
      const next = migrate(JSON.parse(await f.text()));
      if (!next) throw new Error("invalid");
      setIncoming(next);
    } catch {
      setRestoreError(t("That file couldn't be read as a Moasis backup. Nothing was changed.", "تعذّرت قراءة الملف كنسخة احتياطية من مؤسس. لم يتغيّر شيء."));
    }
  };

  const applyRestore = () => {
    if (!incoming) return;
    // Keep the current workspace before replacing it.
    try { localStorage.setItem(PRE_RESTORE_KEY, JSON.stringify(ws.state)); } catch {}
    downloadJson(ws.state, `before-restore-${backupName(ws.state)}`);
    ws.replace(incoming);
    setIncoming(null);
    toast({ message: t("Backup restored. A copy of your previous workspace was downloaded.", "تمت الاستعادة. نُزّلت نسخة من مساحة عملك السابقة.") });
  };

  return (
    <>
      <PageHeader title={t("Settings", "الإعدادات")} />
      <div className="settings">
        <Panel aria-labelledby="account-title">
          <PanelHeader id="account-title" title={t("Account", "الحساب")} />
          {ws.mode === "account" ? (
            <div className="settings-row">
              <div className="settings-row-text"><strong><bdi>{ws.user?.name}</bdi></strong><p className="field-hint" dir="ltr">{ws.user?.email}</p><p className="field-hint">{t("Your workspace is saved to this account.", "مساحة عملك محفوظة في هذا الحساب.")}</p></div>
              <Button variant="secondary" icon={<SignOut size={18} className="flip-rtl" />} onClick={async () => { await signOut(); router.replace("/"); }}>{t("Sign out", "تسجيل الخروج")}</Button>
            </div>
          ) : (
            <div className="settings-row">
              <p className="settings-row-text secondary">{accountsEnabled ? t("You're practising as a guest. Your work is saved in this browser only.", "أنت تتدرّب كضيف. يُحفظ عملك في هذا المتصفح فقط.") : t("Your work is saved in this browser. To move it to another device, download a backup below and restore it there.", "يُحفظ عملك في هذا المتصفح. لنقله إلى جهاز آخر، نزّل نسخة احتياطية أدناه واستعدها هناك.")}</p>
              {accountsEnabled && <div className="cluster"><Button variant="secondary" href="/sign-in">{t("Sign in", "تسجيل الدخول")}</Button><Button href="/sign-up">{t("Create account", "إنشاء حساب")}</Button></div>}
            </div>
          )}
        </Panel>

        <Panel id="business" aria-labelledby="business-title">
          <PanelHeader id="business-title" title={t("Business", "المشروع")} action={<Button variant="secondary" size="sm" href="/setup" icon={<PencilSimple size={16} />}>{t("Edit profile", "تعديل الملف")}</Button>} />
          <dl className="balance-list">
            <div><dt>{t("Business", "المشروع")}</dt><dd><bdi>{v.name}</bdi></dd></div>
            <div><dt>{t("Type", "النوع")}</dt><dd>{v.sector === "other" ? v.other : p(sectorOf(v.sector).name)}</dd></div>
            <div><dt>{t("Location", "الموقع")}</dt><dd><bdi>{v.city}</bdi></dd></div>
            <div><dt>{t("Founder", "المؤسس")}</dt><dd><bdi>{v.founder}</bdi></dd></div>
            <div><dt>{t("Practice capital", "رأس المال التدريبي")}</dt><dd><Money value={v.capital} /></dd></div>
          </dl>
          <p className="field-hint">{t("Editing the profile doesn't change your wallet history, reserve or forecast.", "تعديل الملف لا يغيّر سجل المحفظة أو الاحتياطي أو التوقعات.")}</p>
        </Panel>

        <Panel aria-labelledby="prefs-title">
          <PanelHeader id="prefs-title" title={t("Language and appearance", "اللغة والمظهر")} />
          <div className="settings-row"><span>{t("Language", "اللغة")}</span><Segmented label={t("Language", "اللغة")} value={lang} onChange={setLang} options={[{ value: "en", label: "English" }, { value: "ar", label: "العربية" }]} /></div>
          <div className="settings-row"><span>{t("Appearance", "المظهر")}</span><Segmented label={t("Appearance", "المظهر")} value={(theme ?? "system") as "light" | "dark" | "system"} onChange={setTheme} options={[{ value: "light", label: t("Light", "فاتح") }, { value: "dark", label: t("Dark", "داكن") }, { value: "system", label: t("System", "النظام") }]} /></div>
          <p className="field-hint">{t("Both are remembered in this browser.", "يُحفظ الخياران في هذا المتصفح.")}</p>
        </Panel>

        <Panel aria-labelledby="data-title">
          <PanelHeader id="data-title" title={t("Your data", "بياناتك")} subtitle={t("Download a full copy any time, or restore one. Older Moasis backups work too.", "نزّل نسخة كاملة في أي وقت، أو استعد واحدة. تعمل النسخ القديمة من مؤسس أيضاً.")} />
          <div className="cluster">
            <Button variant="secondary" icon={<DownloadSimple size={18} />} onClick={() => downloadJson(ws.state)}>{t("Download backup", "تنزيل نسخة احتياطية")}</Button>
            <Button variant="secondary" icon={<UploadSimple size={18} />} onClick={() => file.current?.click()}>{t("Restore from file", "استعادة من ملف")}</Button>
            <input ref={file} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) void readBackup(f); e.target.value = ""; }} />
          </div>
          {restoreError && <p className="notice notice-danger settings-notice" role="alert">{restoreError}</p>}
        </Panel>

        <Panel className="danger-zone" aria-labelledby="danger-title">
          <PanelHeader id="danger-title" title={t("Start over", "البدء من جديد")} subtitle={t("Deletes your business profile, plan answers, wallet history, forecast, lessons, decisions, team and consultant records from this workspace. It can't be undone.", "يحذف ملف المشروع وإجابات الخطة وسجل المحفظة والتوقعات والدروس والقرارات والفريق وسجلات الاستشارة من مساحة العمل هذه. لا يمكن التراجع عنه.")} />
          <Button variant="danger-quiet" icon={<Warning size={18} />} onClick={() => { setUnderstood(false); setConfirmReset(true); }}>{t("Start over…", "البدء من جديد…")}</Button>
        </Panel>
      </div>

      <Sheet open={Boolean(incoming)} onOpenChange={(o) => !o && setIncoming(null)} size="sm" title={t("Restore this backup?", "استعادة هذه النسخة؟")}
        description={t("It replaces everything in this workspace. A copy of the current workspace is downloaded first.", "ستستبدل كل ما في مساحة العمل هذه. تُنزَّل نسخة من مساحة العمل الحالية أولاً.")}
        footer={<><Button variant="secondary" onClick={() => setIncoming(null)}>{t("Cancel", "إلغاء")}</Button><Button onClick={applyRestore}>{t("Replace and restore", "استبدال واستعادة")}</Button></>}>
        {incoming && (
          <dl className="balance-list">
            <div><dt>{t("Business", "المشروع")}</dt><dd><bdi>{incoming.venture.name || "—"}</bdi></dd></div>
            <div><dt>{t("Plan answers", "إجابات الخطة")}</dt><dd>{Object.values(incoming.answers).filter((a) => a.trim()).length}</dd></div>
            <div><dt>{t("Wallet entries", "حركات المحفظة")}</dt><dd>{incoming.entries.length}</dd></div>
            <div><dt>{t("Decisions", "القرارات")}</dt><dd>{incoming.decisions.length}</dd></div>
            <div><dt>{t("Lessons completed", "الدروس المكتملة")}</dt><dd>{incoming.learning.completed.length}</dd></div>
          </dl>
        )}
      </Sheet>

      <Sheet open={confirmReset} onOpenChange={setConfirmReset} size="sm" title={t("Delete everything and start over?", "حذف كل شيء والبدء من جديد؟")}
        description={t("Download a backup first if you might want any of it.", "نزّل نسخة احتياطية أولاً إن كنت قد تحتاج أي شيء منها.")}
        footer={<><Button variant="secondary" onClick={() => setConfirmReset(false)}>{t("Cancel", "إلغاء")}</Button><Button variant="danger" disabled={!understood} onClick={() => { ws.replace(emptyState()); setConfirmReset(false); router.replace("/setup"); }}>{t("Delete everything", "حذف كل شيء")}</Button></>}>
        <div className="form-stack">
          <Button variant="secondary" icon={<DownloadSimple size={18} />} onClick={() => downloadJson(ws.state)}>{t("Download backup", "تنزيل نسخة احتياطية")}</Button>
          <label className="switch-label"><input type="checkbox" className="task-check" checked={understood} onChange={(e) => setUnderstood(e.target.checked)} />{t(`I understand this deletes ${v.name || "this workspace"} and can't be undone.`, `أفهم أن هذا يحذف ${v.name || "مساحة العمل هذه"} ولا يمكن التراجع عنه.`)}</label>
        </div>
      </Sheet>
    </>
  );
}
