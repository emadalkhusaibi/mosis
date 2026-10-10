/** Shared-element morphs were retired in the calmer redesign; kept as a passthrough until callers are gone. */
export function Morph({ children }: { name: string; children: React.ReactElement; kind?: "morph" | "morph-text" }) {
  return children;
}
