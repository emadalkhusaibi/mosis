import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const retail: Lexicon = {
  customer: w("shopper", "الزبون"),
  customers: w("shoppers", "الزبائن"),
  product: w("item", "الصنف"),
  products: w("items", "الأصناف"),
  place: w("shop", "المحل"),
  staff: w("cashier", "المحاسب"),
  peak: w("the evening rush after work", "زحمة المساء بعد الدوام"),
  supply: w("stock from wholesalers and distributors", "البضاعة من تجار الجملة والموزّعين"),
  ex: {
    problem: w("Families in the new Al Amerat blocks drive 15 minutes for bread, milk and eggs because no shop is nearby.", "الأسر في المخططات الجديدة بالعامرات تقطع ١٥ دقيقة بالسيارة للخبز والحليب والبيض لعدم وجود محل قريب."),
    offer: w("A neighbourhood grocery with 400 everyday items, open until midnight, with free delivery by WhatsApp within 2 km.", "بقالة حي فيها ٤٠٠ صنف يومي، تفتح حتى منتصف الليل، مع توصيل مجاني عبر واتساب ضمن ٢ كم."),
    goal: w("Reach 180 baskets a day by month 8, at an average of 3.500 per basket.", "الوصول إلى ١٨٠ سلة يومياً بحلول الشهر الثامن، بمتوسط ٣٫٥٠٠ للسلة."),
    customer: w("Young families in Al Amerat who shop daily for small top-ups and order by WhatsApp in the evening.", "أسر شابة في العامرات تتسوّق يومياً لحاجات صغيرة وتطلب عبر واتساب في المساء."),
    alternatives: w("The hypermarket on the highway, a weekly bulk shop, or asking a neighbour.", "الهايبرماركت على الطريق السريع، أو التسوّق الأسبوعي بالجملة، أو الاستعانة بجار."),
    test: w("Sell 50 top items from a rented kiosk for two weeks; pass if 70 baskets a day average 2.500.", "بيع أكثر ٥٠ صنفاً طلباً من كشك مستأجر لأسبوعين؛ النجاح إن بلغت ٧٠ سلة يومياً بمتوسط ٢٫٥٠٠."),
    area: w("About 600 villas and apartments within a five-minute drive of our corner unit in Al Amerat.", "نحو ٦٠٠ فيلا وشقة على بعد خمس دقائق بالسيارة من محلنا على الزاوية في العامرات."),
    competitors: w("A hypermarket 6 km away with lower prices, a small grocery with old stock, and Talabat Mart delivering in 30 minutes.", "هايبرماركت على بعد ٦ كم بأسعار أقل، وبقالة صغيرة بضاعتها قديمة، وطلبات مارت يوصل خلال ٣٠ دقيقة."),
    difference: w("Fresh bread and produce every morning, open late, and orders on WhatsApp delivered in 15 minutes.", "خبز وخضار طازجة كل صباح، ودوام متأخر، وطلبات واتساب تصل خلال ١٥ دقيقة."),
    channels: w("A flyer with our WhatsApp number in every mailbox, and a sign at the mosque car park.", "منشور برقم واتساب في كل صندوق بريد، ولوحة في موقف سيارات المسجد."),
    delivery: w("Shopper orders on WhatsApp, the cashier packs and checks the list, and a driver delivers by motorbike.", "يطلب المتسوّق عبر واتساب، ويعبّئ المحاسب الطلب ويطابقه مع القائمة، ثم يوصله سائق بالدراجة."),
    suppliers: w("Two distributors for dairy and drinks with weekly visits, and a cash-and-carry in Al Mabela for gaps.", "موزّعان للألبان والمشروبات بزيارات أسبوعية، ومتجر جملة نقدي في المعبيلة لسدّ النواقص."),
    people: w("I handle buying and the morning shift; one cashier covers 3pm to midnight; a part-time driver for deliveries.", "أتولى الشراء والفترة الصباحية؛ ومحاسب يغطي من ٣ عصراً حتى منتصف الليل؛ وسائق بدوام جزئي للتوصيل."),
    location: w("A 70 m² corner unit with parking, shelving, two chillers, a freezer and a POS system.", "محل على زاوية بمساحة ٧٠ م² مع مواقف، ورفوف، وثلاجتي عرض، وفريزر، ونظام نقاط بيع."),
    risks: w("Slow items may expire on the shelf; a hypermarket may open nearby; credit to regulars may not be paid back.", "قد تنتهي صلاحية الأصناف بطيئة البيع على الرف؛ وقد يُفتتح هايبرماركت قريب؛ وقد لا يسدّد الزبائن الدائمون ديونهم."),
    pilot: w("Open with 150 items only for one month, tracking which sell weekly and which sit for 30 days.", "الافتتاح بـ١٥٠ صنفاً فقط لشهر واحد، مع تتبّع ما يُباع أسبوعياً وما يبقى ٣٠ يوماً دون بيع."),
  },
  sc: {
    capacity: w("In the evening rush after work, the single till has a queue of eight and WhatsApp orders go unanswered.", "في زحمة المساء بعد الدوام، يقف ثمانية أشخاص أمام صندوق الدفع الوحيد وتبقى طلبات واتساب بلا رد."),
    pricing: w("The hypermarket has cut rice, oil and sugar prices below your cost for the month.", "خفّض الهايبرماركت أسعار الأرز والزيت والسكر إلى ما دون تكلفتك طوال الشهر."),
    supplier: w("A distributor offers 10% off soft drinks if you take a full pallet each month.", "يعرض عليك موزّع خصم ١٠٪ على المشروبات الغازية إن أخذت منصّة كاملة كل شهر."),
    marketing: w("You could print a loyalty card, pay for Instagram ads in Al Amerat, or offer free delivery for a month.", "يمكنك طباعة بطاقة ولاء، أو الدفع لإعلانات إنستغرام في العامرات، أو تقديم توصيل مجاني لشهر."),
    partner: w("A snack distributor offers to fit out your shelves free if you stock only their brands.", "موزّع وجبات خفيفة يعرض تجهيز رفوفك مجاناً بشرط أن تبيع علاماته فقط."),
    service: w("A shopper complains in the neighbourhood WhatsApp group that she was sold expired yoghurt.", "متسوّقة تشتكي في مجموعة واتساب الحي من أنها اشترت لبناً منتهي الصلاحية."),
  },
  extra: [
    { key: "retail_range", chapter: "market", label: w("Which 50 items will your shoppers buy every week?", "ما الأصناف الخمسون التي سيشتريها متسوّقوك كل أسبوع؟"), hint: w("Start with the items people run out of, not what distributors push.", "ابدأ بما ينفد من البيوت، لا بما يروّج له الموزّعون.") },
    { key: "retail_stock", chapter: "operations", label: w("How will you stop cash getting stuck in slow stock?", "كيف ستمنع تجمّد المال في بضاعة بطيئة البيع؟"), hint: w("Set a reorder level for each item and review unsold stock every two weeks.", "حدّد حداً لإعادة الطلب لكل صنف، وراجع البضاعة غير المباعة كل أسبوعين.") },
  ],
};
