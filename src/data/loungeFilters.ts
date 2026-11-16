import type { CommunityPattern } from "./communityPatterns.ts";
import { findLoungeAuthor, handleFromAuthor } from "./loungeAuthors.ts";
import type { NeedleType } from "./knittingMetadataLibrary.ts";
import { type SkillLevel } from "../utils/personalizationStorage.ts";

export type LoungeLevel = SkillLevel;
export type LoungeTool = NeedleType;
export type LoungeItemKind = "clothing" | "accessory" | "household";
export type LoungeItemType =
  | "gloves"
  | "hat"
  | "scarf"
  | "sweater"
  | "coaster"
  | "accessory";
export type LoungeMaterial = "merino" | "cotton" | "mohair" | "acrylic";

export type LoungeMeta = {
  level: LoungeLevel;
  tool: LoungeTool;
  itemKind: LoungeItemKind;
  itemType: LoungeItemType;
  material: LoungeMaterial;
};

export type LoungeSort = "recommended" | "popular" | "newest";

export type LoungeFilters = {
  query: string;
  level: "all" | LoungeLevel;
  tool: "all" | LoungeTool;
  itemType: "all" | LoungeItemType;
  sort: LoungeSort;
};

export const DEFAULT_LOUNGE_FILTERS: LoungeFilters = {
  query: "",
  level: "all",
  tool: "all",
  itemType: "all",
  sort: "recommended",
};

const SEEDED_META: Record<string, LoungeMeta> = {
  "cp-1": { level: "beginner", tool: "crochet", itemKind: "accessory", itemType: "accessory", material: "cotton" },
  "cp-2": { level: "beginner", tool: "knitting", itemKind: "accessory", itemType: "scarf", material: "merino" },
  "cp-3": { level: "intermediate", tool: "crochet", itemKind: "accessory", itemType: "accessory", material: "merino" },
  "cp-4": { level: "beginner", tool: "knitting", itemKind: "accessory", itemType: "hat", material: "acrylic" },
  "cp-5": { level: "beginner", tool: "crochet", itemKind: "household", itemType: "coaster", material: "cotton" },
  "cp-6": { level: "intermediate", tool: "knitting", itemKind: "clothing", itemType: "sweater", material: "merino" },
  "cp-7": { level: "intermediate", tool: "knitting", itemKind: "accessory", itemType: "gloves", material: "merino" },
  "cp-8": { level: "beginner", tool: "crochet", itemKind: "household", itemType: "coaster", material: "cotton" },
  "cp-9": { level: "intermediate", tool: "knitting", itemKind: "accessory", itemType: "accessory", material: "merino" },
  "cp-10": { level: "beginner", tool: "knitting", itemKind: "accessory", itemType: "hat", material: "acrylic" },
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

function matchLoungeItemType(text: string): LoungeItemType | null {
  const hay = text.toLowerCase();
  if (/장갑(?!바늘)|글러브|\bgloves?\b|\bmittens?\b|미튼/.test(hay)) return "gloves";
  if (/코스터|\bcoasters?\b/.test(hay)) return "coaster";
  if (/모자|비니|\bbeanies?\b|\bhats?\b|캡|베레/.test(hay)) return "hat";
  if (/목도리|머플러|스카프|\bscar(?:f|ves)\b|\bmufflers?\b|\bshawls?\b|숄/.test(hay)) return "scarf";
  if (/스웨터|가디건|\bsweaters?\b|\bcardigans?\b|\bpullovers?\b|조끼|베스트/.test(hay)) return "sweater";
  return null;
}

export function inferLoungeItemType(title: string, extra = ""): LoungeItemType {
  return matchLoungeItemType(title) ?? matchLoungeItemType(extra) ?? "accessory";
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
    itemType: inferLoungeItemType(pattern.title, text),
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
    if (filters.itemType !== "all" && meta.itemType !== filters.itemType) return false;
    return true;
  });
}

export function sortLoungePatterns(
  patterns: CommunityPattern[],
  sort: LoungeSort,
): CommunityPattern[] {
  if (sort === "popular") {
    return [...patterns].sort(
      (a, b) => b.likes - a.likes || b.publishedAt.localeCompare(a.publishedAt),
    );
  }
  if (sort === "newest") {
    return [...patterns].sort(
      (a, b) => b.publishedAt.localeCompare(a.publishedAt) || b.likes - a.likes,
    );
  }
  return patterns;
}
