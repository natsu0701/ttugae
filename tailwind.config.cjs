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
        // 3xs/2xs: 캔버스 기호 등 초밀집 UI. 본문에는 쓰지 않음.
        "3xs": ["0.625rem", { lineHeight: "1.3" }],
        "2xs": ["0.75rem", { lineHeight: "1.35" }],
        xs: ["clamp(0.8125rem, 0.12vw + 0.78rem, 0.875rem)", { lineHeight: "1.45" }],
        sm: ["clamp(0.875rem, 0.18vw + 0.84rem, 0.9375rem)", { lineHeight: "1.55" }],
        base: ["clamp(1rem, 0.22vw + 0.94rem, 1.0625rem)", { lineHeight: "1.65" }],
        lg: ["clamp(1.125rem, 0.35vw + 1.02rem, 1.25rem)", { lineHeight: "1.5" }],
        xl: ["clamp(1.25rem, 0.5vw + 1.1rem, 1.5rem)", { lineHeight: "1.4" }],
        "2xl": ["clamp(1.5rem, 0.8vw + 1.2rem, 1.875rem)", { lineHeight: "1.35" }],
        "3xl": ["clamp(1.75rem, 1.1vw + 1.3rem, 2.25rem)", { lineHeight: "1.3" }],
        "4xl": ["clamp(2rem, 1.6vw + 1.35rem, 2.75rem)", { lineHeight: "1.2" }],
        "5xl": ["clamp(2.25rem, 2vw + 1.4rem, 3.25rem)", { lineHeight: "1.15" }],
        "6xl": ["clamp(2.5rem, 2.6vw + 1.45rem, 4rem)", { lineHeight: "1.1" }],
        "7xl": ["clamp(2.75rem, 3.2vw + 1.5rem, 4.75rem)", { lineHeight: "1.05" }],
      },
    },
  },
  plugins: [],
};
