"use client";
import { useState } from "react";
import { Plus, Trash } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { sectorOf } from "@/content/sectors";
import { newId } from "@/domain/state";

/** A real-world step, plus the founder's own action list. */
export function FieldTask({ className }: { className?: string }) {
  const { t, p, date } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const suggestion = p(sectorOf(state.venture.sector).test);
  const added = state.tasks.some((x) => x.title === suggestion);
  const open = state.tasks.filter((x) => !x.done);
  const done = state.tasks.filter((x) => x.done).slice(-2);

  const addTask = (text: string, due = "") => update((s) => (s.tasks.some((x) => x.title === text && !x.done) ? s : { ...s, tasks: [...s.tasks, { id: newId(), title: text, due, done: false }] }));
  const remove = (id: string) => {
    const index = state.tasks.findIndex((x) => x.id === id);
    const task = state.tasks[index];
    if (!task || !update((s) => ({ ...s, tasks: s.tasks.filter((x) => x.id !== id) }))) return;
    toast({ message: t("Action deleted", "حُذفت المهمة"), action: { label: t("Undo", "تراجع"), run: () => update((s) => ({ ...s, tasks: [...s.tasks.slice(0, index), task, ...s.tasks.slice(index)] })) } });
  };

  return (
    <Panel className={className} aria-labelledby="actions-title">
      <PanelHeader id="actions-title" title={t("Actions", "المهام")} subtitle={t(`${open.length} open`, `${open.length} مفتوحة`)} />
      {!added && (
        <div className="suggestion">
          <p className="suggestion-label">{t("Suggested field test", "اختبار ميداني مقترح")}</p>
          <p className="suggestion-text">{suggestion}</p>
          <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => addTask(suggestion, new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10))}>{t("Add to my actions", "أضف إلى مهامي")}</Button>
        </div>
      )}
      <ul className="tasks">
        {[...open, ...done].map((task) => (
          <li key={task.id} className={clsx("task", task.done && "is-done")}>
            <input type="checkbox" className="task-check" checked={task.done} aria-label={task.title} onChange={() => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, done: !x.done } : x)) }))} />
            <span className="task-main">
              <span className="task-title"><bdi>{task.title}</bdi></span>
              {!task.done && (
                <label className="task-due">
                  <span className="sr-only">{t("Due date for", "تاريخ الاستحقاق لـ")} {task.title}</span>
                  <input type="date" value={task.due} onChange={(e) => update((s) => ({ ...s, tasks: s.tasks.map((x) => (x.id === task.id ? { ...x, due: e.target.value } : x)) }))} />
                  {!task.due && <span aria-hidden="true">{t("Add due date", "أضف موعداً")}</span>}
                  {task.due && <span aria-hidden="true">{t("Due", "الموعد")} {date(task.due)}</span>}
                </label>
              )}
            </span>
            <IconButton label={t(`Delete ${task.title}`, `حذف ${task.title}`)} size="sm" onClick={() => remove(task.id)}><Trash size={16} /></IconButton>
          </li>
        ))}
      </ul>
      {state.tasks.length === 0 && added === false && <p className="field-hint">{t("Or add one small step you can do this week.", "أو أضف خطوة صغيرة تستطيع فعلها هذا الأسبوع.")}</p>}
      <form className="task-add" onSubmit={(e) => { e.preventDefault(); if (title.trim()) { addTask(title.trim()); setTitle(""); } }}>
        <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("Add an action", "أضف مهمة")} aria-label={t("Add an action", "أضف مهمة")} maxLength={300} />
        <Button type="submit" variant="secondary" size="sm">{t("Add", "إضافة")}</Button>
      </form>
    </Panel>
  );
}
