import enLocale from './en.locale';
import arLocale from './ar.locale';

function getLocaleString(key: string, lang: 'en' | 'ar'): string {
    const locale = lang === 'en' ? enLocale : arLocale;
    return locale[key] || '';
}

export default getLocaleString;
