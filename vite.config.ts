import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/ttugae/",
  plugins: [react()],
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
