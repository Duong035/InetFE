// https://nuxt.com/docs/api/configuration/nuxt-config
import AutoImport from 'unplugin-auto-import/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  devServer: {
    port: 3000
  },
  modules: [
    '@nuxtjs/tailwindcss',
    'nuxtjs-naive-ui',
    "dayjs-nuxt",
    '@nuxtjs/i18n',
    [
      "@pinia/nuxt",
      {
        autoImports: [
          // automatically imports `usePinia()`
          "defineStore",
          // automatically imports `usePinia()` as `usePiniaStore()`
          ["defineStore", "definePiniaStore"],
        ],
      },
    ],
    '@pinia/nuxt',
  ],
  build: {
    transpile: ['naive-ui', 'vueuc'],
  },
  css: ["@/assets/index.css"],
  vite: {
    plugins: [
      AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar'
            ]
          }
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      }),
      svgLoader()
    ],
  },
  dayjs: {
    defaultLocale: ['en', {
      weekStart: 1
    }]
  },
  runtimeConfig: {
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL || "",
    },
  },
  sourcemap: {
    server: true,
    client: false,
  },
  i18n: {
    compilation: {
      strictMessage: false,
    },
    locales: [
      {
        code: "vi",
        name: "Tiếng Việt",
        file: "vi.json",
      },
      {
        code: "en",
        name: "English",
        file: "en.json",
      },
    ],
    strategy: "no_prefix",
    defaultLocale: 'vi',
    lazy: true,
    langDir: "../i18n",
    detectBrowserLanguage: false
  },
})