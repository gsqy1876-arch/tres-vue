// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    baseURL: '/ssr/'
  },
  modules: [
    '@tresjs/nuxt',
    '@nuxt/devtools',
    '@nuxtjs/tailwindcss'
  ],
  compatibilityDate: '2025-01-01',
  vite: {
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // 单独打包 Three.js
            three: ['three'],
          }
        }
      }
    }
  }
})