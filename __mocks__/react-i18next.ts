import React from 'react'

const useTranslation = () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      'search.placeholder': 'Zunooradan so\'rang...',
      'search.newShablon': 'Yangi shablon',
      'search.noResults': 'Natija topilmadi',
      'sidebar.history': 'Tarix',
      'sidebar.settings': 'Sozlamalar',
      'sidebar.account': 'Hisob',
      'sidebar.newChat': 'Yangi suhbat',
      'settings.title': 'Sozlamalar',
      'settings.theme': 'Mavzu',
      'settings.language': 'Til',
      'settings.dark': 'Qorong\'i',
      'settings.light': 'Yorug\'',
      'account.title': 'Hisob',
      'account.login': 'Kirish',
      'account.password': 'Parol',
      'account.logout': 'Chiqish',
      'account.role': 'Lavozim',
      'account.school': 'Maktab',
      'account.profile': 'Profil',
    }
    return translations[key] || key
  },
  i18n: {
    changeLanguage: () => {},
    language: 'uz',
  },
  ready: true,
})

export { useTranslation }
export default { useTranslation }
