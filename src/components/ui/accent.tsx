import { Fragment, type ReactNode } from "react";

/**
 * Renders `*word*` spans as the editorial accent (Instrument Serif italic in Latin,
 * a lighter titanium weight in Arabic). Keep it to one accent per headline.
 */
export function accent(text: ReactNode): ReactNode {
  if (typeof text !== "string" || !text.includes("*")) return text;
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") && part.endsWith("*") ? <em key={i} className="accent">{part.slice(1, -1)}</em> : <Fragment key={i}>{part}</Fragment>,
  );
}
