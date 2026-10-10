import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const restaurant: Lexicon = {
  customer: w("diner", "الزبون"),
  customers: w("diners", "الزبائن"),
  product: w("dish", "الطبق"),
  products: w("dishes", "الأطباق"),
  place: w("restaurant", "المطعم"),
  staff: w("cook", "الطاهي"),
  peak: w("the Friday lunch rush", "زحمة غداء الجمعة"),
  supply: w("rice, meat, vegetables and packaging", "الأرز واللحوم والخضروات ومواد التغليف"),
  ex: {
    problem: w("Workers in the Ruwi offices have a 45-minute lunch break and no home-style meal nearby under 2 rials.", "موظفو مكاتب روي لديهم استراحة غداء مدتها ٤٥ دقيقة، ولا توجد قربهم وجبة بطابع منزلي بأقل من ريالين."),
    offer: w("Three daily rice dishes with salad and laban for 1.800, dine-in or delivered by Talabat.", "ثلاثة أطباق أرز يومية مع السلطة واللبن بسعر ١٫٨٠٠، في المطعم أو بالتوصيل عبر طلبات."),
    goal: w("Serve 150 meals a day by month 10, with food waste under 5% of ingredient cost.", "تقديم ١٥٠ وجبة يومياً بحلول الشهر العاشر، مع إبقاء هدر الطعام دون ٥٪ من تكلفة المكونات."),
    customer: w("Office workers and drivers in Ruwi who eat lunch between 12:30 and 2pm and pay cash or by card.", "موظفو المكاتب والسائقون في روي الذين يتناولون الغداء بين ١٢:٣٠ و٢ ظهراً ويدفعون نقداً أو بالبطاقة."),
    alternatives: w("Shawarma stands, a lunch box from home, or a Talabat order from a big chain.", "أكشاك الشاورما، أو علبة غداء من البيت، أو طلب من سلسلة كبيرة عبر طلبات."),
    test: w("Take WhatsApp pre-orders for a single biryani at 1.800 for five days; pass if 200 portions sell with under 10 wasted.", "استقبال طلبات مسبقة عبر واتساب لطبق برياني واحد بسعر ١٫٨٠٠ لخمسة أيام؛ النجاح إن بيعت ٢٠٠ حصة وهُدر أقل من ١٠."),
    area: w("The offices and shops within a ten-minute drive of our kitchen in Ruwi, plus Talabat orders up to Wadi Kabir.", "المكاتب والمحلات على بعد عشر دقائق بالسيارة من مطبخنا في روي، إضافة إلى طلبات طلبات حتى وادي الكبير."),
    competitors: w("A chain fast-food outlet at 2.500 a meal, a cafeteria at 0.900 a sandwich, and a family restaurant with slow service.", "مطعم وجبات سريعة تابع لسلسلة بسعر ٢٫٥٠٠ للوجبة، ومقصف بسعر ٠٫٩٠٠ للساندويتش، ومطعم عائلي خدمته بطيئة."),
    difference: w("Home-style Omani dishes ready in ten minutes, with a fixed weekly menu posted every Saturday on WhatsApp.", "أطباق عُمانية بطابع منزلي جاهزة خلال عشر دقائق، مع قائمة أسبوعية ثابتة تُنشر كل سبت على واتساب."),
    channels: w("Free tasting portions at three office buildings, a Talabat listing, and a WhatsApp broadcast list for the daily menu.", "حصص تذوق مجانية في ثلاثة مبانٍ مكتبية، وصفحة على طلبات، وقائمة بث على واتساب للقائمة اليومية."),
    delivery: w("Order before 11am, cook in batches, pack in sealed boxes, and check each order against the ticket before pickup.", "الطلب قبل ١١ صباحاً، والطبخ على دفعات، والتعبئة في علب محكمة، ومطابقة كل طلب مع الورقة قبل الاستلام."),
    suppliers: w("A wholesaler at the Mawaleh market for vegetables every two days, and a second meat supplier in Seeb as backup.", "تاجر جملة في سوق الموالح للخضروات كل يومين، ومورّد لحوم ثانٍ في السيب كبديل احتياطي."),
    people: w("I cook and plan the menu; one helper preps and packs from 9am to 3pm, and I hire a cashier in month 3.", "أطبخ وأخطط القائمة بنفسي؛ ومساعد يجهّز ويعبّئ من ٩ صباحاً حتى ٣ عصراً، وأوظّف محاسباً في الشهر الثالث."),
    location: w("A 60 m² unit with a licensed kitchen, eight tables, an extractor hood and two fridges.", "محل بمساحة ٦٠ م² بمطبخ مرخّص وثماني طاولات وشفّاط وثلاجتين."),
    risks: w("Rice and meat prices could rise; a bad hygiene inspection could close us; Talabat commission may eat the margin.", "قد ترتفع أسعار الأرز واللحوم؛ وقد يغلقنا تفتيش صحي سيئ؛ وقد تلتهم عمولة طلبات الهامش."),
    pilot: w("Cook from a rented shared kitchen for three weeks, selling two dishes by pre-order and logging waste daily.", "الطبخ في مطبخ مشترك مستأجر لثلاثة أسابيع، وبيع طبقين بالطلب المسبق، وتسجيل الهدر يومياً."),
  },
  sc: {
    capacity: w("During the Friday lunch rush, orders wait 40 minutes and Talabat drivers start cancelling.", "في زحمة غداء الجمعة تنتظر الطلبات ٤٠ دقيقة، ويبدأ سائقو طلبات بالإلغاء."),
    pricing: w("A new restaurant on your street is offering a full meal for 1.200 all month.", "مطعم جديد في شارعك يقدّم وجبة كاملة بسعر ١٫٢٠٠ طوال الشهر."),
    supplier: w("Your rice wholesaler offers 12% off if you buy six months' stock at once.", "يعرض عليك تاجر الأرز خصم ١٢٪ إن اشتريت مخزون ستة أشهر دفعة واحدة."),
    marketing: w("You could pay for a featured spot on Talabat, sponsor an office lunch, or run Instagram ads.", "يمكنك الدفع لظهور مميّز على طلبات، أو رعاية غداء لأحد المكاتب، أو تشغيل إعلانات إنستغرام."),
    partner: w("A catering company offers to fund a second kitchen if you cook their wedding orders first.", "شركة تموين تعرض تمويل مطبخ ثانٍ بشرط أن تعطي طلبات أعراسها الأولوية."),
    service: w("A diner posts a photo on Instagram of a cold, half-filled box from your restaurant.", "زبون ينشر على إنستغرام صورة علبة باردة ونصف ممتلئة من مطعمك."),
  },
  extra: [
    { key: "restaurant_menu", chapter: "finance", label: w("What does each dish cost you to make?", "كم يكلّفك تحضير كل طبق؟"), hint: w("Weigh every ingredient and the packaging; aim for food cost under a third of the price.", "زِن كل مكوّن مع التغليف؛ واجعل تكلفة الطعام دون ثلث سعر البيع.") },
    { key: "restaurant_waste", chapter: "operations", label: w("How will you track and cut food waste?", "كيف ستتابع هدر الطعام وتقلّله؟"), hint: w("Record what is thrown away each night and adjust tomorrow's batch sizes.", "سجّل ما يُرمى كل ليلة وعدّل كميات الطبخ لليوم التالي.") },
  ],
};
