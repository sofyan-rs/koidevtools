// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/ui"],

  colorMode: {
    preference: "dark",
  },

  devtools: { enabled: true },

  compatibilityDate: "2024-08-14",

  // Static site generation — pre-renders every page at build time.
  // No server / worker needed; Cloudflare Pages serves plain HTML + JS.
  nitro: {
    preset: "cloudflare-pages",
    prerender: {
      // Explicitly list all routes so nuxt generate never misses one.
      routes: ["/", "/markdown", "/json", "/dart", "/regex", "/api", "/jwt"],
    },
  },
});
