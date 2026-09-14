import type { CommunityPattern } from "./communityPatterns.ts";
import { findLoungeAuthor, handleFromAuthor } from "./loungeAuthors.ts";
import type { NeedleType } from "./knittingMetadataLibrary.ts";
import { type SkillLevel } from "../utils/personalizationStorage.ts";

export type LoungeLevel = SkillLevel;
export type LoungeTool = NeedleType;
export type LoungeItemKind = "clothing" | "accessory" | "household";
export type LoungeMaterial = "merino" | "cotton" | "mohair" | "acrylic";

export type LoungeMeta = {
  level: LoungeLevel;
  tool: LoungeTool;
  itemKind: LoungeItemKind;
  material: LoungeMaterial;
};

export type LoungeFilters = {
  query: string;
  level: "all" | LoungeLevel;
  tool: "all" | LoungeTool;
};

export const DEFAULT_LOUNGE_FILTERS: LoungeFilters = {
  query: "",
  level: "all",
  tool: "all",
};

const SEEDED_META: Record<string, LoungeMeta> = {
  "cp-1": { level: "beginner", tool: "crochet", itemKind: "accessory", material: "cotton" },
  "cp-2": { level: "beginner", tool: "knitting", itemKind: "accessory", material: "merino" },
  "cp-3": { level: "intermediate", tool: "crochet", itemKind: "accessory", material: "merino" },
  "cp-4": { level: "beginner", tool: "knitting", itemKind: "accessory", material: "acrylic" },
  "cp-5": { level: "beginner", tool: "crochet", itemKind: "household", material: "cotton" },
  "cp-6": { level: "intermediate", tool: "knitting", itemKind: "clothing", material: "merino" },
  "cp-7": { level: "intermediate", tool: "knitting", itemKind: "accessory", material: "merino" },
  "cp-8": { level: "beginner", tool: "crochet", itemKind: "household", material: "cotton" },
  "cp-9": { level: "intermediate", tool: "knitting", itemKind: "accessory", material: "merino" },
  "cp-10": { level: "beginner", tool: "knitting", itemKind: "accessory", material: "acrylic" },
};

export function inferLoungeMaterial(text: string): LoungeMaterial {
  const hay = text.toLowerCase();
  if (/모헤어|mohair/.test(hay)) return "mohair";
  if (/코튼|면\s*실|cotton|오가닉/.test(hay)) return "cotton";
  if (/아크릴|acrylic/.test(hay)) return "acrylic";
  return "merino";
}

export function inferLoungeItemKind(text: string): LoungeItemKind {
  const hay = text.toLowerCase();
  if (/가디건|스웨터|조끼|베스트|cardigan|sweater|vest/.test(hay)) return "clothing";
  if (/코스터|담요|러그|매트|블랭킷|coaster|blanket/.test(hay)) return "household";
  return "accessory";
}

export function inferLoungeLevel(pattern: CommunityPattern): LoungeLevel {
  const hay = `${pattern.title} ${pattern.finishedCaption} ${pattern.finishedDetail.review}`.toLowerCase();
  if (/고급|아란|노르딕|자카드|꽈배기/.test(hay)) return "advanced";
  if (/초보|기본형|키링|코스터|비니|목도리|스카프/.test(hay)) return "beginner";
  const cells = pattern.gridCols * pattern.gridRows;
  if (cells <= 400) return "beginner";
  if (cells <= 900) return "intermediate";
  return "advanced";
}

export function getLoungeMeta(pattern: CommunityPattern): LoungeMeta {
  const seeded = SEEDED_META[pattern.id];
  if (seeded) return seeded;

  const text = `${pattern.title} ${pattern.finishedCaption} ${pattern.finishedDetail.yarn}`;
  return {
    level: inferLoungeLevel(pattern),
    tool: pattern.needle?.needleType ?? "knitting",
    itemKind: inferLoungeItemKind(text),
    material: inferLoungeMaterial(text),
  };
}

export function patternSearchText(pattern: CommunityPattern): string {
  const handle = handleFromAuthor(pattern.author);
  const author = findLoungeAuthor(handle);
  return [
    pattern.title,
    pattern.author,
    pattern.finishedCaption,
    pattern.finishedDetail.review,
    handle,
    author?.nickname,
    author?.handle,
    author?.bio,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function applyLoungeFilters(
  patterns: CommunityPattern[],
  filters: LoungeFilters,
): CommunityPattern[] {
  const q = filters.query.trim().toLowerCase();
  return patterns.filter((pattern) => {
    if (q && !patternSearchText(pattern).includes(q)) return false;
    const meta = getLoungeMeta(pattern);
    if (filters.level !== "all" && meta.level !== filters.level) return false;
    if (filters.tool !== "all" && meta.tool !== filters.tool) return false;
    return true;
  });
}
