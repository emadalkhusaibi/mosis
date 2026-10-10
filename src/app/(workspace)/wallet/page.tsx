"use client";
import { useMemo, useState } from "react";
import { DropdownMenu } from "radix-ui";
import { ArrowCounterClockwise, DotsThree, DownloadSimple, Info, MagnifyingGlass, Minus, Plus, ShieldCheck, SlidersHorizontal, TrendUp } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, MoneyInput, TextArea } from "@/components/ui/field";
import { FinanceSubnav } from "@/components/finance/finance-subnav";
import { WalletCards, type CardId } from "@/components/wallet/wallet-cards";
import { categoryMeta, spendCategories } from "@/components/wallet/categories";
import { available, balance, spent, type Entry, type EntryCategory, type State } from "@/domain/state";
import { adjustCapital, isReversed, recordExpense, recordIncome, reverseEntry, setReserve, walletError, type WalletResult } from "@/domain/wallet";
import { formatCoverage, reserveCoverage } from "@/domain/reserve";
import { moneyErrorText, toDecimal, type Baisa, type MoneyError } from "@/lib/money";

type SheetKind = null | "expense" | "income" | "reserve" | "capital" | "help" | { entry: string };
type Filter = "all" | "in" | "out";

export default function WalletPage() {
  const { t, dir, number } = useI18n();
  const ws = useWorkspace();
  const s = ws.state;
  const [card, setCard] = useState<CardId>("capital");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const entries = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    return s.entries.filter((e) => (filter === "all" || (filter === "in" ? e.amount > 0 : e.amount < 0)) && (!needle || e.title.toLocaleLowerCase().includes(needle)));
  }, [s.entries, filter, q]);
  const filtered = filter !== "all" || q.trim() !== "";

  const close = () => setSheet(null);
  const entry = typeof sheet === "object" && sheet && "entry" in sheet ? s.entries.find((e) => e.id === sheet.entry) : undefined;
  const coverage = formatCoverage(reserveCoverage(s.reserve, s.finance.fixed), t, number);

  const exportCsv = () => {
    const header = ["date", "description", "category", "source", "amount", "currency", "note"];
    // Quote every text cell, and neutralise values a spreadsheet would run as a formula.
    const cell = (v: string) => `"${v.replace(/^[=+\-@\t\r]/, "'$&").replaceAll('"', '""')}"`;
    const rows = s.entries.map((e) => [e.date.slice(0, 10), cell(e.title), categoryMeta[e.category].en, e.source ?? "manual", toDecimal(e.amount), "OMR", cell(e.note ?? "")].join(","));
    const blob = new Blob(["﻿" + [header.join(","), ...rows].join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `moasis-wallet-${new Date().toISOString().slice(0, 10)}.csv` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        title={t("Wallet", "المحفظة")}
        description={t("What you decided to spend, in exact rials. Practice money only.", "ما قررت إنفاقه، بالريال الدقيق. مال تدريبي فقط.")}
        action={
          <>
            <Button icon={<Plus size={18} weight="bold" />} onClick={() => setSheet("expense")}>{t("Record expense", "تسجيل مصروف")}</Button>
            <DropdownMenu.Root dir={dir}>
              <DropdownMenu.Trigger className="icon-btn" aria-label={t("More wallet options", "خيارات أخرى للمحفظة")}><DotsThree size={22} weight="bold" /></DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="menu" align="end" sideOffset={8}>
                  <DropdownMenu.Item className="menu-item" onSelect={exportCsv}><DownloadSimple size={18} />{t("Export all activity (CSV)", "تصدير كل الحركات (CSV)")}</DropdownMenu.Item>
                  <DropdownMenu.Item className="menu-item" onSelect={() => setSheet("help")}><Info size={18} />{t("How the wallet works", "كيف تعمل المحفظة")}</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </>
        }
      />
      <FinanceSubnav />

      <div className="wallet-layout">
        <div className="wallet-side">
          <WalletCards active={card} onChange={setCard} />

          <div className="wallet-actions" role="group" aria-label={t("Wallet actions", "إجراءات المحفظة")}>
            <QuickAction icon={<Minus size={18} weight="bold" />} label={t("Expense", "مصروف")} onClick={() => setSheet("expense")} />
            <QuickAction icon={<TrendUp size={18} />} label={t("Income", "دخل")} onClick={() => setSheet("income")} />
            <QuickAction icon={<ShieldCheck size={18} />} label={t("Reserve", "احتياطي")} onClick={() => setSheet("reserve")} />
            <QuickAction icon={<SlidersHorizontal size={18} />} label={t("Capital", "رأس المال")} onClick={() => setSheet("capital")} />
          </div>

          <Panel aria-labelledby="balances-title">
            <h2 id="balances-title" className="sr-only">{t("Balances", "الأرصدة")}</h2>
            <dl className="balance-list">
              <div className="is-strong"><dt>{t("Available to spend", "المتاح للإنفاق")}</dt><dd><Money value={available(s)} /></dd></div>
              <div><dt>{t("Protected reserve", "الاحتياطي المحمي")}<span className="balance-note">{coverage}</span></dt><dd><Money value={s.reserve} /></dd></div>
              <div><dt>{t("Balance", "الرصيد")}<span className="balance-note">{t("Available plus reserve", "المتاح مع الاحتياطي")}</span></dt><dd><Money value={balance(s)} /></dd></div>
              <div><dt>{t("Spent so far", "المُنفق حتى الآن")}</dt><dd><Money value={spent(s)} /></dd></div>
            </dl>
          </Panel>
        </div>

        <Panel className="wallet-activity" aria-labelledby="activity-title">
          <PanelHeader id="activity-title" title={t("Activity", "الحركات")} subtitle={filtered ? t(`${entries.length} of ${s.entries.length} shown`, `${entries.length} من ${s.entries.length} معروضة`) : t(`${s.entries.length} recorded`, `${s.entries.length} حركة مسجّلة`)} />
          <div className="activity-tools">
            <label className="search-input">
              <MagnifyingGlass size={18} aria-hidden="true" />
              <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search activity", "ابحث في الحركات")} aria-label={t("Search activity", "ابحث في الحركات")} />
            </label>
            <Segmented label={t("Show", "عرض")} value={filter} onChange={setFilter} options={[{ value: "all", label: t("All", "الكل") }, { value: "in", label: t("Money in", "وارد") }, { value: "out", label: t("Money out", "صادر") }]} />
            {filtered && <Button variant="ghost" size="sm" onClick={() => { setQ(""); setFilter("all"); }}>{t("Reset", "إعادة ضبط")}</Button>}
          </div>
          {entries.length ? (
            <ul className="list ledger" aria-live="polite">
              {entries.map((e) => <EntryRow key={e.id} e={e} reversed={isReversed(s, e.id)} onOpen={() => setSheet({ entry: e.id })} />)}
            </ul>
          ) : filtered ? (
            <div className="empty"><p className="empty-title">{t("Nothing matches", "لا توجد نتائج")}</p><p>{t("Try another word or show all activity.", "جرّب كلمة أخرى أو اعرض كل الحركات.")}</p><Button variant="secondary" size="sm" onClick={() => { setQ(""); setFilter("all"); }}>{t("Show all activity", "عرض كل الحركات")}</Button></div>
          ) : (
            <div className="empty"><p className="empty-title">{t("No activity yet", "لا توجد حركات بعد")}</p><p>{t("Record your first expense to see it here.", "سجّل أول مصروف ليظهر هنا.")}</p><Button size="sm" onClick={() => setSheet("expense")}>{t("Record expense", "تسجيل مصروف")}</Button></div>
          )}
        </Panel>
      </div>

      <ExpenseSheet open={sheet === "expense"} onClose={close} />
      <IncomeSheet open={sheet === "income"} onClose={close} />
      <ReserveSheet open={sheet === "reserve"} onClose={close} />
      <CapitalSheet open={sheet === "capital"} onClose={close} />
      <HelpSheet open={sheet === "help"} onClose={close} />
      <EntrySheet entry={entry} onClose={close} />
    </>
  );
}

function QuickAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" className="quick-action" onClick={onClick}>
      <span className="quick-action-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

function sourceLabel(e: Entry, t: (en: string, ar: string) => string) {
  switch (e.source) {
    case "setup": return t("Setup", "الإعداد");
    case "scenario": return t("Decision", "قرار");
    case "payroll": return t("Payroll", "رواتب");
    case "reversal": return t("Reversal", "عكس");
    default: return null;
  }
}

function EntryRow({ e, reversed, onOpen }: { e: Entry; reversed: boolean; onOpen: () => void }) {
  const { t, lang, date } = useI18n();
  const meta = categoryMeta[e.category];
  const I = e.source === "reversal" ? ArrowCounterClockwise : meta.icon;
  const src = sourceLabel(e, t);
  return (
    <li>
      <button type="button" className="row row-pad" onClick={onOpen}>
        <span className="row-icon"><I size={18} aria-hidden="true" /></span>
        <span className="row-main">
          <span className="row-title"><bdi>{e.title}</bdi></span>
          <span className="row-sub">{date(e.date)} · {lang === "ar" ? meta.ar : meta.en}{src && ` · ${src}`}</span>
        </span>
        <span className="row-end">
          {reversed && <span className="chip">{t("Reversed", "معكوسة")}</span>}
          <Money value={e.amount} signed tone />
        </span>
      </button>
    </li>
  );
}

/**
 * Applies a wallet operation. Success is announced only once the change is
 * accepted by the workspace, and Undo is itself an audited operation.
 */
function useWalletAction() {
  const ws = useWorkspace();
  const toast = useToast();
  const { t } = useI18n();
  return (run: (s: State) => WalletResult, message: string, undo?: (r: Extract<WalletResult, { ok: true }>) => (s: State) => WalletResult) => {
    const r = run(ws.state);
    if (!r.ok) return walletError(r.error, t);
    if (!ws.update(() => r.state)) return t("That change couldn't be saved. Check the amounts.", "تعذّر حفظ التغيير. تحقق من المبالغ.");
    toast({
      message,
      action: undo ? {
        label: t("Undo", "تراجع"),
        run: () => {
          const u = undo(r)(ws.state);
          if (!u.ok || !ws.update(() => u.state)) toast({ message: u.ok ? t("Undo couldn't be saved.", "تعذّر حفظ التراجع.") : walletError(u.error, t) });
        },
      } : undefined,
    });
    return null;
  };
}

const reversal = (t: (en: string, ar: string) => string) => (r: { entryId?: string }) => (s: State) => reverseEntry(s, r.entryId ?? "", t("Undo", "تراجع"));

function moneyMessage(amount: Baisa | null, err: MoneyError | null, t: (en: string, ar: string) => string, opts: { positive?: boolean } = {}) {
  if (err) return moneyErrorText(err, t);
  if (amount === null) return moneyErrorText("blank", t);
  if (opts.positive && amount <= 0) return t("Enter an amount above zero.", "أدخل مبلغاً أكبر من صفر.");
  return null;
}

function ExpenseSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, lang } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<Baisa | null>(null);
  const [amountErr, setAmountErr] = useState<MoneyError | null>(null);
  const [category, setCategory] = useState<EntryCategory>("equipment");
  const [note, setNote] = useState("");
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reset = () => { setTitle(""); setAmount(null); setAmountErr(null); setNote(""); setTried(false); setError(null); };
  const amountMsg = tried ? moneyMessage(amount, amountErr, t, { positive: true }) : null;
  const titleMsg = tried && !title.trim() ? t("Say what it was for.", "اذكر الغرض من المصروف.") : null;
  const over = amount !== null && amount > available(ws.state);
  const submit = () => {
    setTried(true);
    if (moneyMessage(amount, amountErr, t, { positive: true }) || !title.trim()) return;
    const err = act((s) => recordExpense(s, title, amount ?? 0, category, note.trim() || undefined), t(`Recorded ${title.trim()}`, `تم تسجيل ${title.trim()}`), reversal(t));
    if (err) return setError(err);
    reset();
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title={t("Record an expense", "تسجيل مصروف")} onSubmit={submit}
      description={<>{t("Available to spend", "المتاح للإنفاق")}: <Money value={available(ws.state)} /></>}
      footer={<><Button variant="secondary" onClick={() => { reset(); onClose(); }}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Record expense", "تسجيل المصروف")}</Button></>}>
      <div className="form-stack">
        <Field label={t("Amount", "المبلغ")} error={amountMsg} hint={over ? t("This is more than you can spend. The reserve stays protected, so it will be refused.", "هذا أكثر مما يمكنك إنفاقه. الاحتياطي يبقى محمياً، لذا سيُرفض.") : undefined}>
          {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} invalid={f.invalid} value={amount} onChange={(b, _raw, e) => { setAmount(b); setAmountErr(e); setError(null); }} autoFocus />}
        </Field>
        <Field label={t("What was it for?", "على ماذا أنفقت؟")} error={titleMsg}>
          {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} maxLength={160} placeholder={t("e.g. Espresso machine deposit", "مثال: عربون آلة الإسبريسو")} />}
        </Field>
        <fieldset className="field">
          <legend className="field-label">{t("Category", "الفئة")}</legend>
          <div className="choice-grid choice-grid-3" role="radiogroup" aria-label={t("Category", "الفئة")}>
            {spendCategories.map((c) => {
              const m = categoryMeta[c];
              return (
                <button key={c} type="button" role="radio" aria-checked={category === c} className="choice choice-row choice-compact" onClick={() => setCategory(c)}>
                  <m.icon size={16} aria-hidden="true" /><span className="choice-title">{lang === "ar" ? m.ar : m.en}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <Field label={t("Note", "ملاحظة")} optional>{(f) => <TextArea id={f.id} rows={2} value={note} onChange={(e) => setNote(e.target.value)} maxLength={600} placeholder={t("Why this, why now?", "لماذا هذا، ولماذا الآن؟")} />}</Field>
        {error && <p className="notice notice-danger" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function IncomeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const act = useWalletAction();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<Baisa | null>(null);
  const [amountErr, setAmountErr] = useState<MoneyError | null>(null);
  const [tried, setTried] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reset = () => { setTitle(""); setAmount(null); setAmountErr(null); setTried(false); setError(null); };
  const submit = () => {
    setTried(true);
    if (moneyMessage(amount, amountErr, t, { positive: true }) || !title.trim()) return;
    const err = act((s) => recordIncome(s, title, amount ?? 0), t(`Recorded ${title.trim()}`, `تم تسجيل ${title.trim()}`), reversal(t));
    if (err) return setError(err);
    reset();
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }} title={t("Record practice income", "تسجيل دخل تدريبي")} size="sm" onSubmit={submit}
      description={t("Sales from a pilot, a pre-order or a market day.", "مبيعات من تجربة أو طلب مسبق أو يوم سوق.")}
      footer={<><Button variant="secondary" onClick={() => { reset(); onClose(); }}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Record income", "تسجيل الدخل")}</Button></>}>
      <div className="form-stack">
        <Field label={t("Amount", "المبلغ")} error={tried ? moneyMessage(amount, amountErr, t, { positive: true }) : null}>
          {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} invalid={f.invalid} value={amount} onChange={(b, _r, e) => { setAmount(b); setAmountErr(e); setError(null); }} autoFocus />}
        </Field>
        <Field label={t("Source", "المصدر")} error={tried && !title.trim() ? t("Say where it came from.", "اذكر مصدر الدخل.") : null}>
          {(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={title} onChange={(e) => { setTitle(e.target.value); setError(null); }} maxLength={160} placeholder={t("e.g. Weekend pop-up sales", "مثال: مبيعات ركن نهاية الأسبوع")} />}
        </Field>
        {error && <p className="notice notice-danger" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function ReserveSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, number } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const s = ws.state;
  const fixed = s.finance.fixed;
  const [value, setValue] = useState<Baisa | null>(s.reserve);
  const [valueErr, setValueErr] = useState<MoneyError | null>(null);
  const [preset, setPreset] = useState<string>("custom");
  const [error, setError] = useState<string | null>(null);
  const presets = fixed > 0 ? [1, 3, 6] : [];
  const submit = () => {
    const msg = moneyMessage(value, valueErr, t);
    if (msg) return setError(msg);
    const prev = s.reserve;
    const err = act((st) => setReserve(st, value ?? 0), t("Reserve updated", "تم تحديث الاحتياطي"), () => (st) => setReserve(st, prev));
    if (err) return setError(err);
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); else { setValue(s.reserve); setValueErr(null); setPreset("custom"); setError(null); } }} title={t("Protected reserve", "الاحتياطي المحمي")} onSubmit={submit}
      description={t("The reserve stays in your balance but can't be spent until you lower it. Setting it aside isn't an expense.", "يبقى الاحتياطي ضمن رصيدك لكن لا يمكن إنفاقه حتى تخفّضه. تخصيصه ليس مصروفاً.")}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Save reserve", "حفظ الاحتياطي")}</Button></>}>
      <div className="form-stack">
        {presets.length > 0 && (
          <Segmented label={t("Months of fixed costs", "أشهر من التكاليف الثابتة")} value={preset} onChange={(m) => { setPreset(m); if (m !== "custom") { setValue(Math.min(balance(s), fixed * Number(m))); setValueErr(null); } setError(null); }}
            options={[...presets.map((m) => ({ value: String(m), label: t(`${m} month${m > 1 ? "s" : ""}`, m === 1 ? "شهر" : `${m} أشهر`) })), { value: "custom", label: t("Custom", "مخصص") }]} />
        )}
        <Field label={t("Reserve amount", "مبلغ الاحتياطي")} hint={<>{t("Balance", "الرصيد")}: <Money value={balance(s)} /></>}>
          {(f) => <MoneyInput id={f.id} describedBy={f.describedBy} value={value} onChange={(b, _r, e) => { setValue(b); setValueErr(e); setPreset("custom"); setError(null); }} />}
        </Field>
        {value !== null && <p className="field-hint"><ShieldCheck size={16} aria-hidden="true" className="inline-icon" /> {formatCoverage(reserveCoverage(value, fixed), t, number)}{fixed > 0 && <> · {t("based on fixed costs of", "على أساس تكاليف ثابتة قدرها")} <Money value={fixed} /> {t("a month", "شهرياً")}</>}</p>}
        {error && <p className="notice notice-danger" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function CapitalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const [value, setValue] = useState<Baisa | null>(ws.state.venture.capital);
  const [valueErr, setValueErr] = useState<MoneyError | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const msg = moneyMessage(value, valueErr, t);
    if (msg) return setError(msg);
    const prev = ws.state.venture.capital;
    const err = act((s) => adjustCapital(s, value ?? 0, t("Capital adjusted", "تعديل رأس المال")), t("Capital updated", "تم تحديث رأس المال"), () => (s) => adjustCapital(s, prev, t("Capital adjustment undone", "التراجع عن تعديل رأس المال")));
    if (err) return setError(err);
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); else { setValue(ws.state.venture.capital); setValueErr(null); setError(null); } }} title={t("Practice capital", "رأس المال التدريبي")} size="sm" onSubmit={submit}
      description={t("Changing capital records the difference as a capital entry. It doesn't change your reserve.", "تعديل رأس المال يسجّل الفرق كحركة رأس مال، ولا يغيّر الاحتياطي.")}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Save capital", "حفظ رأس المال")}</Button></>}>
      <div className="form-stack">
        <Field label={t("Total practice capital", "إجمالي رأس المال التدريبي")}>{(f) => <MoneyInput id={f.id} value={value} onChange={(b, _r, e) => { setValue(b); setValueErr(e); setError(null); }} autoFocus />}</Field>
        {error && <p className="notice notice-danger" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function EntrySheet({ entry, onClose }: { entry?: Entry; onClose: () => void }) {
  const { t, lang, date } = useI18n();
  const ws = useWorkspace();
  const act = useWalletAction();
  const [error, setError] = useState<string | null>(null);
  if (!entry) return null;
  const meta = categoryMeta[entry.category];
  const reversed = isReversed(ws.state, entry.id);
  const original = entry.reverses ? ws.state.entries.find((e) => e.id === entry.reverses) : undefined;
  const linked = entry.source === "scenario" || entry.source === "setup";
  const canReverse = !reversed && !entry.reverses && !linked;
  const reverse = () => {
    const err = act((s) => reverseEntry(s, entry.id, t(`Reversed: ${entry.title}`, `عكس: ${entry.title}`).slice(0, 160)), t("Entry reversed", "تم عكس الحركة"));
    if (err) return setError(err);
    onClose();
  };
  return (
    <Sheet open onOpenChange={(o) => { if (!o) { setError(null); onClose(); } }} title={<bdi>{entry.title}</bdi>} size="sm"
      footer={canReverse ? <Button variant="danger-quiet" icon={<ArrowCounterClockwise size={18} />} onClick={reverse}>{t("Reverse entry", "عكس الحركة")}</Button> : undefined}>
      <p className="entry-amount"><Money value={entry.amount} signed tone /></p>
      <dl className="balance-list">
        <div><dt>{t("Category", "الفئة")}</dt><dd>{lang === "ar" ? meta.ar : meta.en}</dd></div>
        <div><dt>{t("Date", "التاريخ")}</dt><dd>{date(entry.date, "long")}</dd></div>
        {sourceLabel(entry, t) && <div><dt>{t("Came from", "المصدر")}</dt><dd>{sourceLabel(entry, t)}</dd></div>}
        {original && <div><dt>{t("Cancels", "يلغي")}</dt><dd><bdi>{original.title}</bdi></dd></div>}
        {entry.note && <div><dt>{t("Note", "ملاحظة")}</dt><dd><bdi>{entry.note}</bdi></dd></div>}
      </dl>
      <p className="field-hint">
        {reversed ? t("This entry has been reversed. Both stay in your history.", "عُكست هذه الحركة. تبقى الحركتان في سجلّك.")
          : linked ? t("This entry belongs to a setup step or a committed decision, so it can't be reversed here.", "هذه الحركة مرتبطة بخطوة إعداد أو قرار معتمد، لذا لا يمكن عكسها من هنا.")
          : canReverse ? t("Reversing adds an opposite entry. Nothing is deleted.", "العكس يضيف حركة معاكسة. لا يُحذف شيء.")
          : t("Simulated entry. No real funds moved.", "حركة محاكاة. لم تنتقل أموال حقيقية.")}
      </p>
      {error && <p className="notice notice-danger" role="alert">{error}</p>}
    </Sheet>
  );
}

function HelpSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} title={t("How the wallet works", "كيف تعمل المحفظة")}>
      <div className="prose">
        <h3>{t("Capital and spending", "رأس المال والإنفاق")}</h3>
        <p>{t("Starting capital is the amount you choose to practise with. Expenses reduce your balance; practice income increases it.", "رأس المال الأولي هو المبلغ الذي تختاره للتدرّب. تقلّل المصروفات رصيدك، ويزيده الدخل التدريبي.")}</p>
        <h3>{t("The protected reserve", "الاحتياطي المحمي")}</h3>
        <p>{t("The reserve stays part of your balance but can't be spent until you lower it. An expense larger than what's available is refused rather than dipping into it.", "يبقى الاحتياطي جزءاً من رصيدك لكن لا يمكن إنفاقه حتى تخفّضه. يُرفض أي مصروف يتجاوز المتاح بدلاً من السحب منه.")}</p>
        <h3>{t("Undo and reversals", "التراجع والعكس")}</h3>
        <p>{t("Entries are never deleted. Undo and Reverse add an opposite entry, so the history always explains the balance.", "لا تُحذف الحركات أبداً. التراجع والعكس يضيفان حركة معاكسة، فيبقى السجل مفسّراً للرصيد.")}</p>
        <h3>{t("Wallet and forecast", "المحفظة والتوقعات")}</h3>
        <p>{t("The wallet records what you decided. The forecast models what might happen and never changes the wallet.", "تسجّل المحفظة ما قررته. أما التوقعات فتنمذج ما قد يحدث ولا تغيّر المحفظة أبداً.")}</p>
        <h3>{t("Exact amounts", "مبالغ دقيقة")}</h3>
        <p>{t("Amounts are stored in baisa, so totals are exact to three decimals. The CSV export uses the same exact values.", "تُخزَّن المبالغ بالبيسة، لذا تكون المجاميع دقيقة حتى ثلاث خانات عشرية. ويستخدم ملف CSV القيم الدقيقة نفسها.")}</p>
      </div>
    </Sheet>
  );
}
