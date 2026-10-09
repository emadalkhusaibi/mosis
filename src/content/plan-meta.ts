import { ChartLineUp, Compass, Flag, Gear, Lightbulb, ShieldCheck, Users, type Icon } from "@phosphor-icons/react";

/** Presentation details and related lessons for each plan section. */
export const sectionMeta: Record<string, { icon: Icon; lessons: string[]; forecast?: boolean }> = {
  idea: { icon: Lightbulb, lessons: ["experiment"] },
  customer: { icon: Users, lessons: ["interviews", "experiment"] },
  market: { icon: Compass, lessons: ["position", "channels"] },
  finance: { icon: ChartLineUp, lessons: ["cash", "margin", "breakeven", "forecast"], forecast: true },
  operations: { icon: Gear, lessons: ["hiring", "feedback"] },
  risk: { icon: ShieldCheck, lessons: ["partners", "decisions"] },
  launch: { icon: Flag, lessons: ["decisions", "experiment"] },
};
