import kabsa from "@/assets/kabsa.jpg";
import jareesh from "@/assets/jareesh.jpg";
import mutabbaq from "@/assets/mutabbaq.jpg";
import saleeg from "@/assets/saleeg.jpg";
import chef1 from "@/assets/chef1.jpg";
import chef2 from "@/assets/chef2.jpg";

// Demo data only — بيانات تجريبية للعرض

export type Ingredient = { name: string; qty: number; unit: string; allergen?: string; sub?: string };
export type Recipe = {
  id: string; title: string; en: string; img: string; chefId: string; region: string;
  time: number; servings: number; kcal: number; likes: string; category: string;
  allergens: string[]; ingredients: Ingredient[]; steps: string[]; cost: number;
};
export type Chef = { id: string; name: string; title: string; city: string; img: string; bio: string; followers: string; rating: number };

export const chefs: Chef[] = [
  { id: "faisal", name: "الشيف فيصل العتيبي", title: "متخصص في المطبخ النجدي", city: "الرياض", img: chef1,
    bio: "١٢ سنة في المطابخ الفاخرة. أعيد تقديم أطباق الجدّات بلمسة عصرية وصحية.", followers: "٤٨٢ ألف", rating: 4.9 },
  { id: "noura", name: "الشيفة نورة الحربي", title: "حلويات ومطبخ حجازي", city: "جدة", img: chef2,
    bio: "خريجة معهد الطهي في باريس، أحب تبسيط الوصفات التراثية للبيت السعودي.", followers: "٣١٠ ألف", rating: 4.8 },
];

export const recipes: Recipe[] = [
  { id: "kabsa", title: "كبسة دجاج", en: "Chicken Kabsa", img: kabsa, chefId: "faisal", region: "نجد", time: 75, servings: 4, kcal: 620, likes: "١٢ ألف", category: "أطباق رئيسية",
    allergens: ["مكسرات"], cost: 48,
    ingredients: [
      { name: "دجاج كامل", qty: 1, unit: "حبة" }, { name: "أرز بسمتي", qty: 3, unit: "كوب" },
      { name: "بصل", qty: 2, unit: "حبة" }, { name: "طماطم", qty: 2, unit: "حبة" },
      { name: "بهارات الكبسة", qty: 2, unit: "م.ك" },
      { name: "لوز محمص", qty: 0.5, unit: "كوب", allergen: "مكسرات", sub: "بذور اليقطين المحمصة" },
      { name: "زبيب", qty: 0.25, unit: "كوب" },
    ],
    steps: ["حمّر البصل حتى يذبل ثم أضف الدجاج والبهارات.", "أضف الطماطم والماء واتركه ٤٠ دقيقة.", "أخرج الدجاج وأضف الأرز المنقوع للمرق.", "اشوِ الدجاج في الفرن ١٠ دقائق وزيّن باللوز والزبيب."] },
  { id: "jareesh", title: "جريش بالدجاج", en: "Jareesh", img: jareesh, chefId: "faisal", region: "القصيم", time: 90, servings: 4, kcal: 480, likes: "٨ آلاف", category: "تراثي",
    allergens: ["قمح", "ألبان"], cost: 32,
    ingredients: [
      { name: "جريش", qty: 2, unit: "كوب", allergen: "قمح", sub: "كينوا مجروشة" },
      { name: "دجاج", qty: 500, unit: "غ" }, { name: "بصل", qty: 2, unit: "حبة" },
      { name: "لبن", qty: 1, unit: "كوب", allergen: "ألبان", sub: "لبن الشوفان" },
      { name: "سمن", qty: 2, unit: "م.ك", allergen: "ألبان", sub: "زيت زيتون" },
    ],
    steps: ["انقع الجريش ساعة.", "اسلقه مع الدجاج حتى ينضج.", "أضف اللبن وحرّك حتى يتماسك.", "زيّن بالبصل المكرمل والسمن."] },
  { id: "mutabbaq", title: "مطبق لحم", en: "Mutabbaq", img: mutabbaq, chefId: "noura", region: "الحجاز", time: 40, servings: 3, kcal: 540, likes: "١٥ ألف", category: "مقبلات",
    allergens: ["قمح", "بيض"], cost: 27,
    ingredients: [
      { name: "عجينة رقيقة", qty: 6, unit: "حبة", allergen: "قمح", sub: "عجينة أرز خالية من الجلوتين" },
      { name: "لحم مفروم", qty: 300, unit: "غ" }, { name: "بيض", qty: 3, unit: "حبة", allergen: "بيض", sub: "بذر الكتان مع ماء" },
      { name: "كراث", qty: 1, unit: "ربطة" }, { name: "بصل", qty: 1, unit: "حبة" },
    ],
    steps: ["اطهُ اللحم مع البصل والبهارات.", "اخلط البيض والكراث مع اللحم.", "افرد العجينة وضع الحشوة واطوها.", "حمّرها على الصاج من الجهتين."] },
  { id: "saleeg", title: "سليق طائفي", en: "Saleeg", img: saleeg, chefId: "noura", region: "الحجاز", time: 60, servings: 4, kcal: 590, likes: "٩ آلاف", category: "أطباق رئيسية",
    allergens: ["ألبان"], cost: 36,
    ingredients: [
      { name: "أرز مصري", qty: 2, unit: "كوب" }, { name: "دجاج", qty: 1, unit: "حبة" },
      { name: "حليب", qty: 2, unit: "كوب", allergen: "ألبان", sub: "حليب جوز الهند" },
      { name: "سمن", qty: 2, unit: "م.ك", allergen: "ألبان", sub: "زيت زيتون" }, { name: "لومي", qty: 2, unit: "حبة" },
    ],
    steps: ["اسلق الدجاج مع اللومي.", "اطبخ الأرز بالمرق حتى يلين.", "أضف الحليب تدريجياً مع التحريك.", "قدّمه مع الدجاج المحمّر والسمن."] },
];

export const allergensList = ["مكسرات", "ألبان", "قمح / جلوتين", "بيض", "مأكولات بحرية", "سمسم", "صويا"];
export const dislikesList = ["كزبرة", "باذنجان", "فلفل حار", "فطر", "زيتون", "بصل نيء"];

export const regions = [
  { name: "نجد", en: "Najd", dishes: ["كبسة", "جريش", "مرقوق", "قرصان"], img: kabsa },
  { name: "الحجاز", en: "Hijaz", dishes: ["مطبق", "سليق", "معصوب", "فول"], img: mutabbaq },
  { name: "القصيم", en: "Qassim", dishes: ["كليجا", "جريش", "حنيني"], img: jareesh },
  { name: "الجنوب", en: "South", dishes: ["عريكة", "حنيذ", "مندي"], img: saleeg },
  { name: "الشرقية", en: "Eastern", dishes: ["مچبوس سمك", "بلاليط", "خبز رقاق"], img: kabsa },
  { name: "الشمال", en: "North", dishes: ["منسف", "جريش", "كبيبة حائل"], img: jareesh },
];

export const stores = [
  { name: "بنده", en: "Panda" }, { name: "التميمي", en: "Tamimi" },
  { name: "الدانوب", en: "Danube" }, { name: "لولو", en: "LuLu" },
];
// prices in SAR per item; null = unavailable
export const basket: { item: string; prices: (number | null)[] }[] = [
  { item: "دجاج كامل ١كغ", prices: [18.5, 21, 19.75, 17.95] },
  { item: "أرز بسمتي ٢كغ", prices: [24, 26.5, 25, 22.5] },
  { item: "بهارات الكبسة", prices: [6.5, 7, null, 5.75] },
  { item: "بذور اليقطين", prices: [12, 14.5, 13, null] },
  { item: "زبيب ٢٥٠غ", prices: [5.5, 6, 5.25, 5.95] },
];

export const pantryAll = ["دجاج", "أرز", "بصل", "طماطم", "بيض", "لحم مفروم", "حليب", "جريش", "عجينة", "كراث", "لبن", "سمن", "بهارات", "لومي"];
export const pantryMeals = [
  { title: "كبسة دجاج", needs: ["دجاج", "أرز", "بصل", "طماطم", "بهارات"], img: kabsa, id: "kabsa" },
  { title: "سليق", needs: ["دجاج", "أرز", "حليب", "سمن", "لومي"], img: saleeg, id: "saleeg" },
  { title: "مطبق", needs: ["عجينة", "لحم مفروم", "بيض", "كراث", "بصل"], img: mutabbaq, id: "mutabbaq" },
  { title: "جريش", needs: ["جريش", "دجاج", "بصل", "لبن", "سمن"], img: jareesh, id: "jareesh" },
  { title: "شكشوكة", needs: ["بيض", "طماطم", "بصل"], img: mutabbaq, id: "mutabbaq" },
];

export const getRecipe = (id: string) => recipes.find((r) => r.id === id);
export const getChef = (id: string) => chefs.find((c) => c.id === id);
export const sar = (n: number) => `${n.toFixed(2)} ر.س`;
