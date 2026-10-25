import { available, balance, newId, type EntryCategory, type State } from "./state";
import type { Baisa } from "@/lib/money";

export type WalletError = "invalid_amount" | "insufficient_funds" | "reserve_exceeds_balance" | "missing_title" | "capital_below_spent" | "not_found" | "already_reversed" | "reversal_breaks_reserve" | "linked_entry";
export type WalletResult = { ok: true; state: State; entryId?: string } | { ok: false; error: WalletError };

const stamp = () => new Date().toISOString();

export function recordExpense(s: State, title: string, amount: Baisa, category: EntryCategory, note?: string): WalletResult {
  if (!title.trim()) return { ok: false, error: "missing_title" };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, error: "invalid_amount" };
  if (amount > available(s)) return { ok: false, error: "insufficient_funds" };
  const id = newId();
  return { ok: true, entryId: id, state: { ...s, entries: [{ id, title: title.trim(), amount: -amount, category, date: stamp(), note, source: "manual" }, ...s.entries] } };
}

export function recordIncome(s: State, title: string, amount: Baisa, note?: string): WalletResult {
  if (!title.trim()) return { ok: false, error: "missing_title" };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, error: "invalid_amount" };
  const id = newId();
  return { ok: true, entryId: id, state: { ...s, entries: [{ id, title: title.trim(), amount, category: "income", date: stamp(), note, source: "manual" }, ...s.entries] } };
}

/**
 * Cancels an entry by posting an equal and opposite reversal, keeping the
 * original for the audit trail. An entry is reversed at most once, a reversal
 * can't itself be reversed, and the reserve must still fit afterwards.
 * Entries created by a decision are reversed from that decision, not here.
 */
export function reverseEntry(s: State, entryId: string, label: string): WalletResult {
  const e = s.entries.find((x) => x.id === entryId);
  if (!e) return { ok: false, error: "not_found" };
  if (e.reverses || s.entries.some((x) => x.reverses === entryId)) return { ok: false, error: "already_reversed" };
  if (e.source === "scenario" || e.source === "setup") return { ok: false, error: "linked_entry" };
  if (balance(s) - e.amount < s.reserve) return { ok: false, error: "reversal_breaks_reserve" };
  const id = newId();
  return {
    ok: true,
    entryId: id,
    state: { ...s, entries: [{ id, title: label, amount: -e.amount, category: e.category, date: stamp(), source: "reversal", reverses: entryId }, ...s.entries] },
  };
}

export const isReversed = (s: Pick<State, "entries">, entryId: string) => s.entries.some((x) => x.reverses === entryId);

/** Moves money in or out of the protected reserve. The reserve stays part of the balance. */
export function setReserve(s: State, reserve: Baisa): WalletResult {
  if (!Number.isSafeInteger(reserve) || reserve < 0) return { ok: false, error: "invalid_amount" };
  if (reserve > balance(s)) return { ok: false, error: "reserve_exceeds_balance" };
  return { ok: true, state: { ...s, reserve } };
}

/** Changes the total practice capital by recording the difference as a capital entry. */
export function adjustCapital(s: State, capital: Baisa, label: string): WalletResult {
  if (!Number.isSafeInteger(capital) || capital <= 0) return { ok: false, error: "invalid_amount" };
  const delta = capital - s.venture.capital;
  if (delta === 0) return { ok: true, state: s };
  if (balance(s) + delta < s.reserve) return { ok: false, error: "capital_below_spent" };
  return {
    ok: true,
    state: {
      ...s,
      venture: { ...s.venture, capital },
      entries: [{ id: newId(), title: label, amount: delta, category: "capital", date: stamp(), source: "manual" }, ...s.entries],
    },
  };
}

export function walletError(e: WalletError, t: (en: string, ar: string) => string) {
  switch (e) {
    case "missing_title": return t("Add a short description.", "أضف وصفاً قصيراً.");
    case "invalid_amount": return t("Enter an amount above zero, with up to three decimals.", "أدخل مبلغاً أكبر من صفر، بثلاث خانات عشرية كحد أقصى.");
    case "insufficient_funds": return t("That's more than your available funds. Release some reserve or adjust capital first.", "المبلغ يتجاوز الأموال المتاحة. حرّر جزءاً من الاحتياطي أو عدّل رأس المال أولاً.");
    case "reserve_exceeds_balance": return t("The reserve can't be larger than your balance.", "لا يمكن أن يتجاوز الاحتياطي رصيدك.");
    case "capital_below_spent": return t("Capital can't drop below what you've already spent plus your reserve.", "لا يمكن أن يقل رأس المال عمّا أنفقته مع الاحتياطي.");
    case "not_found": return t("That entry no longer exists.", "هذا القيد لم يعد موجوداً.");
    case "already_reversed": return t("That entry has already been reversed.", "تم عكس هذا القيد مسبقاً.");
    case "reversal_breaks_reserve": return t("Undoing this would leave less than your protected reserve. Lower the reserve first.", "التراجع عن هذا سيترك أقل من الاحتياطي المحمي. خفّض الاحتياطي أولاً.");
    case "linked_entry": return t("This entry belongs to a decision or your setup, so it can't be undone here.", "هذا القيد مرتبط بقرار أو بالإعداد، لذا لا يمكن التراجع عنه هنا.");
  }
}
