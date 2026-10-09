"use client";
import clsx from "clsx";
import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { parseRials, toRials, type Baisa } from "@/lib/money";
import { useI18n } from "@/lib/i18n";

export function Field({ label, hint, error, children, id, optional, className }: { label: ReactNode; hint?: ReactNode; error?: ReactNode; children: (p: { id: string; describedBy?: string; invalid: boolean }) => ReactNode; id?: string; optional?: boolean; className?: string }) {
  const auto = useId();
  const fid = id ?? auto;
  const { t } = useI18n();
  const hintId = hint ? `${fid}-hint` : undefined;
  const errId = error ? `${fid}-err` : undefined;
  return (
    <div className={clsx("field", error && "is-invalid", className)}>
      <label htmlFor={fid} className="field-label">
        {label}
        {optional && <span className="field-optional">{t("Optional", "اختياري")}</span>}
      </label>
      {children({ id: fid, describedBy: [hintId, errId].filter(Boolean).join(" ") || undefined, invalid: Boolean(error) })}
      {hint && !error && <p id={hintId} className="field-hint">{hint}</p>}
      {error && <p id={errId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...rest }, ref) {
  return <input ref={ref} className={clsx("input", className)} {...rest} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className, ...rest }, ref) {
  return <textarea ref={ref} className={clsx("input textarea", className)} {...rest} />;
});

/** Rial input that reports exact baisa (or null while the text is invalid). */
export function MoneyInput({ value, onChange, id, describedBy, invalid, autoFocus, placeholder }: { value: Baisa | null; onChange: (v: Baisa | null, raw: string) => void; id?: string; describedBy?: string; invalid?: boolean; autoFocus?: boolean; placeholder?: string }) {
  const { t } = useI18n();
  const [raw, setRaw] = useState(value === null ? "" : String(toRials(value)));
  const [seen, setSeen] = useState(value);
  // Follow outside changes (presets, resets) without fighting the user's typing.
  if (value !== seen) {
    setSeen(value);
    if (value !== parseRials(raw)) setRaw(value === null ? "" : String(toRials(value)));
  }
  return (
    <div className={clsx("money-input", invalid && "is-invalid")} dir="ltr">
      <input
        id={id}
        className="input num"
        inputMode="decimal"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-describedby={describedBy}
        aria-invalid={invalid || undefined}
        placeholder={placeholder ?? "0"}
        value={raw}
        onChange={(e) => {
          setRaw(e.target.value);
          onChange(parseRials(e.target.value), e.target.value);
        }}
      />
      <span className="rial money-input-sign" role="img" aria-label={t("Omani rials", "ريال عُماني")} />
    </div>
  );
}
