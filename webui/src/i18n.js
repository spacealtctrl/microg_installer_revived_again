
import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import ptbr from './locales/ptbr.json'
import vi from './locales/vi.json'
import zh from './locales/zh.json'
import hr from './locales/hr.json'

const messages = {
  en,
  ptbr,
  vi,
  zh,
  hr
}

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
})
