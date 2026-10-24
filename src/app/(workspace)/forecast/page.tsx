"use client";
import { useId, useMemo, useState } from "react";
import { ArrowCounterClockwise, CheckCircle, Warning } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { useToast } from "@/components/ui/toast";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Segmented } from "@/components/ui/segmented";
import { Field, MoneyInput } from "@/components/ui/field";
import { CashChart } from "@/components/charts/cash-chart";
import { FinanceSubnav } from "@/components/finance/finance-subnav";
import { sectorOf } from "@/content/sectors";
import { projection, seasonsOf, type Projection, type ScenarioKey } from "@/domain/forecast";
import { marketCalendar, seasonNames } from "@/domain/calendar";
import { formatCoverage, reserveCoverage } from "@/domain/reserve";
import { available, type Finance } from "@/domain/state";
import { moneyErrorText, toBaisa, toDecimal, type Baisa, type MoneyError } from "@/lib/money";

type T = (en: string, ar: string) => string;

export default function ForecastPage() {
  const { t, p, number } = useI18n();
  const { state, update } = useWorkspace();
  const toast = useToast();
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [showTable, setShowTable] = useState(false);
  const f = state.finance;
  const sector = sectorOf(state.venture.sector);
  const unit = p(sector.unit);
  const start = available(state);
  const seasons = useMemo(() => seasonsOf(state), [state]);
  const r = useMemo(() => projection(f, start, scenario, seasons), [f, start, scenario, seasons]);
  const base = useMemo(() => projection(f, start, "base", seasons), [f, start, seasons]);
  const defaults: Finance = { price: toBaisa(sector.price), variable: toBaisa(sector.variable), units: sector.units, fixed: toBaisa(sector.fixed), setup: toBaisa(sector.setup), growth: 3, capacity: null };
  const isDefault = (k: keyof Finance) => f[k] === defaults[k];

  const set = (patch: Partial<Finance>) => update((s) => ({ ...s, finance: { ...s.finance, ...patch } }));
  const resetToSector = () => {
    const prev = f;
    if (!set(defaults)) return;
    toast({ message: t("Sector defaults restored", "تمت استعادة افتراضات القطاع"), action: { label: t("Undo", "تراجع"), run: () => set(prev) } });
  };

  const scenarioName: Record<ScenarioKey, string> = { low: t("Cautious", "متحفظ"), base: t("Base", "أساسي"), high: t("Strong", "قوي") };

  return (
    <>
      <PageHeader
        title={t("Forecast", "التوقعات")}
        description={t("Twelve months modelled from your assumptions. Changing it never touches your wallet.", "اثنا عشر شهراً مبنية على افتراضاتك. تغييرها لا يمسّ محفظتك أبداً.")}
        action={<Button variant="secondary" icon={<ArrowCounterClockwise size={18} />} onClick={resetToSector}>{t("Use sector defaults", "استخدام افتراضات القطاع")}</Button>}
      />
      <FinanceSubnav />

      <div className="forecast-layout">
        <Panel className="forecast-outcome" aria-labelledby="outcome-title">
          <PanelHeader id="outcome-title" title={t("Cash over 12 months", "النقد خلال ١٢ شهراً")}
            subtitle={t("Scenarios scale demand to 70%, 100% or 130%. They are what-ifs, not probabilities.", "تضرب السيناريوهات الطلب في ٧٠٪ أو ١٠٠٪ أو ١٣٠٪. هي احتمالات افتراضية، لا نسب ترجيح.")}
            action={<Segmented label={t("Scenario", "السيناريو")} value={scenario} onChange={setScenario} options={(["low", "base", "high"] as const).map((k) => ({ value: k, label: scenarioName[k] }))} />} />
          <Verdict r={r} />
          <CashChart months={r.months} startCash={r.initialCash} compare={scenario === "base" ? undefined : base.months} compareLabel={scenarioName.base} />
          {scenario !== "base" && <p className="field-hint">{t("Dashed line: the base scenario, for comparison.", "الخط المتقطع: السيناريو الأساسي للمقارنة.")}</p>}
          <dl className="stat-grid forecast-stats">
            <Stat label={t("Lowest cash", "أدنى نقد")} value={<Money value={r.lowestCash} tone={r.lowestCash < 0} />} note={r.lowestMonth === 0 ? t("Right after setup", "بعد التأسيس مباشرة") : t(`Month ${r.lowestMonth}`, `الشهر ${r.lowestMonth}`)} warn={r.lowestCash < 0} />
            <Stat label={t("Cash at month 12", "النقد في الشهر ١٢")} value={<Money value={r.endingCash} tone={r.endingCash < 0} />} />
            <Stat label={t("Break-even volume", "حجم التعادل")} value={breakEvenValue(r, t, number)} note={r.breakEven.kind === "units" ? t(`${unit} a month`, `${unit} شهرياً`) : undefined} warn={r.breakEven.kind === "no-margin"} />
            <Stat label={t("First profitable month", "أول شهر مربح")} value={r.firstPositiveMonth ? t(`Month ${r.firstPositiveMonth}`, `الشهر ${r.firstPositiveMonth}`) : t("Not within 12 months", "ليس خلال ١٢ شهراً")} warn={!r.firstPositiveMonth} />
            <Stat label={t("Unit margin", "هامش الوحدة")} value={<Money value={r.unitMargin} tone={r.unitMargin < 0} />} note={r.marginPercent === null ? t("No price entered", "لم يُدخل سعر") : t(`${number(r.marginPercent, 1)}% of price`, `${number(r.marginPercent, 1)}٪ من السعر`)} warn={r.unitMargin <= 0} />
            <Stat label={t("Reserve coverage", "تغطية الاحتياطي")} value={formatCoverage(reserveCoverage(state.reserve, f.fixed), t, number)} note={<><Money value={state.reserve} /> {t("protected", "محمي")}</>} />
          </dl>
          <details className="disclosure">
            <summary>{t("What these numbers mean", "ماذا تعني هذه الأرقام")}</summary>
            <dl className="disclosure-body definition-list">
              <dt>{t("Lowest cash", "أدنى نقد")}</dt><dd>{t("The smallest cash position across the year, including right after the one-off setup cost. Below zero means you would need more money to get through.", "أصغر رصيد نقدي خلال السنة، بما في ذلك بعد تكلفة التأسيس مباشرة. ما دون الصفر يعني أنك تحتاج مالاً إضافياً.")}</dd>
              <dt>{t("Break-even volume", "حجم التعادل")}</dt><dd>{t("Units a month where sales just cover unit costs and fixed costs: fixed costs ÷ unit margin, rounded up.", "عدد الوحدات شهرياً الذي تغطي فيه المبيعات تكاليف الوحدة والتكاليف الثابتة: التكاليف الثابتة ÷ هامش الوحدة، مقرّباً للأعلى.")}</dd>
              <dt>{t("First profitable month", "أول شهر مربح")}</dt><dd>{t("The first month whose operating profit is above zero. Setup cost isn't counted here.", "أول شهر يكون فيه الربح التشغيلي أكبر من صفر. لا تُحتسب تكلفة التأسيس هنا.")}</dd>
              <dt>{t("Reserve coverage", "تغطية الاحتياطي")}</dt><dd>{t("How many months of fixed costs your protected reserve would pay for. The reserve is not part of starting cash.", "كم شهراً من التكاليف الثابتة يغطيه احتياطيك المحمي. الاحتياطي ليس جزءاً من النقد الأولي.")}</dd>
            </dl>
          </details>
        </Panel>

        <Panel className="forecast-inputs" aria-labelledby="inputs-title">
          <PanelHeader id="inputs-title" title={t("Assumptions", "الافتراضات")} subtitle={t("Each number is marked as a sector default or your own estimate.", "كل رقم مُعلَّم كافتراض للقطاع أو تقدير منك.")} />
          <div className="input-group" role="group" aria-labelledby="group-sales">
            <h3 id="group-sales" className="input-group-title">{t("Sales", "المبيعات")}</h3>
            <ForecastMoney label={t("Price per unit", "سعر الوحدة")} value={f.price} onChange={(price) => set({ price })} isDefault={isDefault("price")} />
            <NumberSlider label={t(`${capitalise(unit)} in month one`, `${unit} في الشهر الأول`)} value={f.units} min={0} max={Math.max(2000, f.units * 2)} step={10} hardMax={10_000_000} onChange={(units) => set({ units })} format={(v) => number(v)} isDefault={isDefault("units")} />
            <NumberSlider label={t("Monthly growth", "النمو الشهري")} value={f.growth} min={-20} max={30} step={1} hardMin={-50} hardMax={100} unitLabel="%" onChange={(growth) => set({ growth })} format={(v) => `${v > 0 ? "+" : ""}${number(v)}%`} isDefault={isDefault("growth")} />
            <CapacityField value={f.capacity} units={f.units} onChange={(capacity) => set({ capacity })} limited={r.capacityLimited} />
          </div>
          <div className="input-group" role="group" aria-labelledby="group-costs">
            <h3 id="group-costs" className="input-group-title">{t("Costs", "التكاليف")}</h3>
            <ForecastMoney label={t("Variable cost per unit", "التكلفة المتغيرة للوحدة")} hint={t("What each sale costs you: ingredients, packaging, delivery.", "ما تكلّفه كل عملية بيع: المكونات والتغليف والتوصيل.")} value={f.variable} onChange={(variable) => set({ variable })} isDefault={isDefault("variable")} />
            <ForecastMoney label={t("Fixed costs per month", "التكاليف الثابتة شهرياً")} hint={t("Rent, salaries, utilities, subscriptions.", "الإيجار والرواتب والمرافق والاشتراكات.")} value={f.fixed} onChange={(fixed) => set({ fixed })} isDefault={isDefault("fixed")} />
          </div>
          <div className="input-group" role="group" aria-labelledby="group-start">
            <h3 id="group-start" className="input-group-title">{t("Starting position", "نقطة البداية")}</h3>
            <dl className="balance-list">
              <div><dt>{t("Available funds", "الأموال المتاحة")}<span className="balance-note">{t("From your wallet, after the protected reserve", "من محفظتك، بعد الاحتياطي المحمي")}</span></dt><dd><Money value={start} /></dd></div>
            </dl>
            <ForecastMoney label={t("One-off setup cost", "تكلفة التأسيس لمرة واحدة")} hint={t("Paid once before month one. If you've already recorded it in the wallet, set this to the part still to pay.", "تُدفع مرة واحدة قبل الشهر الأول. إن سجّلتها في المحفظة، اجعلها الجزء المتبقي فقط.")} value={f.setup} onChange={(setup) => set({ setup })} isDefault={isDefault("setup")} />
            <dl className="balance-list">
              <div className="is-strong"><dt>{t("Starting cash", "النقد الأولي")}</dt><dd><Money value={r.initialCash} tone={r.initialCash < 0} /></dd></div>
            </dl>
          </div>
          <p className="field-hint">{t("Sector defaults are general examples, not local quotes.", "افتراضات القطاع أمثلة عامة، وليست أسعاراً محلية.")}</p>
        </Panel>

        <div className="forecast-details">
          <MarketCalendar />
          <Sensitivity f={f} start={start} scenario={scenario} r={r} seasons={seasons} />

          <Panel aria-labelledby="table-title">
            <PanelHeader id="table-title" title={t("Month by month", "شهراً بشهر")} subtitle={t("Exact to the baisa, so every row adds up.", "دقيق حتى البيسة، فيتطابق كل صف.")}
              action={<Button variant="secondary" size="sm" aria-expanded={showTable} aria-controls="forecast-table" onClick={() => setShowTable((v) => !v)}>{showTable ? t("Hide table", "إخفاء الجدول") : t("Show table", "عرض الجدول")}</Button>} />
            {showTable && <ForecastTable r={r} unit={unit} scenario={scenarioName[scenario]} />}
          </Panel>
        </div>
      </div>
    </>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function breakEvenValue(r: Projection, t: T, number: (n: number) => string) {
  if (r.breakEven.kind === "no-margin") return t("No positive unit margin", "لا يوجد هامش موجب للوحدة");
  if (r.breakEven.kind === "no-fixed") return t("No fixed costs entered", "لم تُدخل تكاليف ثابتة");
  return number(r.breakEven.units);
}

function Verdict({ r }: { r: Projection }) {
  const { t } = useI18n();
  if (r.firstNegativeMonth === 0)
    return <p className="verdict is-caution"><Warning size={20} aria-hidden="true" />{t("The setup cost alone is more than your available funds.", "تكلفة التأسيس وحدها تتجاوز أموالك المتاحة.")} <span>{t("Shortfall", "العجز")}: <Money value={-r.lowestCash} /></span></p>;
  if (r.firstNegativeMonth)
    return <p className="verdict is-caution"><Warning size={20} aria-hidden="true" />{t(`Cash goes below zero in month ${r.firstNegativeMonth}.`, `ينخفض النقد دون الصفر في الشهر ${r.firstNegativeMonth}.`)} <span>{t("To get through the low point you'd need about", "لتجاوز أدنى نقطة تحتاج نحو")} <Money value={-r.lowestCash} /></span></p>;
  return <p className="verdict is-positive"><CheckCircle size={20} aria-hidden="true" />{t("Cash stays above zero all year under these assumptions.", "يبقى النقد فوق الصفر طوال السنة وفق هذه الافتراضات.")}</p>;
}

function Stat({ label, value, note, warn }: { label: string; value: React.ReactNode; note?: React.ReactNode; warn?: boolean }) {
  return (
    <div className={clsx("stat forecast-stat", warn && "is-warn")}>
      <dt className="stat-label">{label}</dt>
      <dd className="stat-value">{value}</dd>
      {note && <dd className="stat-note">{note}</dd>}
    </div>
  );
}

function SourceTag({ isDefault }: { isDefault: boolean }) {
  const { t } = useI18n();
  return <span className={clsx("chip", isDefault ? "" : "chip-accent")}>{isDefault ? t("Sector default", "افتراض القطاع") : t("Your estimate", "تقديرك")}</span>;
}

/** Money assumption: commits only valid values and explains invalid ones in place. */
function ForecastMoney({ label, hint, value, onChange, isDefault }: { label: string; hint?: string; value: Baisa; onChange: (v: Baisa) => void; isDefault: boolean }) {
  const { t } = useI18n();
  const [err, setErr] = useState<MoneyError | null>(null);
  return (
    <Field label={<>{label} <SourceTag isDefault={isDefault} /></>} hint={hint} error={err ? moneyErrorText(err, t) : undefined}>
      {(x) => <MoneyInput id={x.id} describedBy={x.describedBy} invalid={x.invalid} value={value} onChange={(b, _raw, e) => { setErr(e); if (b !== null) onChange(b); }} />}
    </Field>
  );
}

/** A slider paired with an exact number box; both edit the same value. */
function NumberSlider({ label, value, min, max, step, onChange, format, hardMin = 0, hardMax, unitLabel, isDefault }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; hardMin?: number; hardMax: number; unitLabel?: string; isDefault?: boolean }) {
  const id = useId();
  const { t } = useI18n();
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const commit = (raw: string) => {
    const v = Number(raw.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d))).replace(/,/g, ""));
    if (raw.trim() === "" || !Number.isFinite(v) || !Number.isInteger(v)) return setError(t("Enter a whole number.", "أدخل عدداً صحيحاً."));
    if (v < hardMin || v > hardMax) return setError(t(`Use a value from ${hardMin} to ${hardMax}.`, `استخدم قيمة من ${hardMin} إلى ${hardMax}.`));
    setError(null);
    setDraft(null);
    onChange(v);
  };
  return (
    <div className={clsx("field", error && "is-invalid")}>
      <label htmlFor={id} className="field-label">{label} {isDefault !== undefined && <SourceTag isDefault={isDefault} />}</label>
      <div className="number-slider">
        <input type="range" className="slider" min={Math.min(min, value)} max={Math.max(max, value)} step={step} value={value} aria-label={label} aria-valuetext={format(value)} onChange={(e) => { setDraft(null); setError(null); onChange(Number(e.target.value)); }} />
        <span className="number-box" dir="ltr">
          <input id={id} className="input num" inputMode="numeric" value={draft ?? String(value)} aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined}
            onChange={(e) => { setDraft(e.target.value); setError(null); }} onBlur={(e) => draft !== null && commit(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(e.currentTarget.value); } }} />
          {unitLabel && <span className="number-unit" aria-hidden="true">{unitLabel}</span>}
        </span>
      </div>
      {error && <p id={`${id}-err`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

/** Capacity is explicit: unlimited is a switch, not a magic zero. */
function CapacityField({ value, units, onChange, limited }: { value: number | null; units: number; onChange: (v: number | null) => void; limited: boolean }) {
  const { t, number } = useI18n();
  const id = useId();
  const unlimited = value === null;
  return (
    <div className="field">
      <div className="toggle-line">
        <span className="field-label" id={`${id}-l`}>{t("Monthly capacity", "الطاقة الشهرية")}</span>
        <label className="switch-label">
          <input type="checkbox" role="switch" className="switch" checked={unlimited} aria-describedby={`${id}-h`} onChange={(e) => onChange(e.target.checked ? null : Math.max(units, 100))} />
          {t("Unlimited", "غير محدودة")}
        </label>
      </div>
      {!unlimited && <NumberSlider label={t("Units you can make or serve a month", "الوحدات التي يمكنك إنتاجها أو خدمتها شهرياً")} value={value} min={0} max={Math.max(2000, units * 3, value * 2)} step={10} hardMax={10_000_000} onChange={onChange} format={(v) => number(v)} />}
      <p id={`${id}-h`} className="field-hint">
        {unlimited ? t("Sales follow demand with no ceiling.", "تتبع المبيعات الطلب دون سقف.")
          : value === 0 ? t("Zero capacity means no sales at all.", "الطاقة صفر تعني عدم وجود أي مبيعات.")
          : limited ? t("Capacity caps sales in some months. Those months are marked in the table.", "الطاقة تحدّ المبيعات في بعض الأشهر. هذه الأشهر مُعلَّمة في الجدول.")
          : t("Demand stays under capacity all year.", "يبقى الطلب تحت الطاقة طوال السنة.")}
      </p>
    </div>
  );
}

/** The seasons the forecast applies, month by month, with a switch to turn them off. */
function MarketCalendar() {
  const { t, p, lang } = useI18n();
  const { state, update } = useWorkspace();
  const on = state.calendar !== false;
  const months = useMemo(() => marketCalendar(state.venture.sector, state.venture.city), [state.venture.sector, state.venture.city]);
  const monthName = (y: number, m: number) => new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString(lang === "ar" ? "ar-OM-u-nu-latn" : "en-GB", { month: "short", timeZone: "UTC" });
  const pct = (n: number) => (n === 0 ? "0%" : `${n > 0 ? "+" : "−"}${Math.abs(n)}%`);
  return (
    <Panel aria-labelledby="calendar-title">
      <PanelHeader id="calendar-title" title={t("Omani market calendar", "التقويم التجاري العُماني")}
        subtitle={t("Ramadan, Eid, summer, Khareef, back to school and National Day change demand. These are practice assumptions for your sector, not measured data.", "رمضان والعيد والصيف والخريف والعودة إلى المدارس والعيد الوطني تغيّر الطلب. هذه افتراضات تدريبية لقطاعك، وليست بيانات مقيسة.")}
      />
      <Segmented className="season-toggle" label={t("Market calendar", "التقويم التجاري")} value={on ? "on" : "off"} onChange={(v) => update((s) => ({ ...s, calendar: v === "on" }))} options={[{ value: "on", label: t("On", "مفعّل") }, { value: "off", label: t("Off", "متوقف") }]} />
      <ol className={clsx("season-strip", !on && "is-off")} aria-label={t("Seasonal change in demand, by forecast month", "التغيّر الموسمي في الطلب حسب شهر التوقعات")}>
        {months.map((m, i) => (
          <li key={`${m.year}-${m.month}`} className={clsx("season-month", m.percent > 0 && "is-up", m.percent < 0 && "is-down")}>
            <span className="season-name">{monthName(m.year, m.month)}<span className="sr-only"> {m.year}, {t(`month ${i + 1}`, `الشهر ${i + 1}`)}</span></span>
            <span className="season-bar" aria-hidden="true"><span style={{ blockSize: `${Math.min(50, Math.abs(m.percent) * 1.6)}%` }} /></span>
            <span className="season-pct num" dir="ltr">{pct(m.percent)}</span>
            <span className="season-tags">{m.seasons.map((x) => p(seasonNames[x])).join(t(", ", "، "))}</span>
          </li>
        ))}
      </ol>
      <p className="field-hint">{on
        ? t("Month 1 is next month. Islamic dates follow the moon and may shift by a day or two.", "الشهر الأول هو الشهر القادم. تتبع التواريخ الهجرية رؤية الهلال وقد تتغير بيوم أو يومين.")
        : t("Off: every month follows the growth trend only.", "متوقف: يتبع كل شهر اتجاه النمو فقط.")}</p>
    </Panel>
  );
}

function Sensitivity({ f, start, scenario, r, seasons }: { f: Finance; start: Baisa; scenario: ScenarioKey; r: Projection; seasons?: readonly number[] }) {
  const { t } = useI18n();
  // One change at a time, through the same engine.
  const levers = [
    { id: "price", label: t("Price +10%", "السعر +١٠٪"), f: { ...f, price: Math.round(f.price * 1.1) } },
    { id: "cost", label: t("Unit cost −10%", "تكلفة الوحدة −١٠٪"), f: { ...f, variable: Math.round(f.variable * 0.9) } },
    { id: "fixed", label: t("Fixed costs −10%", "التكاليف الثابتة −١٠٪"), f: { ...f, fixed: Math.round(f.fixed * 0.9) } },
    { id: "demand", label: t("Month-one demand −30%", "طلب الشهر الأول −٣٠٪"), f: { ...f, units: Math.round(f.units * 0.7) } },
  ].map((l) => ({ ...l, delta: projection(l.f, start, scenario, seasons).endingCash - r.endingCash }));
  const maxDelta = Math.max(...levers.map((l) => Math.abs(l.delta)), 1);
  return (
    <Panel aria-labelledby="levers-title">
      <PanelHeader id="levers-title" title={t("Which lever matters most?", "أي عامل هو الأهم؟")} subtitle={t("Change in month-12 cash from moving one assumption. Effects of price on demand aren't modelled.", "التغيّر في نقد الشهر ١٢ عند تحريك افتراض واحد. لا يُنمذج أثر السعر على الطلب.")} />
      <ul className="levers">
        {levers.map((l) => (
          <li key={l.id} className="lever">
            <span className="lever-label">{l.label}</span>
            <span className="lever-track" aria-hidden="true">
              <span className={clsx("lever-bar", l.delta < 0 && "is-negative")} style={{ inlineSize: `${(Math.abs(l.delta) / maxDelta) * 50}%`, insetInlineStart: l.delta >= 0 ? "50%" : `${50 - (Math.abs(l.delta) / maxDelta) * 50}%` }} />
            </span>
            <span className="lever-value"><Money value={l.delta} signed tone /></span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ForecastTable({ r, unit, scenario }: { r: Projection; unit: string; scenario: string }) {
  const { t, number } = useI18n();
  const cell = (v: Baisa) => <span dir="ltr" className="num">{toDecimal(v)}</span>;
  return (
    <div className="table-scroll" id="forecast-table" role="region" aria-label={t("Monthly forecast table", "جدول التوقعات الشهرية")} tabIndex={0}>
      <table className="data-table">
        <caption className="sr-only">{t(`Monthly forecast, ${scenario} scenario, amounts in Omani rials`, `التوقعات الشهرية، سيناريو ${scenario}، المبالغ بالريال العُماني`)}</caption>
        <thead><tr><th scope="col">{t("Month", "الشهر")}</th><th scope="col">{capitalise(unit)}</th><th scope="col">{t("Revenue (OMR)", "الإيرادات (ر.ع.)")}</th><th scope="col">{t("Costs (OMR)", "التكاليف (ر.ع.)")}</th><th scope="col">{t("Profit (OMR)", "الربح (ر.ع.)")}</th><th scope="col">{t("Cash (OMR)", "النقد (ر.ع.)")}</th></tr></thead>
        <tbody>
          <tr><th scope="row">{t("Start", "البداية")}</th><td>—</td><td>—</td><td>—</td><td>—</td><td>{cell(r.initialCash)}</td></tr>
          {r.months.map((m) => (
            <tr key={m.month} className={clsx(m.cash < 0 && "is-negative")}>
              <th scope="row">{m.month}</th>
              <td className="num">{number(m.units)}{m.units < m.demand && <span className="table-flag" title={t(`Demand ${m.demand}, capped by capacity`, `الطلب ${m.demand}، مقيّد بالطاقة`)}> *</span>}</td>
              <td>{cell(m.revenue)}</td><td>{cell(m.cost)}</td><td>{cell(m.profit)}</td><td>{cell(m.cash)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr><th scope="row">{t("Total", "الإجمالي")}</th><td /><td>{cell(r.totalRevenue)}</td><td>{cell(r.totalRevenue - r.totalProfit)}</td><td>{cell(r.totalProfit)}</td><td>{cell(r.endingCash)}</td></tr></tfoot>
      </table>
      {r.capacityLimited && <p className="field-hint table-note">{t("* Capped by capacity.", "* مقيّد بالطاقة.")}</p>}
    </div>
  );
}
