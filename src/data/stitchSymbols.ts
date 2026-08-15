export const STITCHES = [
  { id: "empty", symbol: "·" },
  { id: "knit", symbol: "—" },
  { id: "purl", symbol: "∪" },
  { id: "yo", symbol: "○" },
  { id: "k2tog", symbol: "∧" },
  { id: "ssk", symbol: "∨" },
  { id: "bobble", symbol: "●" },
  { id: "slip", symbol: "/" },
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
