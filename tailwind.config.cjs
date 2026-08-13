/** @type {import('tailwindcss').Config} */
module.exports = {
  // src + index.html만 스캔 (node_modules·dist·프로젝트 루트 전체 스캔 방지)
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        coral: {
          DEFAULT: "#FC5F53",
        },
        "pink-deep": "#FC5F53",
        "beige-cream": "#F5EDE6",
      },
      fontFamily: {
        sans: ['"Noto Sans KR"', "system-ui", "sans-serif"],
        rounded: ["Jua", "sans-serif"],
        han: ['"Black Han Sans"', "sans-serif"],
        gamhong: ["Mungyeong-Gamhong-Apple", "sans-serif"],
      },
    },
  },
  plugins: [],
};
