import type { CommunityPattern } from "./communityPatterns.ts";
import {
  needlesMatch,
  resolvePatternNeedle,
  type NeedleType,
} from "./knittingMetadataLibrary.ts";
import {
  loadTasteProfile,
  loadYarnInventory,
  ownedNeedlesForFilter,
  type SkillLevel,
  type YarnStock,
} from "../utils/personalizationStorage.ts";

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
  itemKind: "all" | LoungeItemKind;
  material: "all" | LoungeMaterial;
  myHardwareOnly: boolean;
};

export const DEFAULT_LOUNGE_FILTERS: LoungeFilters = {
  query: "",
  level: "all",
  tool: "all",
  itemKind: "all",
  material: "all",
  myHardwareOnly: false,
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

export function materialsFromYarnBag(yarns: YarnStock[] = loadYarnInventory()): Set<LoungeMaterial> {
  const found = new Set<LoungeMaterial>();
  for (const yarn of yarns) {
    found.add(inferLoungeMaterial(`${yarn.name} ${yarn.needle}`));
  }
  return found;
}

export function filtersFromKnittingBag(): LoungeFilters {
  const taste = loadTasteProfile();
  const owned = ownedNeedlesForFilter();
  const materials = [...materialsFromYarnBag()];
  const types = [...new Set(owned.map((item) => item.needleType))];

  return {
    query: "",
    level: taste.skill,
    tool: types.length === 1 ? types[0] : "all",
    itemKind: "all",
    material: materials.length === 1 ? materials[0] : "all",
    myHardwareOnly: true,
  };
}

export function applyLoungeFilters(
  patterns: CommunityPattern[],
  filters: LoungeFilters,
): CommunityPattern[] {
  let result = patterns.filter((pattern) => {
    const q = filters.query.trim().toLowerCase();
    if (q) {
      const hay =
        `${pattern.title} ${pattern.author} ${pattern.finishedCaption}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    const meta = getLoungeMeta(pattern);
    if (filters.level !== "all" && meta.level !== filters.level) return false;
    if (filters.tool !== "all" && meta.tool !== filters.tool) return false;
    return true;
  });

  if (!filters.myHardwareOnly) return result;

  const owned = ownedNeedlesForFilter();
  const bagMaterials = materialsFromYarnBag();

  if (owned.length > 0) {
    result = result.filter((pattern) => {
      const spec = resolvePatternNeedle(pattern);
      if (!spec) return false;
      return owned.some((item) => needlesMatch(spec, item));
    });
  }

  if (bagMaterials.size > 0) {
    result = result.filter((pattern) => bagMaterials.has(getLoungeMeta(pattern).material));
  }

  return result;
}
