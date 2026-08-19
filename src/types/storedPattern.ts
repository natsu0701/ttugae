import type { NeedleSpec, PatternMetadata } from "../data/knittingMetadataLibrary.ts";

export type StoredPattern = {
  id: string;
  title: string;
  updatedAt: number;
  gridSize: number;
  grid: { colorId: string; stitchId: string }[][];
  /** 앞면과 뒷면을 따로 그릴 때 뒷면 격자 */
  backGrid?: { colorId: string; stitchId: string }[][];
  facesIndependent?: boolean;
  colorMap?: Record<string, string>;
  needle?: NeedleSpec;
  metadata?: PatternMetadata;
};
