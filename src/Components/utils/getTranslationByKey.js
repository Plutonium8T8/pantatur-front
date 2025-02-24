import { translations } from "./translations"

const language = localStorage.getItem('language') || 'RO';

export const getLanguageByKey = (key: string) => {
    return translations[key][language]
}
