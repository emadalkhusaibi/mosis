"use client";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Hub } from "@/components/shell/hub";
import { Money } from "@/components/ui/money";
import { planProgress } from "@/domain/progress";
import { forecastFor } from "@/domain/forecast";
import { available } from "@/domain/state";

const noop = () => () => {};

export default function BuildHub() {
  const { t, number } = useI18n();
  const { state: s } = useWorkspace();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const plan = planProgress(s);
  const hasForecast = s.finance.price > 0 && s.finance.units > 0;
  const f = forecastFor(s, available(s));
  return (
    <Hub id="build" values={{
      "/plan": <span className="num">{number(Math.round(plan.ratio * 100))}%</span>,
      "/forecast": !hasForecast ? t("Not set", "غير مُعد") : mounted ? <Money value={f.lowestCash} tone={f.lowestCash < 0} compact /> : null,
      "/brand": s.brand?.name ? <bdi>{s.brand.name}</bdi> : null,
    }} />
  );
}
