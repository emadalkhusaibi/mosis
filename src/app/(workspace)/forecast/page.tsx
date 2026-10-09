"use client";
import { useMemo, useState } from "react";
import { ArrowCounterClockwise, Info, TrendDown, TrendUp, Warning } from "@phosphor-icons/react";
import clsx from "clsx";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { Money } from "@/components/ui/money";
import { Segmented } from "@/components/ui/segmented";
import { Field, MoneyInput } from "@/components/ui/field";
import { CashChart } from "@/components/charts/cash-chart";
import { sectorOf } from "@/content/sectors";
import { projection, type ScenarioKey } from "@/domain/forecast";
import { available, type Finance } from "@/domain/state";
import { toBaisa } from "@/lib/money";

export default function ForecastPage() {
  const { t, p, number } = useI18n();
  const { state, update } = useWorkspace();
  const [scenario, setScenario] = useState<ScenarioKey>("base");
  const [showTable, setShowTable] = useState(false);
  const f = state.finance;
  const sector = sectorOf(state.venture.sector);
  const unit = p(sector.unit);
  const start = available(state);
  const r = useMemo(() => projection(f, start, scenario), [f, start, scenario]);
  const base = useMemo(() => projection(f, start, "base"), [f, start]);

  const set = (patch: Partial<Finance>) => update((s) => ({ ...s, finance: { ...s.finance, ...patch } }));
  const resetToSector = () => set({ price: toBaisa(sector.price), variable: toBaisa(sector.variable), units: sector.units, fixed: toBaisa(sector.fixed), setup: toBaisa(sector.setup), growth: 3, capacity: 0 });

  // What-if: one change at a time, so the founder sees which lever matters most.
  const levers = [
    { id: "price", label: t("Price +10%", "السعر +١٠٪"), f: { ...f, price: Math.round(f.price * 1.1) } },
    { id: "cost", label: t("Unit cost −10%", "تكلفة الوحدة −١٠٪"), f: { ...f, variable: Math.round(f.variable * 0.9) } },
    { id: "fixed", label: t("Fixed costs −10%", "التكاليف الثابتة −١٠٪"), f: { ...f, fixed: Math.round(f.fixed * 0.9) } },
    { id: "demand", label: t("Demand −30%", "الطلب −٣٠٪"), f: { ...f, units: Math.round(f.units * 0.7) } },
  ].map((l) => ({ ...l, delta: projection(l.f, start, scenario).endingCash - r.endingCash }));
  const maxDelta = Math.max(...levers.map((l) => Math.abs(l.delta)), 1);

  const reserveMonths = f.fixed > 0 ? state.reserve / f.fixed : null;

  return (
    <>
      <PageHeader
        eyebrow={t("Forecast", "التوقعات")}
        title={t("See the year before you live it.", "شاهد السنة قبل أن تعيشها.")}
        description={t("A forward plan built from your assumptions. It never changes your wallet.", "خطة مستقبلية مبنية على افتراضاتك. لا تغيّر محفظتك أبداً.")}
        action={<Button variant="secondary" icon={<ArrowCounterClockwise size={18} />} onClick={resetToSector}>{t("Sector defaults", "افتراضات القطاع")}</Button>}
      />

      <div className="forecast-layout">
        <Panel className="forecast-inputs">
          <PanelHeader title={t("Assumptions", "الافتراضات")} subtitle={t(`Per ${unit.replace(/s$/, "")} and per month`, "لكل وحدة ولكل شهر")} />
          <div className="sheet-form">
            <Field label={t("Price per unit", "سعر الوحدة")}>{(x) => <MoneyInput id={x.id} value={f.price} onChange={(b) => b !== null && b >= 0 && set({ price: b })} />}</Field>
            <Field label={t("Variable cost per unit", "التكلفة المتغيرة للوحدة")} hint={t("Ingredients, packaging, delivery: what each sale costs you.", "المكونات والتغليف والتوصيل: ما تكلّفه كل عملية بيع.")}>{(x) => <MoneyInput id={x.id} describedBy={x.describedBy} value={f.variable} onChange={(b) => b !== null && b >= 0 && set({ variable: b })} />}</Field>
            <SliderField label={t(`${capitalise(unit)} in month one`, `${unit} في الشهر الأول`)} value={f.units} min={0} max={Math.max(5000, f.units * 2)} step={10} onChange={(units) => set({ units })} format={(v) => number(v)} />
            <SliderField label={t("Monthly growth", "النمو الشهري")} value={f.growth} min={-20} max={30} step={1} onChange={(growth) => set({ growth })} format={(v) => `${v > 0 ? "+" : ""}${v}%`} />
            <Field label={t("Fixed costs per month", "التكاليف الثابتة شهرياً")} hint={t("Rent, salaries, utilities, subscriptions.", "الإيجار والرواتب والمرافق والاشتراكات.")}>{(x) => <MoneyInput id={x.id} describedBy={x.describedBy} value={f.fixed} onChange={(b) => b !== null && b >= 0 && set({ fixed: b })} />}</Field>
            <Field label={t("One-off setup cost", "تكلفة التأسيس لمرة واحدة")}>{(x) => <MoneyInput id={x.id} value={f.setup} onChange={(b) => b !== null && b >= 0 && set({ setup: b })} />}</Field>
            <SliderField label={t("Monthly capacity", "الطاقة الشهرية")} value={f.capacity} min={0} max={Math.max(5000, f.capacity * 2, f.units * 3)} step={10} onChange={(capacity) => set({ capacity })} format={(v) => (v === 0 ? t("Unlimited", "غير محدودة") : number(v))} />
          </div>
        </Panel>

        <div className="forecast-main">
          <Panel>
            <PanelHeader
              title={t("Cash over 12 months", "النقد خلال ١٢ شهراً")}
              subtitle={<>{t("Starting from what you can spend today", "بدءاً مما يمكنك إنفاقه اليوم")}: <Money value={start} /></>}
              action={<Segmented size="sm" label={t("Scenario", "السيناريو")} value={scenario} onChange={setScenario} options={[{ value: "low", label: t("Cautious", "متحفظ") }, { value: "base", label: t("Base", "أساسي") }, { value: "high", label: t("Strong", "قوي") }]} />}
            />
            <CashChart months={r.months} startCash={start} height={240} compare={scenario === "base" ? undefined : base.months} />
            {scenario !== "base" && <p className="muted small mt-2">{t("Dashed line: base case for comparison.", "الخط المتقطع: الحالة الأساسية للمقارنة.")}</p>}
            <div className={clsx("verdict", r.firstNegativeMonth ? "is-caution" : "is-positive")}>
              {r.firstNegativeMonth ? <Warning size={20} /> : <TrendUp size={20} />}
              <p>
                {r.firstNegativeMonth
                  ? t(`Cash runs out in month ${r.firstNegativeMonth}. You'd need about `, `ينفد النقد في الشهر ${r.firstNegativeMonth}. ستحتاج إلى نحو `)
                  : t("Cash stays positive all year. ", "يبقى النقد موجباً طوال السنة. ")}
                {r.firstNegativeMonth ? <><Money value={-r.lowestCash} decimals={0} />{t(" more to get through the low point.", " إضافية لتجاوز أدنى نقطة.")}</> : <>{t("Ending cash: ", "النقد في النهاية: ")}<Money value={r.endingCash} decimals={0} />.</>}
              </p>
            </div>
          </Panel>

          <div className="kpi-grid">
            <Kpi label={t("Unit margin", "هامش الوحدة")} value={<Money value={r.unitMargin} animate />} note={t(`${r.marginPercent.toFixed(0)}% of price`, `${r.marginPercent.toFixed(0)}٪ من السعر`)} warn={r.unitMargin <= 0} />
            <Kpi label={t("Break-even volume", "حجم التعادل")} value={r.breakEvenUnits ? number(r.breakEvenUnits) : "—"} note={r.breakEvenUnits ? t(`${unit} per month`, `${unit} شهرياً`) : t("Price must exceed unit cost", "يجب أن يتجاوز السعر تكلفة الوحدة")} warn={!r.breakEvenUnits} />
            <Kpi label={t("First profitable month", "أول شهر مربح")} value={r.breakEvenMonth ? t(`Month ${r.breakEvenMonth}`, `الشهر ${r.breakEvenMonth}`) : t("Not within a year", "ليس خلال سنة")} warn={!r.breakEvenMonth} />
            <Kpi label={t("12-month revenue", "إيرادات ١٢ شهراً")} value={<Money value={r.totalRevenue} compact animate />} />
            <Kpi label={t("12-month profit", "ربح ١٢ شهراً")} value={<Money value={r.totalProfit} compact animate />} warn={r.totalProfit < 0} />
            <Kpi label={t("Reserve cover", "تغطية الاحتياطي")} value={reserveMonths === null ? "—" : t(`${reserveMonths.toFixed(1)} mo`, `${reserveMonths.toFixed(1)} شهر`)} note={t("of fixed costs", "من التكاليف الثابتة")} />
          </div>

          <Panel>
            <PanelHeader title={t("Which lever matters most?", "أي عامل هو الأهم؟")} subtitle={t("Change to month-12 cash if you moved just one assumption.", "التغيّر في نقد الشهر ١٢ لو غيّرت افتراضاً واحداً فقط.")} />
            <ul className="levers">
              {levers.map((l) => (
                <li key={l.id} className="lever">
                  <span className="lever-label">{l.label}</span>
                  <span className="lever-track" aria-hidden="true">
                    <span className={clsx("lever-bar", l.delta < 0 && "is-negative")} style={{ inlineSize: `${(Math.abs(l.delta) / maxDelta) * 50}%`, insetInlineStart: l.delta >= 0 ? "50%" : `${50 - (Math.abs(l.delta) / maxDelta) * 50}%` }} />
                  </span>
                  <span className="lever-value">{l.delta >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}<Money value={l.delta} signed compact /></span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel>
            <PanelHeader title={t("Month by month", "شهراً بشهر")} action={<Button variant="ghost" size="sm" onClick={() => setShowTable((v) => !v)}>{showTable ? t("Hide table", "إخفاء الجدول") : t("Show table", "عرض الجدول")}</Button>} />
            {showTable && (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>{t("Month", "الشهر")}</th><th>{capitalise(unit)}</th><th>{t("Revenue", "الإيرادات")}</th><th>{t("Costs", "التكاليف")}</th><th>{t("Profit", "الربح")}</th><th>{t("Cash", "النقد")}</th></tr></thead>
                  <tbody>
                    {r.months.map((m) => (
                      <tr key={m.month} className={clsx(m.cash < 0 && "is-negative")}>
                        <td>{m.month}</td><td className="num">{number(m.units)}</td><td><Money value={m.revenue} decimals={0} /></td><td><Money value={m.cost} decimals={0} /></td><td><Money value={m.profit} decimals={0} /></td><td><Money value={m.cash} decimals={0} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="muted small flex items-start gap-2"><Info size={16} className="mt-0.5 flex-none" />{t("Cautious and strong scenarios scale demand by 70% and 130%. Starting defaults are general sector profiles, not local quotes.", "يضرب السيناريو المتحفظ والقوي الطلب في ٧٠٪ و١٣٠٪. الافتراضات الأولية ملفات عامة للقطاع وليست أسعاراً محلية.")}</p>
          </Panel>
        </div>
      </div>
    </>
  );
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function Kpi({ label, value, note, warn }: { label: string; value: React.ReactNode; note?: string; warn?: boolean }) {
  return (
    <Panel className={clsx("kpi", warn && "is-warn")}>
      <span className="stat-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {note && <span className="stat-note">{note}</span>}
    </Panel>
  );
}

function SliderField({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string }) {
  return (
    <div className="field">
      <div className="slider-head"><span className="field-label">{label}</span><output className="slider-value num">{format(value)}</output></div>
      <input type="range" className="slider" min={min} max={max} step={step} value={value} aria-label={label} aria-valuetext={format(value)} onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` } as React.CSSProperties} />
    </div>
  );
}

