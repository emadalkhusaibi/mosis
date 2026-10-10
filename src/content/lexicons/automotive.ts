import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const automotive: Lexicon = {
  customer: w("customer", "العميل"),
  customers: w("customers", "العملاء"),
  product: w("service", "الخدمة"),
  products: w("services", "الخدمات"),
  place: w("workshop", "الورشة"),
  staff: w("technician", "الفني"),
  peak: w("the summer AC season", "موسم صيانة المكيّفات في الصيف"),
  supply: w("spare parts, oil and filters", "قطع الغيار والزيوت والفلاتر"),
  ex: {
    problem: w("Drivers in Al Amerat wait half a day at agency service centres for a simple oil change.", "السائقون في العامرات ينتظرون نصف يوم في مراكز خدمة الوكالات من أجل تغيير زيت بسيط."),
    offer: w("Oil change, filter and a 20-point check in 30 minutes, at a fixed 15.000 including parts.", "تغيير الزيت والفلتر وفحص من ٢٠ نقطة خلال ٣٠ دقيقة، بسعر ثابت ١٥٫٠٠٠ شاملاً القطع."),
    goal: w("Service 12 cars a day by month 9, with half of them booked in advance.", "خدمة ١٢ سيارة يومياً بحلول الشهر التاسع، نصفها بحجز مسبق."),
    customer: w("Families and commuters in Al Amerat whose cars are out of warranty and who want a fair, fixed price.", "عائلات وموظفون في العامرات انتهى ضمان سياراتهم ويريدون سعراً ثابتاً ومنصفاً."),
    alternatives: w("The agency service centre, an industrial-area garage with unclear prices, or putting the service off.", "مركز خدمة الوكالة، أو كراج في المنطقة الصناعية بأسعار غير واضحة، أو تأجيل الصيانة."),
    test: w("Offer the oil-change package for one week at 15.000; pass if 30 cars book and each takes under 40 minutes.", "عرض باقة تغيير الزيت لأسبوع بسعر ١٥٫٠٠٠؛ النجاح إن حجزت ٣٠ سيارة واستغرقت كل منها أقل من ٤٠ دقيقة."),
    area: w("The residential blocks of Al Amerat and Wadi Adai, within ten minutes of the workshop.", "الأحياء السكنية في العامرات ووادي عدي، على بعد عشر دقائق من الورشة."),
    competitors: w("The agency at 35.000 for the same service, two garages at around 12.000, and a mobile oil-change van.", "الوكالة بسعر ٣٥٫٠٠٠ للخدمة نفسها، وكراجان بنحو ١٢٫٠٠٠، وسيارة متنقلة لتغيير الزيت."),
    difference: w("A written price before work starts, old parts handed back, and progress photos sent on WhatsApp.", "سعر مكتوب قبل بدء العمل، وإعادة القطع القديمة إلى العميل، وصور لمراحل العمل تُرسل عبر واتساب."),
    channels: w("A Google Maps listing with reviews, flyers at the nearby petrol station, and free AC checks in the first month.", "صفحة على خرائط جوجل مع التقييمات، ومنشورات في محطة الوقود القريبة، وفحص مجاني للمكيّف في الشهر الأول."),
    delivery: w("Book on WhatsApp, check the car in with photos, approve a written quote, then a road test before payment.", "الحجز عبر واتساب، واستلام السيارة مع صور، والموافقة على عرض سعر مكتوب، ثم تجربة على الطريق قبل الدفع."),
    suppliers: w("A parts dealer in Wadi Kabir delivering daily, and a second dealer in Ghala for urgent orders.", "تاجر قطع غيار في الوادي الكبير يوصل يومياً، وتاجر ثانٍ في غلا للطلبات العاجلة."),
    people: w("I manage bookings and quotes; two technicians work the bays from 8am to 8pm.", "أتولى الحجوزات وعروض الأسعار؛ وفنيان يعملان في الورشة من ٨ صباحاً حتى ٨ مساءً."),
    location: w("A two-bay unit on the Al Amerat main road with a lift, a compressor and a diagnostic scanner.", "ورشة بموقفين على الشارع الرئيسي في العامرات، فيها رافعة وضاغط هواء وجهاز فحص إلكتروني."),
    risks: w("A fault that comes back could cost us a customer's trust; a broken lift would close one bay.", "عودة العطل قد تكلّفنا ثقة العميل؛ وتعطّل الرافعة سيوقف أحد الموقفين."),
    pilot: w("Two weeks offering only oil changes and AC checks, recording labour time and comebacks for each car.", "أسبوعان نقدّم فيهما تغيير الزيت وفحص المكيّف فقط، مع تسجيل وقت العمل لكل سيارة وعدد السيارات العائدة بسبب خلل."),
  },
  sc: {
    capacity: w("In the summer AC season, cars wait outside for hours and some customers drive away.", "في موسم صيانة المكيّفات صيفاً تنتظر السيارات خارج الورشة ساعات، ويغادر بعض العملاء."),
    pricing: w("A new garage nearby is advertising oil changes at 9.000 on Instagram.", "كراج جديد قريب يعلن على إنستغرام عن تغيير الزيت بسعر ٩٫٠٠٠."),
    supplier: w("Your parts dealer offers 12% off if you buy six months of oil and filters upfront.", "يعرض عليك تاجر القطع خصم ١٢٪ إن اشتريت زيوتاً وفلاتر تكفي ستة أشهر مقدماً."),
    marketing: w("You could pay for Google ads, partner with a car rental office, or offer free tyre checks.", "يمكنك الدفع لإعلانات جوجل، أو الشراكة مع مكتب لتأجير السيارات، أو تقديم فحص مجاني للإطارات."),
    partner: w("A taxi fleet owner offers a steady contract if you service his 15 cars at cost plus 10%.", "صاحب أسطول سيارات أجرة يعرض عقداً ثابتاً إن تولّيت صيانة سياراته الخمس عشرة بالتكلفة زائد ١٠٪."),
    service: w("A customer writes a Google review saying the same noise came back two days after the repair.", "عميل يكتب تقييماً على جوجل بأن الصوت نفسه عاد بعد يومين من الإصلاح."),
  },
  extra: [
    { key: "automotive_warranty", chapter: "risk", label: w("What warranty will you give on your work?", "ما الضمان الذي ستقدّمه على عملك؟"), hint: w("Set the period, what it covers, and who pays when a part fails.", "حدّد مدته وما يشمله، ومن يدفع إذا تلفت القطعة.") },
    { key: "automotive_parts", chapter: "finance", label: w("Will customers buy parts through you or bring their own?", "هل سيشتري العملاء القطع عن طريقك أم يحضرونها بأنفسهم؟"), hint: w("Parts margin can matter as much as labour, so decide your markup.", "قد يكون هامش القطع بأهمية أجور العمل، فحدّد نسبة ربحك عليها.") },
  ],
};
