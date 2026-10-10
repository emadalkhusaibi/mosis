import { w } from "../words";
import type { Lexicon } from "../lexicon";

export const manufacturing: Lexicon = {
  customer: w("customer", "العميل"),
  customers: w("customers", "العملاء"),
  product: w("piece", "القطعة"),
  products: w("products", "المنتجات"),
  place: w("workshop", "الورشة"),
  staff: w("craftsperson", "الحرفي"),
  peak: w("the weeks before Eid", "الأسابيع التي تسبق العيد"),
  supply: w("raw materials and packaging", "المواد الخام والتغليف"),
  ex: {
    problem: w("Visitors to Salalah want frankincense gifts but find only loose resin in plastic bags, with no grade or story.", "زوار صلالة يريدون هدايا من اللبان، لكنهم لا يجدون إلا لباناً سائباً في أكياس بلاستيكية بلا درجة جودة ولا قصة."),
    offer: w("Gift boxes of graded Hojari frankincense and bakhoor in three sizes, from 4.500 to 12.000.", "علب هدايا من اللبان الحوجري المصنّف والبخور بثلاثة أحجام، من ٤٫٥٠٠ إلى ١٢٫٠٠٠."),
    goal: w("Sell 400 boxes a month by month 9, with 30% through hotels and shops that resell them.", "بيع ٤٠٠ علبة شهرياً بحلول الشهر التاسع، على أن يكون ٣٠٪ منها عبر فنادق ومحلات تعيد بيعها."),
    customer: w("Tourists in Salalah during Khareef, and Omanis buying gifts for weddings and trips abroad.", "السياح في صلالة خلال موسم الخريف، والعُمانيون الذين يشترون هدايا للأعراس والسفر إلى الخارج."),
    alternatives: w("Loose resin from the souq, mass-produced bakhoor from perfume chains, or airport gift shops.", "اللبان السائب من السوق، أو البخور المصنّع بكميات كبيرة من سلاسل العطور، أو محلات الهدايا في المطار."),
    test: w("Make 50 boxes and sell them at a Khareef stall for one week at 6.000; pass if 40 sell.", "إنتاج ٥٠ علبة وبيعها في كشك خلال الخريف لمدة أسبوع بسعر ٦٫٠٠٠؛ النجاح إن بيعت ٤٠ علبة."),
    area: w("Al Haffa souq and three hotels in Salalah, plus Instagram orders shipped to Muscat.", "سوق الحافة وثلاثة فنادق في صلالة، إضافة إلى طلبات إنستغرام التي تُشحن إلى مسقط."),
    competitors: w("Souq stalls at 1.000 a bag, perfume chains at 8.000 for bakhoor, and airport shops at 15.000 a box.", "بسطات السوق بسعر ١٫٠٠٠ للكيس، وسلاسل العطور بسعر ٨٫٠٠٠ للبخور، ومحلات المطار بسعر ١٥٫٠٠٠ للعلبة."),
    difference: w("Every box states the grade and harvest area, and each one is made by hand in Salalah.", "كل علبة تذكر درجة اللبان ومنطقة حصاده، وكل واحدة منها مصنوعة يدوياً في صلالة."),
    channels: w("Hotel gift shops on sale-or-return, a stall at the Khareef festival, and Instagram reels of the making.", "محلات الهدايا في الفنادق بنظام البيع أو الإرجاع، وكشك في مهرجان الخريف، ومقاطع على إنستغرام تُظهر مراحل الصنع."),
    delivery: w("Sort resin by grade, blend and dry the bakhoor, pack and label, check the weight, then ship.", "فرز اللبان حسب الدرجة، ثم خلط البخور وتجفيفه، فالتعبئة ووضع الملصق، والتحقق من الوزن، ثم الشحن."),
    suppliers: w("Two frankincense collectors in Dhofar for resin, and a Muscat printer for boxes with a three-week lead time.", "اثنان من جامعي اللبان في ظفار للمادة الخام، ومطبعة في مسقط للعلب بمدة توريد ثلاثة أسابيع."),
    people: w("I blend and handle sales; one part-time assistant packs and labels during Khareef.", "أتولى الخلط والمبيعات؛ ومساعد بدوام جزئي يتولى التعبئة ووضع الملصقات في موسم الخريف."),
    location: w("A 30 m² room at home in Salalah with drying racks, a scale and a sealing machine.", "غرفة بمساحة ٣٠ م² في المنزل بصلالة، فيها رفوف للتجفيف وميزان وآلة إغلاق."),
    risks: w("Resin quality varies between harvests; the box printer could miss our Khareef deadline.", "تتفاوت جودة اللبان من حصاد إلى آخر؛ وقد تتأخر المطبعة عن موعد الخريف."),
    pilot: w("One batch of 50 boxes, recording materials used, defective boxes and hours per box.", "دفعة واحدة من ٥٠ علبة، مع تسجيل المواد المستهلكة والعلب المعيبة وعدد الساعات لكل علبة."),
  },
  sc: {
    capacity: w("A hotel orders 300 boxes for the weeks before Eid, and you can make 100 a week.", "فندق يطلب ٣٠٠ علبة للأسابيع التي تسبق العيد، بينما طاقتك ١٠٠ علبة في الأسبوع."),
    pricing: w("A perfume chain launches a frankincense gift set at 3.900, cheaper than your smallest box.", "سلسلة عطور تطلق طقم هدايا من اللبان بسعر ٣٫٩٠٠، أرخص من أصغر علبك."),
    supplier: w("Your resin collector offers 18% off if you buy the whole season's harvest now.", "يعرض عليك جامع اللبان خصم ١٨٪ إن اشتريت محصول الموسم كاملاً الآن."),
    marketing: w("You could pay for a Khareef festival stall, run Instagram ads, or send samples to hotels.", "يمكنك دفع رسوم كشك في مهرجان الخريف، أو تشغيل إعلانات على إنستغرام، أو إرسال عينات إلى الفنادق."),
    partner: w("A Muscat gift shop offers to buy all your output if you sell only under its brand.", "محل هدايا في مسقط يعرض شراء كل إنتاجك بشرط أن تبيع باسمه التجاري فقط."),
    service: w("A customer posts that their box arrived crushed and the bakhoor smelled weak.", "عميل ينشر أن علبته وصلت مهشّمة وأن رائحة البخور كانت ضعيفة."),
  },
  extra: [
    { key: "manufacturing_batch", chapter: "operations", label: w("How many pieces will you make in one batch?", "كم قطعة ستنتج في الدفعة الواحدة؟"), hint: w("Weigh material discounts against unsold stock and storage space.", "وازن بين خصومات المواد وخطر المخزون غير المبيع ومساحة التخزين.") },
    { key: "manufacturing_quality", chapter: "risk", label: w("How will you check each piece before it is sold?", "كيف ستفحص كل قطعة قبل بيعها؟"), hint: w("Write down what counts as a defect and who makes the call.", "اكتب ما يُعدّ عيباً، ومن يملك القرار في ذلك.") },
  ],
};
