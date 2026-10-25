import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

/** Matte content plane: a border, no blur, no shadow. */
export function Panel({ className, padded = true, subtle, as: Tag = "section", ...rest }: HTMLAttributes<HTMLElement> & { padded?: boolean; subtle?: boolean; as?: "section" | "div" | "article" | "aside" }) {
  return <Tag className={clsx("panel", padded && "panel-pad", subtle && "panel-subtle", className)} {...rest} />;
}

export function PanelHeader({ title, subtitle, action, level = 2, id }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode; level?: 2 | 3; id?: string }) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <header className="panel-header">
      <div className="min-w-0">
        <H className="panel-title" id={id}>{title}</H>
        {subtitle && <p className="panel-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="panel-action">{action}</div>}
    </header>
  );
}

/** Operational page heading: compact, one H1, no editorial serif. */
export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: ReactNode; title: ReactNode; description?: ReactNode; action?: ReactNode }) {
  return (
    <header className="page-heading">
      <div className="page-heading-text">
        {eyebrow && <p className="page-kicker">{eyebrow}</p>}
        <h1 className="page-title">{typeof title === "string" ? title.replace(/\*/g, "") : title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-actions">{action}</div>}
    </header>
  );
}
