import enLocale from "./en.locale";
import arLocale from "./ar.locale";
// Import more locales as needed

const locales = {
  en: enLocale,
  ar: arLocale,
  // Add more locales as needed
};

export function getStr(key: string, lang: keyof typeof locales): string {
  const locale = locales[lang];
  return locale ? locale[key] || "" : "";
}
