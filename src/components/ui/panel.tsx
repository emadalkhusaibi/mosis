import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";
import { accent } from "./accent";

/** Matte content plane. Use for reading surfaces; glass is reserved for chrome and overlays. */
export function Panel({ className, padded = true, as: Tag = "section", ...rest }: HTMLAttributes<HTMLElement> & { padded?: boolean; as?: "section" | "div" | "article" | "aside" }) {
  return <Tag className={clsx("panel", padded && "panel-pad", className)} {...rest} />;
}

export function PanelHeader({ title, subtitle, action, level = 2 }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; level?: 2 | 3 }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <header className="panel-header">
      <div className="min-w-0">
        <H className="panel-title">{title}</H>
        {subtitle && <p className="panel-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="panel-action">{action}</div>}
    </header>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="page-header">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="page-title">{accent(title)}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-action">{action}</div>}
    </header>
  );
}
