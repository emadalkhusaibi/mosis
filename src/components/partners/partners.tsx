"use client";
import Link from "next/link";
import { useState } from "react";
import { Briefcase, ChatsCircle, Check, GraduationCap } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { Wordmark } from "@/components/ui/origin";
import { Field, Input, TextArea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

const partnersEmail = process.env.NEXT_PUBLIC_PARTNERS_EMAIL;
const offers = ["internships", "jobs", "sessions"] as const;
type Offer = (typeof offers)[number];

/** The page for companies and leaders: what they can offer founders, and a short form to get in touch. */
export function Partners() {
  const { t, lang, setLang } = useI18n();
  const [form, setForm] = useState({ org: "", name: "", role: "", contact: "", sectors: "", message: "" });
  const [picked, setPicked] = useState<Offer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<"sent" | "copied" | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });
  const offerNames: Record<Offer, string> = { internships: t("Internships", "تدريب"), jobs: t("Jobs", "وظائف"), sessions: t("1:1 sessions", "جلسات فردية") };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.org.trim() || !form.name.trim() || !form.contact.trim()) return setError(t("Add your organisation, your name and a way to reach you.", "أضف جهتك واسمك ووسيلة للتواصل معك."));
    if (!picked.length) return setError(t("Pick at least one thing you could offer.", "اختر شيئاً واحداً على الأقل يمكنك تقديمه."));
    setError(null);
    const body = [
      `Organisation: ${form.org}`, `Name: ${form.name}`, `Role: ${form.role}`, `Contact: ${form.contact}`,
      `Can offer: ${picked.map((o) => offerNames[o]).join(", ")}`, `Business types: ${form.sectors}`, "", form.message,
    ].join("\n");
    if (partnersEmail) {
      window.location.href = `mailto:${partnersEmail}?subject=${encodeURIComponent(`Moasis partner: ${form.org}`)}&body=${encodeURIComponent(body)}`;
      setDone("sent");
    } else {
      try { await navigator.clipboard.writeText(body); } catch { /* clipboard blocked; the text stays in the form */ }
      setDone("copied");
    }
  };

  return (
    <div className="welcome">
      <header className="w-nav">
        <div className="w-container w-nav-inner">
          <Link href="/welcome" aria-label="Moasis"><Wordmark /></Link>
          <nav className="w-nav-actions" aria-label={t("Site", "الموقع")}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>{lang === "ar" ? "English" : "العربية"}</button>
            <Link href="/welcome" className="btn btn-ghost btn-sm">{t("For founders", "للمؤسسين")}</Link>
          </nav>
        </div>
      </header>

      <main id="partners-main">
        <section className="w-hero" aria-labelledby="p-title">
          <div className="w-container">
            <p className="w-eyebrow">{t("Partner with Moasis", "كن شريكاً لمؤسس")}</p>
            <h1 id="p-title" className="w-title">{t("Meet Oman's next founders before anyone else.", "تعرّف على مؤسسي عُمان القادمين قبل غيرك.")}</h1>
            <p className="w-lede">{t("Founders on Moasis practise a real business: they plan it, test it with customers and forecast the cash. Offer an internship, a job or one hour of your time, and they come to you with a record of what they've proven.", "يتدرّب المؤسسون في مؤسس على مشروع حقيقي: يخططون له، ويختبرونه مع الزبائن، ويتوقعون نقده. قدّم تدريباً أو وظيفة أو ساعة من وقتك، ويأتونك بسجلّ لما أثبتوه.")}</p>
          </div>
        </section>

        <section className="w-section" aria-labelledby="p-offer">
          <div className="w-container">
            <h2 id="p-offer" className="w-h2">{t("Three ways to take part", "ثلاث طرق للمشاركة")}</h2>
            <ul className="w-steps">
              <Way icon={<GraduationCap size={20} />} title={t("Internships", "تدريب")} body={t("A few weeks inside your business for a founder planning the same kind of business. We match by business type.", "بضعة أسابيع داخل مشروعك لمؤسس يخطط لمشروع من النوع نفسه. نطابق حسب نوع المشروع.")} />
              <Way icon={<Briefcase size={20} />} title={t("Jobs", "وظائف")} body={t("Hire people who think like owners. Every applicant arrives with their readiness score and field evidence.", "وظّف أشخاصاً يفكرون كالمالكين. يأتي كل متقدم بدرجة جاهزيته وأدلته الميدانية.")} />
              <Way icon={<ChatsCircle size={20} />} title={t("1:1 sessions", "جلسات فردية")} body={t("CEOs, managers, finance leads and entrepreneurs give 30 to 45 minutes. Founders send one clear question first.", "رؤساء تنفيذيون ومدراء وقادة ماليون ورواد أعمال يمنحون ٣٠ إلى ٤٥ دقيقة. يرسل المؤسس سؤالاً واضحاً واحداً أولاً.")} />
            </ul>
          </div>
        </section>

        <section className="w-section w-section-alt" aria-labelledby="p-form">
          <div className="w-container partner-form-wrap">
            <h2 id="p-form" className="w-h2">{t("Tell us what you could offer", "أخبرنا بما يمكنك تقديمه")}</h2>
            <p className="w-section-lede">{t("Two minutes. We'll reply to set up your first listing; you decide who you meet.", "دقيقتان. سنرد عليك لإعداد أول فرصة لك؛ وأنت تقرر من تقابل.")}</p>
            {done ? (
              <p className="notice partner-done" role="status"><Check size={16} aria-hidden="true" />
                {done === "sent" ? t("Your email app should open with the details. Send it and we'll be in touch.", "يُفترض أن يُفتح تطبيق البريد بالتفاصيل. أرسله وسنتواصل معك.") : t("Your details are copied. The partner inbox isn't set up on this site yet, so please send them to the Moasis team directly.", "نُسخت تفاصيلك. صندوق بريد الشركاء غير مُعد على هذا الموقع بعد، فأرسلها إلى فريق مؤسس مباشرة.")}
              </p>
            ) : (
              <form className="partner-form form-stack" noValidate onSubmit={submit}>
                <div className="partner-grid">
                  <Field label={t("Organisation", "الجهة")}>{(f) => <Input id={f.id} value={form.org} onChange={set("org")} maxLength={120} autoComplete="organization" />}</Field>
                  <Field label={t("Your name", "اسمك")}>{(f) => <Input id={f.id} value={form.name} onChange={set("name")} maxLength={120} autoComplete="name" />}</Field>
                  <Field label={t("Your role", "منصبك")} optional>{(f) => <Input id={f.id} value={form.role} onChange={set("role")} maxLength={120} placeholder={t("e.g. CEO, HR manager, founder", "مثال: رئيس تنفيذي، مدير موارد بشرية، مؤسس")} />}</Field>
                  <Field label={t("Email or phone", "البريد أو الهاتف")}>{(f) => <Input id={f.id} value={form.contact} onChange={set("contact")} maxLength={160} />}</Field>
                </div>
                <fieldset className="partner-offers">
                  <legend className="field-label">{t("You could offer", "يمكنك تقديم")}</legend>
                  {offers.map((o) => (
                    <label key={o} className="partner-offer">
                      <input type="checkbox" className="task-check" checked={picked.includes(o)} onChange={() => setPicked(picked.includes(o) ? picked.filter((x) => x !== o) : [...picked, o])} />
                      {offerNames[o]}
                    </label>
                  ))}
                </fieldset>
                <Field label={t("Types of business you know best", "أنواع المشاريع التي تعرفها أكثر")} optional>{(f) => <Input id={f.id} value={form.sectors} onChange={set("sectors")} maxLength={200} placeholder={t("e.g. cafés, retail, logistics", "مثال: مقاهٍ، تجزئة، لوجستيات")} />}</Field>
                <Field label={t("Anything else", "أي شيء آخر")} optional>{(f) => <TextArea id={f.id} value={form.message} onChange={set("message")} maxLength={1200} rows={3} />}</Field>
                {error && <p className="field-error" role="alert">{error}</p>}
                <div><Button type="submit">{t("Send", "أرسل")}</Button></div>
              </form>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Way({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="w-step">
      <div className="w-step-head"><span className="w-step-icon" aria-hidden="true">{icon}</span></div>
      <h3 className="w-bi-title">{title}</h3>
      <p className="w-step-body">{body}</p>
    </li>
  );
}
