import kabsa from "@/assets/kabsa.jpg";
import jareesh from "@/assets/jareesh.jpg";
import mutabbaq from "@/assets/mutabbaq.jpg";
import saleeg from "@/assets/saleeg.jpg";
import haneeth from "@/assets/haneeth.jpg";
import qursan from "@/assets/qursan.jpg";
import luqaimat from "@/assets/luqaimat.jpg";
import veggie from "@/assets/veggie.jpg";
import pasta from "@/assets/pasta.jpg";
import chef1 from "@/assets/chef1.jpg";
import chef2 from "@/assets/chef2.jpg";

// ⚠ Demo data only — بيانات تجريبية للعرض، ليست أسعاراً أو معلومات موثّقة.

export type Sub = { name: string; reason: string; impact: string; kcal: number; cost: number };
export type Ingredient = { key: string; qty: number; unit: string; allergen?: string; subs?: Sub[] };
export type Recipe = {
  id: string; title: string; en: string; img: string; chefId: string; region: string;
  time: number; servings: number; difficulty: "سهل" | "متوسط" | "متقدم"; likes: string;
  cats: string[]; nutrition: { kcal: number; protein: number; carbs: number; fat: number };
  ingredients: Ingredient[]; steps: { t: string; min?: number }[];
};
export type Chef = {
  id: string; name: string; title: string; city: string; roots: string; img: string; bio: string;
  followers: string; rating: number; reviews: number; specialties: string[];
};

export const categories = ["سعودي", "حلويات", "مكرونة", "صحي", "سريع", "نباتي"];
export const allergensList = ["مكسرات", "ألبان", "جلوتين", "بيض", "مأكولات بحرية", "سمسم", "صويا"];
export const dislikesList = ["كزبرة", "باذنجان", "فلفل حار", "فطر", "زيتون", "بصل نيء", "كراث"];
export const diets = [
  { id: "all", ar: "بدون قيود", en: "No restriction" },
  { id: "healthy", ar: "صحي / قليل الدهون", en: "Healthy" },
  { id: "veg", ar: "نباتي", en: "Vegetarian" },
  { id: "highprotein", ar: "عالي البروتين", en: "High protein" },
];

export const chefs: Chef[] = [
  { id: "faisal", name: "الشيف فيصل العتيبي", title: "مطبخ نجدي معاصر", city: "الرياض", roots: "من عنيزة، القصيم", img: chef1,
    bio: "١٢ سنة بين مطابخ الفنادق ومطبخ والدته. يعيد تقديم أطباق الجدّات بتقنيات حديثة وحصص متوازنة.",
    followers: "٤٨٢ ألف", rating: 4.9, reviews: 1240, specialties: ["الكبسة", "الجريش", "القرصان", "الحنيذ"] },
  { id: "noura", name: "الشيفة نورة الحربي", title: "حلويات ومطبخ حجازي", city: "جدة", roots: "من الطائف، الحجاز", img: chef2,
    bio: "درست فنون الطهي في باريس وعادت لتبسيط الوصفات الحجازية للبيت السعودي، مع بدائل صحية ذكية.",
    followers: "٣١٠ ألف", rating: 4.8, reviews: 860, specialties: ["السليق", "المطبق", "اللقيمات", "أطباق صحية"] },
];

const nutSubs: Sub[] = [
  { name: "بذور اليقطين المحمصة", reason: "قرمشة مشابهة وخالية من المكسرات الشجرية", impact: "نكهة أخف · بروتين أعلى", kcal: -10, cost: -2 },
  { name: "حمص محمّص", reason: "يحافظ على القوام المقرمش", impact: "ألياف أعلى · سعر أقل", kcal: -25, cost: -4 },
];
const dairySubs = (x: string): Sub[] => [
  { name: x === "سمن" ? "زيت زيتون" : "حليب جوز الهند", reason: "خالٍ من اللاكتوز ويعطي قواماً كريمياً", impact: x === "سمن" ? "دهون صحية · نكهة أخف" : "نكهة استوائية خفيفة", kcal: -15, cost: 1 },
  { name: x === "سمن" ? "زيت أفوكادو" : "حليب الشوفان", reason: "بديل نباتي محايد الطعم", impact: "سعرات أقل", kcal: -30, cost: 2 },
];
const glutenSubs = (x: string): Sub[] => [
  { name: x === "جريش" ? "كينوا مجروشة" : x === "مكرونة" ? "مكرونة أرز" : "عجينة أرز", reason: "خالية من الجلوتين بقوام مقارب", impact: "وقت طهي أقصر", kcal: -20, cost: 6 },
];
const eggSubs: Sub[] = [
  { name: "بذر كتان + ماء", reason: "يربط المكونات كالبيض تماماً", impact: "أوميغا ٣ · بدون كوليسترول", kcal: -40, cost: 0 },
];
const sesameSubs: Sub[] = [{ name: "رقائق جوز الهند", reason: "زينة مقرمشة دون سمسم", impact: "حلاوة طبيعية", kcal: 10, cost: 1 }];

export const recipes: Recipe[] = [
  { id: "kabsa", title: "كبسة دجاج", en: "Chicken Kabsa", img: kabsa, chefId: "faisal", region: "نجد", time: 75, servings: 4, difficulty: "متوسط", likes: "١٢٫٤ ألف",
    cats: ["سعودي"], nutrition: { kcal: 620, protein: 38, carbs: 72, fat: 18 },
    ingredients: [
      { key: "دجاج", qty: 1, unit: "حبة" }, { key: "أرز", qty: 3, unit: "كوب" }, { key: "بصل", qty: 2, unit: "حبة" },
      { key: "طماطم", qty: 2, unit: "حبة" }, { key: "بهارات كبسة", qty: 2, unit: "م.ك" },
      { key: "لوز", qty: 0.5, unit: "كوب", allergen: "مكسرات", subs: nutSubs }, { key: "زبيب", qty: 0.25, unit: "كوب" },
    ],
    steps: [{ t: "حمّر البصل حتى يذبل ثم أضف الدجاج والبهارات.", min: 8 }, { t: "أضف الطماطم والماء واتركه على نار هادئة.", min: 40 }, { t: "أخرج الدجاج وأضف الأرز المنقوع إلى المرق.", min: 20 }, { t: "اشوِ الدجاج في الفرن وزيّن باللوز والزبيب.", min: 10 }] },
  { id: "jareesh", title: "جريش بالدجاج", en: "Jareesh", img: jareesh, chefId: "faisal", region: "نجد", time: 90, servings: 4, difficulty: "متوسط", likes: "٨ آلاف",
    cats: ["سعودي"], nutrition: { kcal: 480, protein: 26, carbs: 58, fat: 14 },
    ingredients: [
      { key: "جريش", qty: 2, unit: "كوب", allergen: "جلوتين", subs: glutenSubs("جريش") }, { key: "دجاج", qty: 500, unit: "غ" }, { key: "بصل", qty: 2, unit: "حبة" },
      { key: "لبن", qty: 1, unit: "كوب", allergen: "ألبان", subs: dairySubs("لبن") }, { key: "سمن", qty: 2, unit: "م.ك", allergen: "ألبان", subs: dairySubs("سمن") },
    ],
    steps: [{ t: "انقع الجريش ساعة على الأقل.", min: 60 }, { t: "اسلقه مع الدجاج حتى ينضج.", min: 45 }, { t: "أضف اللبن وحرّك حتى يتماسك.", min: 10 }, { t: "زيّن بالبصل المكرمل والسمن." }] },
  { id: "qursan", title: "قرصان باللحم", en: "Qursan", img: qursan, chefId: "faisal", region: "نجد", time: 80, servings: 5, difficulty: "متقدم", likes: "٥٫٢ ألف",
    cats: ["سعودي"], nutrition: { kcal: 540, protein: 30, carbs: 60, fat: 16 },
    ingredients: [
      { key: "دقيق", qty: 3, unit: "كوب", allergen: "جلوتين", subs: glutenSubs("دقيق") }, { key: "لحم", qty: 500, unit: "غ" },
      { key: "كوسا", qty: 2, unit: "حبة" }, { key: "جزر", qty: 2, unit: "حبة" }, { key: "طماطم", qty: 3, unit: "حبة" }, { key: "بصل", qty: 1, unit: "حبة" },
    ],
    steps: [{ t: "اعجن الدقيق بالماء وافرده رقيقاً واخبزه على الصاج.", min: 20 }, { t: "اطبخ اللحم مع البصل والطماطم.", min: 35 }, { t: "أضف الخضار حتى تنضج.", min: 15 }, { t: "قطّع الخبز وأضفه للمرق قبل التقديم مباشرة." }] },
  { id: "saleeg", title: "سليق طائفي", en: "Saleeg", img: saleeg, chefId: "noura", region: "الحجاز", time: 60, servings: 4, difficulty: "سهل", likes: "٩ آلاف",
    cats: ["سعودي"], nutrition: { kcal: 590, protein: 34, carbs: 64, fat: 20 },
    ingredients: [
      { key: "أرز", qty: 2, unit: "كوب" }, { key: "دجاج", qty: 1, unit: "حبة" },
      { key: "حليب", qty: 2, unit: "كوب", allergen: "ألبان", subs: dairySubs("حليب") }, { key: "سمن", qty: 2, unit: "م.ك", allergen: "ألبان", subs: dairySubs("سمن") }, { key: "لومي", qty: 2, unit: "حبة" },
    ],
    steps: [{ t: "اسلق الدجاج مع اللومي.", min: 30 }, { t: "اطبخ الأرز بالمرق حتى يلين.", min: 20 }, { t: "أضف الحليب تدريجياً مع التحريك.", min: 8 }, { t: "قدّمه مع الدجاج المحمّر والسمن." }] },
  { id: "mutabbaq", title: "مطبق لحم", en: "Mutabbaq", img: mutabbaq, chefId: "noura", region: "الحجاز", time: 30, servings: 3, difficulty: "متوسط", likes: "١٥ ألف",
    cats: ["سعودي", "سريع"], nutrition: { kcal: 540, protein: 28, carbs: 40, fat: 28 },
    ingredients: [
      { key: "عجينة", qty: 6, unit: "حبة", allergen: "جلوتين", subs: glutenSubs("عجينة") }, { key: "لحم مفروم", qty: 300, unit: "غ" },
      { key: "بيض", qty: 3, unit: "حبة", allergen: "بيض", subs: eggSubs }, { key: "كراث", qty: 1, unit: "ربطة" }, { key: "بصل", qty: 1, unit: "حبة" },
    ],
    steps: [{ t: "اطهُ اللحم مع البصل والبهارات.", min: 10 }, { t: "اخلط البيض والكراث مع اللحم." }, { t: "افرد العجينة وضع الحشوة واطوها." }, { t: "حمّرها على الصاج من الجهتين.", min: 6 }] },
  { id: "haneeth", title: "حنيذ لحم", en: "Haneeth", img: haneeth, chefId: "faisal", region: "الجنوب", time: 240, servings: 6, difficulty: "متقدم", likes: "٦٫٧ ألف",
    cats: ["سعودي"], nutrition: { kcal: 710, protein: 52, carbs: 55, fat: 30 },
    ingredients: [
      { key: "لحم", qty: 2, unit: "كغ" }, { key: "أرز", qty: 4, unit: "كوب" }, { key: "بهارات حنيذ", qty: 3, unit: "م.ك" },
      { key: "بصل", qty: 2, unit: "حبة" }, { key: "لوز", qty: 0.5, unit: "كوب", allergen: "مكسرات", subs: nutSubs },
    ],
    steps: [{ t: "تبّل اللحم بالبهارات وغلّفه بورق الألمنيوم.", min: 10 }, { t: "اطهه في فرن منخفض الحرارة ببطء.", min: 210 }, { t: "اطبخ الأرز بمرق اللحم.", min: 25 }, { t: "قدّم اللحم فوق الأرز مع اللوز." }] },
  { id: "luqaimat", title: "لقيمات بدبس التمر", en: "Luqaimat", img: luqaimat, chefId: "noura", region: "الشرقية", time: 35, servings: 6, difficulty: "سهل", likes: "٢١ ألف",
    cats: ["حلويات", "سريع", "نباتي"], nutrition: { kcal: 320, protein: 5, carbs: 52, fat: 11 },
    ingredients: [
      { key: "دقيق", qty: 2, unit: "كوب", allergen: "جلوتين", subs: glutenSubs("دقيق") }, { key: "خميرة", qty: 1, unit: "م.ك" },
      { key: "دبس تمر", qty: 0.5, unit: "كوب" }, { key: "سمسم", qty: 2, unit: "م.ك", allergen: "سمسم", subs: sesameSubs }, { key: "زيت", qty: 2, unit: "كوب" },
    ],
    steps: [{ t: "اخلط الدقيق والخميرة والماء حتى تتكون عجينة لينة.", min: 5 }, { t: "اتركها تتخمر.", min: 45 }, { t: "اقلِ كرات صغيرة حتى تتحمّر.", min: 10 }, { t: "زيّن بدبس التمر والسمسم." }] },
  { id: "pasta", title: "مكرونة بالبشاميل", en: "Baked Pasta", img: pasta, chefId: "noura", region: "الحجاز", time: 50, servings: 6, difficulty: "سهل", likes: "١٨ ألف",
    cats: ["مكرونة"], nutrition: { kcal: 610, protein: 27, carbs: 66, fat: 26 },
    ingredients: [
      { key: "مكرونة", qty: 500, unit: "غ", allergen: "جلوتين", subs: glutenSubs("مكرونة") }, { key: "لحم مفروم", qty: 400, unit: "غ" },
      { key: "حليب", qty: 3, unit: "كوب", allergen: "ألبان", subs: dairySubs("حليب") }, { key: "دقيق", qty: 3, unit: "م.ك", allergen: "جلوتين", subs: glutenSubs("دقيق") }, { key: "بصل", qty: 1, unit: "حبة" },
    ],
    steps: [{ t: "اسلق المكرونة نصف سلقة.", min: 8 }, { t: "حضّر اللحم مع البصل.", min: 10 }, { t: "حضّر البشاميل بالحليب والدقيق.", min: 7 }, { t: "رتّب الطبقات واخبزها.", min: 25 }] },
  { id: "freekeh", title: "سلطة فريكة بالخضار المشوية", en: "Freekeh Bowl", img: veggie, chefId: "noura", region: "الشمال", time: 25, servings: 2, difficulty: "سهل", likes: "٧٫١ ألف",
    cats: ["صحي", "سريع", "نباتي"], nutrition: { kcal: 410, protein: 15, carbs: 54, fat: 14 },
    ingredients: [
      { key: "فريكة", qty: 1, unit: "كوب", allergen: "جلوتين", subs: glutenSubs("دقيق").map((s) => ({ ...s, name: "كينوا" })) }, { key: "حمص", qty: 1, unit: "علبة" },
      { key: "كوسا", qty: 1, unit: "حبة" }, { key: "جزر", qty: 2, unit: "حبة" }, { key: "طحينة", qty: 3, unit: "م.ك", allergen: "سمسم", subs: [{ name: "زبادي يوناني", reason: "صلصة كريمية بدون سمسم", impact: "بروتين أعلى", kcal: -20, cost: 1 }] },
    ],
    steps: [{ t: "اسلق الفريكة.", min: 15 }, { t: "اشوِ الخضار والحمص في الفرن.", min: 15 }, { t: "اخلط الطحينة بالليمون والماء." }, { t: "رتّب الطبق وزيّن بالرمان." }] },
];

/** Demo SAR prices per ingredient across 4 demo stores. null = غير متوفر */
export const stores = [
  { id: "panda", name: "بنده", en: "Panda", delivery: 15 },
  { id: "tamimi", name: "التميمي", en: "Tamimi", delivery: 0 },
  { id: "danube", name: "الدانوب", en: "Danube", delivery: 10 },
  { id: "lulu", name: "لولو", en: "LuLu", delivery: 12 },
];
export const prices: Record<string, (number | null)[]> = {
  "دجاج": [18.5, 21, 19.75, 17.95], "أرز": [24, 26.5, 25, 22.5], "بصل": [3.5, 4.25, 3.95, 3.25], "طماطم": [4.5, 5.5, 4.95, 4.25],
  "بهارات كبسة": [6.5, 7, null, 5.75], "لوز": [19, 22, 20.5, null], "زبيب": [5.5, 6, 5.25, 5.95], "جريش": [9, 10.5, 9.75, 8.95],
  "لبن": [6, 6.5, 6.25, 5.95], "سمن": [22, 24.5, 23, 21.5], "دقيق": [7, 8, 7.5, 6.75], "لحم": [42, 48, 45, 39.95], "كوسا": [5, 6, 5.5, null],
  "جزر": [3, 3.75, 3.5, 2.95], "حليب": [6.5, 7, 6.75, 6.25], "لومي": [8, 9, null, 7.5], "عجينة": [8.5, 9.5, 9, null], "لحم مفروم": [28, 32, 30, 27.5],
  "بيض": [14, 15.5, 14.75, 13.5], "كراث": [3, 3.5, 3.25, null], "بهارات حنيذ": [9, null, 9.5, 8.5], "خميرة": [4, 4.5, 4.25, 3.95],
  "دبس تمر": [12, 13.5, 12.75, 11.5], "سمسم": [6, 6.5, null, 5.75], "زيت": [18, 19.5, 18.75, 17.5], "مكرونة": [5.5, 6.5, 6, 5.25],
  "فريكة": [11, 12.5, 11.75, null], "حمص": [4, 4.5, 4.25, 3.75], "طحينة": [14, 15, 14.5, 13.5],
};
export const priceOf = (key: string, store: number) => prices[key]?.[store] ?? null;
export const cheapest = (key: string) => {
  const ps = prices[key] ?? [];
  let best = -1;
  ps.forEach((p, i) => { if (p !== null && (best < 0 || p < (ps[best] as number))) best = i; });
  return best;
};

export type Loc = "pantry" | "fridge" | "freezer";
export const locations: { id: Loc; ar: string; en: string }[] = [
  { id: "pantry", ar: "المخزن", en: "Pantry" }, { id: "fridge", ar: "الثلاجة", en: "Fridge" }, { id: "freezer", ar: "الفريزر", en: "Freezer" },
];
export const ingredientLoc: Record<string, Loc> = {
  "دجاج": "freezer", "لحم": "freezer", "لحم مفروم": "freezer",
  "لبن": "fridge", "حليب": "fridge", "بيض": "fridge", "طماطم": "fridge", "كوسا": "fridge", "جزر": "fridge", "كراث": "fridge", "سمن": "fridge", "عجينة": "fridge", "طحينة": "fridge",
};
export const quickAdd = ["دجاج", "أرز", "بصل", "طماطم", "بيض", "حليب", "دقيق", "لحم مفروم", "جزر", "كوسا", "مكرونة", "حمص", "بهارات كبسة", "زيت", "خميرة", "دبس تمر"];

export type Dish = { name: string; story: string; origin: string; occasion: string; recipeId?: string };
export const regions: { name: string; en: string; img: string; tagline: string; dishes: Dish[] }[] = [
  { name: "نجد", en: "Najd", img: qursan, tagline: "قلب الجزيرة… حيث الحبوب والصبر على النار",
    dishes: [
      { name: "الكبسة", recipeId: "kabsa", origin: "وسط الجزيرة", occasion: "سفرة الجمعة والضيافة", story: "طبق الكرم السعودي الأول؛ تُطبخ فيه الأرز والبهارات في مرق اللحم ليجتمع حولها البيت كله." },
      { name: "الجريش", recipeId: "jareesh", origin: "القصيم ونجد", occasion: "رمضان والشتاء", story: "قمح مجروش يُطهى ببطء حتى يلين؛ كانت الأمهات يجرشن الحب بالرحى الحجرية في البيوت الطينية." },
      { name: "القرصان", recipeId: "qursan", origin: "نجد", occasion: "ليالي البرد", story: "خبز رقيق يُخبز على الصاج ثم يُغمر بمرق الخضار؛ طبق مزارعي النخيل بعد يوم طويل." },
    ] },
  { name: "الحجاز", en: "Hijaz", img: saleeg, tagline: "ملتقى الحجاج… مطبخ تشكّل من العالم",
    dishes: [
      { name: "السليق", recipeId: "saleeg", origin: "الطائف", occasion: "المناسبات العائلية", story: "أرز كريمي مطبوخ بالحليب والمرق، ارتبط بمصايف الطائف وبيوت أهلها القديمة." },
      { name: "المطبق", recipeId: "mutabbaq", origin: "مكة وجدة", occasion: "سفرة رمضان", story: "وصل مع تجّار الهند واليمن وتحوّل إلى أيقونة شوارع جدة التاريخية." },
    ] },
  { name: "الجنوب", en: "South", img: haneeth, tagline: "جبال السروات… نار هادئة وتنّور طيني",
    dishes: [
      { name: "الحنيذ", recipeId: "haneeth", origin: "عسير وجازان", occasion: "الأعياد والأعراس", story: "لحم يُطهى ببطء في حفرة أو تنّور مغلق بالحجارة الساخنة حتى يذوب، ويُقدَّم للضيوف تكريماً." },
      { name: "العريكة", origin: "عسير", occasion: "الإفطار الشتوي", story: "عجينة من البر تُعجن بالسمن والعسل، طعام الطاقة لأهل الجبال في الصباحات الباردة." },
    ] },
  { name: "الشرقية", en: "Eastern", img: luqaimat, tagline: "البحر والنخيل… نكهات الخليج والبهارات",
    dishes: [
      { name: "اللقيمات", recipeId: "luqaimat", origin: "الأحساء والقطيف", occasion: "رمضان والقهوة", story: "كرات عجين مقرمشة تُغمس بدبس التمر من نخيل الأحساء، أشهر حلويات الخليج." },
      { name: "المچبوس", origin: "الساحل الشرقي", occasion: "غداء البحّارة", story: "أرز بالسمك والبهارات، ارتبط بمواسم الغوص على اللؤلؤ وعودة السفن." },
    ] },
  { name: "الشمال", en: "North", img: jareesh, tagline: "حائل والجوف… كرم البادية وزيتون الشمال",
    dishes: [
      { name: "الكبيبة الحائلية", origin: "حائل", occasion: "المناسبات", story: "عجينة محشوة تُطهى في المرق، تعبير عن كرم حاتم الطائي الذي اشتهرت به حائل." },
      { name: "سلطة الفريكة", recipeId: "freekeh", origin: "الجوف", occasion: "طبق يومي", story: "قمح أخضر محمّص من مزارع الجوف؛ إعادة تقديم معاصرة لحبوب الشمال." },
    ] },
];

export const getRecipe = (id: string) => recipes.find((r) => r.id === id);
export const getChef = (id: string) => chefs.find((c) => c.id === id);
export const sar = (n: number) => `${n.toFixed(2)} ر.س`;
export const recipeAllergens = (r: Recipe) => [...new Set(r.ingredients.map((i) => i.allergen).filter(Boolean) as string[])];
export const baseCost = (r: Recipe) =>
  r.ingredients.reduce((a, i) => { const c = cheapest(i.key); return a + (c >= 0 ? (priceOf(i.key, c) as number) : 0); }, 0);
