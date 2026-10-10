import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const services: Lexicon = {
  customer: w("client", "العميل"),
  customers: w("clients", "العملاء"),
  product: w("job", "المهمة"),
  products: w("cleaning services", "خدمات التنظيف"),
  place: w("cleaning service", "خدمة التنظيف"),
  staff: w("cleaner", "عامل التنظيف"),
  peak: w("the deep-cleaning rush before Eid", "زحمة التنظيف الشامل قبل العيد"),
  supply: w("cleaning products, mops and a vacuum", "مواد التنظيف والممسحات والمكنسة الكهربائية"),
  ex: {
    problem: w("Working families in Seeb wait days for a cleaner, and many crews arrive late or skip the kitchen.", "الأسر العاملة في السيب تنتظر أياماً لعامل تنظيف، وكثير من الفرق تتأخر أو تتجاهل المطبخ."),
    offer: w("A three-hour villa clean for 18.000 with two cleaners and our own products, booked on WhatsApp.", "تنظيف فيلا لثلاث ساعات بسعر ١٨٫٠٠٠ بعاملين ومواد تنظيف من عندنا، يُحجز عبر واتساب."),
    goal: w("Complete 70 jobs a month by month 10, with half of clients on a weekly or monthly plan.", "إنجاز ٧٠ مهمة شهرياً بحلول الشهر العاشر، على أن يكون نصف العملاء على باقة أسبوعية أو شهرية."),
    customer: w("Dual-income families in villas in Al Mawaleh and Al Khoudh who want a reliable weekly clean.", "أسر يعمل فيها الزوجان وتسكن فللاً في الموالح والخوض، وتريد تنظيفاً أسبوعياً يُعتمد عليه."),
    alternatives: w("A live-in housemaid, a cleaning company found on Instagram, or cleaning it themselves at the weekend.", "عاملة منزلية مقيمة، أو شركة تنظيف من إنستغرام، أو التنظيف بأنفسهم في عطلة نهاية الأسبوع."),
    test: w("Offer five villa cleans in Al Mawaleh at 15.000 each; pass if three clients book a second visit.", "تقديم خمس مهام تنظيف فلل في الموالح بسعر ١٥٫٠٠٠ للمهمة؛ النجاح إن حجز ثلاثة عملاء زيارة ثانية."),
    area: w("Al Mawaleh and Al Khoudh, so no job is more than 15 minutes from the next.", "الموالح والخوض، بحيث لا تبعد أي مهمة أكثر من ١٥ دقيقة عن التي تليها."),
    competitors: w("A large company at 25.000 a visit, hourly cleaners at 2.000 an hour, and a few Instagram crews.", "شركة كبيرة بسعر ٢٥٫٠٠٠ للزيارة، وعمال بالساعة بسعر ٢٫٠٠٠، وبعض الفرق على إنستغرام."),
    difference: w("The same cleaners every visit, a fixed checklist signed off by the client, and a free redo within 24 hours.", "نفس العمال في كل زيارة، وقائمة مهام ثابتة يوقّعها العميل، وإعادة مجانية خلال ٢٤ ساعة."),
    channels: w("Flyers in the Al Mawaleh mosque and supermarket noticeboards, plus a referral discount for neighbours.", "منشورات في لوحات إعلانات المسجد والسوبرماركت في الموالح، وخصم إحالة للجيران."),
    delivery: w("Booking on WhatsApp, crew arrives in a branded van, works the checklist, and sends photos before leaving.", "الحجز عبر واتساب، ويصل الفريق بسيارة تحمل الشعار، وينفّذ قائمة المهام، ويرسل صوراً قبل المغادرة."),
    suppliers: w("A wholesaler in Ruwi for detergents with monthly delivery, and a hardware shop in Seeb as backup.", "تاجر جملة في روي لمواد التنظيف بتوصيل شهري، ومحل أدوات في السيب كبديل."),
    people: w("I take bookings and check quality; two full-time cleaners work as one crew six days a week.", "أتولى الحجوزات وأراجع الجودة؛ وعاملان بدوام كامل يعملان فريقاً واحداً ستة أيام في الأسبوع."),
    location: w("A small storeroom in Seeb for supplies, one van, two vacuums and a steam cleaner.", "مخزن صغير في السيب للمواد، وسيارة واحدة، ومكنستان كهربائيتان، وجهاز تنظيف بالبخار."),
    risks: w("A cleaner may quit with little notice; a client may claim damage to furniture or a missing item.", "قد يستقيل أحد العمال دون إشعار كافٍ؛ وقد يدّعي عميل تلف أثاث أو فقدان غرض."),
    pilot: w("Two weeks serving one neighbourhood, measuring travel time, hours per job and repeat bookings.", "أسبوعان لخدمة حي واحد، مع قياس وقت التنقل وساعات كل مهمة وتكرار الحجز."),
  },
  sc: {
    capacity: w("Before Eid you have 30 booking requests for a week your one crew can only cover 12.", "قبل العيد وصلك ٣٠ طلب حجز لأسبوع لا يغطي فيه فريقك الوحيد سوى ١٢ مهمة."),
    pricing: w("A big cleaning company is advertising villa cleans at 12.000 for new clients.", "شركة تنظيف كبيرة تعلن عن تنظيف الفلل بسعر ١٢٫٠٠٠ للعملاء الجدد."),
    supplier: w("Your detergent wholesaler offers 20% off if you buy six months of stock now.", "يعرض عليك تاجر مواد التنظيف خصم ٢٠٪ إن اشتريت مخزون ستة أشهر الآن."),
    marketing: w("You could boost Instagram posts, print flyers for Al Khoudh, or offer a free first hour.", "يمكنك ترويج منشورات إنستغرام، أو طباعة منشورات للخوض، أو تقديم الساعة الأولى مجاناً."),
    partner: w("A property manager offers 40 apartments a month if you cut your price by a third.", "مدير عقارات يعرض عليك ٤٠ شقة شهرياً إن خفّضت سعرك بمقدار الثلث."),
    service: w("A client sends a WhatsApp voice note saying the bathrooms were left dirty.", "عميل يرسل رسالة صوتية على واتساب يقول فيها إن الحمامات بقيت متسخة."),
  },
  extra: [
    { key: "services_route", chapter: "operations", label: w("How will you group jobs to cut travel time?", "كيف ستجمع المهام لتقليل وقت التنقل؟"), hint: w("Plan days by neighbourhood and count minutes between jobs.", "رتّب الأيام حسب الحي واحسب الدقائق بين المهام.") },
    { key: "services_trust", chapter: "risk", label: w("How will clients trust strangers inside their home?", "كيف سيثق العملاء بغرباء داخل بيوتهم؟"), hint: w("Think about uniforms, ID, the same crew each visit, and a damage policy.", "فكّر في الزي والهوية ونفس الفريق في كل زيارة وسياسة للتعويض عن الأضرار.") },
  ],
};
