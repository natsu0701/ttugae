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
        sans: ["Pretendard", '"Noto Sans KR"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(23, 23, 23, 0.06)",
        nav: "0 -8px 24px rgba(23, 23, 23, 0.04)",
      },
    },
  },
  plugins: [],
};
