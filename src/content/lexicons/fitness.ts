import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const fitness: Lexicon = {
  customer: w("member", "العضو"),
  customers: w("members", "الأعضاء"),
  product: w("class", "الحصة"),
  products: w("classes and memberships", "الحصص والاشتراكات"),
  place: w("studio", "الاستوديو"),
  staff: w("trainer", "المدرب"),
  peak: w("the evening classes after work", "حصص المساء بعد الدوام"),
  supply: w("equipment, mats and maintenance", "المعدات والسجادات والصيانة"),
  ex: {
    problem: w("Women in Al Khuwair want evening group classes, but the nearest ladies-only studio is full by 6pm.", "النساء في الخوير يردن حصصاً جماعية مسائية، لكن أقرب استوديو للسيدات يمتلئ قبل السادسة."),
    offer: w("Small-group strength and cycling classes for women, 25.000 a month for unlimited classes, booked through an app.", "حصص قوة ودراجات جماعية صغيرة للسيدات، بـ٢٥٫٠٠٠ شهرياً لحصص غير محدودة، تُحجز عبر تطبيق."),
    goal: w("Reach 180 paying members by month 12, with 75% renewing after their third month.", "الوصول إلى ١٨٠ مشتركة بحلول الشهر الثاني عشر، على أن تجدّد ٧٥٪ منهن بعد شهرهن الثالث."),
    customer: w("Working women aged 25 to 45 in Al Khuwair and Bausher who train after 5pm and pay monthly by card.", "موظفات بين ٢٥ و٤٥ عاماً في الخوير وبوشر يتمرّنّ بعد الخامسة مساءً ويدفعن شهرياً بالبطاقة."),
    alternatives: w("A big chain gym at 20.000 a month, walking at the beach, or YouTube workouts at home.", "نادٍ كبير تابع لسلسلة بـ٢٠٫٠٠٠ شهرياً، أو المشي على الشاطئ، أو تمارين يوتيوب في البيت."),
    test: w("Run a paid four-week class in a rented hall at 3.000 per session; pass if 12 women attend at least six times.", "حصة مدفوعة لأربعة أسابيع في قاعة مستأجرة بسعر ٣٫٠٠٠ للحصة؛ النجاح إن حضرت ١٢ امرأة ست مرات على الأقل."),
    area: w("Homes and offices within a ten-minute drive of our studio in Al Khuwair, on the way back from work.", "البيوت والمكاتب على بعد عشر دقائق بالسيارة من الاستوديو في الخوير، على طريق العودة من الدوام."),
    competitors: w("A chain gym at 20.000 with no classes for women, a boutique studio at 45.000, and free running groups.", "نادٍ تابع لسلسلة بـ٢٠٫٠٠٠ بلا حصص للسيدات، واستوديو راقٍ بـ٤٥٫٠٠٠، ومجموعات جري مجانية."),
    difference: w("Classes capped at ten with a coach who knows every name, and a progress check every four weeks.", "حصص لا تزيد على عشر مشتركات مع مدرّبة تعرف كل واحدة باسمها، وتقييم للتقدّم كل أربعة أسابيع."),
    channels: w("A free first class, Instagram Reels from real sessions, and a bring-a-friend week each month.", "حصة أولى مجانية، ومقاطع ريلز على إنستغرام من حصص حقيقية، وأسبوع \"أحضري صديقة\" كل شهر."),
    delivery: w("Book in the app, check in at the door, 45-minute class, and attendance logged to spot members who stop coming.", "الحجز عبر التطبيق، وتسجيل الحضور عند الباب، وحصة مدتها ٤٥ دقيقة، ومتابعة الحضور لرصد من تنقطع."),
    suppliers: w("A fitness equipment dealer in Ghala with a one-year service contract, and a local technician as backup.", "وكيل معدات رياضية في غلا بعقد صيانة لسنة، وفني محلي كبديل احتياطي."),
    people: w("I coach the evening classes; one part-time trainer covers mornings and weekends from month 2.", "أدرّب حصص المساء بنفسي؛ ومدرّبة بدوام جزئي تغطي الصباح وعطلة نهاية الأسبوع من الشهر الثاني."),
    location: w("A 120 m² first-floor unit with mirrors, sound system, 12 bikes, changing rooms and parking.", "وحدة بمساحة ١٢٠ م² في الطابق الأول فيها مرايا ونظام صوت و١٢ دراجة وغرف تبديل ومواقف."),
    risks: w("Members may quit after Ramadan; my only trainer could leave; the summer heat may cut attendance.", "قد تنسحب المشتركات بعد رمضان؛ وقد تغادر مدرّبتي الوحيدة؛ وقد يقلّ الحضور في حرّ الصيف."),
    pilot: w("Rent a hall three evenings a week for six weeks, selling 10-class packs and tracking attendance.", "استئجار قاعة ثلاث أمسيات أسبوعياً لستة أسابيع، وبيع باقات من ١٠ حصص، وتتبّع الحضور."),
  },
  sc: {
    capacity: w("The 6pm class has a waitlist of 15 every day while the 8am class has three people.", "حصة السادسة مساءً عليها قائمة انتظار من ١٥ شخصاً يومياً، بينما لا يحضر حصة الثامنة صباحاً إلا ثلاثة."),
    pricing: w("A chain gym opens nearby with a 12-month membership at 150.000.", "نادٍ تابع لسلسلة يُفتتح قريباً باشتراك سنوي بسعر ١٥٠٫٠٠٠."),
    supplier: w("A dealer offers 25% off a second set of bikes if you sign a three-year service contract.", "يعرض عليك وكيل خصم ٢٥٪ على مجموعة دراجات ثانية إن وقّعت عقد صيانة لثلاث سنوات."),
    marketing: w("You could run a 30-day challenge, pay for Instagram ads, or offer corporate packs to nearby offices.", "يمكنك إطلاق تحدٍّ لمدة ٣٠ يوماً، أو الدفع لإعلانات إنستغرام، أو تقديم باقات للشركات المجاورة."),
    partner: w("A physiotherapy clinic offers to share your space and refer patients if you split the rent.", "عيادة علاج طبيعي تعرض مشاركتك المكان وإحالة مرضاها إليك مقابل تقاسم الإيجار."),
    service: w("A member posts on Instagram that she was charged for a month after cancelling.", "مشتركة تنشر على إنستغرام أنه خُصم منها مبلغ شهر بعد إلغاء اشتراكها."),
  },
  extra: [
    { key: "fitness_retention", chapter: "customer", label: w("How will you keep members coming after the first month?", "كيف ستحافظ على حضور الأعضاء بعد الشهر الأول؟"), hint: w("Track who misses a week and contact them before they cancel.", "تابع من يغيب أسبوعاً وتواصل معه قبل أن يلغي اشتراكه.") },
    { key: "fitness_capacity", chapter: "operations", label: w("How many members can each class hold?", "كم عضواً تتّسع له كل حصة؟"), hint: w("Count space, equipment and one trainer's attention, then plan your timetable.", "احسب المساحة والمعدات وما يستطيع مدرب واحد متابعته، ثم ضع جدول الحصص.") },
  ],
};
