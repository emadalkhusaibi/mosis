"use client";
import { useSyncExternalStore } from "react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Hub } from "@/components/shell/hub";
import { readiness } from "@/domain/readiness";
import { matches, opportunities } from "@/content/opportunities";
import { launchSteps } from "@/content/launch";

const noop = () => () => {};

export default function ConnectHub() {
  const { t, number } = useI18n();
  const { state: s } = useWorkspace();
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const fits = opportunities.filter((o) => matches(o, s.venture.sector)).length;
  return (
    <Hub id="connect" values={{
      "/opportunities": t(`${fits} for you`, `${fits} لك`),
      "/record": mounted ? <span className="num">{number(readiness(s).overall)}/100</span> : null,
      "/launch": <span className="num">{s.launch?.length ?? 0}/{launchSteps.length}</span>,
    }} />
  );
}
