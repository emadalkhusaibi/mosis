"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Eye, EyeSlash } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { Wordmark } from "@/components/ui/origin";

function Shell({ title, lead, children }: { title: string; lead: string; children: React.ReactNode }) {
  const { t, lang, setLang } = useI18n();
  return (
    <div className="auth">
      <div className="auth-card panel">
        <div className="auth-top">
          <Link href="/sign-in" className="link-quiet small"><ArrowLeft size={14} className="flip-rtl inline-icon" aria-hidden="true" /> {t("Sign in", "تسجيل الدخول")}</Link>
          <button type="button" className="link-quiet small" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "English" : "العربية"}</button>
        </div>
        <Wordmark />
        <h1 className="auth-title">{title}</h1>
        <p className="secondary">{lead}</p>
        {children}
      </div>
    </div>
  );
}

/** Step one: ask for a reset link. The reply is the same whether or not the address has an account. */
export function ForgotPasswordForm({ mailReady }: { mailReady: boolean }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError(t("Enter a valid email address.", "أدخل بريداً إلكترونياً صحيحاً."));
      input.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.requestPasswordReset({ email: email.trim(), redirectTo: "/reset-password" });
      if (res.error) {
        setError(res.error.status === 429 ? t("Too many attempts. Wait a minute and try again.", "محاولات كثيرة. انتظر دقيقة وحاول مجدداً.") : t("Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."));
        return;
      }
      setSent(true);
    } catch {
      setError(t("Couldn't reach the server. Check your connection and try again.", "تعذّر الوصول إلى الخادم. تحقق من اتصالك وحاول مجدداً."));
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Shell title={t("Check your email", "تحقق من بريدك")} lead={t(`If ${email.trim()} has a Moasis account, a reset link is on its way. It works for one hour.`, `إن كان للبريد ${email.trim()} حساب في مؤسس، فرابط إعادة التعيين في طريقه إليك. يعمل الرابط لمدة ساعة.`)}>
        <p className="field-hint">{t("Nothing after a few minutes? Look in spam, or try again.", "لم يصل شيء بعد دقائق؟ تفقد البريد غير المرغوب، أو حاول مرة أخرى.")}</p>
        <Button variant="secondary" onClick={() => setSent(false)}>{t("Send another link", "أرسل رابطاً آخر")}</Button>
      </Shell>
    );
  }

  return (
    <Shell title={t("Reset your password", "إعادة تعيين كلمة المرور")} lead={t("Enter the email you signed up with. We'll send a link to choose a new password.", "أدخل البريد الذي سجّلت به. سنرسل رابطاً لاختيار كلمة مرور جديدة.")}>
      {!mailReady && <p className="notice" role="status">{t("Email isn't set up on this server yet, so reset links can't be delivered. Your workspace is safe; ask the Moasis team to reset it for you.", "لم يُفعَّل البريد على هذا الخادم بعد، فلا يمكن إيصال روابط إعادة التعيين. مساحة عملك بأمان؛ اطلب من فريق مؤسس إعادة تعيينها لك.")}</p>}
      <form className="form-stack auth-form" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
        <Field label={t("Email", "البريد الإلكتروني")} error={error ?? undefined}>{(f) => <Input ref={input} id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} type="email" dir="ltr" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" spellCheck={false} autoFocus />}</Field>
        <Button type="submit" size="lg" block disabled={busy} aria-busy={busy}>{busy ? t("One moment…", "لحظة…") : t("Send reset link", "أرسل رابط إعادة التعيين")}</Button>
      </form>
    </Shell>
  );
}

/** Step two: the link from the email lands here with ?token=… (or ?error=INVALID_TOKEN). */
export function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const linkError = params.get("error");
  const input = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (!token || linkError) {
    return (
      <Shell title={t("This link has expired", "انتهت صلاحية هذا الرابط")} lead={t("Reset links work once, for one hour. Ask for a new one and use the latest email.", "تعمل روابط إعادة التعيين مرة واحدة ولمدة ساعة. اطلب رابطاً جديداً واستخدم أحدث رسالة.")}>
        <Button href="/forgot-password">{t("Get a new link", "احصل على رابط جديد")}</Button>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell title={t("Password changed", "تم تغيير كلمة المرور")} lead={t("Sign in with your new password. Other devices have been signed out.", "سجّل الدخول بكلمة المرور الجديدة. تم تسجيل الخروج من الأجهزة الأخرى.")}>
        <Button onClick={() => router.replace("/sign-in")}>{t("Sign in", "تسجيل الدخول")}</Button>
      </Shell>
    );
  }

  const submit = async () => {
    if (busy) return;
    if (password.length < 8) {
      setError(t("Use at least 8 characters.", "استخدم ٨ أحرف على الأقل."));
      input.current?.focus();
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await authClient.resetPassword({ newPassword: password, token });
      if (res.error) {
        setError((res.error.code ?? "").includes("INVALID_TOKEN") ? t("This link has expired. Ask for a new one.", "انتهت صلاحية الرابط. اطلب رابطاً جديداً.") : t("Something went wrong. Please try again.", "حدث خطأ. حاول مرة أخرى."));
        return;
      }
      setDone(true);
    } catch {
      setError(t("Couldn't reach the server. Check your connection and try again.", "تعذّر الوصول إلى الخادم. تحقق من اتصالك وحاول مجدداً."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell title={t("Choose a new password", "اختر كلمة مرور جديدة")} lead={t("Use at least 8 characters. Signing in with it will sign out your other devices.", "استخدم ٨ أحرف على الأقل. سيُسجَّل خروجك من أجهزتك الأخرى.")}>
      <form className="form-stack auth-form" onSubmit={(e) => { e.preventDefault(); void submit(); }} noValidate>
        <Field label={t("New password", "كلمة المرور الجديدة")} error={error ?? undefined}>
          {(f) => (
            <div className="password-input" dir="ltr">
              <Input ref={input} id={f.id} type={show ? "text" : "password"} dir="ltr" aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
              <button type="button" className="icon-btn icon-btn-sm password-toggle" aria-pressed={show} aria-label={show ? t("Hide password", "إخفاء كلمة المرور") : t("Show password", "إظهار كلمة المرور")} onClick={() => setShow((x) => !x)}>
                {show ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
          )}
        </Field>
        <Button type="submit" size="lg" block disabled={busy} aria-busy={busy}>{busy ? t("One moment…", "لحظة…") : t("Save new password", "احفظ كلمة المرور")}</Button>
      </form>
    </Shell>
  );
}
