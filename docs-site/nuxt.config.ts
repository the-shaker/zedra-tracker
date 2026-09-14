export default defineNuxtConfig({
  extends: ['shadcn-docs-nuxt'],
  compatibilityDate: '2025-07-15',
  i18n: {
    defaultLocale: 'ru',
    locales: [
      { code: 'ru', name: 'Русский', language: 'ru-RU' }
    ]
  }
})
