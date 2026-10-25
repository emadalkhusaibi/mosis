"use client";
import { useState } from "react";
import { CalendarCheck, Flask, Plus, Trash } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button, IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { Sheet } from "@/components/ui/sheet";
import { Field, Input, MoneyInput, TextArea } from "@/components/ui/field";
import { Money } from "@/components/ui/money";
import { sectorOf } from "@/content/sectors";
import { addAssumption, evidenceSummary, planTest, recordFinding, removeAssumption, removeTest, reviseForecast, type Outcome } from "@/domain/evidence";
import { assumptionCategories, type Assumption, type FieldTest, type ForecastKey } from "@/domain/state";
import type { Baisa } from "@/lib/money";

type T = (en: string, ar: string) => string;

const stateLabel = (t: T): Record<Assumption["state"], { text: string; chip: string }> => ({
  untested: { text: t("Untested", "لم يُختبر"), chip: "" },
  some: { text: t("Some evidence", "بعض الأدلة"), chip: "chip-positive" },
  contradicted: { text: t("Contradicted", "تعارضه الأدلة"), chip: "chip-danger" },
  review: { text: t("Needs another look", "يحتاج نظرة أخرى"), chip: "chip-warning" },
});
const outcomeLabel = (t: T): Record<Outcome, { text: string; chip: string }> => ({
  supports: { text: t("Supports it", "يدعمه"), chip: "chip-positive" },
  contradicts: { text: t("Contradicts it", "يعارضه"), chip: "chip-danger" },
  inconclusive: { text: t("Inconclusive", "غير حاسم"), chip: "chip-warning" },
});
const categoryLabel = (t: T): Record<(typeof assumptionCategories)[number], string> => ({
  demand: t("Demand", "الطلب"), price: t("Price", "السعر"), cost: t("Cost", "التكلفة"), operations: t("Operations", "التشغيل"), other: t("Other", "أخرى"),
});
/** Forecast numbers a finding can revise. Money keys are in baisa. */
const revisable = (t: T): { key: ForecastKey; label: string; money: boolean }[] => [
  { key: "price", label: t("Price per unit", "سعر الوحدة"), money: true },
  { key: "units", label: t("Sales in month one", "مبيعات الشهر الأول"), money: false },
  { key: "variable", label: t("Variable cost per unit", "التكلفة المتغيرة للوحدة"), money: true },
  { key: "fixed", label: t("Fixed costs per month", "التكاليف الثابتة شهرياً"), money: true },
];

export default function ProvePage() {
  const { t } = useI18n();
  const { state } = useWorkspace();
  const sum = evidenceSummary(state);
  const [planning, setPlanning] = useState<{ assumptionId?: string } | null>(null);
  const [adding, setAdding] = useState(false);
  const [recording, setRecording] = useState<FieldTest | null>(null);
  const planned = state.tests.filter((x) => x.status === "planned");
  const done = state.tests.filter((x) => x.status === "done");

  return (
    <>
      <PageHeader
        title={t("Prove", "أثبِت")}
        description={t("Take the plan outside. Write down what you believe, test it with real people, and record what you find, including when it goes against you.", "اخرج بالخطة إلى الواقع. اكتب ما تعتقده، واختبره مع أناس حقيقيين، وسجّل ما تجده، حتى لو جاء عكس توقعك.")}
        action={<Button icon={<Flask size={18} />} onClick={() => setPlanning({})}>{t("Plan a field test", "خطط لاختبار ميداني")}</Button>}
      />

      <div className="grid-12">
        <Panel className="col-12 col-lg-8" aria-labelledby="proof-title">
          <PanelHeader id="proof-title" title={t("Your evidence so far", "أدلتك حتى الآن")} />
          <dl className="stat-grid">
            <div className="stat"><dt className="stat-label">{t("Field tests done", "اختبارات ميدانية منجزة")}</dt><dd className="stat-value">{sum.done}</dd><span className="stat-note">{t(`${sum.planned} planned`, `${sum.planned} مخطط لها`)}</span></div>
            <div className="stat"><dt className="stat-label">{t("Assumptions with support", "افتراضات مدعومة")}</dt><dd className="stat-value">{sum.supported}</dd><span className="stat-note">{t(`of ${sum.assumptions}`, `من ${sum.assumptions}`)}</span></div>
            <div className="stat"><dt className="stat-label">{t("Contradicted", "تعارضها الأدلة")}</dt><dd className="stat-value">{sum.contradicted}</dd><span className="stat-note">{t("Finding these early is the point", "اكتشافها مبكراً هو الهدف")}</span></div>
            <div className="stat"><dt className="stat-label">{t("Forecast changes from evidence", "تعديلات التوقعات من الأدلة")}</dt><dd className="stat-value">{sum.revisions}</dd></div>
          </dl>
          {sum.highUntested.length > 0 && (
            <p className="notice notice-warning prove-notice">{t(`${sum.highUntested.length} high-impact assumption${sum.highUntested.length > 1 ? "s are" : " is"} still untested. Start there.`, `ما زال ${sum.highUntested.length} من الافتراضات عالية الأثر دون اختبار. ابدأ بها.`)}</p>
          )}
        </Panel>

        <Panel className="col-12 col-lg-4 review-card" aria-labelledby="review-card-title">
          <PanelHeader id="review-card-title" title={t("Weekly review", "المراجعة الأسبوعية")} subtitle={sum.reviewedThisWeek ? t("Done for this week", "أُنجزت لهذا الأسبوع") : t("Due this week", "مستحقة هذا الأسبوع")} />
          <p className="secondary">{sum.streak > 0 ? t(`${sum.streak} week${sum.streak > 1 ? "s" : ""} in a row.`, `${sum.streak} أسبوع متتالٍ.`) : t("Three questions, five minutes. It turns what you learned into changes.", "ثلاثة أسئلة وخمس دقائق. تحوّل ما تعلمته إلى تغييرات.")}</p>
          <Button href="/prove/review" variant={sum.reviewedThisWeek ? "secondary" : "primary"} icon={<CalendarCheck size={18} />}>{sum.reviewedThisWeek ? t("Edit this week's review", "عدّل مراجعة هذا الأسبوع") : t("Start review", "ابدأ المراجعة")}</Button>
        </Panel>

        <Panel className="col-12 col-lg-6" aria-labelledby="assumptions-title">
          <PanelHeader id="assumptions-title" title={t("What you believe", "ما تعتقده")} subtitle={t("The assumptions your plan rests on", "الافتراضات التي تقوم عليها خطتك")}
            action={<Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => setAdding(true)}>{t("Add", "إضافة")}</Button>} />
          <AssumptionList onTest={(id) => setPlanning({ assumptionId: id })} />
        </Panel>

        <Panel className="col-12 col-lg-6" aria-labelledby="tests-title">
          <PanelHeader id="tests-title" title={t("Field tests", "الاختبارات الميدانية")} subtitle={t(`${planned.length} planned · ${done.length} done`, `${planned.length} مخطط · ${done.length} منجز`)} />
          <TestList tests={[...planned, ...done]} onRecord={setRecording} onPlan={() => setPlanning({})} />
        </Panel>
      </div>

      <AddAssumptionSheet open={adding} onClose={() => setAdding(false)} />
      <PlanTestSheet key={planning ? `plan-${planning.assumptionId ?? "new"}` : "closed"} open={Boolean(planning)} assumptionId={planning?.assumptionId} onClose={() => setPlanning(null)} />
      <RecordSheet key={recording?.id ?? "none"} test={recording} onClose={() => setRecording(null)} />
    </>
  );
}

function AssumptionList({ onTest }: { onTest: (id: string) => void }) {
  const { t } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const labels = stateLabel(t);
  if (!state.assumptions.length)
    return <div className="empty"><p className="empty-title">{t("Nothing written down yet", "لم تكتب شيئاً بعد")}</p><p>{t("Start with the belief that would hurt most if it were wrong, such as how many people will buy in month one.", "ابدأ بالاعتقاد الذي سيضرّك أكثر لو كان خاطئاً، مثل عدد من سيشتري في الشهر الأول.")}</p></div>;
  const order = { high: 0, medium: 1, low: 2 } as const;
  const sorted = [...state.assumptions].sort((a, b) => order[a.impact] - order[b.impact]);
  return (
    <ul className="list">
      {sorted.map((a) => {
        const tested = state.tests.some((x) => x.assumptionId === a.id);
        return (
          <li key={a.id} className="row evidence-row">
            <span className="row-main">
              <span className="row-title row-title-wrap"><bdi>{a.statement}</bdi></span>
              <span className="row-sub cluster">
                <span className={clsx("chip", labels[a.state].chip)}>{labels[a.state].text}</span>
                <span>{a.impact === "high" ? t("High impact", "أثر عالٍ") : a.impact === "medium" ? t("Medium impact", "أثر متوسط") : t("Low impact", "أثر منخفض")}</span>
                <span>· {categoryLabel(t)[a.category]}</span>
              </span>
            </span>
            <span className="row-end">
              {!tested && <Button variant="ghost" size="sm" onClick={() => onTest(a.id)}>{t("Test this", "اختبره")}</Button>}
              <IconButton label={t(`Delete: ${a.statement}`, `حذف: ${a.statement}`)} size="sm" onClick={() => {
                const prev = state;
                if (update((s) => removeAssumption(s, a.id))) toast({ message: t("Assumption deleted", "حُذف الافتراض"), action: { label: t("Undo", "تراجع"), run: () => update(() => prev) } });
              }}><Trash size={16} /></IconButton>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function TestList({ tests, onRecord, onPlan }: { tests: FieldTest[]; onRecord: (x: FieldTest) => void; onPlan: () => void }) {
  const { t, date } = useI18n();
  const { update } = useWorkspace();
  const outcomes = outcomeLabel(t);
  if (!tests.length)
    return <div className="empty"><p className="empty-title">{t("No field tests yet", "لا اختبارات ميدانية بعد")}</p><p>{t("One small test this week beats a perfect plan next month.", "اختبار صغير هذا الأسبوع أفضل من خطة مثالية الشهر القادم.")}</p><Button variant="secondary" size="sm" onClick={onPlan}>{t("Plan your first test", "خطط لاختبارك الأول")}</Button></div>;
  return (
    <ul className="list">
      {tests.map((x) => (
        <li key={x.id} className="row evidence-row">
          <span className="row-main">
            <span className="row-title row-title-wrap"><bdi>{x.action}</bdi></span>
            {x.status === "done" ? (
              <>
                <span className="row-sub cluster">{x.outcome && <span className={clsx("chip", outcomes[x.outcome].chip)}>{outcomes[x.outcome].text}</span>}{x.observedAt && <span>{date(x.observedAt)}</span>}</span>
                {x.finding && <span className="evidence-finding"><bdi>{x.finding}</bdi></span>}
              </>
            ) : (
              <span className="row-sub">{x.plannedFor ? t(`Planned for ${date(x.plannedFor)}`, `مخطط له في ${date(x.plannedFor)}`) : t("Planned", "مخطط له")} · {t("Decision rule:", "قاعدة القرار:")} <bdi>{x.decisionRule}</bdi></span>
            )}
          </span>
          <span className="row-end">
            {x.status === "planned" ? <Button size="sm" onClick={() => onRecord(x)}>{t("Record result", "سجّل النتيجة")}</Button> : <Button variant="ghost" size="sm" onClick={() => onRecord(x)}>{t("Edit", "تعديل")}</Button>}
            {x.status === "planned" && <IconButton label={t("Delete test", "حذف الاختبار")} size="sm" onClick={() => update((s) => removeTest(s, x.id))}><Trash size={16} /></IconButton>}
          </span>
        </li>
      ))}
    </ul>
  );
}

function AddAssumptionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { update } = useWorkspace();
  const [statement, setStatement] = useState("");
  const [impact, setImpact] = useState<Assumption["impact"]>("high");
  const [category, setCategory] = useState<Assumption["category"]>("demand");
  const [error, setError] = useState<string | null>(null);
  const labels = categoryLabel(t);
  const save = () => {
    if (!statement.trim()) return setError(t("Write the belief in one sentence.", "اكتب الاعتقاد في جملة واحدة."));
    if (!update((s) => addAssumption(s, { statement: statement.trim(), impact, category, chapter: category === "demand" ? "customer" : category === "operations" ? "operations" : "finance" }))) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    setStatement(""); setError(null); onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { setError(null); onClose(); } }} title={t("Add an assumption", "أضف افتراضاً")} description={t("Something your plan needs to be true, written so it could be proven wrong.", "شيء تحتاج خطتك أن يكون صحيحاً، مكتوب بطريقة يمكن إثبات خطئها.")} onSubmit={save}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Add assumption", "أضف الافتراض")}</Button></>}>
      <div className="form-stack">
        <Field label={t("I believe that…", "أعتقد أن…")} error={error ?? undefined} hint={t("e.g. At least 40 office workers nearby will buy coffee before 8 am.", "مثال: ٤٠ موظفاً على الأقل في المكاتب القريبة سيشترون القهوة قبل الثامنة صباحاً.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={statement} onChange={(e) => setStatement(e.target.value)} maxLength={400} rows={3} autoFocus />}</Field>
        <div className="field"><span className="field-label">{t("If it's wrong, how much does it hurt?", "إن كان خاطئاً، ما مقدار الضرر؟")}</span><Segmented label={t("Impact", "الأثر")} value={impact} onChange={setImpact} options={[{ value: "high", label: t("A lot", "كثيراً") }, { value: "medium", label: t("Some", "بعض الشيء") }, { value: "low", label: t("A little", "قليلاً") }]} /></div>
        <div className="field"><span className="field-label">{t("It's about", "يتعلق بـ")}</span><Segmented label={t("Category", "الفئة")} value={category} onChange={setCategory} options={assumptionCategories.map((c) => ({ value: c, label: labels[c] }))} /></div>
      </div>
    </Sheet>
  );
}

function PlanTestSheet({ open, assumptionId, onClose }: { open: boolean; assumptionId?: string; onClose: () => void }) {
  const { t, p } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const linked = state.assumptions.find((a) => a.id === assumptionId);
  const [link, setLink] = useState(assumptionId ?? "");
  const [belief, setBelief] = useState(linked?.statement ?? "");
  const [action, setAction] = useState(state.tests.length ? "" : p(sectorOf(state.venture.sector).test));
  const [observe, setObserve] = useState("");
  const [rule, setRule] = useState("");
  const [when, setWhen] = useState(() => new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const save = () => {
    if (!action.trim() || !observe.trim() || !rule.trim()) return setError(t("Fill in what you'll do, what you'll count and your decision rule.", "املأ ما ستفعله وما ستقيسه وقاعدة قرارك."));
    const ok = update((s) => planTest(s, { assumptionId: link || undefined, belief: belief.trim(), action: action.trim(), observe: observe.trim(), decisionRule: rule.trim(), plannedFor: when || undefined }));
    if (!ok) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    toast({ message: t("Field test planned", "تم التخطيط للاختبار") });
    onClose();
  };
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()} size="lg" title={t("Plan a field test", "خطط لاختبار ميداني")} description={t("Decide in advance what result would change your mind. That keeps the test honest.", "قرّر مسبقاً ما النتيجة التي ستغيّر رأيك. هذا يُبقي الاختبار صادقاً.")} onSubmit={save}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Plan test", "خطط للاختبار")}</Button></>}>
      <div className="form-stack">
        {state.assumptions.length > 0 && (
          <Field label={t("Which assumption does it test?", "أي افتراض يختبر؟")} optional>{(f) => (
            <select id={f.id} className="input" value={link} onChange={(e) => { setLink(e.target.value); const a = state.assumptions.find((x) => x.id === e.target.value); if (a && !belief) setBelief(a.statement); }}>
              <option value="">{t("None", "لا شيء")}</option>
              {state.assumptions.map((a) => <option key={a.id} value={a.id}>{a.statement.slice(0, 90)}</option>)}
            </select>
          )}</Field>
        )}
        <Field label={t("What I believe", "ما أعتقده")} optional>{(f) => <TextArea id={f.id} value={belief} onChange={(e) => setBelief(e.target.value)} maxLength={600} rows={2} />}</Field>
        <Field label={t("What I'll do", "ما سأفعله")} hint={t("Small and real: talk to people, ask for quotes, count, offer a pre-order.", "صغير وحقيقي: تحدث مع الناس، اطلب عروض أسعار، احسب، اعرض طلباً مسبقاً.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} value={action} onChange={(e) => setAction(e.target.value)} maxLength={600} rows={2} />}</Field>
        <Field label={t("What I'll count or watch for", "ما سأقيسه أو أراقبه")} hint={t("e.g. How many of 10 people say they'd pay 2.5 rials.", "مثال: كم من ١٠ أشخاص يقولون إنهم سيدفعون ٢٫٥ ريال.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} value={observe} onChange={(e) => setObserve(e.target.value)} maxLength={600} rows={2} />}</Field>
        <Field label={t("My decision rule", "قاعدة قراري")} hint={t("e.g. Fewer than 4 of 10: I lower the price or change the offer.", "مثال: أقل من ٤ من ١٠: أخفّض السعر أو أغيّر العرض.")}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} value={rule} onChange={(e) => setRule(e.target.value)} maxLength={600} rows={2} />}</Field>
        <Field label={t("When", "متى")} optional>{(f) => <Input id={f.id} type="date" value={when} onChange={(e) => setWhen(e.target.value)} />}</Field>
        {error && <p className="notice notice-danger" role="alert">{error}</p>}
      </div>
    </Sheet>
  );
}

function RecordSheet({ test, onClose }: { test: FieldTest | null; onClose: () => void }) {
  const { t, number } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [outcome, setOutcome] = useState<Outcome>(test?.outcome ?? "supports");
  const [finding, setFinding] = useState(test?.finding ?? "");
  const [limits, setLimits] = useState(test?.limitations ?? "");
  const [source, setSource] = useState(test?.sourceUrl ?? "");
  const [reviseKey, setReviseKey] = useState<ForecastKey | "">("");
  const [money, setMoney] = useState<Baisa | null>(null);
  const [count, setCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const outcomes = outcomeLabel(t);
  const keys = revisable(t);
  const chosen = keys.find((k) => k.key === reviseKey);
  if (!test) return null;
  const current = chosen ? state.finance[chosen.key] : null;

  const save = () => {
    if (!finding.trim()) return setError(t("Write what actually happened, with numbers if you have them.", "اكتب ما حدث فعلاً، بالأرقام إن وُجدت."));
    if (source && !/^https?:\/\/\S+$/.test(source.trim())) return setError(t("The link should start with https://", "يجب أن يبدأ الرابط بـ https://"));
    let to: number | null = null;
    if (chosen) {
      to = chosen.money ? money : Number.parseInt(count, 10);
      if (to === null || !Number.isFinite(to) || to < 0) return setError(t("Enter the new number, or choose not to change the forecast.", "أدخل الرقم الجديد، أو اختر عدم تغيير التوقعات."));
    }
    const ok = update((s) => {
      let next = recordFinding(s, test.id, { outcome, finding: finding.trim(), limitations: limits.trim(), sourceUrl: source.trim() || undefined });
      if (chosen && to !== null) next = reviseForecast(next, chosen.key, to, finding.trim().slice(0, 400), test.id);
      return next;
    });
    if (!ok) return setError(t("That couldn't be saved.", "تعذّر الحفظ."));
    toast({ message: chosen ? t("Result recorded and forecast updated", "سُجّلت النتيجة وحُدّثت التوقعات") : t("Result recorded", "سُجّلت النتيجة") });
    onClose();
  };

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} size="lg" title={t("Record the result", "سجّل النتيجة")} description={<><bdi>{test.action}</bdi>{test.decisionRule && <> · {t("Your rule:", "قاعدتك:")} <bdi>{test.decisionRule}</bdi></>}</>} onSubmit={save}
      footer={<><Button variant="secondary" onClick={onClose}>{t("Cancel", "إلغاء")}</Button><Button type="submit">{t("Save result", "احفظ النتيجة")}</Button></>}>
      <div className="form-stack">
        <div className="field"><span className="field-label">{t("What did it show?", "ماذا أظهر؟")}</span><Segmented label={t("Outcome", "النتيجة")} value={outcome} onChange={setOutcome} options={(["supports", "contradicts", "inconclusive"] as const).map((o) => ({ value: o, label: outcomes[o].text }))} /></div>
        <Field label={t("What happened", "ما حدث")} error={error ?? undefined}>{(f) => <TextArea id={f.id} aria-describedby={f.describedBy} aria-invalid={f.invalid || undefined} value={finding} onChange={(e) => setFinding(e.target.value)} maxLength={2000} rows={4} autoFocus placeholder={t("e.g. 3 of 10 said yes at 2.5 rials; 7 said yes at 1.8.", "مثال: ٣ من ١٠ وافقوا على ٢٫٥ ريال؛ ٧ وافقوا على ١٫٨.")} />}</Field>
        <Field label={t("What could make this misleading?", "ما الذي قد يجعل هذا مضللاً؟")} optional hint={t("Small sample, friends and family, one time of day…", "عينة صغيرة، أصدقاء وعائلة، وقت واحد من اليوم…")}>{(f) => <TextArea id={f.id} value={limits} onChange={(e) => setLimits(e.target.value)} maxLength={1000} rows={2} />}</Field>
        <Field label={t("Link to notes or a photo", "رابط للملاحظات أو صورة")} optional>{(f) => <Input id={f.id} type="url" dir="ltr" value={source} onChange={(e) => setSource(e.target.value)} maxLength={500} placeholder="https://" />}</Field>
        <fieldset className="field revise">
          <legend className="field-label">{t("Change a forecast number because of this?", "هل تغيّر رقماً في التوقعات بسبب هذا؟")}</legend>
          <select className="input" aria-label={t("Forecast number", "رقم التوقعات")} value={reviseKey} onChange={(e) => { setReviseKey(e.target.value as ForecastKey | ""); setMoney(null); setCount(""); }}>
            <option value="">{t("No, leave the forecast as it is", "لا، اترك التوقعات كما هي")}</option>
            {keys.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
          </select>
          {chosen && (
            <>
              <p className="field-hint">{t("Now", "الآن")}: {chosen.money ? <Money value={current as number} /> : number(current as number)}</p>
              {chosen.money ? <MoneyInput value={money} onChange={(b) => setMoney(b)} /> : <Input inputMode="numeric" dir="ltr" value={count} onChange={(e) => setCount(e.target.value.replace(/[^\d]/g, ""))} aria-label={t("New value", "القيمة الجديدة")} />}
              <p className="field-hint">{t("The change is recorded with this test, so you can always see why the number moved.", "يُسجَّل التغيير مع هذا الاختبار، فترى دائماً سبب تغيّر الرقم.")}</p>
            </>
          )}
        </fieldset>
      </div>
    </Sheet>
  );
}
