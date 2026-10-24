"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Wordmark } from "@/components/ui/origin";

type Errors = Partial<Record<"name" | "email" | "password" | "form", string>>;

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const isUp = mode === "sign-up";

  const validate = (): Errors => ({
    ...(isUp && !name.trim() && { name: t("Add your name.", "أضف اسمك.") }),
    ...(!/^\S+@\S+\.\S+$/.test(email.trim()) && { email: t("Enter a valid email address.", "أدخل بريداً إلكترونياً صحيحاً.") }),
    ...(password.length < 8 && { password: isUp ? t("Use at least 8 characters.", "استخدم ٨ أحرف على الأقل.") : t("Enter your password.", "أدخل كلمة المرور.") }),
  });

  const submit = async () => {
    if (busy) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setBusy(true);
    try {
      const res = isUp ? await signUp.email({ name: name.trim(), email: email.trim(), password }) : await signIn.email({ email: email.trim(), password });
      if (res.error) {
        const code = res.error.code ?? "";
        setErrors({
          form: code.includes("USER_ALREADY_EXISTS") ? t("We couldn't create an account with these details. If you already have one, sign in instead.", "تعذّر إنشاء حساب بهذه البيانات. إن كان لديك حساب، سجّل الدخول.")
            : code.includes("INVALID_EMAIL_OR_PASSWORD") ? t("That email and password don't match.", "البريد وكلمة المرور غير متطابقين.")
            : res.error.status === 429 ? t("Too many attempts. Wait a minute and try again.", "محاولات كثيرة. انتظر دقيقة وحاول مجدداً.")
            : t("Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."),
        });
        return;
      }
      router.replace("/");
      router.refresh();
    } catch {
      setErrors({ form: t("Couldn't reach the server. Check your connection and try again.", "تعذّر الوصول إلى الخادم. تحقق من اتصالك وحاول مجدداً.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-card panel">
        <div className="auth-top">
          <Link href="/" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Back", "رجوع")}</Link>
          <button type="button" className="link-quiet small" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <Wordmark />
        <h1 className="auth-title">{isUp ? t("Save your work across devices", "احفظ عملك عبر الأجهزة") : t("Sign in", "تسجيل الدخول")}</h1>
        <p className="secondary">{isUp ? t("A free account keeps your workspace and opens it on any device. Practice you've done as a guest in this browser comes with you.", "حساب مجاني يحفظ مساحة عملك ويفتحها من أي جهاز. ينتقل معك تدريبك كضيف في هذا المتصفح.") : t("Continue where you left off.", "تابع من حيث توقفت.")}</p>
        <form ref={form} className="form-stack auth-form" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
          {isUp && <Field label={t("Name", "الاسم")} error={errors.name}>{(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} />}</Field>}
          <Field label={t("Email", "البريد الإلكتروني")} error={errors.email}>{(f) => <Input id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} type="email" dir="ltr" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" spellCheck={false} />}</Field>
          <Field label={t("Password", "كلمة المرور")} hint={isUp ? t("At least 8 characters.", "٨ أحرف على الأقل.") : undefined} error={errors.password}>
            {(f) => (
              <div className="password-input" dir="ltr">
                <Input id={f.id} type={show ? "text" : "password"} dir="ltr" aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isUp ? "new-password" : "current-password"} />
                <button type="button" className="icon-btn icon-btn-sm password-toggle" aria-pressed={show} aria-label={show ? t("Hide password", "إخفاء كلمة المرور") : t("Show password", "إظهار كلمة المرور")} onClick={() => setShow((x) => !x)}>
                  {show ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            )}
          </Field>
          {!isUp && <Link className="link-quiet small auth-forgot" href="/forgot-password">{t("Forgot your password?", "نسيت كلمة المرور؟")}</Link>}
          {errors.form && <p className="notice notice-danger" role="alert">{errors.form}</p>}
          <Button type="submit" size="lg" block disabled={busy} aria-busy={busy}>{busy ? t("One moment…", "لحظة…") : isUp ? t("Create account", "إنشاء حساب") : t("Sign in", "تسجيل الدخول")}</Button>
        </form>
        <p className="auth-switch field-hint">
          {isUp ? t("Already have an account?", "لديك حساب؟") : t("New to Moasis?", "جديد في مؤسس؟")}{" "}
          <Link className="link" href={isUp ? "/sign-in" : "/sign-up"}>{isUp ? t("Sign in", "تسجيل الدخول") : t("Create an account", "أنشئ حساباً")}</Link>
        </p>
      </div>
    </div>
  );
}
