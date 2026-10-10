import { w, type Words } from "./words";

/**
 * One "In your business" paragraph per lesson. Tokens come from the founder's lexicon
 * ({customers}, {place}, …) and from their sector's starting figures:
 * {price}, {cost}, {margin}, {fixed}, {breakeven}, {unit}.
 * The figures are the sector's illustrative defaults, so the copy says "typical".
 */
export const applied: Record<string, Words> = {
  cash: w(
    "For your {place}: write down the day {customers} pay you and the day you pay for {supply}. If you pay suppliers before {customers} pay you, the gap is cash you need in the bank.",
    "في {place}: اكتب اليوم الذي يدفع فيه {customers} لك واليوم الذي تدفع فيه ثمن {supply}. إن كنت تدفع للموردين قبل أن يدفع لك {customers}، فالفرق نقد تحتاجه في حسابك.",
  ),
  margin: w(
    "The typical {place} sells at about {price} with {cost} of variable cost, leaving {margin} per sale. Check your own numbers: a 20% discount would cut that much further than it sounds.",
    "عادةً ما يكون سعر البيع في {place} نحو {price} والتكلفة المتغيرة {cost}، فيبقى {margin} من كل عملية بيع. راجع أرقامك أنت: خصم ٢٠٪ يقتطع من هذا الهامش أكثر مما يبدو.",
  ),
  breakeven: w(
    "With typical fixed costs of {fixed} a month and {margin} left from each sale, the typical {place} needs about {breakeven} {unit} a month to break even. Is that realistic for your area?",
    "بتكاليف ثابتة نموذجية قدرها {fixed} شهرياً و{margin} يبقى من كل عملية بيع، تحتاج إلى نحو {breakeven} عملية بيع شهرياً لبلوغ نقطة التعادل في {place}. هل هذا واقعي في منطقتك؟",
  ),
  forecast: w(
    "Forecast your {place} month by month, and mark the months around {peak} separately. A quiet month after a busy season is where cash usually runs short.",
    "توقّع أداء {place} شهراً بشهر، وميّز الأشهر المحيطة بـ{peak}. الشهر الهادئ بعد موسم مزدحم هو عادةً حيث ينفد النقد.",
  ),
  interviews: w(
    "Talk to five {customers} this week. Ask about the last time they needed what your {place} offers, what they did, and what it cost them. Don't pitch.",
    "تحدّث إلى خمسة من {customers} هذا الأسبوع. اسألهم عن آخر مرة احتاجوا فيها ما يقدمه {place}، وماذا فعلوا، وكم كلّفهم ذلك. لا تعرض فكرتك.",
  ),
  position: w(
    "Finish this sentence for your {place}: for {customers} who want ___, we are the only ones who ___. If a competitor could say the same, keep going.",
    "أكمل هذه الجملة عن {place}: بالنسبة إلى {customers} الذين يريدون ___، نحن الوحيدون الذين ___. إن كان بوسع منافس قول الشيء نفسه، فواصل.",
  ),
  experiment: w(
    "Pick one of your {products} and sell it to real {customers} before you invest more. Set the price, the date and the number of sales that counts as a pass.",
    "اختر واحداً من {products} وبِعه إلى {customers} حقيقيين قبل أن تستثمر أكثر. حدّد السعر والتاريخ وعدد المبيعات الذي يُعدّ نجاحاً.",
  ),
  channels: w(
    "List where your first ten {customers} already spend time. Try the cheapest channel first and count how many people actually buy, not just how many see you.",
    "اكتب الأماكن التي يقضي فيها أول عشرة من {customers} وقتهم. جرّب أرخص قناة أولاً واحسب عدد من يشترون فعلاً، لا عدد من يرونك فقط.",
  ),
  hiring: w(
    "Before you hire your first {staff}, write down the hours you can't cover yourself, especially during {peak}, and what a good week of their work looks like.",
    "قبل أن توظّف أحداً في دور {staff}، اكتب الساعات التي لا تستطيع تغطيتها بنفسك، خاصة في {peak}، وكيف يبدو أسبوع عمل جيد بالنسبة إليه.",
  ),
  feedback: w(
    "Give feedback on one specific moment, such as how one {customer} was served during {peak}, and agree on one change to try next week.",
    "قدّم ملاحظاتك عن موقف محدد، مثل طريقة خدمة {customer} في {peak}، واتفقا على تغيير واحد تجربانه الأسبوع المقبل.",
  ),
  partners: w(
    "If someone wants a share of your {place}, write down what each of you brings, who decides on spending and {products}, and what happens if one of you leaves.",
    "إن أراد أحد حصة في {place}، فاكتبا ما يقدمه كل منكما، ومن يقرر الإنفاق و{products}، وماذا يحدث إن غادر أحدكما.",
  ),
  decisions: w(
    "Choose one decision about your {place} this month, write what would change your mind, and set a date to review it with real numbers.",
    "اختر قراراً واحداً بشأن {place} هذا الشهر، واكتب ما الذي قد يغيّر رأيك، وحدّد موعداً لمراجعته بأرقام حقيقية.",
  ),
};
