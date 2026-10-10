import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const tourism: Lexicon = {
  customer: w("guest", "الضيف"),
  customers: w("guests", "الضيوف"),
  product: w("tour", "الجولة"),
  products: w("tours", "الجولات"),
  place: w("tour business", "مشروع الجولات"),
  staff: w("guide", "المرشد"),
  peak: w("the cool season from October to March", "الموسم البارد من أكتوبر إلى مارس"),
  supply: w("4x4 vehicles, fuel and camping gear", "سيارات الدفع الرباعي والوقود ومعدات التخييم"),
  ex: {
    problem: w("Visitors to Nizwa see the fort in an hour and leave, because no one offers a half-day village walk.", "زوار نزوى يشاهدون القلعة في ساعة ثم يغادرون، لأن أحداً لا يقدّم جولة مشي في القرى لنصف يوم."),
    offer: w("A four-hour guided walk on Jebel Akhdar with lunch in a village house, for 35.000 per guest.", "جولة مشي بمرشد في الجبل الأخضر لأربع ساعات مع غداء في بيت قروي، بسعر ٣٥٫٠٠٠ للضيف."),
    goal: w("50 bookings a month in the cool season by year two, with at least a third from repeat or referred guests.", "٥٠ حجزاً شهرياً في الموسم البارد بحلول السنة الثانية، على أن يأتي الثلث على الأقل من ضيوف متكررين أو بالإحالة."),
    customer: w("European couples and expat families in Muscat who book weekend trips online and want something authentic.", "أزواج أوروبيون وأسر وافدة في مسقط يحجزون رحلات نهاية الأسبوع عبر الإنترنت ويبحثون عن تجربة أصيلة."),
    alternatives: w("A hotel-booked bus tour, driving up alone with a map, or staying by the pool.", "رحلة بالحافلة يحجزها الفندق، أو الصعود بالسيارة وحدهم مع خريطة، أو البقاء عند المسبح."),
    test: w("Run four Friday walks at 30.000 each, sold through an Instagram post; pass if 24 guests book.", "تنظيم أربع جولات مشي أيام الجمعة بسعر ٣٠٫٠٠٠ للضيف، تُباع عبر منشور على إنستغرام؛ النجاح إن حجز ٢٤ ضيفاً."),
    area: w("Hotels in Muscat and Nizwa, and travellers searching online for Jebel Akhdar.", "الفنادق في مسقط ونزوى، والمسافرون الذين يبحثون عن الجبل الأخضر عبر الإنترنت."),
    competitors: w("A large operator at 60.000 for a full-day 4x4 tour, and freelance drivers at 25.000 with no guiding.", "شركة كبيرة بسعر ٦٠٫٠٠٠ لجولة يوم كامل بالدفع الرباعي، وسائقون مستقلون بسعر ٢٥٫٠٠٠ دون إرشاد."),
    difference: w("Groups of eight at most, a local guide from the village, and lunch cooked by a family on the terraces.", "مجموعات لا تتجاوز ثمانية أشخاص، ومرشد محلي من القرية، وغداء تطبخه أسرة بين المدرجات الزراعية."),
    channels: w("Listings on a global booking site, flyers at hotel desks in Nizwa, and reviews from every guest.", "إدراج على موقع حجز عالمي، ومنشورات عند مكاتب الاستقبال في فنادق نزوى، وتقييمات من كل ضيف."),
    delivery: w("Booking online with a deposit, pickup from the hotel, safety briefing, walk, lunch, and drop-off by 3pm.", "الحجز عبر الإنترنت بعربون، والاستلام من الفندق، وتعليمات السلامة، ثم المشي والغداء، والعودة قبل الثالثة عصراً."),
    suppliers: w("A 4x4 rental company in Nizwa, two village families for lunch, and a backup driver on call.", "شركة تأجير سيارات دفع رباعي في نزوى، وأسرتان من القرية للغداء، وسائق احتياطي عند الطلب."),
    people: w("I guide every tour myself; one driver works with me on weekends in the cool season.", "أرشد كل جولة بنفسي؛ ويعمل معي سائق في عطلات نهاية الأسبوع خلال الموسم البارد."),
    location: w("No fixed premises; one rented 4x4, first-aid kit, radios and a tourism guide licence.", "لا مقر ثابت؛ سيارة دفع رباعي مستأجرة، وحقيبة إسعافات أولية، وأجهزة لاسلكي، وترخيص مرشد سياحي."),
    risks: w("Bookings may disappear in the summer heat; heavy rain could close the mountain road on a booked day.", "قد تختفي الحجوزات في حر الصيف؛ وقد تُغلق الأمطار الغزيرة طريق الجبل في يوم محجوز."),
    pilot: w("Eight weekend tours over one month, measuring bookings per tour, guest reviews and cost per guest.", "ثماني جولات في عطلات نهاية الأسبوع خلال شهر، مع قياس الحجوزات لكل جولة وتقييمات الضيوف والتكلفة لكل ضيف."),
  },
  sc: {
    capacity: w("A cruise ship docks in Muscat and a group of 40 wants your tour on a day you have one car.", "سفينة سياحية ترسو في مسقط ومجموعة من ٤٠ شخصاً تريد جولتك في يوم لا تملك فيه سوى سيارة واحدة."),
    pricing: w("A large operator now sells a Jebel Akhdar day trip for 25.000 on the same booking site.", "شركة كبيرة صارت تبيع رحلة يوم إلى الجبل الأخضر بسعر ٢٥٫٠٠٠ على موقع الحجز نفسه."),
    supplier: w("The 4x4 rental company offers 25% off if you rent for the whole season upfront.", "شركة تأجير السيارات تعرض خصم ٢٥٪ إن استأجرت للموسم كاملاً مقدماً."),
    marketing: w("You could pay a travel influencer, pay hotel concierges a commission, or advertise on the booking site.", "يمكنك الدفع لمؤثر سياحي، أو دفع عمولة لموظفي استقبال الفنادق، أو الإعلان على موقع الحجز."),
    partner: w("A hotel in Nizwa offers to sell only your tours if you give it 30% of every booking.", "فندق في نزوى يعرض أن يبيع جولاتك وحدها مقابل ٣٠٪ من كل حجز."),
    service: w("A guest leaves a two-star review saying the pickup was 40 minutes late.", "ضيف يترك تقييماً بنجمتين يقول فيه إن الاستلام تأخر ٤٠ دقيقة."),
  },
  extra: [
    { key: "tourism_season", chapter: "finance", label: w("How will you cover costs from May to September?", "كيف ستغطي تكاليفك من مايو إلى سبتمبر؟"), hint: w("Consider a summer product in Salalah, lower fixed costs, or savings from the cool season.", "فكّر في تجربة صيفية في صلالة، أو خفض التكاليف الثابتة، أو ادخار جزء من إيرادات الموسم البارد.") },
    { key: "tourism_safety", chapter: "risk", label: w("What will you do if a guest is hurt far from the road?", "ماذا ستفعل إن أُصيب ضيف بعيداً عن الطريق؟"), hint: w("Write down first aid, how you'll call for help, and your insurance cover.", "دوّن خطة الإسعافات الأولية، وطريقة طلب المساعدة، وما يغطيه تأمينك.") },
  ],
};
