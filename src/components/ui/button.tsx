"use client";
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "glass";
type Size = "sm" | "md" | "lg";
type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; href?: string; icon?: ReactNode; trailing?: ReactNode; block?: boolean };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", href, icon, trailing, block, className, children, type = "button", ...rest },
  ref,
) {
  const cls = clsx("btn", `btn-${variant}`, `btn-${size}`, block && "btn-block", className);
  const inner = (
    <>
      {icon && <span className="btn-icon" aria-hidden="true">{icon}</span>}
      {children && <span className="btn-label">{children}</span>}
      {trailing && <span className="btn-icon flip-rtl" aria-hidden="true">{trailing}</span>}
    </>
  );
  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  return <button ref={ref} type={type} className={cls} {...rest}>{inner}</button>;
});

type IconProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string; variant?: "plain" | "glass" | "solid"; size?: "sm" | "md" | "lg" };
export const IconButton = forwardRef<HTMLButtonElement, IconProps>(function IconButton({ label, variant = "plain", size = "md", className, children, type = "button", ...rest }, ref) {
  return (
    <button ref={ref} type={type} aria-label={label} title={label} className={clsx("icon-btn", `icon-btn-${variant}`, `icon-btn-${size}`, className)} {...rest}>
      {children}
    </button>
  );
});
