import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const events: Lexicon = {
  customer: w("client", "العميل"),
  customers: w("clients", "العملاء"),
  product: w("package", "الباقة"),
  products: w("packages", "الباقات"),
  place: w("catering business", "مشروع الضيافة"),
  staff: w("event server", "مقدّم الضيافة"),
  peak: w("the wedding season", "موسم الأعراس"),
  supply: w("food, rented tents and serving equipment", "الطعام والخيام المستأجرة وأدوات التقديم"),
  ex: {
    problem: w("Families in Nizwa hosting a wedding deal with five separate suppliers and still run short of food.", "العائلات في نزوى التي تقيم عرساً تتعامل مع خمسة موردين منفصلين، ومع ذلك ينقص الطعام."),
    offer: w("Full catering for 100 to 300 guests: Omani dishes, tent, serving staff and cleanup, priced per guest.", "ضيافة متكاملة من ١٠٠ إلى ٣٠٠ ضيف: أطباق عُمانية وخيمة وطاقم تقديم وتنظيف، بسعر محدد لكل ضيف."),
    goal: w("Book four events a month by month 9, each with a 50% deposit paid upfront.", "حجز أربع فعاليات شهرياً بحلول الشهر التاسع، مع دفعة مقدمة بنسبة ٥٠٪ لكل منها."),
    customer: w("Families in Nizwa and Bahla planning weddings and Eid gatherings, who book on relatives' recommendations.", "عائلات في نزوى وبهلاء تخطط لأعراس وتجمعات العيد، وتحجز بناءً على توصيات الأقارب."),
    alternatives: w("Ordering food from several restaurants, a large Muscat caterer, or relatives cooking at home.", "طلب الطعام من عدة مطاعم، أو شركة ضيافة كبيرة من مسقط، أو طبخ الأقارب في البيت."),
    test: w("Cater two family gatherings of 80 guests at 6.000 per guest; pass if both clients refer someone.", "تقديم الضيافة لتجمعين عائليين من ٨٠ ضيفاً بسعر ٦٫٠٠٠ للضيف؛ النجاح إن رشّح كل عميل شخصاً آخر."),
    area: w("Nizwa, Bahla and Izki, all within an hour's drive of our kitchen.", "نزوى وبهلاء وإزكي، وكلها على بعد ساعة بالسيارة من مطبخنا."),
    competitors: w("A Muscat caterer at 9.000 a guest plus transport, local restaurants at 4.000 with no service, and home cooks.", "شركة ضيافة من مسقط بسعر ٩٫٠٠٠ للضيف إضافة إلى النقل، ومطاعم محلية بسعر ٤٫٠٠٠ دون خدمة، وطبّاخون منزليون."),
    difference: w("One contact for food, tent and staff, with a written menu and the headcount confirmed a week before.", "جهة واحدة للطعام والخيمة والطاقم، مع قائمة طعام مكتوبة وعدد ضيوف يُؤكَّد قبل أسبوع."),
    channels: w("Photos and short videos from each event on Instagram, and a tasting day for families planning a wedding.", "صور ومقاطع قصيرة من كل فعالية على إنستغرام، ويوم تذوق للعائلات التي تخطط لعرس."),
    delivery: w("Tasting, signed quote and deposit, headcount confirmed a week before, setup four hours early, cleanup after.", "تذوق، ثم عرض سعر موقّع ودفعة مقدمة، وتأكيد العدد قبل أسبوع، والتجهيز قبل أربع ساعات، والتنظيف بعد الانتهاء."),
    suppliers: w("A tent rental company in Nizwa, a meat supplier in Bahla, and a backup tent supplier in Izki.", "شركة تأجير خيام في نزوى، ومورّد لحوم في بهلاء، ومورّد خيام احتياطي في إزكي."),
    people: w("I handle bookings and the kitchen; six part-time servers join us for each event.", "أتولى الحجوزات والمطبخ؛ وينضم إلينا ستة من طاقم التقديم بدوام جزئي في كل فعالية."),
    location: w("A licensed kitchen in Nizwa with two large cookers, a cold room and a rented pickup.", "مطبخ مرخّص في نزوى فيه موقدان كبيران وغرفة تبريد وسيارة نقل مستأجرة."),
    risks: w("A client may cancel after we have bought the food; in the wedding season every tent in town may be booked.", "قد يلغي العميل بعد شراء الطعام؛ وقد تُحجز جميع الخيام في المدينة خلال موسم الأعراس."),
    pilot: w("Two small events in one month, tracking leftover food and actual cost against the quote.", "فعاليتان صغيرتان في شهر واحد، مع تتبّع الطعام المتبقي ومقارنة التكلفة الفعلية بعرض السعر."),
  },
  sc: {
    capacity: w("Three clients want the same Thursday in the wedding season, and you have staff for one.", "ثلاثة عملاء يريدون يوم الخميس نفسه في موسم الأعراس، ولديك طاقم يكفي لفعالية واحدة."),
    pricing: w("A Muscat caterer is offering Nizwa families 20% off bookings made this month.", "شركة ضيافة من مسقط تعرض على عائلات نزوى خصم ٢٠٪ على الحجوزات هذا الشهر."),
    supplier: w("The tent company offers 25% off if you book ten dates for the season in advance.", "تعرض عليك شركة الخيام خصم ٢٥٪ إن حجزت عشرة مواعيد للموسم مسبقاً."),
    marketing: w("You could pay an Instagram influencer, host a free tasting day, or give event planners a referral fee.", "يمكنك الدفع لمؤثر على إنستغرام، أو إقامة يوم تذوق مجاني، أو منح منسّقي الحفلات عمولة إحالة."),
    partner: w("A wedding hall owner offers you every booking at his hall in return for 15% of each event.", "صاحب قاعة أعراس يعرض عليك كل الحجوزات في قاعته مقابل ١٥٪ من قيمة كل فعالية."),
    service: w("A client says on Instagram that the food ran out before the women's section was served.", "عميل يقول على إنستغرام إن الطعام نفد قبل أن يُقدَّم لقسم النساء."),
  },
  extra: [
    { key: "events_deposit", chapter: "finance", label: w("How much deposit will you take, and when?", "ما قيمة الدفعة المقدمة التي ستأخذها، ومتى؟"), hint: w("Cover what you must buy before the event, and set a clear cancellation rule.", "اجعلها تغطي ما يجب شراؤه قبل الفعالية، وضع قاعدة واضحة للإلغاء.") },
    { key: "events_headcount", chapter: "operations", label: w("How will you plan for the real number of guests?", "كيف ستخطط لعدد الضيوف الفعلي؟"), hint: w("Agree a date for the final headcount and how much extra food you prepare.", "اتفق على موعد نهائي لتأكيد العدد، وحدّد كمية الطعام الإضافية.") },
  ],
};
