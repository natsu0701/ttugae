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
        gamhong: ["Mungyeong-Gamhong-Apple", "sans-serif"],
        seoyun: ["LeeSeoyun", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.4" }],
        sm: ["clamp(0.8125rem, 0.15vw + 0.78rem, 0.875rem)", { lineHeight: "1.5" }],
        base: ["clamp(0.875rem, 0.2vw + 0.82rem, 1rem)", { lineHeight: "1.6" }],
        lg: ["clamp(1rem, 0.35vw + 0.9rem, 1.125rem)", { lineHeight: "1.5" }],
        xl: ["clamp(1.125rem, 0.5vw + 0.95rem, 1.25rem)", { lineHeight: "1.4" }],
        "2xl": ["clamp(1.25rem, 0.8vw + 1rem, 1.5rem)", { lineHeight: "1.35" }],
        "3xl": ["clamp(1.5rem, 1.1vw + 1.05rem, 1.875rem)", { lineHeight: "1.3" }],
        "4xl": ["clamp(1.75rem, 1.6vw + 1.1rem, 2.25rem)", { lineHeight: "1.2" }],
        "5xl": ["clamp(2rem, 2vw + 1.2rem, 3rem)", { lineHeight: "1.15" }],
        "6xl": ["clamp(2.25rem, 2.6vw + 1.2rem, 3.75rem)", { lineHeight: "1.1" }],
        "7xl": ["clamp(2.5rem, 3.2vw + 1.2rem, 4.5rem)", { lineHeight: "1.05" }],
      },
    },
  },
  plugins: [],
};
