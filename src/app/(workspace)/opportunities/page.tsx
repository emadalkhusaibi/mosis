"use client";
import Link from "next/link";
import { useState } from "react";
import { BookmarkSimple, Briefcase, ChatsCircle, GraduationCap, Handshake, Info } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Field, TextArea } from "@/components/ui/field";
import { sectorOf } from "@/content/sectors";
import { forSector, isOpen, kindNames, matches, modeNames, opportunities, type Opportunity, type OpportunityKind } from "@/content/opportunities";
import { kindOrder } from "@/domain/profile";
import { applicationText, recordSent, toggleSaved } from "@/domain/connect";

type Filter = "all" | OpportunityKind;
const icons = { internship: GraduationCap, job: Briefcase, session: ChatsCircle };

/** Internships, jobs and one-to-one sessions from Moasis partners, matched to the founder's type of business. */
export default function OpportunitiesPage() {
  const { t, p, date } = useI18n();
  const { state } = useWorkspace();
  const [kind, setKind] = useState<Filter>("all");
  const [scope, setScope] = useState<"match" | "all">("match");
  const [open, setOpen] = useState<Opportunity | null>(null);
  const sector = state.venture.sector;
  const sectorName = state.venture.sector === "other" ? state.venture.other || t("your business", "مشروعك") : p(sectorOf(sector).name);
  // Fits first, then the kind that suits the founder's experience (internships for a first business, 1:1s for seasoned founders).
  const order = kindOrder(state);
  const rank = (o: Opportunity) => (matches(o, sector) ? 0 : 10) + order.indexOf(o.kind);
  const list = forSector(opportunities, sector).filter((o) => (kind === "all" || o.kind === kind) && (scope === "all" || matches(o, sector))).sort((a, b) => rank(a) - rank(b));
  const sent = state.connect?.sent ?? [];
  const hasExamples = opportunities.some((o) => o.example);

  return (
    <>
      <PageHeader
        title={t("Opportunities", "الفرص")}
        description={t("Internships, jobs and one-to-one time with CEOs, managers and entrepreneurs, picked for your type of business. Your Founder record goes with every request.", "تدريب ووظائف ووقت فردي مع رؤساء تنفيذيين ومدراء ورواد أعمال، مختارة لنوع مشروعك. يرافق سجلّ المؤسس كل طلب ترسله.")}
      />

      {hasExamples && (
        <p className="notice">
          <Info size={16} aria-hidden="true" />
          <span>{t("Partners are joining now. Listings marked Example show how this works: you can save them, but not apply yet.", "الشركاء ينضمون الآن. الفرص المعلَّمة «مثال» توضّح طريقة العمل: يمكنك حفظها، لكن لا يمكنك التقديم عليها بعد.")} <Link className="link" href="/partners">{t("Know a company or leader who'd take part?", "تعرف شركة أو قائداً يودّ المشاركة؟")}</Link></span>
        </p>
      )}

      <div className="opp-filters">
        <Segmented<Filter> label={t("Type", "النوع")} value={kind} onChange={setKind} options={[
          { value: "all", label: t("All", "الكل") },
          { value: "internship", label: t("Internships", "تدريب") },
          { value: "job", label: t("Jobs", "وظائف") },
          { value: "session", label: t("1:1 sessions", "جلسات فردية") },
        ]} />
        <Segmented<"match" | "all"> label={t("Show", "اعرض")} value={scope} onChange={setScope} options={[
          { value: "match", label: t("For my business", "لمشروعي") },
          { value: "all", label: t("Everything", "كل شيء") },
        ]} />
      </div>

      {list.length ? (
        <ul className="opp-grid">
          {list.map((o) => <OpportunityCard key={o.id} o={o} sectorName={sectorName} onOpen={() => setOpen(o)} />)}
        </ul>
      ) : (
        <Panel><p className="field-hint">{t(`Nothing for ${sectorName} in this view yet. Try Everything, or check back as partners join.`, `لا شيء لـ${sectorName} في هذا العرض بعد. جرّب «كل شيء»، أو عد لاحقاً مع انضمام الشركاء.`)}</p></Panel>
      )}

      {sent.length > 0 && (
        <Panel aria-labelledby="sent-title" className="opp-sent">
          <PanelHeader id="sent-title" title={t("Your requests", "طلباتك")} />
          <ul className="list">
            {sent.map((s) => {
              const o = opportunities.find((x) => x.id === s.id);
              return (
                <li key={s.id + s.at} className="row">
                  <span className="row-main"><span className="row-title row-title-wrap">{o ? p(o.title) : s.id}</span><span className="row-sub">{o && p(o.org)} · {t("Sent", "أُرسل")} {date(s.at)}</span></span>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <p className="opp-partner small muted"><Handshake size={16} aria-hidden="true" /> {t("Run a company, or happy to give an hour to a founder?", "تدير شركة، أو مستعد لمنح ساعة لمؤسس؟")} <Link className="link" href="/partners">{t("Partner with Moasis", "كن شريكاً لمؤسس")}</Link></p>

      <RequestSheet o={open} onClose={() => setOpen(null)} />
    </>
  );
}

function OpportunityCard({ o, sectorName, onOpen }: { o: Opportunity; sectorName: string; onOpen: () => void }) {
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  const Icon = icons[o.kind];
  const saved = state.connect?.saved.includes(o.id) ?? false;
  const done = state.connect?.sent.some((s) => s.id === o.id) ?? false;
  const fit = matches(o, state.venture.sector);
  return (
    <li className="opp-card">
      <div className="opp-tags">
        <span className="chip"><Icon size={14} aria-hidden="true" /> {p(kindNames[o.kind])}</span>
        {fit && !o.sectors.includes("*") && <span className="chip chip-positive">{t(`Fits ${sectorName}`, `يناسب ${sectorName}`)}</span>}
        {o.example && <span className="chip chip-warning">{t("Example", "مثال")}</span>}
      </div>
      <h2 className="opp-title">{p(o.title)}</h2>
      <p className="opp-org">{o.person ? <><bdi>{p(o.person.name)}</bdi> · {p(o.person.role)}, <bdi>{p(o.org)}</bdi></> : <bdi>{p(o.org)}</bdi>}</p>
      <p className="opp-about">{p(o.about)}</p>
      {o.topics && <ul className="opp-topics" aria-label={t("Topics", "المواضيع")}>{o.topics.map((x) => <li key={x[0]}>{p(x)}</li>)}</ul>}
      <p className="opp-meta">
        <bdi>{p(o.city)}</bdi> · {p(modeNames[o.mode])} · {p(o.length)}{o.paid && <> · {t("Paid", "مدفوع")}</>}
      </p>
      <div className="opp-actions">
        <Button size="sm" variant={done ? "secondary" : "primary"} onClick={onOpen}>
          {done ? t("Sent", "أُرسل") : o.kind === "session" ? t("Request a session", "اطلب جلسة") : t("Apply", "قدّم")}
        </Button>
        <Button size="sm" variant="ghost" aria-pressed={saved} icon={<BookmarkSimple size={16} weight={saved ? "fill" : "regular"} />} onClick={() => update((s) => toggleSaved(s, o.id))}>
          {saved ? t("Saved", "محفوظ") : t("Save", "احفظ")}
        </Button>
      </div>
    </li>
  );
}

function RequestSheet({ o, onClose }: { o: Opportunity | null; onClose: () => void }) {
  const { t, p, lang } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!o) return null;
  const session = o.kind === "session";
  const ready = isOpen(o);
  const send = () => {
    if (!ready) return;
    if (!note.trim()) return setError(session ? t("Write what you'd like to ask.", "اكتب ما تودّ أن تسأله.") : t("Write a line or two about why you'd fit.", "اكتب سطراً أو سطرين عن سبب مناسبتك."));
    const body = applicationText(state, o, note.trim(), lang);
    const subject = `${session ? (lang === "ar" ? "طلب جلسة" : "Session request") : lang === "ar" ? "طلب تقديم" : "Application"}: ${p(o.title)} (Moasis)`;
    if (o.contact?.email) window.location.href = `mailto:${o.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    else if (o.contact?.url) window.open(o.contact.url, "_blank", "noopener");
    update((s) => recordSent(s, o.id, note.trim()));
    toast({ message: t("Request ready to send", "الطلب جاهز للإرسال") });
    setNote(""); setError(null); onClose();
  };
  return (
    <Sheet open onOpenChange={(v) => { if (!v) { setError(null); onClose(); } }} onSubmit={send}
      title={session ? t(`Request a session: ${p(o.title)}`, `اطلب جلسة: ${p(o.title)}`) : t(`Apply: ${p(o.title)}`, `تقديم: ${p(o.title)}`)}
      description={p(o.org)}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit" disabled={!ready}>{session ? t("Send request", "أرسل الطلب") : t("Send application", "أرسل الطلب")}</Button></>}>
      <div className="form-stack">
        {!ready && <p className="notice notice-warning">{o.example ? t("This is an example listing, so it can't receive requests. Save it to see how your list works.", "هذه فرصة على سبيل المثال، فلا تستقبل طلبات. احفظها لترى كيف تعمل قائمتك.") : t("This listing isn't open for requests yet.", "هذه الفرصة غير مفتوحة للطلبات بعد.")}</p>}
        <Field label={session ? t("What do you want to ask?", "ماذا تريد أن تسأل؟") : t("Why you'd fit", "لماذا تناسبك")} error={error ?? undefined}
          hint={session ? t("One clear question gets a better hour. e.g. Is 1,800 rials a month too much rent for a 40-seat café in Al Khoud?", "سؤال واضح واحد يصنع ساعة أفضل. مثال: هل ١٨٠٠ ريال شهرياً إيجار مرتفع لمقهى بأربعين مقعداً في الخوض؟") : undefined}>
          {(f) => <TextArea id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={note} onChange={(e) => setNote(e.target.value)} maxLength={1200} rows={4} disabled={!ready} />}
        </Field>
        <div className="opp-share">
          <p className="stat-label">{t("Sent with your request", "يُرسل مع طلبك")}</p>
          <p className="small">{t("Your name, business and city, your readiness score and skills, and your field-test count, from your Founder record. Nothing else leaves this device.", "اسمك ومشروعك ومدينتك، ودرجة جاهزيتك ومهاراتك، وعدد اختباراتك الميدانية، من سجلّ المؤسس. لا يغادر هذا الجهاز شيء غير ذلك.")} <Link className="link" href="/record">{t("See your record", "اطّلع على سجلّك")}</Link></p>
        </div>
      </div>
    </Sheet>
  );
}
