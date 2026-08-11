/** AI 예상 렌더링·팔레트용 실 메타데이터 */

export type YarnTexture = "soft" | "fluffy" | "smooth" | "coarse" | "elastic";

export type EditorYarn = {
  id: string;
  label: string;
  hex: string;
  brand: string;
  fiberType: string;
  texture: YarnTexture;
};

export type YarnCatalogEntry = {
  id: string;
  name: string;
  brand: string;
  fiberType: string;
  texture: YarnTexture;
  hex: string;
  keywords: string[];
};
