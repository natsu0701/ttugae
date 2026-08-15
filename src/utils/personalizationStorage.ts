import type { NeedleSpec } from "../data/knittingMetadataLibrary.ts";
import { parseNeedleFromText } from "../data/knittingMetadataLibrary.ts";

const GAUGE_KEY = "ttugae.settings.gauge.v1";
const YARN_KEY = "ttugae.settings.yarnInventory.v1";
const NEEDLE_KEY = "ttugae.settings.needleInventory.v1";
const TASTE_KEY = "ttugae.settings.taste.v1";
export const LOUNGE_POSTS_KEY = "lounge_posts";
export const INTERACTIONS_KEY = "ttugae.community.interactions.v1";

export type GaugeProfile = {
  beforeSts: string;
  beforeRows: string;
  afterSts: string;
  afterRows: string;
};

export type NeedleStock = NeedleSpec & { id: string };

export type YarnStock = {
  id: string;
  name: string;
  grams: string;
  meters: string;
  needle: string;
};

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type TasteStyle = "nordic" | "aran" | "colorwork" | "amigurumi" | "simple";

export type TasteProfile = {
  skill: SkillLevel;
  styles: TasteStyle[];
};

export type LoungePostRecord = {
  id: string;
  title: string;
  author: string;
  hasLiked: boolean;
  hasSaved: boolean;
  likes: number;
  saves: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function loadGaugeProfile(): GaugeProfile | null {
  const data = readJson<GaugeProfile | null>(GAUGE_KEY, null);
  if (!data) return null;
  return data;
}

export function saveGaugeProfile(profile: GaugeProfile): void {
  localStorage.setItem(GAUGE_KEY, JSON.stringify(profile));
}

export function loadYarnInventory(): YarnStock[] {
  const list = readJson<YarnStock[]>(YARN_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveYarnInventory(items: YarnStock[]): void {
  localStorage.setItem(YARN_KEY, JSON.stringify(items));
}

export function loadNeedleInventory(): NeedleStock[] {
  const list = readJson<NeedleStock[]>(NEEDLE_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveNeedleInventory(items: NeedleStock[]): void {
  localStorage.setItem(NEEDLE_KEY, JSON.stringify(items));
}

export function ownedNeedlesForFilter(): NeedleSpec[] {
  const fromWarehouse = loadNeedleInventory();
  const fromYarn = loadYarnInventory()
    .map((yarn) => parseNeedleFromText(yarn.needle))
    .filter((spec): spec is NeedleSpec => Boolean(spec));
  return [...fromWarehouse, ...fromYarn];
}

export function loadTasteProfile(): TasteProfile {
  const data = readJson<Partial<TasteProfile> | null>(TASTE_KEY, null);
  return {
    skill: data?.skill === "intermediate" || data?.skill === "advanced" ? data.skill : "beginner",
    styles: Array.isArray(data?.styles) ? data.styles : [],
  };
}

export function saveTasteProfile(profile: TasteProfile): void {
  localStorage.setItem(TASTE_KEY, JSON.stringify(profile));
}

export function saveLoungePosts(posts: LoungePostRecord[]): void {
  localStorage.setItem(LOUNGE_POSTS_KEY, JSON.stringify(posts));
}

export function loadLoungePosts(): LoungePostRecord[] {
  const list = readJson<LoungePostRecord[]>(LOUNGE_POSTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export const TASTE_STYLE_LABELS: Record<TasteStyle, string> = {
  nordic: "노르딕 배색",
  aran: "아란 자수",
  colorwork: "컬러워크",
  amigurumi: "아미구루미",
  simple: "심플 데일리",
};

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "입문",
  intermediate: "중급",
  advanced: "숙련",
};

const STYLE_KEYWORDS: Record<TasteStyle, string[]> = {
  nordic: ["노르딕", "자카드", "겨울", "모자", "nordic"],
  aran: ["가디건", "아란", "케이블", "aran"],
  colorwork: ["무지개", "배색", "스트라이프", "스카프"],
  amigurumi: ["키링", "인형", "체리", "곰", "amigurumi"],
  simple: ["코스터", "초보", "심플"],
};

export function patternTasteScore(
  title: string,
  caption: string,
  styles: TasteStyle[],
): number {
  if (styles.length === 0) return 0;
  const hay = `${title} ${caption}`.toLowerCase();
  return styles.reduce((score, style) => {
    const hit = STYLE_KEYWORDS[style].some((kw) => hay.includes(kw.toLowerCase()));
    return score + (hit ? 2 : 0);
  }, 0);
}
