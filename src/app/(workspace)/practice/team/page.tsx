"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Plus, UserCircle } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, MoneyInput } from "@/components/ui/field";
import { Origin } from "@/components/ui/origin";
import { available, newId } from "@/domain/state";
import { toBaisa, type Baisa } from "@/lib/money";

export default function TeamPage() {
  const { t } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [release, setRelease] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState<Baisa | null>(toBaisa(350));
  const [error, setError] = useState<string | null>(null);
  const payroll = state.team.reduce((a, m) => a + m.salary, 0);
  const releasing = state.team.find((m) => m.id === release);

  const hire = () => {
    if (!name.trim() || !role.trim()) return setError(t("Add a name and a role.", "أضف اسماً ودوراً."));
    if (salary === null || salary <= 0) return setError(t("Enter a monthly salary.", "أدخل راتباً شهرياً."));
    if (salary > available(state)) return setError(t("One month's salary is more than your available funds.", "راتب شهر واحد يتجاوز أموالك المتاحة."));
    const ok = update((s) => ({
      ...s,
      team: [...s.team, { id: newId(), name: name.trim(), role: role.trim(), salary }],
      finance: { ...s.finance, fixed: s.finance.fixed + salary },
      entries: [{ id: newId(), title: t(`First month salary · ${name.trim()}`, `راتب الشهر الأول · ${name.trim()}`), amount: -salary, category: "people", date: new Date().toISOString() }, ...s.entries],
    }));
    if (!ok) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    toast({ message: t(`${name.trim()} joined your practice team`, `انضم ${name.trim()} إلى فريقك التدريبي`) });
    setAdding(false); setName(""); setRole(""); setError(null);
  };

  return (
    <>
      <nav className="crumbs"><Link href="/practice"><ArrowLeft size={15} className="flip-rtl" />{t("CEO practice", "تدريب القيادة")}</Link></nav>
      <header className="page-header">
        <div className="min-w-0">
          <p className="eyebrow">{t("Practice team", "الفريق التدريبي")}</p>
          <h1 className="page-title">{t("Design the team before you hire it.", "صمّم الفريق قبل أن توظّفه.")}</h1>
          <p className="page-description">{t("Fictional roles only. Adding one records a month of salary and raises your forecast's fixed costs. No real employment is created.", "أدوار افتراضية فقط. إضافة دور تسجّل راتب شهر وترفع التكاليف الثابتة في التوقعات. لا يُنشأ توظيف حقيقي.")}</p>
        </div>
        <div className="page-action"><Button icon={<Plus size={18} weight="bold" />} onClick={() => setAdding(true)}>{t("Add role", "إضافة دور")}</Button></div>
      </header>

      <div className="grid-dash">
        <Panel className="span-12 md-span-8">
          <PanelHeader title={t("Roles", "الأدوار")} subtitle={t(`${state.team.length} people`, `${state.team.length} أشخاص`)} />
          {state.team.length ? (
            <ul className="list">
              {state.team.map((m) => (
                <li key={m.id} className="row">
                  <span className="row-icon"><UserCircle size={20} /></span>
                  <span className="row-main"><span className="row-title">{m.name}</span><span className="row-sub">{m.role}</span></span>
                  <span className="row-end"><Money value={m.salary} /><Button variant="ghost" size="sm" onClick={() => setRelease(m.id)}>{t("Remove", "إزالة")}</Button></span>
                </li>
              ))}
            </ul>
          ) : <div className="empty"><Origin className="empty-mark" /><p>{t("No roles yet. Start with the one job you can't do yourself.", "لا أدوار بعد. ابدأ بالمهمة التي لا تستطيع أداءها بنفسك.")}</p></div>}
        </Panel>
        <Panel className="span-12 md-span-4">
          <span className="stat-label">{t("Monthly payroll", "الرواتب الشهرية")}</span>
          <p className="stat-value"><Money value={payroll} /></p>
          <p className="stat-note">{state.finance.fixed > 0 ? t(`${Math.round((payroll / state.finance.fixed) * 100)}% of your monthly fixed costs`, `${Math.round((payroll / state.finance.fixed) * 100)}٪ من تكاليفك الثابتة الشهرية`) : ""}</p>
          <Link href="/forecast" className="tile-link mt-3 -ms-2.5">{t("See the forecast impact", "شاهد الأثر على التوقعات")}</Link>
        </Panel>
      </div>

      <Sheet open={adding} onOpenChange={(o) => { setAdding(o); setError(null); }} title={t("Add a practice role", "إضافة دور تدريبي")} description={<>{t("Available to spend", "المتاح للإنفاق")}: <Money value={available(state)} /></>}
        footer={<><Button variant="secondary" onClick={() => setAdding(false)}>{t("Cancel", "إلغاء")}</Button><Button onClick={hire}>{t("Add role & record salary", "إضافة الدور وتسجيل الراتب")}</Button></>}>
        <form className="sheet-form" onSubmit={(e) => { e.preventDefault(); hire(); }}>
          <Field label={t("Name", "الاسم")}>{(f) => <Input id={f.id} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus placeholder={t("A fictional name", "اسم افتراضي")} />}</Field>
          <Field label={t("Role", "الدور")}>{(f) => <Input id={f.id} value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder={t("e.g. Barista, weekday mornings", "مثال: باريستا، صباحات أيام الأسبوع")} />}</Field>
          <Field label={t("Monthly salary", "الراتب الشهري")}>{(f) => <MoneyInput id={f.id} value={salary} onChange={setSalary} />}</Field>
          {error && <p className="field-error" role="alert">{error}</p>}
          <button type="submit" hidden />
        </form>
      </Sheet>

      <Sheet open={Boolean(releasing)} onOpenChange={(o) => !o && setRelease(null)} size="sm" title={t("Remove this role?", "إزالة هذا الدور؟")}
        description={t("Future fixed costs go down. Past salary entries stay in your wallet.", "تنخفض التكاليف الثابتة المستقبلية. تبقى رواتب الأشهر السابقة في محفظتك.")}
        footer={<><Button variant="secondary" onClick={() => setRelease(null)}>{t("Keep", "إبقاء")}</Button><Button variant="danger" onClick={() => { if (releasing) update((s) => ({ ...s, team: s.team.filter((m) => m.id !== releasing.id), finance: { ...s.finance, fixed: Math.max(0, s.finance.fixed - releasing.salary) } })); setRelease(null); }}>{t("Remove role", "إزالة الدور")}</Button></>}>
        <p>{releasing?.name} · {releasing?.role}</p>
      </Sheet>
    </>
  );
}
