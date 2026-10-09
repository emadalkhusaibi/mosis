"use client";
import { useMemo, useState } from "react";
import { DropdownMenu } from "radix-ui";
import { DotsThree, DownloadSimple, Info, MagnifyingGlass, Minus, Plus, ShieldCheck, SlidersHorizontal, TrendUp } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, MoneyInput, TextArea } from "@/components/ui/field";
import { Origin } from "@/components/ui/origin";
import { CardStack, type CardId } from "@/components/wallet/card-stack";
import { categoryMeta, spendCategories } from "@/components/wallet/categories";
import { available, balance, spent, type Entry, type EntryCategory, type State } from "@/domain/state";
import { adjustCapital, recordExpense, recordIncome, setReserve, walletError } from "@/domain/wallet";
import { toRials, type Baisa } from "@/lib/money";

type SheetKind = null | "expense" | "income" | "reserve" | "capital" | "help" | { entry: string } | { card: CardId };

export default function WalletPage() {
  const { t, dir } = useI18n();
  const ws = useWorkspace();
  const s = ws.state;
  const [card, setCard] = useState<CardId>("capital");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [filter, setFilter] = useState<"all" | "in" | "out">("all");
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return s.entries.filter((e) => (filter === "all" || (filter === "in" ? e.amount > 0 : e.amount < 0)) && (!needle || e.title.toLocaleLowerCase().includes(needle)));
  }, [s.entries, filter, q]);

  const close = () => setSheet(null);
  const entry = typeof sheet === "object" && sheet && "entry" in sheet ? s.entries.find((e) => e.id === sheet.entry) : undefined;

  const exportCsv = () => {
    const header = [t("Date", "التاريخ"), t("Description", "الوصف"), t("Category", "الفئة"), t("Amount (OMR)", "المبلغ (ر.ع.)")];
    const safe = (v: string) => `"${v.replaceAll('"', '""').replace(/^[=+@-]/, "'$&")}"`;
    const rows = s.entries.map((e) => [e.date.slice(0, 10), safe(e.title), categoryMeta[e.category].en, toRials(e.amount).toFixed(3)].join(","));
    const blob = new Blob(["﻿" + [header.join(","), ...rows].join("\n")], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `moasis-wallet-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        eyebrow={t("Practice wallet", "المحفظة التدريبية")}
        title={t("Wallet", "المحفظة")}
        description={t("Every decision shows up here in exact rials. Nothing real moves.", "يظهر كل قرار هنا بالريال الدقيق. لا تنتقل أموال حقيقية.")}
        action={
          <>
            <IconButton label={t("Record expense", "تسجيل مصروف")} variant="solid" size="lg" onClick={() => setSheet("expense")}><Plus size={22} weight="bold" /></IconButton>
            <DropdownMenu.Root dir={dir}>
              <DropdownMenu.Trigger className="icon-btn icon-btn-glass icon-btn-lg" aria-label={t("Wallet options", "خيارات المحفظة")}><DotsThree size={24} weight="bold" /></DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
                  <DropdownMenu.Item className="menu-item" onSelect={() => setSheet("income")}><TrendUp size={18} />{t("Record income", "تسجيل دخل")}</DropdownMenu.Item>
                  <DropdownMenu.Item className="menu-item" onSelect={() => setSheet("reserve")}><ShieldCheck size={18} />{t("Set reserve", "تحديد الاحتياطي")}</DropdownMenu.Item>
                  <DropdownMenu.Item className="menu-item" onSelect={() => setSheet("capital")}><SlidersHorizontal size={18} />{t("Adjust capital", "تعديل رأس المال")}</DropdownMenu.Item>
                  <DropdownMenu.Separator className="menu-sep" />
                  <DropdownMenu.Item className="menu-item" onSelect={exportCsv}><DownloadSimple size={18} />{t("Export activity (CSV)", "تصدير الحركات (CSV)")}</DropdownMenu.Item>
                  <DropdownMenu.Item className="menu-item" onSelect={() => setSheet("help")}><Info size={18} />{t("How your wallet works", "كيف تعمل محفظتك")}</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </>
        }
      />

      <div className="wallet-layout">
        <div className="wallet-left">
          <CardStack active={card} onChange={setCard} onOpen={(c) => setSheet({ card: c })} />
          <div className="quick-actions">
            <QuickAction icon={<Minus size={20} weight="bold" />} label={t("Expense", "مصروف")} onClick={() => setSheet("expense")} />
            <QuickAction icon={<TrendUp size={20} />} label={t("Income", "دخل")} onClick={() => setSheet("income")} />
            <QuickAction icon={<ShieldCheck size={20} />} label={t("Reserve", "احتياطي")} onClick={() => setSheet("reserve")} />
            <QuickAction icon={<SlidersHorizontal size={20} />} label={t("Capital", "رأس المال")} onClick={() => setSheet("capital")} />
          </div>
          <Panel className="wallet-summary">
            <SummaryRow label={t("Balance", "الرصيد")} value={balance(s)} />
            <SummaryRow label={t("Protected reserve", "الاحتياطي المحمي")} value={s.reserve} />
            <SummaryRow label={t("Available to spend", "المتاح للإنفاق")} value={available(s)} strong />
            <div className="summary-meter" aria-hidden="true">
              <span style={{ flexGrow: Math.max(0, available(s)) }} className="m-available" />
              <span style={{ flexGrow: s.reserve }} className="m-reserve" />
              <span style={{ flexGrow: spent(s) }} className="m-spent" />
            </div>
            <div className="summary-legend">
              <span><i className="m-available" />{t("Available", "متاح")}</span>
              <span><i className="m-reserve" />{t("Reserve", "احتياطي")}</span>
              <span><i className="m-spent" />{t("Spent", "مُنفق")} <Money value={spent(s)} /></span>
            </div>
          </Panel>
        </div>

        <Panel className="wallet-activity">
          <PanelHeader title={t("Activity", "الحركات")} subtitle={t(`${s.entries.length} recorded`, `${s.entries.length} حركة مسجّلة`)} />
          <div className="activity-tools">
            <label className="search-field">
              <MagnifyingGlass size={18} aria-hidden="true" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search activity", "ابحث في الحركات")} aria-label={t("Search activity", "ابحث في الحركات")} />
            </label>
            <Segmented size="sm" label={t("Filter", "تصفية")} value={filter} onChange={setFilter} options={[{ value: "all", label: t("All", "الكل") }, { value: "in", label: t("In", "وارد") }, { value: "out", label: t("Out", "صادر") }]} />
          </div>
          {entries.length ? (
            <ul className="list">
              {entries.map((e) => <EntryRow key={e.id} e={e} onOpen={() => setSheet({ entry: e.id })} />)}
            </ul>
          ) : (
            <div className="empty"><Origin className="empty-mark" /><p>{q ? t("No activity matches your search.", "لا توجد حركات مطابقة.") : t("No activity yet. Record your first expense to see it here.", "لا توجد حركات بعد. سجّل أول مصروف ليظهر هنا.")}</p></div>
          )}
          <p className="muted small mt-4">{t("Practice money. Real learning.", "مال تدريبي. تعلّم حقيقي.")}</p>
        </Panel>
      </div>

      <ExpenseSheet open={sheet === "expense"} onClose={close} />
      <IncomeSheet open={sheet === "income"} onClose={close} />
      <ReserveSheet open={sheet === "reserve"} onClose={close} />
      <CapitalSheet open={sheet === "capital"} onClose={close} />
      <HelpSheet open={sheet === "help"} onClose={close} />
      <EntrySheet entry={entry} onClose={close} />
      <CardSheet card={typeof sheet === "object" && sheet && "card" in sheet ? sheet.card : null} onClose={close} onAction={(k) => setSheet(k)} />
    </>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className="quick-action" onClick={onClick}>
      <span className="quick-action-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function SummaryRow({ label, value, strong }: { label: string; value: Baisa; strong?: boolean }) {
  return (
    <div className={clsx("summary-row", strong && "is-strong")}>
      <span>{label}</span>
      <Money value={value} />
    </div>
  );
}

function EntryRow({ e, onOpen }: { e: Entry; onOpen: () => void }) {
  const { lang, date } = useI18n();
  const meta = categoryMeta[e.category];
  const I = meta.icon;
  return (
    <li>
      <button type="button" className="row" onClick={onOpen}>
        <span className="row-icon"><I size={19} aria-hidden="true" /></span>
        <span className="row-main">
          <span className="row-title">{e.title}</span>
          <span className="row-sub">{lang === "ar" ? meta.ar : meta.en} · {date(e.date)}</span>
        </span>
        <span className="row-end"><Money value={e.amount} signed tone /></span>
      </button>
    </li>
  );
}

/** Applies a wallet operation, shows the result and offers an exact inverse as Undo. */
function useWalletAction() {
  const ws = useWorkspace();
  const toast = useToast();
  const { t } = useI18n();
  return (run: (s: State) => ReturnType<typeof recordExpense>, message: string, undo: (prev: State, next: State) => (s: State) => State) => {
    const prev = ws.state;
    const r = run(prev);
    if (!r.ok) return walletError(r.error, t);
    if (!ws.update(() => r.state)) return t("That change couldn't be saved. Check the amounts.", "تعذّر حفظ التغيير. تحقق من المبالغ.");
    const inverse = undo(prev, r.state);
    toast({ message, action: { label: t("Undo", "تراجع"), run: () => ws.update(inverse) } });
    return null;
  };
}

function ExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<Baisa | null>(null);
  const [category, setCategory] = useState<EntryCategory>("equipment");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const reset = () => { setTitle(""); setAmount(null); setNote(""); setError(null); };
  const submit = () => {
    const err = act(
      (s) => recordExpense(s, title, amount ?? 0, category, note.trim() || undefined),
      t(`Recorded ${title.trim()}`, `تم تسجيل ${title.trim()}`),
      (_prev, next) => (s) => ({ ...s, entries: s.entries.filter((e) => e.id !== next.entries[0].id) }),
    );
    if (err) return setError(err);
    reset();
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title={t("Record an expense", "تسجيل مصروف")}
      description={<>{t("Available to spend", "المتاح للإنفاق")}: <Money value={available(ws.state)} /></>}
      footer={<><Button variant="secondary" onClick={() => { reset(); onClose(); }}>{t("Cancel", "إلغاء")}</Button><Button onClick={submit}>{t("Record expense", "تسجيل المصروف")}</Button></>}>
      <form className="sheet-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label={t("Amount", "المبلغ")}>{(f) => <MoneyInput id={f.id} value={amount} onChange={(b) => { setAmount(b); setError(null); }} autoFocus />}</Field>
        <Field label={t("What was it for?", "على ماذا أنفقت؟")}>{(f) => <Input id={f.id} value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} maxLength={160} placeholder={t("e.g. Espresso machine deposit", "مثال: عربون آلة الإسبريسو")} />}</Field>
        <fieldset className="field">
          <legend className="field-label">{t("Category", "الفئة")}</legend>
          <div className="chip-picker">
            {spendCategories.map((c) => {
              const m = categoryMeta[c];
              return (
                <button key={c} type="button" aria-pressed={category === c} className="pick-chip" onClick={() => setCategory(c)}>
                  <m.icon size={16} aria-hidden="true" />{lang === "ar" ? m.ar : m.en}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label={t("Note", "ملاحظة")} optional>{(f) => <TextArea id={f.id} rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder={t("Why this, why now?", "لماذا هذا، ولماذا الآن؟")} />}</Field>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

function IncomeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const act = useWalletAction();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<Baisa | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reset = () => { setTitle(""); setAmount(null); setError(null); };
  const submit = () => {
    const err = act(
      (s) => recordIncome(s, title, amount ?? 0),
      t(`Recorded ${title.trim()}`, `تم تسجيل ${title.trim()}`),
      (_p, next) => (s) => ({ ...s, entries: s.entries.filter((e) => e.id !== next.entries[0].id) }),
    );
    if (err) return setError(err);
    reset();
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title={t("Record practice income", "تسجيل دخل تدريبي")}
      description={t("Sales from a pilot, a pre-order or a market day.", "مبيعات من تجربة أو طلب مسبق أو يوم سوق.")}
      footer={<><Button variant="secondary" onClick={() => { reset(); onClose(); }}>{t("Cancel", "إلغاء")}</Button><Button onClick={submit}>{t("Record income", "تسجيل الدخل")}</Button></>}>
      <form className="sheet-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <Field label={t("Amount", "المبلغ")}>{(f) => <MoneyInput id={f.id} value={amount} onChange={(b) => { setAmount(b); setError(null); }} autoFocus />}</Field>
        <Field label={t("Source", "المصدر")}>{(f) => <Input id={f.id} value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} maxLength={160} placeholder={t("e.g. Weekend pop-up sales", "مثال: مبيعات ركن نهاية الأسبوع")} />}</Field>
        {error && <p className="field-error" role="alert">{error}</p>}
        <button type="submit" hidden />
      </form>
    </Sheet>
  );
}

function ReserveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const s = ws.state;
  const fixed = s.finance.fixed;
  const [value, setValue] = useState<Baisa | null>(s.reserve);
  const [months, setMonths] = useState<string>("custom");
  const [error, setError] = useState<string | null>(null);
  const presets = fixed > 0 ? [1, 3, 6] : [];
  const submit = () => {
    const err = act(
      (st) => setReserve(st, value ?? -1),
      t("Reserve updated", "تم تحديث الاحتياطي"),
      (prev) => (st) => ({ ...st, reserve: Math.min(prev.reserve, balance(st)) }),
    );
    if (err) return setError(err);
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); else { setValue(s.reserve); setError(null); } }} title={t("Build your safety net.", "ابنِ شبكة أمانك.")}
      description={t("The reserve stays in your balance but can't be spent until you release it.", "يبقى الاحتياطي ضمن رصيدك لكن لا يمكن إنفاقه حتى تحرّره.")}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button onClick={submit}>{t("Set reserve", "تحديد الاحتياطي")}</Button></>}>
      <div className="sheet-form">
        {presets.length > 0 && (
          <Segmented label={t("Months of fixed costs", "أشهر من التكاليف الثابتة")} value={months} onChange={(m) => { setMonths(m); if (m !== "custom") setValue(Math.min(balance(s), fixed * Number(m))); setError(null); }}
            options={[...presets.map((m) => ({ value: String(m), label: t(`${m} month${m > 1 ? "s" : ""}`, m === 1 ? "شهر" : m === 3 ? "٣ أشهر" : "٦ أشهر") })), { value: "custom", label: t("Custom", "مخصص") }]} className="w-full justify-between" />
        )}
        <Field label={t("Reserve amount", "مبلغ الاحتياطي")} hint={<>{t("Balance", "الرصيد")}: <Money value={balance(s)} /></>}>
          {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} value={value} onChange={(b) => { setValue(b); setMonths("custom"); setError(null); }} />}
        </Field>
        {fixed > 0 && value !== null && <p className="calm-note"><ShieldCheck size={18} /> {t(`Covers about ${(value / fixed).toFixed(1)} months of fixed costs.`, `يغطي نحو ${(value / fixed).toFixed(1)} أشهر من التكاليف الثابتة.`)}</p>}
        {error && <p className="field-error" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function CapitalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const [value, setValue] = useState<Baisa | null>(ws.state.venture.capital);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const err = act(
      (s) => adjustCapital(s, value ?? 0, t("Capital adjusted", "تعديل رأس المال")),
      t("Capital updated", "تم تحديث رأس المال"),
      (prev, next) => (s) => next === prev ? s : ({ ...s, venture: { ...s.venture, capital: prev.venture.capital }, entries: s.entries.filter((e) => e.id !== next.entries[0].id) }),
    );
    if (err) return setError(err);
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); else { setValue(ws.state.venture.capital); setError(null); } }} title={t("Adjust practice capital", "تعديل رأس المال التدريبي")}
      description={t("Changing capital records the difference as a capital entry. It doesn't move money into your reserve.", "تعديل رأس المال يسجّل الفرق كحركة رأس مال، ولا ينقل أموالاً إلى الاحتياطي.")}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button onClick={submit}>{t("Save capital", "حفظ رأس المال")}</Button></>}>
      <div className="sheet-form">
        <Field label={t("Total practice capital", "إجمالي رأس المال التدريبي")}>{(f) => <MoneyInput id={f.id} value={value} onChange={(b) => { setValue(b); setError(null); }} autoFocus />}</Field>
        {error && <p className="field-error" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function EntrySheet({ entry, onClose }: { entry?: Entry; onClose: () => void }) {
  const { t, lang, date } = useI18n();
  const ws = useWorkspace();
  const toast = useToast();
  if (!entry) return <Sheet open={false} onOpenChange={onClose} title=""><span /></Sheet>;
  const meta = categoryMeta[entry.category];
  const removable = entry.category !== "capital";
  const remove = () => {
    const ok = ws.update((s) => ({ ...s, entries: s.entries.filter((e) => e.id !== entry.id) }));
    if (!ok) return toast({ message: t("Removing this would leave your reserve larger than your balance.", "حذف هذه الحركة يجعل الاحتياطي أكبر من الرصيد.") });
    toast({ message: t("Entry removed", "تم حذف الحركة"), action: { label: t("Undo", "تراجع"), run: () => ws.update((s) => ({ ...s, entries: [entry, ...s.entries].sort((a, b) => b.date.localeCompare(a.date)) })) } });
    onClose();
  };
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={entry.title} size="sm"
      footer={removable ? <Button variant="danger" onClick={remove}>{t("Remove entry", "حذف الحركة")}</Button> : undefined}>
      <div className="entry-hero"><Money value={entry.amount} signed tone className="entry-amount" /></div>
      <dl className="review-list">
        <div><dt>{t("Category", "الفئة")}</dt><dd>{lang === "ar" ? meta.ar : meta.en}</dd></div>
        <div><dt>{t("Date", "التاريخ")}</dt><dd>{date(entry.date, "long")}</dd></div>
        {entry.note && <div><dt>{t("Note", "ملاحظة")}</dt><dd>{entry.note}</dd></div>}
      </dl>
      <p className="muted small mt-4">{t("This is a simulated entry. No real funds moved.", "هذه حركة محاكاة. لم تنتقل أموال حقيقية.")}</p>
    </Sheet>
  );
}

function CardSheet({ card, onClose, onAction }: { card: CardId | null; onClose: () => void; onAction: (k: SheetKind) => void }) {
  const { t } = useI18n();
  const { state } = useWorkspace();
  const info = {
    capital: { title: t("Your capital card", "بطاقة رأس مالك"), body: t("Shows what you can spend right now: your balance minus the protected reserve.", "تعرض ما يمكنك إنفاقه الآن: رصيدك ناقص الاحتياطي المحمي."), action: t("Adjust capital", "تعديل رأس المال"), next: "capital" as const },
    reserve: { title: t("Your reserve card", "بطاقة احتياطيك"), body: t("Money set aside for uncertainty: a slow month, a broken machine, a late payment.", "أموال مخصصة للظروف غير المتوقعة: شهر بطيء أو عطل أو دفعة متأخرة."), action: t("Manage reserve", "إدارة الاحتياطي"), next: "reserve" as const },
    pass: { title: t("Your founder pass", "بطاقة المؤسس الخاصة بك"), body: t("Grows as you complete lessons and work through CEO decisions, not as you spend.", "تنمو كلما أكملت الدروس وقرارات القيادة، لا كلما أنفقت."), action: t("Open learning", "فتح التعلّم"), next: null },
  };
  if (!card) return <Sheet open={false} onOpenChange={onClose} title=""><span /></Sheet>;
  const i = info[card];
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={i.title} description={i.body} size="sm"
      footer={i.next ? <Button onClick={() => onAction(i.next)}>{i.action}</Button> : <Button href="/learn">{i.action}</Button>}>
      <dl className="review-list">
        <div><dt>{t("Cardholder", "صاحب البطاقة")}</dt><dd>{state.venture.founder}</dd></div>
        <div><dt>{t("Business", "المشروع")}</dt><dd>{state.venture.name}</dd></div>
        <div><dt>{t("Starting capital", "رأس المال الأولي")}</dt><dd><Money value={state.venture.capital} /></dd></div>
        {card === "pass" && <div><dt>{t("Completed", "المنجز")}</dt><dd>{t(`${state.learning.completed.length} lessons · ${state.decisions.length} decisions`, `${state.learning.completed.length} دروس · ${state.decisions.length} قرارات`)}</dd></div>}
      </dl>
      <p className="muted small mt-4">{t("Simulation only. No real card or account exists.", "للمحاكاة فقط. لا توجد بطاقة أو حساب حقيقي.")}</p>
    </Sheet>
  );
}

function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title={t("How your wallet works", "كيف تعمل محفظتك")}>
      <div className="prose-block help-prose">
        <h3>{t("Capital and spending", "رأس المال والإنفاق")}</h3>
        <p>{t("Starting capital is the amount you choose to practise with. Recorded expenses reduce your balance, practice income increases it.", "رأس المال الأولي هو المبلغ الذي تختاره للتدرّب. تقلّل المصروفات المسجّلة رصيدك، ويزيده الدخل التدريبي.")}</p>
        <h3>{t("Your protected reserve", "احتياطيك المحمي")}</h3>
        <p>{t("The reserve remains part of your balance but can't be spent until you release it. Setting it aside isn't an expense.", "يبقى الاحتياطي جزءاً من رصيدك لكن لا يمكن إنفاقه حتى تحرّره. تخصيصه ليس مصروفاً.")}</p>
        <h3>{t("Wallet vs forecast", "المحفظة مقابل التوقعات")}</h3>
        <p>{t("The wallet records what you decided. The forecast is a plan of what might happen. They're kept separate on purpose.", "تسجّل المحفظة ما قررته، بينما التوقعات خطة لما قد يحدث. فصلناهما عن قصد.")}</p>
        <h3>{t("Exact amounts", "مبالغ دقيقة")}</h3>
        <p>{t("Everything is stored in baisa, so totals are always exact to three decimals.", "يُخزَّن كل شيء بالبيسة، لذا تكون المجاميع دقيقة دائماً حتى ثلاث خانات عشرية.")}</p>
      </div>
    </Sheet>
  );
}
