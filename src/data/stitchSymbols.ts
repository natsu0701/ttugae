/** 일본·한국 대바늘 도안과 Craft Yarn Council에서 쓰는 겉면 기준 기호 */
export const STITCHES = [
  { id: "empty", symbol: "·" },
  { id: "knit", symbol: "|" },
  { id: "purl", symbol: "—" },
  { id: "yo", symbol: "○" },
  { id: "k2tog", symbol: "/" },
  { id: "ssk", symbol: "\\" },
  { id: "bobble", symbol: "●" },
  { id: "slip", symbol: "V" },
  { id: "twist", symbol: "×" },
  { id: "caston", symbol: "+" },
] as const;

export type StitchId = (typeof STITCHES)[number]["id"];

const STITCH_SYMBOL: Record<string, string> = Object.fromEntries(
  STITCHES.map((s) => [s.id, s.symbol]),
);

export function stitchSymbol(stitchId: string) {
  return STITCH_SYMBOL[stitchId] ?? "·";
}
