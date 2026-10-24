import "server-only";

/**
 * Outgoing email. Uses Resend's HTTP API when RESEND_API_KEY and EMAIL_FROM are set.
 * Without them, messages are printed to the server log in development and dropped in
 * production, and `mailConfigured` lets pages say that recovery by email is unavailable.
 */
export const mailConfigured = Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

export type Mail = { to: string; subject: string; text: string; html: string };

export async function sendMail(mail: Mail) {
  if (!mailConfigured) {
    if (process.env.NODE_ENV !== "production") console.info(`[mail] to ${mail.to}: ${mail.subject}\n${mail.text}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: process.env.EMAIL_FROM, to: mail.to, subject: mail.subject, text: mail.text, html: mail.html }),
  });
  if (!res.ok) console.error(`[mail] send failed: ${res.status}`);
}

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** The reset email, in Arabic and English together, since we don't know which the reader prefers. */
export function resetPasswordMail(to: string, name: string, url: string): Mail {
  const first = name.split(/\s+/)[0] || "";
  return {
    to,
    subject: "Reset your Moasis password · إعادة تعيين كلمة مرور مؤسس",
    text: [
      `Hello ${first},`,
      "Someone asked to reset the password for your Moasis account. Open this link within one hour to choose a new one:",
      url,
      "If it wasn't you, ignore this email. Your password stays the same.",
      "",
      `مرحباً ${first}،`,
      "طلب أحدهم إعادة تعيين كلمة مرور حسابك في مؤسس. افتح هذا الرابط خلال ساعة لاختيار كلمة جديدة:",
      url,
      "إن لم تكن أنت، تجاهل هذه الرسالة. تبقى كلمة مرورك كما هي.",
    ].join("\n"),
    html: `<div style="font-family:system-ui,sans-serif;line-height:1.6;color:#202429;max-width:520px">
<p>Hello ${escape(first)},</p>
<p>Someone asked to reset the password for your Moasis account. Open this link within one hour to choose a new one.</p>
<p><a href="${escape(url)}" style="display:inline-block;background:#202429;color:#F1F4F6;padding:10px 18px;border-radius:8px;text-decoration:none">Choose a new password</a></p>
<p style="color:#5E6873">If it wasn't you, ignore this email. Your password stays the same.</p>
<hr style="border:0;border-top:1px solid #C9D0D6;margin:24px 0">
<div dir="rtl" lang="ar" style="font-family:Tajawal,system-ui,sans-serif">
<p>مرحباً ${escape(first)}،</p>
<p>طلب أحدهم إعادة تعيين كلمة مرور حسابك في مؤسس. افتح الرابط خلال ساعة لاختيار كلمة جديدة.</p>
<p><a href="${escape(url)}" style="display:inline-block;background:#202429;color:#F1F4F6;padding:10px 18px;border-radius:8px;text-decoration:none">اختر كلمة مرور جديدة</a></p>
<p style="color:#5E6873">إن لم تكن أنت، تجاهل هذه الرسالة. تبقى كلمة مرورك كما هي.</p>
</div></div>`,
  };
}
