import { ViewTransition } from "react";

/** Marks an element that persists across a navigation so it morphs instead of swapping. */
export function Morph({ name, children, kind = "morph" }: { name: string; children: React.ReactElement; kind?: "morph" | "morph-text" }) {
  return <ViewTransition name={name} share={kind} default="none">{children}</ViewTransition>;
}
