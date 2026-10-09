import { ViewTransition } from "react";

/**
 * Route changes cross-dissolve with a slight depth shift (old recedes, new rises),
 * while shared elements (chapter, lesson, scenario, wallet card) morph between pages.
 * Templates remount per navigation, so enter/exit fire here; chrome stays anchored.
 */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <div className="page-root">{children}</div>
    </ViewTransition>
  );
}
