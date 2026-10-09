import { available, balance, newId, type EntryCategory, type State } from "./state";
import type { Baisa } from "@/lib/money";

export type WalletResult = { ok: true; state: State } | { ok: false; error: "invalid_amount" | "insufficient_funds" | "reserve_exceeds_balance" | "missing_title" | "capital_below_spent" };

const stamp = () => new Date().toISOString();

export function recordExpense(s: State, title: string, amount: Baisa, category: EntryCategory, note?: string): WalletResult {
  if (!title.trim()) return { ok: false, error: "missing_title" };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, error: "invalid_amount" };
  if (amount > available(s)) return { ok: false, error: "insufficient_funds" };
  return { ok: true, state: { ...s, entries: [{ id: newId(), title: title.trim(), amount: -amount, category, date: stamp(), note }, ...s.entries] } };
}

export function recordIncome(s: State, title: string, amount: Baisa, note?: string): WalletResult {
  if (!title.trim()) return { ok: false, error: "missing_title" };
  if (!Number.isSafeInteger(amount) || amount <= 0) return { ok: false, error: "invalid_amount" };
  return { ok: true, state: { ...s, entries: [{ id: newId(), title: title.trim(), amount, category: "income", date: stamp(), note }, ...s.entries] } };
}

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
      entries: [{ id: newId(), title: label, amount: delta, category: "capital", date: stamp() }, ...s.entries],
    },
  };
}

export function walletError(e: Exclude<WalletResult, { ok: true }>["error"], t: (en: string, ar: string) => string) {
  switch (e) {
    case "missing_title": return t("Add a short description.", "أضف وصفاً قصيراً.");
    case "invalid_amount": return t("Enter an amount above zero, with up to three decimals.", "أدخل مبلغاً أكبر من صفر، بثلاث خانات عشرية كحد أقصى.");
    case "insufficient_funds": return t("That's more than your available funds. Release some reserve or adjust capital first.", "المبلغ يتجاوز الأموال المتاحة. حرّر جزءاً من الاحتياطي أو عدّل رأس المال أولاً.");
    case "reserve_exceeds_balance": return t("The reserve can't be larger than your balance.", "لا يمكن أن يتجاوز الاحتياطي رصيدك.");
    case "capital_below_spent": return t("Capital can't drop below what you've already spent plus your reserve.", "لا يمكن أن يقل رأس المال عمّا أنفقته مع الاحتياطي.");
  }
}
