import { expect, type Page } from "@playwright/test";

type Answers = {
  name?: string; business?: string; sector?: RegExp; stage?: RegExp; need?: RegExp;
  experience?: RegExp; channel?: RegExp; time?: RegExp; worry?: RegExp; idea?: string; ar?: boolean;
};

const words = {
  en: { start: "Start", next: "Continue", skip: "Skip", open: "Open my workspace", you: "Your name", business: "Business name", idea: /Your idea/,
    titles: { need: "What do you need most right now?", experience: "Have you run a business before?", channel: "How will customers reach you?", time: "How much time can you give it?", worry: "What worries you most?", business: "Name it and place it." } },
  ar: { start: "ابدأ", next: "متابعة", skip: "تخطَّ", open: "افتح مساحة عملي", you: "اسمك", business: "اسم المشروع", idea: /فكرتك/,
    titles: { need: "ما الذي تحتاجه أكثر الآن؟", experience: "هل أدرت مشروعاً من قبل؟", channel: "كيف سيصل إليك العملاء؟", time: "كم من الوقت تستطيع منحه؟", worry: "ما أكثر ما يقلقك؟", business: "سمِّه وحدّد مكانه." } },
};

/** Answers the opening questions, one screen at a time, and lands on Today. */
export async function answerSetup(page: Page, a: Answers = {}) {
  const w = a.ar ? words.ar : words.en;
  const h1 = page.getByRole("heading", { level: 1 });
  await page.goto("/setup");
  await page.getByRole("button", { name: w.start }).click();
  await page.getByLabel(w.you).fill(a.name ?? "Test Founder");
  await page.getByRole("button", { name: w.next }).click();
  await page.getByRole("radio", { name: a.sector ?? (a.ar ? /مقهى/ : /Café/) }).click();
  await page.getByRole("button", { name: w.next }).click();
  await page.getByRole("radio", { name: a.stage ?? (a.ar ? /أختبرها/ : /Testing with customers/) }).click();
  await expect(h1).toHaveText(w.titles.need);
  if (a.need) await page.getByRole("radio", { name: a.need }).click();
  else await page.getByRole("button", { name: w.next }).click();
  for (const key of ["experience", "channel", "time", "worry"] as const) {
    await expect(h1).toHaveText(w.titles[key]);
    const pick = a[key];
    if (pick) await page.getByRole("radio", { name: pick }).click();
    else await page.getByRole("button", { name: w.skip }).click();
  }
  await expect(h1).toHaveText(w.titles.business);
  await page.getByLabel(w.business).fill(a.business ?? "Nook Coffee");
  await page.getByLabel(w.idea).fill(a.idea ?? "A quiet specialty coffee corner for students in Al Khoud.");
  await page.getByRole("button", { name: w.next }).click();
  await page.getByRole("button", { name: w.next }).click();
  await page.getByRole("button", { name: w.open }).click();
  await expect(page).toHaveURL(/\/$/);
}

/** Completes the setup as a guest and lands on Today. */
export async function startVenture(page: Page, name = "Nook Coffee") {
  await answerSetup(page, { business: name });
}
