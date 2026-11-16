/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#171717",
        blush: {
          DEFAULT: "#f29c9b",
          deep: "#e98988",
          soft: "#fde8e7",
          wash: "#f1a1a0",
        },
      },
      fontFamily: {
        sans: ["Pretendard", "-apple-system", "BlinkMacSystemFont", '"Noto Sans KR"', "system-ui", "sans-serif"],
      },
      fontSize: {
        "large-title": ["34px", { lineHeight: "41px" }],
        title1: ["28px", { lineHeight: "34px" }],
        title2: ["22px", { lineHeight: "28px" }],
        title3: ["20px", { lineHeight: "25px" }],
        headline: ["17px", { lineHeight: "22px" }],
        body: ["17px", { lineHeight: "22px" }],
        callout: ["16px", { lineHeight: "21px" }],
        subhead: ["15px", { lineHeight: "20px" }],
        footnote: ["13px", { lineHeight: "18px" }],
        caption: ["12px", { lineHeight: "16px" }],
        caption2: ["11px", { lineHeight: "13px" }],
      },
      boxShadow: {
        card: "0 8px 24px rgba(23, 23, 23, 0.06)",
        nav: "0 -8px 24px rgba(23, 23, 23, 0.04)",
      },
    },
  },
  plugins: [],
};
