import { enLocale } from "./en.locale";
import { arLocale } from "./ar.locale";
import { nlLocale } from "./nl.locale.ts";
import { frLocale } from "./fr.locale.ts";
import { deLocale } from "./de.locale.ts";

const locales = {
  en: enLocale,
  ar: arLocale,
  nl: nlLocale,
  fr: frLocale,
  de: deLocale,
};
export type LangType = keyof typeof locales;

export function getStr(key: string, lang: LangType): string {
  const locale = locales[lang];
  return locale ? locale[key] || "" : "";
}
