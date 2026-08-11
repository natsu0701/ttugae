import type { YarnCatalogEntry } from "../types/editorYarn.ts";

export const YARN_CATALOG: YarnCatalogEntry[] = [
  {
    id: "merino-cream",
    name: "메리노 울 크림",
    brand: "파인울",
    fiberType: "메리노울",
    texture: "soft",
    hex: "#F5F0E6",
    keywords: ["메리노", "울", "크림", "파인울"],
  },
  {
    id: "merino-navy",
    name: "메리노 울 네이비",
    brand: "파인울",
    fiberType: "메리노울",
    texture: "soft",
    hex: "#1E3A5F",
    keywords: ["메리노", "네이비", "울"],
  },
  {
    id: "mohair-pink",
    name: "모헤어 핑크",
    brand: "몽드",
    fiberType: "모헤어",
    texture: "fluffy",
    hex: "#FFB3C6",
    keywords: ["모헤어", "핑크", "몽드"],
  },
  {
    id: "mohair-lavender",
    name: "모헤어 라벤더",
    brand: "몽드",
    fiberType: "모헤어",
    texture: "fluffy",
    hex: "#D4C4F0",
    keywords: ["모헤어", "라벤더", "보라"],
  },
  {
    id: "cotton-white",
    name: "코튼 화이트",
    brand: "코지코튼",
    fiberType: "면",
    texture: "smooth",
    hex: "#FFFFFF",
    keywords: ["코튼", "면", "화이트"],
  },
  {
    id: "cotton-coral",
    name: "코튼 코랄",
    brand: "코지코튼",
    fiberType: "면",
    texture: "smooth",
    hex: "#FC5F53",
    keywords: ["코튼", "코랄", "빨강"],
  },
  {
    id: "alpaca-beige",
    name: "알파카 베이지",
    brand: "알파하우스",
    fiberType: "알파카",
    texture: "soft",
    hex: "#E8DCC8",
    keywords: ["알파카", "베이지"],
  },
  {
    id: "cashmere-gray",
    name: "캐시미어 그레이",
    brand: "럭셔리얀",
    fiberType: "캐시미어",
    texture: "soft",
    hex: "#9CA3AF",
    keywords: ["캐시미어", "그레이", "회색"],
  },
  {
    id: "acrylic-sky",
    name: "아크릴 스카이블루",
    brand: "데일리얀",
    fiberType: "아크릴",
    texture: "elastic",
    hex: "#BAE1FF",
    keywords: ["아크릴", "블루", "하늘"],
  },
  {
    id: "wool-charcoal",
    name: "울 차콜",
    brand: "울스토리",
    fiberType: "울",
    texture: "coarse",
    hex: "#374151",
    keywords: ["울", "차콜", "다크"],
  },
  {
    id: "linen-natural",
    name: "리넨 내추럴",
    brand: "리넨룸",
    fiberType: "리넨",
    texture: "coarse",
    hex: "#E5D4B8",
    keywords: ["리넨", "내추럴", "여름"],
  },
  {
    id: "bamboo-mint",
    name: "대나무 민트",
    brand: "에코실",
    fiberType: "대나무섬유",
    texture: "smooth",
    hex: "#BAFFC9",
    keywords: ["대나무", "민트", "에코"],
  },
  {
    id: "angora-white",
    name: "앙고라 화이트",
    brand: "플러피",
    fiberType: "앙고라",
    texture: "fluffy",
    hex: "#FAFAFA",
    keywords: ["앙고라", "화이트", "뽀송"],
  },
  {
    id: "silk-gold",
    name: "실크 골드",
    brand: "실크웨이",
    fiberType: "실크",
    texture: "smooth",
    hex: "#E8C547",
    keywords: ["실크", "골드", "고급"],
  },
  {
    id: "blend-rainbow",
    name: "블렌드 무지개",
    brand: "컬러팝",
    fiberType: "울·아크릴 혼방",
    texture: "elastic",
    hex: "#FF9ECD",
    keywords: ["혼방", "무지개", "컬러"],
  },
];

export function searchYarnCatalog(query: string): YarnCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return YARN_CATALOG.slice(0, 8);
  return YARN_CATALOG.filter(
    (entry) =>
      entry.name.toLowerCase().includes(q) ||
      entry.brand.toLowerCase().includes(q) ||
      entry.fiberType.toLowerCase().includes(q) ||
      entry.keywords.some((k) => k.toLowerCase().includes(q)),
  ).slice(0, 10);
}
