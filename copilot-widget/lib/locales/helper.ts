import enLocale from "./en.locale";
import arLocale from "./ar.locale";

const locales = {
  en: enLocale,
  ar: arLocale,
};
export type LangType = keyof typeof locales;

export function getStr(key: string, lang: LangType): string {
  const locale = locales[lang];
  return locale ? locale[key] || "" : "";
}
