/** Current UI language, readable outside React (toasts, helpers). Kept in sync by the store. */
export type Lang = "ar" | "en";
let current: Lang = "ar";
export const getLang = () => current;
export const setLangValue = (l: Lang) => { current = l; };
