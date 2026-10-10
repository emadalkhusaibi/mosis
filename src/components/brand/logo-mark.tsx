import { forwardRef } from "react";
import { onColor, type Logo, type Palette } from "@/domain/brand";

const SHAPES: Record<Exclude<Logo["shape"], "none">, string> = {
  circle: "M50 4a46 46 0 1 1 0 92a46 46 0 1 1 0-92Z",
  square: "M26 4h48a22 22 0 0 1 22 22v48a22 22 0 0 1-22 22H26A22 22 0 0 1 4 74V26A22 22 0 0 1 26 4Z",
  // A pointed Omani arch, the shape of old fort and mosque doorways.
  arch: "M10 96V48C10 26 28 10 50 4c22 6 40 22 40 44v48Z",
  hex: "M50 4l40 23v46L50 96 10 73V27Z",
  leaf: "M50 4c26 10 42 32 42 54c0 22-18 38-42 38S8 80 8 58C8 36 24 14 50 4Z",
};

const FONTS: Record<Logo["font"], { family: string; weight: number }> = {
  sans: { family: "'Sora Variable', Sora, Tajawal, sans-serif", weight: 600 },
  serif: { family: "'Instrument Serif', Tajawal, serif", weight: 400 },
  heavy: { family: "'Sora Variable', Sora, Tajawal, sans-serif", weight: 800 },
};

const isArabic = (s: string) => /[؀-ۿ]/.test(s);

/** The logo mark alone: a shape in the primary colour with up to three letters and an accent dot. */
export const LogoMark = forwardRef<SVGSVGElement, { logo: Logo; colors: Palette; size?: number; title?: string }>(function LogoMark({ logo, colors, size = 96, title }, ref) {
  const chars = [...logo.mark];
  const font = FONTS[logo.font];
  const fontSize = (chars.length <= 1 ? 50 : chars.length === 2 ? 40 : 30) * (isArabic(logo.mark) ? 1.05 : 1) * (logo.font === "serif" ? 1.15 : 1);
  const bare = logo.shape === "none";
  const ink = bare ? colors.primary : onColor(colors.primary);
  const y = logo.shape === "arch" ? 60 : 52;
  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width={size} height={size} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {logo.shape !== "none" && <path d={SHAPES[logo.shape]} fill={colors.primary} />}
      <text x="50" y={y} textAnchor="middle" dominantBaseline="central" fill={ink} fontFamily={font.family} fontWeight={font.weight} fontSize={fontSize} letterSpacing={chars.length > 1 && !isArabic(logo.mark) ? -1 : 0}>
        {logo.mark}
      </text>
      <circle cx={bare ? 86 : logo.shape === "arch" ? 50 : 80} cy={bare ? 22 : logo.shape === "arch" ? 22 : 20} r={bare ? 6 : 5.5} fill={colors.accent} />
    </svg>
  );
});

/** Mark plus name, side by side or stacked, on the brand's own background. */
export function BrandLockup({ logo, colors, name, nameAr, tagline, size = 72, layout }: { logo: Logo; colors: Palette; name: string; nameAr?: string; tagline?: string; size?: number; layout?: Logo["layout"] }) {
  const lay = layout ?? logo.layout;
  return (
    <div className={`brand-lockup brand-lockup-${lay}`} style={{ color: colors.primary }}>
      <LogoMark logo={logo} colors={colors} size={size} />
      <div className="brand-lockup-text">
        <span className="brand-lockup-name" dir="auto">{name || "—"}</span>
        {nameAr && <span className="brand-lockup-ar" dir="rtl" lang="ar">{nameAr}</span>}
        {tagline && <span className="brand-lockup-tag" dir="auto">{tagline}</span>}
      </div>
    </div>
  );
}
