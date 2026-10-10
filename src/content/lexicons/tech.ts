import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const tech: Lexicon = {
  customer: w("customer", "العميل"),
  customers: w("customers", "العملاء"),
  product: w("subscription", "الاشتراك"),
  products: w("plans", "الباقات"),
  place: w("app", "التطبيق"),
  staff: w("developer", "المطوّر"),
  peak: w("month-end, when every shop sends its invoices", "نهاية الشهر حين تُصدر المحلات فواتيرها"),
  supply: w("cloud hosting and the payment gateway", "الاستضافة السحابية وبوابة الدفع"),
  ex: {
    problem: w("Small shops in Oman still write invoices by hand and lose hours each month working out VAT.", "ما زالت المحلات الصغيرة في عُمان تكتب الفواتير يدوياً وتخسر ساعات كل شهر في حساب ضريبة القيمة المضافة."),
    offer: w("A mobile app for bilingual VAT invoices and payment reminders, at 12.000 a month per shop.", "تطبيق جوال لإصدار فواتير ثنائية اللغة بضريبة القيمة المضافة وتذكيرات بالدفع، بسعر ١٢٫٠٠٠ شهرياً للمحل."),
    goal: w("200 paying shops by month 12, with fewer than 5% cancelling each month.", "٢٠٠ محل مشترك بحلول الشهر الثاني عشر، مع إلغاء أقل من ٥٪ شهرياً."),
    customer: w("Owners of trading and spare-parts shops in Ruwi and Sohar who issue 50 to 300 invoices a month.", "أصحاب محلات تجارية وقطع غيار في روي وصحار يصدرون بين ٥٠ و٣٠٠ فاتورة شهرياً."),
    alternatives: w("Paper invoice books, an Excel sheet built by their accountant, or expensive accounting software.", "دفاتر الفواتير الورقية، أو جدول إكسل أعدّه المحاسب، أو برامج محاسبة باهظة الثمن."),
    test: w("Give a clickable prototype to five shop owners in Ruwi; pass if three agree to pay 10.000 for the first month.", "تجربة نموذج تفاعلي مع خمسة من أصحاب المحلات في روي؛ النجاح إن وافق ثلاثة على دفع ١٠٫٠٠٠ للشهر الأول."),
    area: w("Commercial streets in Ruwi first, then the industrial area in Sohar.", "الشوارع التجارية في روي أولاً، ثم المنطقة الصناعية في صحار."),
    competitors: w("An international accounting app at 25.000 a month in English only, and local desktop software at 300.000 once.", "تطبيق محاسبة عالمي بسعر ٢٥٫٠٠٠ شهرياً بالإنجليزية فقط، وبرنامج مكتبي محلي بسعر ٣٠٠٫٠٠٠ لمرة واحدة."),
    difference: w("Arabic-first, works on a basic phone, and sends invoices straight to the customer's WhatsApp.", "العربية أولاً، ويعمل على هاتف بسيط، ويرسل الفواتير مباشرة إلى واتساب العميل."),
    channels: w("Demos at accountants' offices that serve many shops, and a free first month through their referral.", "عروض توضيحية في مكاتب المحاسبين الذين يخدمون محلات كثيرة، وشهر أول مجاني بإحالة منهم."),
    delivery: w("Sign up on the website, a 15-minute setup call, first invoice sent the same day, then a weekly check-in.", "التسجيل عبر الموقع، ومكالمة إعداد لمدة ١٥ دقيقة، وإرسال أول فاتورة في اليوم نفسه، ثم متابعة أسبوعية."),
    suppliers: w("A cloud host with a regional data centre, a local payment gateway, and a backup host already tested.", "مزوّد استضافة سحابية بمركز بيانات إقليمي، وبوابة دفع محلية، ومزوّد استضافة احتياطي تمت تجربته."),
    people: w("I build the app and handle sales; a part-time support agent answers WhatsApp from 9am to 5pm.", "أبني التطبيق وأتولى المبيعات؛ وموظف دعم بدوام جزئي يرد على واتساب من ٩ صباحاً حتى ٥ مساءً."),
    location: w("A desk at an incubator in Muscat, two laptops, test phones and a monthly hosting budget of 80.000.", "مكتب في حاضنة أعمال بمسقط، وجهازا حاسوب محمول، وهواتف للتجربة، وميزانية استضافة شهرية قدرها ٨٠٫٠٠٠."),
    risks: w("Shops may sign up but never send a first invoice; a tax rule change could break the invoice format.", "قد تشترك المحلات دون أن ترسل أي فاتورة؛ وقد يؤدي تغيير في قواعد الضريبة إلى تعطيل صيغة الفاتورة."),
    pilot: w("A free month for 20 shops, measuring how many send an invoice in week one and how many still use it in week four.", "شهر مجاني لعشرين محلاً، مع قياس عدد من أرسلوا فاتورة في الأسبوع الأول ومن بقوا يستخدمونه في الأسبوع الرابع."),
  },
  sc: {
    capacity: w("Support messages have tripled since launch, and your one agent can't reply the same day.", "تضاعفت رسائل الدعم ثلاث مرات منذ الإطلاق، ولم يعد موظف الدعم الوحيد قادراً على الرد في اليوم نفسه."),
    pricing: w("A well-funded competitor launches a free plan for shops with under 100 invoices a month.", "منافس يملك تمويلاً كبيراً يطلق باقة مجانية للمحلات التي تصدر أقل من ١٠٠ فاتورة شهرياً."),
    supplier: w("Your cloud host offers 35% off if you commit to a two-year contract.", "يعرض عليك مزوّد الاستضافة خصم ٣٥٪ إن التزمت بعقد لمدة سنتين."),
    marketing: w("You could run Google ads, pay accountants a referral fee, or exhibit at a trade fair in Muscat.", "يمكنك تشغيل إعلانات غوغل، أو دفع عمولة إحالة للمحاسبين، أو المشاركة في معرض تجاري في مسقط."),
    partner: w("A bank offers to bundle your app with its business accounts if you build only for its customers.", "بنك يعرض دمج تطبيقك مع حساباته التجارية بشرط أن يقتصر تطويرك على عملائه."),
    service: w("A customer's invoices failed to send for a whole day, and he posts about it on X.", "تعذّر إرسال فواتير أحد العملاء طوال يوم كامل، فنشر عن ذلك على منصة إكس."),
  },
  extra: [
    { key: "tech_activation", chapter: "customer", label: w("What must a new customer do in week one to stay?", "ما الذي يجب أن يفعله العميل الجديد في أسبوعه الأول ليستمر؟"), hint: w("Name one action, such as sending a first invoice, and how you'll help them do it.", "حدّد إجراءً واحداً، مثل إرسال أول فاتورة، وكيف ستساعده على القيام به.") },
    { key: "tech_build", chapter: "launch", label: w("What is the smallest version you can launch?", "ما أصغر نسخة يمكنك إطلاقها؟"), hint: w("List the features a customer would pay for today and leave the rest for later.", "اذكر الميزات التي سيدفع العميل مقابلها اليوم وأجّل الباقي.") },
  ],
};
