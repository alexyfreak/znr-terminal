import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import uz from '../locales/uz.json'
import ru from '../locales/ru.json'
import en from '../locales/en.json'

export const getSystemLanguage = (): 'uz' | 'ru' | 'en' => {
  const lang = navigator.language?.split('-')[0] || 'uz'
  if (lang === 'uz' || lang === 'ru' || lang === 'en') return lang
  return 'uz'
}

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: localStorage.getItem('zunoora-language') || getSystemLanguage(),
  fallbackLng: 'uz',
  interpolation: { escapeValue: false },
  debug: import.meta.env.DEV,
})

export default i18n
