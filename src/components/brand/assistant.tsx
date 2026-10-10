"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkle, Trash, Star } from "@phosphor-icons/react";
import { useI18n } from "@/lib/i18n";
import { useWorkspace } from "@/state/workspace";
import { Button, IconButton } from "@/components/ui/button";
import { LogoMark } from "./logo-mark";
import { MAX_CHAT, emptyBrand, type Brand, type ChatMessage, type Logo, type NameIdea, type Palette } from "@/domain/brand";

type Suggestions = {
  names: NameIdea[];
  palettes: (Palette & { name: string; why: string })[];
  logo: (Pick<Logo, "shape" | "mark" | "font"> & { why: string }) | null;
};
type Failure = "not_configured" | "rate_limited" | "busy" | "declined" | "offline" | "failed";

/** The AI brand partner: a short conversation whose suggestions can be applied to the studio in one tap. */
export function BrandAssistant({ brand, setBrand }: { brand: Brand; setBrand: (fn: (b: Brand) => Brand) => void }) {
  const { t, lang } = useI18n();
  const { state } = useWorkspace();
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [suggest, setSuggest] = useState<Suggestions | null>(null);
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight });
  }, [brand.chat.length, sending]);

  const prompts = [
    t("Suggest names that work in English and Arabic", "اقترح أسماء تناسب العربية والإنجليزية"),
    t("Which colours suit my business?", "ما الألوان المناسبة لمشروعي؟"),
    t("Design a logo idea for me", "صمّم لي فكرة شعار"),
    t("Write a short tagline", "اكتب شعاراً نصياً قصيراً"),
  ];

  const send = async (text: string) => {
    const clean = text.trim().slice(0, 1000);
    if (!clean || sending) return;
    const mine: ChatMessage = { role: "user", text: clean };
    const history = [...brand.chat, mine];
    setBrand((b) => ({ ...b, chat: [...b.chat, mine].slice(-MAX_CHAT) }));
    setDraft("");
    setSending(true);
    setFailure(null);
    setSuggest(null);
    try {
      const { chat: _chat, ...rest } = brand;
      void _chat;
      const v = state.venture;
      const res = await fetch("/api/brand-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: history.slice(-24), venture: { name: v.name, sector: v.sector, other: v.other, city: v.city, idea: v.idea }, brand: rest }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const e = data.error as string | undefined;
        setFailure(e === "not_configured" || e === "rate_limited" || e === "busy" || e === "declined" ? e : "failed");
        // Take the unanswered message back out so the conversation stays a clean back-and-forth.
        setBrand((b) => ({ ...b, chat: b.chat.slice(0, -1) }));
        setDraft(clean);
        return;
      }
      setBrand((b) => ({ ...b, chat: [...b.chat, { role: "assistant" as const, text: String(data.reply ?? "").slice(0, 2000) }].slice(-MAX_CHAT) }));
      setSuggest({ names: data.names ?? [], palettes: data.palettes ?? [], logo: data.logo ?? null });
    } catch {
      setFailure("offline");
      setBrand((b) => ({ ...b, chat: b.chat.slice(0, -1) }));
      setDraft(clean);
    } finally {
      setSending(false);
    }
  };

  const failureText: Record<Failure, string> = {
    not_configured: t("The assistant isn't switched on for this site yet. Everything else in the studio works without it.", "المساعد غير مفعّل في هذا الموقع بعد. كل ما سواه في الاستوديو يعمل من دونه."),
    rate_limited: t("That's a lot of messages in a short time. Try again in a few minutes.", "رسائل كثيرة في وقت قصير. حاول مرة أخرى بعد دقائق."),
    busy: t("The assistant is busy right now. Try again shortly.", "المساعد مشغول الآن. حاول بعد قليل."),
    declined: t("The assistant can't help with that. Try asking about your name, colours or logo.", "لا يستطيع المساعد المساعدة في هذا. اسأله عن الاسم أو الألوان أو الشعار."),
    offline: t("You seem to be offline. Your message is still in the box.", "يبدو أنك غير متصل. رسالتك ما زالت في المربع."),
    failed: t("Something went wrong. Your message is still in the box.", "حدث خطأ. رسالتك ما زالت في المربع."),
  };

  const shortlisted = (n: NameIdea) => brand.shortlist.some((x) => x.en === n.en && x.ar === n.ar);

  return (
    <section id="brand-partner" className="panel brand-assistant" aria-labelledby="assistant-title">
      <header className="brand-assistant-head">
        <span className="brand-assistant-icon" aria-hidden="true"><Sparkle size={18} weight="fill" /></span>
        <div className="min-w-0">
          <h2 id="assistant-title" className="panel-title">{t("Brand partner", "شريك الهوية")}</h2>
          <p className="panel-subtitle">{t("An AI that knows your business. Its ideas are suggestions; you decide.", "ذكاء اصطناعي يعرف مشروعك. أفكاره مقترحات، والقرار لك.")}</p>
        </div>
        {brand.chat.length > 0 && (
          <IconButton label={t("Clear conversation", "امسح المحادثة")} size="sm" onClick={() => { setBrand((b) => ({ ...b, chat: [] })); setSuggest(null); }}>
            <Trash size={16} />
          </IconButton>
        )}
      </header>

      <ol ref={list} className="brand-chat" aria-live="polite" aria-busy={sending}>
        {brand.chat.length === 0 && (
          <li className="brand-msg brand-msg-assistant">
            {t("Tell me what you want people to feel when they see your business, or pick a starting point below.", "أخبرني بما تريد أن يشعر به الناس عندما يرون مشروعك، أو اختر نقطة بداية من الأسفل.")}
          </li>
        )}
        {brand.chat.map((m, i) => (
          <li key={i} className={`brand-msg brand-msg-${m.role}`} dir="auto">
            <span className="sr-only">{m.role === "user" ? t("You:", "أنت:") : t("Brand partner:", "شريك الهوية:")} </span>
            {m.text}
          </li>
        ))}
        {sending && <li className="brand-msg brand-msg-assistant brand-msg-wait">{t("Thinking…", "يفكّر…")}</li>}
      </ol>

      {suggest && (suggest.names.length > 0 || suggest.palettes.length > 0 || suggest.logo) && (
        <div className="brand-suggest" aria-label={t("Suggestions", "المقترحات")} role="group">
          {suggest.names.map((n) => (
            <div key={n.en + n.ar} className="brand-suggest-card">
              <div className="min-w-0">
                <strong dir="auto">{n.en}</strong> <span lang="ar" dir="rtl">{n.ar}</span>
                <p className="field-hint" dir="auto">{n.why}</p>
              </div>
              <div className="brand-suggest-actions">
                <Button size="sm" variant="secondary" onClick={() => setBrand((b) => ({ ...b, name: n.en, nameAr: n.ar }))}>{t("Use", "استخدم")}</Button>
                <IconButton size="sm" label={shortlisted(n) ? t("Shortlisted", "في القائمة") : t("Add to shortlist", "أضف إلى القائمة")} aria-pressed={shortlisted(n)} onClick={() => setBrand((b) => (shortlisted(n) ? b : { ...b, shortlist: [...b.shortlist, n].slice(-12) }))}>
                  <Star size={16} weight={shortlisted(n) ? "fill" : "regular"} />
                </IconButton>
              </div>
            </div>
          ))}
          {suggest.palettes.map((x) => (
            <div key={x.name + x.primary} className="brand-suggest-card">
              <span className="brand-swatches" aria-hidden="true">{[x.primary, x.accent, x.surface].map((c) => <span key={c} style={{ background: c }} />)}</span>
              <div className="min-w-0">
                <strong dir="auto">{x.name}</strong>
                <p className="field-hint" dir="auto">{x.why}</p>
              </div>
              <Button size="sm" variant="secondary" onClick={() => setBrand((b) => ({ ...b, colors: { primary: x.primary, accent: x.accent, surface: x.surface } }))}>{t("Apply", "طبّق")}</Button>
            </div>
          ))}
          {suggest.logo && (
            <div className="brand-suggest-card">
              <LogoMark logo={{ ...brand.logo, ...suggest.logo }} colors={brand.colors} size={44} />
              <p className="field-hint min-w-0" dir="auto">{suggest.logo.why}</p>
              <Button size="sm" variant="secondary" onClick={() => setBrand((b) => ({ ...b, logo: { ...b.logo, shape: suggest.logo!.shape, mark: suggest.logo!.mark, font: suggest.logo!.font } }))}>{t("Apply", "طبّق")}</Button>
            </div>
          )}
        </div>
      )}

      {failure && <p className="brand-failure" role="status">{failureText[failure]}</p>}

      {brand.chat.length === 0 && (
        <div className="brand-prompts">
          {prompts.map((q) => <button key={q} type="button" className="chip-btn" onClick={() => send(q)} disabled={sending}>{q}</button>)}
        </div>
      )}

      <form className="brand-compose" onSubmit={(e) => { e.preventDefault(); send(draft); }}>
        <label htmlFor="brand-msg" className="sr-only">{t("Message the brand partner", "راسل شريك الهوية")}</label>
        <textarea
          id="brand-msg"
          dir="auto"
          className="input textarea"
          rows={2}
          maxLength={1000}
          value={draft}
          placeholder={t("Ask about names, colours or your logo…", "اسأل عن الاسم أو الألوان أو الشعار…")}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(draft); } }}
        />
        <IconButton type="submit" variant="solid" label={t("Send", "أرسل")} disabled={sending || !draft.trim()}>
          <ArrowUp size={18} weight="bold" />
        </IconButton>
      </form>
      <p className="field-hint brand-privacy">{t("Messages, your business details and current brand are sent to Anthropic's Claude to generate replies. Don't share personal or sensitive information.", "تُرسل الرسائل وتفاصيل مشروعك وهويتك الحالية إلى Claude من Anthropic لتوليد الردود. لا تشارك معلومات شخصية أو حساسة.")}</p>
    </section>
  );
}

export const brandOf = (b: Brand | undefined, name: string) => b ?? emptyBrand(name);
