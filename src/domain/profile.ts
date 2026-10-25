import { w, type Words } from "@/content/words";
import type { OpportunityKind } from "@/content/opportunities";
import type { channels, experiences, Profile, State, times, worries } from "./state";

/**
 * The questions Moasis asks first, and what each answer changes. Every answer
 * has a visible effect somewhere: the path, Today, launch steps or the order
 * of opportunities. Nothing is asked just to be stored.
 */
type Experience = (typeof experiences)[number];
type Channel = (typeof channels)[number];
type Time = (typeof times)[number];
type Worry = (typeof worries)[number];
type Option = { title: Words; sub: Words };

export const experienceOptions: Record<Experience, Option> = {
  first: { title: w("This is my first", "هذا أول مشروع لي"), sub: w("We'll explain the basics as you go.", "سنشرح الأساسيات خطوة بخطوة.") },
  some: { title: w("I've helped run one", "شاركت في إدارة مشروع"), sub: w("In a family business or someone else's.", "في مشروع عائلي أو لدى غيري.") },
  experienced: { title: w("I've run my own", "أدرت مشروعي الخاص"), sub: w("Skip the basics, get to the numbers.", "تجاوز الأساسيات وادخل في الأرقام.") },
};

export const channelOptions: Record<Channel, Option> = {
  premises: { title: w("They come to my place", "يأتون إلى موقعي"), sub: w("A shop, café, studio or workshop.", "محل أو مقهى أو استوديو أو ورشة.") },
  online: { title: w("Online", "عبر الإنترنت"), sub: w("A website, Instagram or an app.", "موقع إلكتروني أو إنستغرام أو تطبيق.") },
  home: { title: w("I go to them, or work from home", "أذهب إليهم أو أعمل من المنزل"), sub: w("Mobile services, home kitchens, freelancing.", "خدمات متنقلة أو مطبخ منزلي أو عمل حر.") },
  mixed: { title: w("A mix", "مزيج"), sub: w("A place, plus delivery or online orders.", "موقع مع توصيل أو طلبات إلكترونية.") },
};

export const timeOptions: Record<Time, Option> = {
  hours: { title: w("A few hours a week", "بضع ساعات أسبوعياً"), sub: w("Alongside study or a job.", "إلى جانب الدراسة أو العمل.") },
  parttime: { title: w("Evenings and weekends", "المساء وعطلة نهاية الأسبوع"), sub: w("Serious, but not yet full time.", "جادّ، لكن ليس بدوام كامل بعد.") },
  fulltime: { title: w("Full time", "دوام كامل"), sub: w("This is my main work now.", "هذا عملي الأساسي الآن.") },
};

export const worryOptions: Record<Worry, Option> = {
  money: { title: w("Running out of money", "نفاد المال"), sub: w("Spending more than comes in.", "إنفاق أكثر مما يدخل.") },
  customers: { title: w("Finding customers", "إيجاد العملاء"), sub: w("Will anyone actually buy?", "هل سيشتري أحد فعلاً؟") },
  competition: { title: w("Competition", "المنافسة"), sub: w("Others already do this, cheaper.", "غيري يقدّم هذا بسعر أقل.") },
  paperwork: { title: w("Licences and paperwork", "التراخيص والأوراق"), sub: w("Not knowing the official steps.", "عدم معرفة الخطوات الرسمية.") },
  alone: { title: w("Doing it alone", "العمل وحيداً"), sub: w("No one to ask when it gets hard.", "لا أحد أسأله حين يصعب الأمر.") },
};

/** A lesson and a rehearsal aimed at the founder's biggest worry, shown on Today. */
export const worryHelp: Record<Worry, { lesson: string; href: string; cta: Words; why: Words }> = {
  money: { lesson: "cash", href: "/learn/cash", cta: w("Learn how cash runs out", "تعلّم كيف ينفد النقد"), why: w("Most young businesses that close run out of cash, not ideas. Ten minutes on how it happens, then protect a reserve.", "معظم المشاريع الناشئة التي تُغلق ينفد نقدها، لا أفكارها. عشر دقائق عن كيف يحدث ذلك، ثم احمِ احتياطياً.") },
  customers: { lesson: "interviews", href: "/learn/interviews", cta: w("Learn to listen before you build", "تعلّم أن تستمع قبل أن تبني"), why: w("A few honest conversations tell you more than a survey. Learn the questions that get real answers, then run a field test.", "بضع محادثات صادقة تخبرك أكثر من استبيان. تعلّم الأسئلة التي تأتي بإجابات حقيقية، ثم نفّذ اختباراً ميدانياً.") },
  competition: { lesson: "position", href: "/learn/position", cta: w("Find your reason to be chosen", "اعثر على سبب اختيارك"), why: w("You rarely win on price alone. Work out what makes you the better choice for one kind of customer, then rehearse a price war.", "نادراً ما تفوز بالسعر وحده. حدّد ما يجعلك الخيار الأفضل لنوع واحد من العملاء، ثم تدرّب على حرب أسعار.") },
  paperwork: { lesson: "launch", href: "/launch", cta: w("See the launch steps in order", "اطّلع على خطوات الانطلاق بالترتيب"), why: w("The official steps in Oman, in the usual order, with where to check each one. It's less than it looks.", "الخطوات الرسمية في عُمان بترتيبها المعتاد، مع جهة التحقق لكل خطوة. هي أقل مما تبدو.") },
  alone: { lesson: "mentor", href: "/opportunities", cta: w("Find someone who has done it", "ابحث عمّن خاض التجربة"), why: w("One-to-one sessions with founders and managers who have run this kind of business. Your Founder record goes with every request.", "جلسات فردية مع مؤسسين ومدراء أداروا مشاريع مثل مشروعك. يرافق سجلّ المؤسس كل طلب.") },
};

/** How much to aim for each week, given the time the founder has. */
export const paceFor: Record<Time, Words> = {
  hours: w("About one step a week fits a few hours.", "خطوة واحدة أسبوعياً تناسب بضع ساعات."),
  parttime: w("Two steps a week fits evenings and weekends.", "خطوتان أسبوعياً تناسبان المساء وعطلة الأسبوع."),
  fulltime: w("Full time, you could finish this path in a week.", "بدوام كامل، يمكنك إنهاء هذا المسار في أسبوع."),
};

export const profileOf = (s: State): Profile => s.venture.profile ?? {};

/** Newcomers see internships first, experienced founders see 1:1 sessions first; no answer keeps the listed order. */
export function kindOrder(s: State): OpportunityKind[] {
  const e = profileOf(s).experience;
  if (e === "experienced") return ["session", "job", "internship"];
  if (e === "first") return ["internship", "session", "job"];
  if (e === "some") return ["session", "internship", "job"];
  return [];
}
