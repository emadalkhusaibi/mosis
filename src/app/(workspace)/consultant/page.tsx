"use client";
import { useMemo, useState } from "react";
import { CalendarBlank, Check, Lock, MagnifyingGlass, Plus, Trash, UserCircle } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, TextArea } from "@/components/ui/field";
import { Segmented } from "@/components/ui/segmented";
import { sectors } from "@/content/sectors";
import { newId, type State } from "@/domain/state";
import { planProgress } from "@/domain/progress";

type Client = State["clients"][number];
const blank = (): Client => ({ id: newId(), name: "", business: "", sector: "cafe", stage: "exploring", email: "", notes: "", review: "", evidence: 3, economics: 3, operations: 3, reviewed: false });

export default function ConsultantPage() {
  const { t, p, date } = useI18n();
  const ws = useWorkspace();
  const { state, update } = ws;
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "reviewed">("all");
  const [editing, setEditing] = useState<Client | null>(null);
  const [selected, setSelected] = useState<string | null>(state.clients[0]?.id ?? null);
  const [agenda, setAgenda] = useState("");
  const [when, setWhen] = useState("");

  const clients = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return state.clients.filter((c) => (filter === "all" || (filter === "reviewed" ? c.reviewed : !c.reviewed)) && (!needle || `${c.name} ${c.business}`.toLocaleLowerCase().includes(needle)));
  }, [state.clients, q, filter]);
  const current = state.clients.find((c) => c.id === selected) ?? null;
  const sessions = state.sessions.filter((s) => s.clientId === current?.id).sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = state.sessions.filter((s) => !s.done).length;

  const save = (c: Client) => {
    if (!c.name.trim()) return;
    update((s) => ({ ...s, clients: s.clients.some((x) => x.id === c.id) ? s.clients.map((x) => (x.id === c.id ? c : x)) : [...s.clients, c] }));
    setSelected(c.id);
    setEditing(null);
  };
  const patch = (fields: Partial<Client>) => current && update((s) => ({ ...s, clients: s.clients.map((x) => (x.id === current.id ? { ...x, ...fields } : x)) }));

  /** Seeds a review of the founder's own practice business, to show the workflow with real content. */
  const reviewSelf = () => {
    const prog = planProgress(state);
    const c: Client = { ...blank(), name: state.venture.founder || t("You", "أنت"), business: state.venture.name, sector: state.venture.sector, stage: state.venture.stage, notes: t(`Plan ${Math.round(prog.ratio * 100)}% written. ${state.decisions.length} CEO decisions practised.`, `الخطة مكتوبة بنسبة ${Math.round(prog.ratio * 100)}٪. تم التدرّب على ${state.decisions.length} قرارات قيادية.`), evidence: Math.max(1, Math.min(5, Math.round(prog.sections[1].done / Math.max(1, prog.sections[1].total) * 5))), economics: state.finance.price > state.finance.variable ? 3 : 1 };
    save(c);
    toast({ message: t("Added your own business for review", "أُضيف مشروعك للمراجعة") });
  };

  return (
    <>
      <PageHeader
        title={t("Consultant desk", "مكتب المستشار")}
        description={t("For advisers: keep client notes, review evidence, economics and operations, and plan sessions.", "للمستشارين: احتفظ بملاحظات العملاء، وراجع الأدلة والاقتصاديات والتشغيل، وخطط للجلسات.")}
        action={<Button icon={<Plus size={18} weight="bold" />} onClick={() => setEditing(blank())}>{t("New client", "عميل جديد")}</Button>}
      />
      <p className="notice"><Lock size={16} aria-hidden="true" /><span>{ws.mode === "account" ? t("Saved to your account and private to you. Sharing with other people isn't available.", "محفوظة في حسابك وخاصة بك. المشاركة مع أشخاص آخرين غير متاحة.") : t("Stored on this device only. Sharing with other people isn't available.", "مخزّنة على هذا الجهاز فقط. المشاركة مع أشخاص آخرين غير متاحة.")}</span></p>

      <div className="consult-layout">
        <Panel className="consult-list">
          <div className="activity-tools">
            <label className="search-input"><MagnifyingGlass size={18} aria-hidden="true" /><input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search clients", "ابحث في العملاء")} aria-label={t("Search clients", "ابحث في العملاء")} /></label>
          </div>
          <Segmented size="sm" label={t("Filter", "تصفية")} value={filter} onChange={setFilter} options={[{ value: "all", label: t("All", "الكل") }, { value: "open", label: t("To review", "للمراجعة") }, { value: "reviewed", label: t("Reviewed", "تمت المراجعة") }]} />
          {clients.length ? (
            <ul className="list">
              {clients.map((c) => (
                <li key={c.id}>
                  <button type="button" className={clsx("row row-pad", c.id === selected && "is-current")} onClick={() => setSelected(c.id)} aria-pressed={c.id === selected}>
                    <span className="row-icon"><UserCircle size={20} aria-hidden="true" /></span>
                    <span className="row-main"><span className="row-title"><bdi>{c.name}</bdi></span><span className="row-sub"><bdi>{c.business || "—"}</bdi></span></span>
                    {c.reviewed && <span className="chip chip-positive"><Check size={12} weight="bold" aria-hidden="true" />{t("Reviewed", "رُوجع")}</span>}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty">
              <p>{state.clients.length ? t("No clients match.", "لا يوجد عملاء مطابقون.") : t("No clients yet.", "لا يوجد عملاء بعد.")}</p>
              {!state.clients.length && <Button variant="secondary" size="sm" onClick={reviewSelf}>{t("Review my own business first", "راجع مشروعي أولاً")}</Button>}
            </div>
          )}
          <p className="field-hint">{t(`${upcoming} upcoming sessions`, `${upcoming} جلسات قادمة`)}</p>
        </Panel>

        {current ? (
          <div className="consult-detail">
            <Panel>
              <PanelHeader title={<bdi>{current.name}</bdi>} subtitle={`${current.business} · ${p(sectors.find((s) => s.id === current.sector)?.name ?? sectors[sectors.length - 1].name)}`}
                action={<div className="flex gap-2"><Button variant="secondary" size="sm" onClick={() => setEditing(current)}>{t("Edit", "تعديل")}</Button><IconButton label={t("Delete client", "حذف العميل")} size="sm" onClick={() => { const c = current; const prev = { clients: state.clients, sessions: state.sessions }; update((s) => ({ ...s, clients: s.clients.filter((x) => x.id !== c.id), sessions: s.sessions.filter((x) => x.clientId !== c.id) })); setSelected(null); toast({ message: t("Client deleted", "تم حذف العميل"), action: { label: t("Undo", "تراجع"), run: () => { update((s) => ({ ...s, ...prev })); setSelected(c.id); } } }); }}><Trash size={16} /></IconButton></div>} />
              <p className="field-hint">{t("Scores are review dimensions from 1 to 5, not a prediction of success. Explain them in the written review.", "الدرجات أبعاد مراجعة من ١ إلى ٥، وليست تنبؤاً بالنجاح. اشرحها في المراجعة المكتوبة.")}</p>
              <div className="scores">
                {([["evidence", t("Customer evidence", "أدلة العملاء")], ["economics", t("Unit economics", "اقتصاديات الوحدة")], ["operations", t("Operational readiness", "الجاهزية التشغيلية")]] as const).map(([k, label]) => (
                  <div key={k} className="score">
                    <span className="field-label">{label}</span>
                    <div className="score-dots" role="radiogroup" aria-label={label}>
                      {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" role="radio" aria-checked={current[k] === n} aria-label={`${label}: ${n} / 5`} className={clsx("score-dot", current[k] >= n && "is-on")} onClick={() => patch({ [k]: n } as Partial<Client>)} />)}
                    </div>
                  </div>
                ))}
              </div>
              <Field label={t("Notes", "ملاحظات")}>{(f) => <TextArea id={f.id} rows={3} value={current.notes} onChange={(e) => patch({ notes: e.target.value })} maxLength={4000} />}</Field>
              <Field label={t("Written review", "المراجعة المكتوبة")} hint={t("Strengths, the biggest open risk, and one next experiment.", "نقاط القوة، وأكبر خطر قائم، وتجربة تالية واحدة.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} rows={4} value={current.review} onChange={(e) => patch({ review: e.target.value })} maxLength={4000} />}</Field>
              <label className="toggle-row"><span className="reserve-toggle-text"><strong>{t("Review complete", "اكتملت المراجعة")}</strong></span><input type="checkbox" role="switch" className="switch" checked={current.reviewed} onChange={(e) => patch({ reviewed: e.target.checked })} /></label>
            </Panel>
            <Panel>
              <PanelHeader title={t("Sessions", "الجلسات")} />
              <ul className="tasks">
                {sessions.map((s) => (
                  <li key={s.id} className={clsx("task", s.done && "is-done")}>
                    <input type="checkbox" className="task-check" checked={s.done} aria-label={s.agenda} onChange={() => update((st) => ({ ...st, sessions: st.sessions.map((x) => (x.id === s.id ? { ...x, done: !x.done } : x)) }))} />
                    <span className="task-main"><span className="task-title"><bdi>{s.agenda}</bdi></span><span className="field-hint">{date(s.date, "long")}</span></span>
                    <IconButton label={t(`Delete ${s.agenda}`, `حذف ${s.agenda}`)} size="sm" onClick={() => update((st) => ({ ...st, sessions: st.sessions.filter((x) => x.id !== s.id) }))}><Trash size={16} /></IconButton>
                  </li>
                ))}
              </ul>
              <form className="session-add" onSubmit={(e) => { e.preventDefault(); if (!agenda.trim() || !when) return; update((st) => ({ ...st, sessions: [...st.sessions, { id: newId(), clientId: current.id, date: when, agenda: agenda.trim(), done: false }] })); setAgenda(""); setWhen(""); }}>
                <Input value={agenda} onChange={(e) => setAgenda(e.target.value)} placeholder={t("Session agenda", "جدول الجلسة")} aria-label={t("Session agenda", "جدول الجلسة")} maxLength={300} />
                <Input type="date" value={when} onChange={(e) => setWhen(e.target.value)} aria-label={t("Date", "التاريخ")} />
                <Button type="submit" variant="secondary" icon={<CalendarBlank size={18} />}>{t("Add", "إضافة")}</Button>
              </form>
            </Panel>
          </div>
        ) : (
          <Panel className="consult-detail empty"><p>{t("Select a client to see their review.", "اختر عميلاً لرؤية مراجعته.")}</p></Panel>
        )}
      </div>

      <Sheet open={Boolean(editing)} onOpenChange={(o) => !o && setEditing(null)} title={editing && state.clients.some((c) => c.id === editing.id) ? t("Edit client", "تعديل العميل") : t("New client", "عميل جديد")}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>{t("Cancel", "إلغاء")}</Button><Button onClick={() => editing && save(editing)} disabled={!editing?.name.trim()}>{t("Save client", "حفظ العميل")}</Button></>}>
        {editing && (
          <form className="form-stack" onSubmit={(e) => { e.preventDefault(); save(editing); }}>
            <Field label={t("Founder name", "اسم المؤسس")}>{(f) => <Input id={f.id} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} maxLength={100} autoFocus />}</Field>
            <Field label={t("Business", "المشروع")}>{(f) => <Input id={f.id} value={editing.business} onChange={(e) => setEditing({ ...editing, business: e.target.value })} maxLength={120} />}</Field>
            <Field label={t("Sector", "القطاع")}>{(f) => <select id={f.id} className="input" value={editing.sector} onChange={(e) => setEditing({ ...editing, sector: e.target.value })}>{sectors.map((s) => <option key={s.id} value={s.id}>{p(s.name)}</option>)}</select>}</Field>
            <Field label={t("Email", "البريد الإلكتروني")} optional>{(f) => <Input id={f.id} type="email" dir="ltr" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} maxLength={150} />}</Field>
            <button type="submit" hidden />
          </form>
        )}
      </Sheet>
    </>
  );
}
