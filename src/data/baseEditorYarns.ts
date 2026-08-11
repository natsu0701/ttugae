import type { EditorYarn } from "../types/editorYarn.ts";

const CORAL = "#FC5F53";

/** 에디터 기본 팔레트 실 */
export const BASE_EDITOR_YARNS: EditorYarn[] = [
  {
    id: "coral",
    label: "코랄",
    hex: CORAL,
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
  {
    id: "beige",
    label: "베이지",
    hex: "#E8DCC8",
    brand: "뜨개러투게더",
    fiberType: "울",
    texture: "soft",
  },
  {
    id: "gray",
    label: "그레이",
    hex: "#E5E7EB",
    brand: "뜨개러투게더",
    fiberType: "아크릴",
    texture: "elastic",
  },
  {
    id: "navy",
    label: "네이비",
    hex: "#1E3A5F",
    brand: "뜨개러투게더",
    fiberType: "메리노울",
    texture: "soft",
  },
  {
    id: "black",
    label: "다크그레이",
    hex: "#374151",
    brand: "뜨개러투게더",
    fiberType: "울",
    texture: "coarse",
  },
  {
    id: "white",
    label: "화이트",
    hex: "#FFFFFF",
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
];
