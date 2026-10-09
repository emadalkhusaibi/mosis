"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { signIn, signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Wordmark } from "@/components/ui/origin";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const { t, lang, setLang } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isUp = mode === "sign-up";

  const submit = async () => {
    setError(null);
    if (isUp && !name.trim()) return setError(t("Add your name.", "أضف اسمك."));
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError(t("Enter a valid email address.", "أدخل بريداً إلكترونياً صحيحاً."));
    if (password.length < 8) return setError(t("Use at least 8 characters for your password.", "استخدم ٨ أحرف على الأقل لكلمة المرور."));
    setBusy(true);
    const res = isUp ? await signUp.email({ name: name.trim(), email, password }) : await signIn.email({ email, password });
    setBusy(false);
    if (res.error) {
      const code = res.error.code ?? "";
      setError(
        code.includes("USER_ALREADY_EXISTS") ? t("An account with this email already exists. Try signing in.", "يوجد حساب بهذا البريد. جرّب تسجيل الدخول.")
        : code.includes("INVALID_EMAIL_OR_PASSWORD") ? t("That email and password don't match.", "البريد وكلمة المرور غير متطابقين.")
        : res.error.status === 429 ? t("Too many attempts. Wait a minute and try again.", "محاولات كثيرة. انتظر دقيقة وحاول مجدداً.")
        : t("Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."),
      );
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="auth">
      <div className="auth-card panel">
        <div className="auth-top">
          <Link href="/" className="auth-back"><ArrowLeft size={16} className="flip-rtl" />{t("Back", "رجوع")}</Link>
          <button type="button" className="link-btn" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <Wordmark />
        <h1 className="auth-title">{isUp ? t("Keep your work safe.", "احفظ عملك بأمان.") : t("Welcome back.", "مرحباً بعودتك.")}</h1>
        <p className="muted">{isUp ? t("Create a free account to save your workspace and open it on any device. Guest practice on this device comes with you.", "أنشئ حساباً مجانياً لحفظ مساحة عملك وفتحها من أي جهاز. ينتقل معك تدريبك كضيف على هذا الجهاز.") : t("Sign in to continue where you left off.", "سجّل الدخول لتتابع من حيث توقفت.")}</p>
        <form className="sheet-form mt-6" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
          {isUp && <Field label={t("Name", "الاسم")}>{(f) => <Input id={f.id} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={100} />}</Field>}
          <Field label={t("Email", "البريد الإلكتروني")}>{(f) => <Input id={f.id} type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />}</Field>
          <Field label={t("Password", "كلمة المرور")} hint={isUp ? t("At least 8 characters.", "٨ أحرف على الأقل.") : undefined}>
            {(f) => <Input id={f.id} type="password" dir="ltr" aria-describedby={f.describedBy} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={isUp ? "new-password" : "current-password"} />}
          </Field>
          {error && <p className="field-error" role="alert">{error}</p>}
          <Button type="submit" size="lg" block disabled={busy}>{busy ? t("One moment…", "لحظة…") : isUp ? t("Create account", "إنشاء حساب") : t("Sign in", "تسجيل الدخول")}</Button>
        </form>
        <p className="auth-switch muted small">
          {isUp ? t("Already have an account?", "لديك حساب؟") : t("New to Moasis?", "جديد في مؤسس؟")}{" "}
          <Link className="link-btn" href={isUp ? "/sign-in" : "/sign-up"}>{isUp ? t("Sign in", "تسجيل الدخول") : t("Create an account", "أنشئ حساباً")}</Link>
        </p>
      </div>
    </div>
  );
}
