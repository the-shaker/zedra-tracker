import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  nitro: {
    preset: 'bun'
  },
  ssr: false,
  devtools: { enabled: true },
  modules: ['@nuxtjs/color-mode', 'shadcn-nuxt', '@vueuse/nuxt'],
  css: ['~/assets/css/tailwind.css', 'vue-sonner/style.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'tracker-theme'
  },
  shadcn: {
    prefix: '',
    componentDir: './app/components/ui'
  },
  app: {
    head: {
      title: 'Трекер проектов',
      htmlAttrs: { lang: 'ru' }
    }
  }
})
