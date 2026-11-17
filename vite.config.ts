import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const YEAR_SECONDS = 60 * 60 * 24 * 365;

export default defineConfig({
  base: "/ttugae/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        name: "뜨개러투게더",
        short_name: "뜨개러",
        description: "뜨개질이 더 즐거워지는 순간",
        lang: "ko",
        start_url: "/ttugae/",
        scope: "/ttugae/",
        display: "standalone",
        background_color: "#FFFBF7",
        theme_color: "#fc5f53",
        icons: [
          {
            src: "vite.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        globPatterns: [
          "**/*.{js,css,html,ico,svg,png,jpg,jpeg,gif,webp,webm,mp4,glb,woff,woff2,ttf,otf,json,webmanifest}",
        ],
        globIgnores: ["**/manifest.webmanifest", "**/vite.svg"],
        // 오버레이 영상·완성작 사진이 2MB를 넘는다. 지하에서는 첫 방문에 전부 받아 둔다.
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024,
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/\/app(?:\/|$)/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ttugae-google-fonts-css",
              expiration: { maxEntries: 8, maxAgeSeconds: YEAR_SECONDS },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ttugae-google-fonts-files",
              expiration: { maxEntries: 24, maxAgeSeconds: YEAR_SECONDS },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.de\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "ttugae-osm-tiles",
              expiration: { maxEntries: 400, maxAgeSeconds: YEAR_SECONDS },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  appType: "spa",

  // PostCSS(Tailwind)는 postcss.config.cjs만 사용 — vite.config 중복 제거로 부팅·HMR 가속
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "framer-motion",
      "i18next",
      "react-i18next",
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three")) {
            return "three";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
        },
      },
    },
  },

  server: {
    warmup: {
      clientFiles: [
        "./index.html",
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/index.css",
      ],
    },
  },
});
