import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
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
      "html2canvas",
    ],
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
