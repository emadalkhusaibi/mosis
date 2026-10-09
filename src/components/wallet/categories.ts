import { ArrowDownLeft, Briefcase, Flask, Gear, Megaphone, Package, Storefront, TrendUp, Users, type Icon } from "@phosphor-icons/react";
import type { EntryCategory } from "@/domain/state";

export const categoryMeta: Record<EntryCategory, { en: string; ar: string; icon: Icon }> = {
  capital: { en: "Capital", ar: "رأس المال", icon: ArrowDownLeft },
  income: { en: "Income", ar: "دخل", icon: TrendUp },
  operations: { en: "Operations", ar: "التشغيل", icon: Gear },
  equipment: { en: "Equipment", ar: "المعدات", icon: Storefront },
  marketing: { en: "Marketing", ar: "التسويق", icon: Megaphone },
  people: { en: "People", ar: "الأفراد", icon: Users },
  inventory: { en: "Inventory", ar: "المخزون", icon: Package },
  research: { en: "Research", ar: "البحث", icon: Flask },
  practice: { en: "CEO practice", ar: "تدريب القيادة", icon: Briefcase },
};

export const spendCategories: EntryCategory[] = ["equipment", "inventory", "marketing", "operations", "people", "research"];
