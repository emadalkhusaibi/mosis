"use client";
import { useRef, useState } from "react";
import clsx from "clsx";
import { ArrowsClockwise, DownloadSimple, Sparkle, Star, X, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { PageHeader, Panel, PanelHeader } from "@/components/ui/panel";
import { Field, Input } from "@/components/ui/field";
import { Button, IconButton } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { useToast } from "@/components/ui/toast";
import { LogoMark, BrandLockup } from "@/components/brand/logo-mark";
import { BrandAssistant, brandOf } from "@/components/brand/assistant";
import { sectorOf } from "@/content/sectors";
import { contrast, initials, logoShapes, nameIdeas, onColor, palettes, type Brand, type NameIdea, type Palette } from "@/domain/brand";

export default function BrandPage() {
  const { t, p, lang } = useI18n();
  const ws = useWorkspace();
  const toast = useToast();
  const v = ws.state.venture;
  const brand = brandOf(ws.state.brand, v.name);
  const setBrand = (fn: (b: Brand) => Brand) => ws.update((s) => ({ ...s, brand: fn(brandOf(s.brand, s.venture.name)) }));
  const markRef = useRef<SVGSVGElement>(null);

  const download = () => {
    const svg = markRef.current;
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${(brand.name || "logo").replace(/[^\p{L}\p{N}]+/gu, "-").toLowerCase()}-logo.svg` });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <>
      <PageHeader
        eyebrow={p(sectorOf(v.sector).name)}
        title={t("Brand studio", "استوديو الهوية")}
        description={t("Shape your business name, colours and logo, and see them on a sign, a card and a profile picture. Your brand partner can suggest ideas; you choose.", "صُغ اسم مشروعك وألوانه وشعاره، وشاهدها على لافتة وبطاقة وصورة حساب. يقترح عليك شريك الهوية أفكاراً، والاختيار لك.")}
      />

      <Preview brand={brand} markRef={markRef} onDownload={download} />

      <div className="brand-grid">
        <div className="brand-main">
          <NamePanel brand={brand} setBrand={setBrand} sector={v.sector} ventureName={v.name}
            onAdopt={() => { ws.update((s) => ({ ...s, venture: { ...s.venture, name: brand.name } })); toast({ message: t("Business name updated across your workspace.", "حُدّث اسم المشروع في مساحة عملك.") }); }} />
          <ColourPanel brand={brand} setBrand={setBrand} lang={lang} />
          <LogoPanel brand={brand} setBrand={setBrand} />
        </div>
        <aside className="brand-side">
          <BrandAssistant brand={brand} setBrand={setBrand} />
        </aside>
      </div>
    </>
  );
}

/* ---------- Preview ---------- */

function Preview({ brand, markRef, onDownload }: { brand: Brand; markRef: React.RefObject<SVGSVGElement | null>; onDownload: () => void }) {
  const { t } = useI18n();
  const { colors, logo } = brand;
  const name = brand.name || t("Your business", "مشروعك");
  return (
    <section className="brand-stage" aria-labelledby="preview-title" style={{ background: colors.surface, color: colors.primary }}>
      <div className="brand-stage-head">
        <h2 id="preview-title" className="brand-stage-label" style={{ color: colors.primary }}>{t("Preview", "معاينة")}</h2>
        <div className="brand-stage-actions">
          <Button size="sm" variant="secondary" href="#brand-partner" className="brand-jump" icon={<Sparkle size={16} weight="fill" />}>{t("Ask the brand partner", "اسأل شريك الهوية")}</Button>
          <Button size="sm" variant="secondary" icon={<DownloadSimple size={16} />} onClick={onDownload}>{t("Download logo (SVG)", "نزّل الشعار (SVG)")}</Button>
        </div>
      </div>
      <div className="brand-stage-hero">
        <LogoMark ref={markRef} logo={logo} colors={colors} size={112} title={t(`${name} logo`, `شعار ${name}`)} />
        <div className="brand-lockup-text">
          <span className="brand-hero-name" dir="auto">{name}</span>
          {brand.nameAr && <span className="brand-hero-ar" lang="ar" dir="rtl">{brand.nameAr}</span>}
          {brand.tagline && <span className="brand-hero-tag" dir="auto">{brand.tagline}</span>}
        </div>
      </div>
      <ul className="brand-mocks" aria-label={t("Your brand in use", "هويتك قيد الاستخدام")}>
        <li>
          <div className="mock-sign" style={{ background: colors.primary, color: onColor(colors.primary) }}>
            <LogoMark logo={{ ...logo, shape: logo.shape === "none" ? "circle" : logo.shape }} colors={{ ...colors, primary: colors.surface, accent: colors.accent }} size={40} />
            <span dir="auto">{name}</span>
            {brand.nameAr && <span lang="ar" dir="rtl" className="mock-sign-ar">{brand.nameAr}</span>}
          </div>
          <span className="brand-mock-label">{t("Shop sign", "لافتة المحل")}</span>
        </li>
        <li>
          <div className="mock-card" style={{ background: "#fff", color: colors.primary, borderColor: colors.accent }}>
            <BrandLockup logo={logo} colors={colors} name={name} size={36} layout="inline" />
            <span className="mock-card-line" style={{ background: colors.accent }} />
            <span className="mock-card-meta" dir="ltr">+968 9000 0000</span>
          </div>
          <span className="brand-mock-label">{t("Business card", "بطاقة العمل")}</span>
        </li>
        <li>
          <div className="mock-avatar">
            <span className="mock-avatar-ring" style={{ borderColor: colors.accent }}><LogoMark logo={logo.shape === "none" ? { ...logo, shape: "circle" } : logo} colors={colors} size={64} /></span>
            <span className="mock-avatar-name" dir="auto">{name}</span>
          </div>
          <span className="brand-mock-label">{t("Instagram profile", "حساب إنستغرام")}</span>
        </li>
      </ul>
    </section>
  );
}

/* ---------- Name ---------- */

function NamePanel({ brand, setBrand, sector, ventureName, onAdopt }: { brand: Brand; setBrand: (fn: (b: Brand) => Brand) => void; sector: string; ventureName: string; onAdopt: () => void }) {
  const { t, lang } = useI18n();
  const [seed, setSeed] = useState(0);
  const ideas = nameIdeas(sector, seed, lang);
  const listed = (n: NameIdea) => brand.shortlist.some((x) => x.en === n.en && x.ar === n.ar);
  const use = (n: NameIdea) => setBrand((b) => ({ ...b, name: n.en, nameAr: n.ar, logo: { ...b.logo, mark: initials(lang === "ar" ? n.ar : n.en) || b.logo.mark } }));
  const toggle = (n: NameIdea) => setBrand((b) => ({ ...b, shortlist: listed(n) ? b.shortlist.filter((x) => !(x.en === n.en && x.ar === n.ar)) : [...b.shortlist, n].slice(-12) }));

  return (
    <Panel aria-labelledby="name-title">
      <PanelHeader id="name-title" title={t("Name", "الاسم")} subtitle={t("A good name is easy to say in Arabic and English, easy to spell from hearing it, and still fits if you grow.", "الاسم الجيد سهل النطق بالعربية والإنجليزية، وسهل الكتابة عند سماعه، ويبقى مناسباً إن كبر مشروعك.")} />
      <div className="brand-fields">
        <Field label={t("Name in English", "الاسم بالإنجليزية")}>{(f) => <Input id={f.id} aria-describedby={f.describedBy} maxLength={60} value={brand.name} onChange={(e) => setBrand((b) => ({ ...b, name: e.target.value }))} />}</Field>
        <Field label={t("Name in Arabic", "الاسم بالعربية")}>{(f) => <Input id={f.id} aria-describedby={f.describedBy} maxLength={60} lang="ar" value={brand.nameAr} onChange={(e) => setBrand((b) => ({ ...b, nameAr: e.target.value }))} />}</Field>
        <Field className="brand-field-wide" label={t("Tagline", "العبارة التعريفية")} optional hint={t("One short line that says what you do or why you're different.", "سطر قصير يوضح ما تقدمه أو ما يميزك.")}>{(f) => <Input id={f.id} aria-describedby={f.describedBy} maxLength={140} value={brand.tagline} onChange={(e) => setBrand((b) => ({ ...b, tagline: e.target.value }))} />}</Field>
      </div>
      {brand.name.trim() && brand.name.trim() !== ventureName.trim() && (
        <div className="brand-adopt">
          <p className="field-hint">{ventureName ? t(`Your workspace still calls the business “${ventureName}”.`, `ما زالت مساحة عملك تسمي المشروع «${ventureName}».`) : t("Your workspace doesn't have a business name yet.", "لا يوجد اسم للمشروع في مساحة عملك بعد.")}</p>
          <Button size="sm" variant="secondary" onClick={onAdopt}>{t("Use as my business name", "اعتمده اسماً لمشروعي")}</Button>
        </div>
      )}

      <div className="brand-sub">
        <div className="brand-sub-head">
          <h3 className="brand-sub-title">{t("Ideas to start from", "أفكار للبداية")}</h3>
          <Button size="sm" variant="ghost" icon={<ArrowsClockwise size={16} />} onClick={() => setSeed((x) => x + 1)}>{t("More ideas", "أفكار أخرى")}</Button>
        </div>
        <ul className="name-ideas">
          {ideas.map((n) => (
            <li key={n.en} className={clsx("name-idea", brand.name === n.en && "is-current")}>
              <button type="button" className="name-idea-main" onClick={() => use(n)} aria-label={t(`Use ${n.en}`, `استخدم ${n.ar}`)}>
                <span className="name-idea-en" dir="ltr">{n.en}</span>
                <span className="name-idea-ar" lang="ar" dir="rtl">{n.ar}</span>
                <span className="name-idea-why">{n.why}</span>
              </button>
              <IconButton size="sm" label={listed(n) ? t("Remove from shortlist", "أزل من القائمة") : t("Add to shortlist", "أضف إلى القائمة")} aria-pressed={listed(n)} onClick={() => toggle(n)}>
                <Star size={16} weight={listed(n) ? "fill" : "regular"} />
              </IconButton>
            </li>
          ))}
        </ul>
      </div>

      {brand.shortlist.length > 0 && (
        <div className="brand-sub">
          <h3 className="brand-sub-title">{t("Your shortlist", "قائمتك المختصرة")}</h3>
          <ul className="shortlist">
            {brand.shortlist.map((n) => (
              <li key={n.en + n.ar} className="shortlist-item">
                <button type="button" className="shortlist-use" onClick={() => use(n)}><bdi>{n.en}</bdi> · <bdi lang="ar">{n.ar}</bdi></button>
                <IconButton size="sm" label={t(`Remove ${n.en}`, `أزل ${n.ar}`)} onClick={() => toggle(n)}><X size={14} /></IconButton>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="field-hint brand-note">{t("Before you print anything, check the name on the Oman Business Platform and that the social handles are free. Moasis can't confirm a name is available.", "قبل أن تطبع أي شيء، تحقق من الاسم في منصة عُمان للأعمال ومن توفر أسماء الحسابات في وسائل التواصل. لا يستطيع مؤسس تأكيد توفر الاسم.")}</p>
    </Panel>
  );
}

/* ---------- Colour ---------- */

function Readability({ ratio, label }: { ratio: number; label: string }) {
  const { t } = useI18n();
  const ok = ratio >= 4.5;
  const large = ratio >= 3;
  return (
    <li className={clsx("readability", ok ? "is-ok" : large ? "is-mid" : "is-low")}>
      {ok ? <CheckCircle size={16} weight="fill" aria-hidden="true" /> : <WarningCircle size={16} weight="fill" aria-hidden="true" />}
      <span>{label}</span>
      <span className="num">{ratio.toFixed(1)}:1</span>
      <span className="readability-verdict">{ok ? t("Easy to read", "سهل القراءة") : large ? t("Large text only", "للنص الكبير فقط") : t("Hard to read", "صعب القراءة")}</span>
    </li>
  );
}

function ColourPanel({ brand, setBrand, lang }: { brand: Brand; setBrand: (fn: (b: Brand) => Brand) => void; lang: "en" | "ar" }) {
  const { t } = useI18n();
  const c = brand.colors;
  const same = (x: Palette) => x.primary === c.primary && x.accent === c.accent && x.surface === c.surface;
  const set = (k: keyof Palette, val: string) => setBrand((b) => ({ ...b, colors: { ...b.colors, [k]: val.toUpperCase() } }));
  const keys: [keyof Palette, string][] = [["primary", t("Main colour", "اللون الرئيسي")], ["accent", t("Accent", "لون التمييز")], ["surface", t("Background", "الخلفية")]];
  return (
    <Panel aria-labelledby="colour-title">
      <PanelHeader id="colour-title" title={t("Colours", "الألوان")} subtitle={t("Start from a palette inspired by Oman, then adjust. Three colours are enough for a sign, a menu and a profile.", "ابدأ من لوحة مستوحاة من عُمان ثم عدّلها. ثلاثة ألوان تكفي للافتة وقائمة وحساب.")} />
      <div role="radiogroup" aria-label={t("Palettes", "اللوحات")} className="palette-grid">
        {palettes.map((x) => (
          <button key={x.id} type="button" role="radio" aria-checked={same(x.colors)} className={clsx("palette-card", same(x.colors) && "is-on")} onClick={() => setBrand((b) => ({ ...b, colors: x.colors }))}>
            <span className="brand-swatches" aria-hidden="true">{[x.colors.primary, x.colors.accent, x.colors.surface].map((col) => <span key={col} style={{ background: col }} />)}</span>
            <span className="palette-name">{x.name[lang === "ar" ? 1 : 0]}</span>
            <span className="palette-mood">{x.mood[lang === "ar" ? 1 : 0]}</span>
          </button>
        ))}
      </div>
      <div className="colour-pickers">
        {keys.map(([k, label]) => (
          <label key={k} className="colour-picker">
            <input type="color" value={c[k]} onChange={(e) => set(k, e.target.value)} />
            <span className="colour-picker-text"><span>{label}</span><span className="num" dir="ltr">{c[k]}</span></span>
          </label>
        ))}
      </div>
      <ul className="readability-list" aria-label={t("Readability", "سهولة القراءة")}>
        <Readability ratio={contrast(c.primary, onColor(c.primary))} label={t("Text on main colour", "النص على اللون الرئيسي")} />
        <Readability ratio={contrast(c.primary, c.surface)} label={t("Main colour on background", "اللون الرئيسي على الخلفية")} />
      </ul>
    </Panel>
  );
}

/* ---------- Logo ---------- */

function LogoPanel({ brand, setBrand }: { brand: Brand; setBrand: (fn: (b: Brand) => Brand) => void }) {
  const { t, lang } = useI18n();
  const shapeName: Record<(typeof logoShapes)[number], string> = {
    circle: t("Circle", "دائرة"), square: t("Rounded square", "مربع مستدير"), arch: t("Omani arch", "قوس عُماني"),
    hex: t("Hexagon", "سداسي"), leaf: t("Leaf", "ورقة"), none: t("Letters only", "حروف فقط"),
  };
  const fromName = initials(lang === "ar" && brand.nameAr ? brand.nameAr : brand.name || brand.nameAr);
  return (
    <Panel aria-labelledby="logo-title">
      <PanelHeader id="logo-title" title={t("Logo", "الشعار")} subtitle={t("A simple mark you can print, stitch or paint. You can hand it to a designer later as a starting point.", "علامة بسيطة يمكن طباعتها أو تطريزها أو رسمها. ويمكنك لاحقاً تسليمها لمصمم كنقطة بداية.")} />
      <fieldset className="brand-fieldset">
        <legend className="field-label">{t("Shape", "الشكل")}</legend>
        <div role="radiogroup" aria-label={t("Shape", "الشكل")} className="shape-grid">
          {logoShapes.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={brand.logo.shape === s} className={clsx("shape-card", brand.logo.shape === s && "is-on")} onClick={() => setBrand((b) => ({ ...b, logo: { ...b.logo, shape: s } }))}>
              <LogoMark logo={{ ...brand.logo, shape: s }} colors={brand.colors} size={48} />
              <span>{shapeName[s]}</span>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="brand-fields">
        <Field label={t("Letters in the mark", "حروف العلامة")} hint={t("Up to three. Arabic or English.", "حتى ثلاثة أحرف، عربية أو إنجليزية.")}>
          {(f) => (
            <div className="mark-input">
              <Input id={f.id} aria-describedby={f.describedBy} value={brand.logo.mark} onChange={(e) => setBrand((b) => ({ ...b, logo: { ...b.logo, mark: [...e.target.value].slice(0, 3).join("") } }))} />
              {fromName && fromName !== brand.logo.mark && <Button size="sm" variant="ghost" onClick={() => setBrand((b) => ({ ...b, logo: { ...b.logo, mark: fromName } }))}>{t(`Use “${fromName}”`, `استخدم «${fromName}»`)}</Button>}
            </div>
          )}
        </Field>
        <div className="field">
          <span className="field-label" id="lettering-label">{t("Lettering", "نوع الخط")}</span>
          <Segmented label={t("Lettering", "نوع الخط")} value={brand.logo.font} onChange={(font) => setBrand((b) => ({ ...b, logo: { ...b.logo, font } }))}
            options={[{ value: "sans", label: t("Clean", "بسيط") }, { value: "serif", label: t("Classic", "كلاسيكي") }, { value: "heavy", label: t("Bold", "عريض") }]} />
        </div>
        <div className="field">
          <span className="field-label">{t("Layout", "التخطيط")}</span>
          <Segmented label={t("Layout", "التخطيط")} value={brand.logo.layout} onChange={(layout) => setBrand((b) => ({ ...b, logo: { ...b.logo, layout } }))}
            options={[{ value: "inline", label: t("Side by side", "متجاور") }, { value: "stacked", label: t("Stacked", "متراكب") }]} />
        </div>
      </div>
      <div className="brand-lockup-demo" style={{ background: brand.colors.surface }}>
        <BrandLockup logo={brand.logo} colors={brand.colors} name={brand.name || t("Your business", "مشروعك")} nameAr={brand.nameAr} size={56} />
      </div>
    </Panel>
  );
}
