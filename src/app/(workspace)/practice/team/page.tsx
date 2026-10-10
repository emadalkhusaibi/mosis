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
import { moneyErrorText, type MoneyError } from "@/lib/money";
import { available, newId } from "@/domain/state";
import { toBaisa, type Baisa } from "@/lib/money";
import { PageHeader } from "@/components/ui/panel";

export default function TeamPage() {
  const { t } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [adding, setAdding] = useState(false);
  const [release, setRelease] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [salary, setSalary] = useState<Baisa | null>(toBaisa(350));
  const [salaryErr, setSalaryErr] = useState<MoneyError | null>(null);
  const [error, setError] = useState<string | null>(null);
  const payroll = state.team.reduce((a, m) => a + m.salary, 0);
  const releasing = state.team.find((m) => m.id === release);

  const hire = () => {
    if (!name.trim() || !role.trim()) return setError(t("Add a name and a role.", "أضف اسماً ودوراً."));
    if (salaryErr) return setError(moneyErrorText(salaryErr, t));
    if (salary === null || salary <= 0) return setError(t("Enter a monthly salary.", "أدخل راتباً شهرياً."));
    if (salary > available(state)) return setError(t("One month's salary is more than your available funds.", "راتب شهر واحد يتجاوز أموالك المتاحة."));
    const roleId = newId();
    // Payroll is derived from the team: the role raises forecast fixed costs, and its
    // current month is paid now as one linked wallet entry.
    const ok = update((s) => ({
      ...s,
      team: [...s.team, { id: roleId, name: name.trim(), role: role.trim(), salary }],
      finance: { ...s.finance, fixed: s.finance.fixed + salary },
      entries: [{ id: newId(), title: t(`Salary, current month · ${name.trim()}`, `راتب الشهر الحالي · ${name.trim()}`), amount: -salary, category: "people", date: new Date().toISOString(), source: "payroll", sourceId: roleId }, ...s.entries],
    }));
    if (!ok) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    toast({ message: t(`${name.trim()} joined your practice team`, `انضم ${name.trim()} إلى فريقك التدريبي`) });
    setAdding(false); setName(""); setRole(""); setError(null);
  };

  return (
    <>
      <nav className="crumbs" aria-label={t("Breadcrumb", "مسار التنقل")}><Link href="/practice" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Practice", "التدريب")}</Link></nav>
      <PageHeader
        title={t("Practice team", "الفريق التدريبي")}
        description={t("Fictional roles only. No real employment is created.", "أدوار افتراضية فقط. لا يُنشأ توظيف حقيقي.")}
        action={<Button icon={<Plus size={18} weight="bold" />} onClick={() => setAdding(true)}>{t("Add role", "إضافة دور")}</Button>}
      />

      <div className="grid-12">
        <Panel className="col-lg-8">
          <PanelHeader title={t("Roles", "الأدوار")} subtitle={t(`${state.team.length} people`, `${state.team.length} أشخاص`)} />
          {state.team.length ? (
            <ul className="list">
              {state.team.map((m) => (
                <li key={m.id} className="row">
                  <span className="row-icon"><UserCircle size={20} aria-hidden="true" /></span>
                  <span className="row-main"><span className="row-title"><bdi>{m.name}</bdi></span><span className="row-sub"><bdi>{m.role}</bdi></span></span>
                  <span className="row-end"><Money value={m.salary} /><Button variant="ghost" size="sm" onClick={() => setRelease(m.id)}>{t("Remove", "إزالة")}<span className="sr-only"> {m.name}</span></Button></span>
                </li>
              ))}
            </ul>
          ) : <div className="empty"><p className="empty-title">{t("No roles yet", "لا أدوار بعد")}</p><p>{t("Start with the one job you can't do yourself.", "ابدأ بالمهمة التي لا تستطيع أداءها بنفسك.")}</p></div>}
        </Panel>
        <Panel className="col-lg-4">
          <div className="stat">
            <span className="stat-label">{t("Planned monthly payroll", "الرواتب الشهرية المخططة")}</span>
            <span className="stat-value"><Money value={payroll} /></span>
            {state.finance.fixed > 0 && <span className="stat-note">{t(`${Math.round((payroll / state.finance.fixed) * 100)}% of monthly fixed costs`, `${Math.round((payroll / state.finance.fixed) * 100)}٪ من التكاليف الثابتة الشهرية`)}</span>}
          </div>
          <div className="prose team-timing">
            <h3>{t("How payroll is counted", "كيف تُحتسب الرواتب")}</h3>
            <p>{t("Adding a role pays its current month now, as one wallet entry, and adds the salary to forecast fixed costs. The forecast's month 1 is next month, so the same month isn't paid twice.", "إضافة دور تدفع شهره الحالي الآن كحركة واحدة في المحفظة، وتضيف الراتب إلى التكاليف الثابتة في التوقعات. الشهر الأول في التوقعات هو الشهر القادم، فلا يُدفع الشهر نفسه مرتين.")}</p>
            <p>{t("Removing a role lowers future costs. Past salary entries stay in the wallet.", "إزالة دور تخفّض التكاليف المستقبلية. تبقى حركات الرواتب السابقة في المحفظة.")}</p>
          </div>
          <Link href="/forecast" className="link small">{t("See the forecast impact", "شاهد الأثر على التوقعات")}</Link>
        </Panel>
      </div>

      <Sheet open={adding} onOpenChange={(o) => { setAdding(o); setError(null); }} title={t("Add a practice role", "إضافة دور تدريبي")} description={<>{t("Available to spend", "المتاح للإنفاق")}: <Money value={available(state)} /></>}
        footer={<><Button variant="secondary" onClick={() => setAdding(false)}>{t("Cancel", "إلغاء")}</Button><Button onClick={hire}>{t("Add role & record salary", "إضافة الدور وتسجيل الراتب")}</Button></>}>
        <form className="form-stack" onSubmit={(e) => { e.preventDefault(); hire(); }}>
          <Field label={t("Name", "الاسم")}>{(f) => <Input id={f.id} value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus placeholder={t("A fictional name", "اسم افتراضي")} />}</Field>
          <Field label={t("Role", "الدور")}>{(f) => <Input id={f.id} value={role} onChange={(e) => setRole(e.target.value)} maxLength={120} placeholder={t("e.g. Barista, weekday mornings", "مثال: باريستا، صباحات أيام الأسبوع")} />}</Field>
          <Field label={t("Monthly salary", "الراتب الشهري")}>{(f) => <MoneyInput id={f.id} value={salary} onChange={(b, _r, e) => { setSalary(b); setSalaryErr(e); setError(null); }} />}</Field>
          {error && <p className="notice notice-danger" role="alert">{error}</p>}
          <button type="submit" hidden />
        </form>
      </Sheet>

      <Sheet open={Boolean(releasing)} onOpenChange={(o) => !o && setRelease(null)} size="sm" title={t("Remove this role?", "إزالة هذا الدور؟")}
        description={t("Future fixed costs go down. Past salary entries stay in your wallet.", "تنخفض التكاليف الثابتة المستقبلية. تبقى رواتب الأشهر السابقة في محفظتك.")}
        footer={<><Button variant="secondary" onClick={() => setRelease(null)}>{t("Keep", "إبقاء")}</Button><Button variant="danger" onClick={() => { if (releasing) update((s) => ({ ...s, team: s.team.filter((m) => m.id !== releasing.id), finance: { ...s.finance, fixed: Math.max(0, s.finance.fixed - releasing.salary) } })); setRelease(null); }}>{t("Remove role", "إزالة الدور")}</Button></>}>
        <p><bdi>{releasing?.name}</bdi> · <bdi>{releasing?.role}</bdi></p>
      </Sheet>
    </>
  );
}
