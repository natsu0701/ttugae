/** 도안 내보내기·앱 연동용 바늘 메타데이터 */

export type NeedleType = "knitting" | "crochet";

export type KnittingNeedleDetail = "straight" | "circular" | "dpn" | "cable";
export type CrochetNeedleDetail = "standard" | "tunisian" | "steel";
export type NeedleDetailId = KnittingNeedleDetail | CrochetNeedleDetail;

export type NeedleSpec = {
  needleType: NeedleType;
  needleSize: string;
  needleDetail?: NeedleDetailId;
};

export interface PatternMetadata {
  title: string;
  author: string;
  needleType: NeedleType;
  needleSize: string;
  needleDetail?: string;
  totalStitches: number;
  totalRows: number;
}

export const NEEDLE_TYPE_LABELS: Record<NeedleType, string> = {
  knitting: "대바늘",
  crochet: "코바늘",
};

export const KNITTING_DETAIL_OPTIONS: { id: KnittingNeedleDetail; label: string }[] = [
  { id: "straight", label: "곧은바늘 (평면)" },
  { id: "circular", label: "줄바늘 (원통·평면)" },
  { id: "dpn", label: "장갑바늘 · DPNs (원통)" },
  { id: "cable", label: "케이블바늘" },
];

export const CROCHET_DETAIL_OPTIONS: { id: CrochetNeedleDetail; label: string }[] = [
  { id: "standard", label: "일반 코바늘" },
  { id: "tunisian", label: "튜니지안 코바늘" },
  { id: "steel", label: "레이스 코바늘" },
];

export const KNITTING_SIZE_OPTIONS = [
  "2.0mm",
  "2.25mm",
  "2.5mm",
  "2.75mm",
  "3.0mm",
  "3.25mm",
  "3.5mm",
  "3.75mm",
  "4.0mm",
  "4.5mm",
  "5.0mm",
  "5.5mm",
  "6.0mm",
  "6.5mm",
  "7.0mm",
  "8.0mm",
  "9.0mm",
  "10.0mm",
] as const;

export const CROCHET_SIZE_OPTIONS = [
  "2호",
  "3호",
  "4호",
  "5호",
  "6호",
  "7호",
  "8호",
  "10호",
] as const;

export const CUSTOM_SIZE_VALUE = "__custom__";

export const DEFAULT_NEEDLE: NeedleSpec = {
  needleType: "knitting",
  needleSize: "4.5mm",
  needleDetail: "circular",
};

export function needleDetailOptions(type: NeedleType) {
  return type === "knitting" ? KNITTING_DETAIL_OPTIONS : CROCHET_DETAIL_OPTIONS;
}

export function needleSizeOptions(type: NeedleType): readonly string[] {
  return type === "knitting" ? KNITTING_SIZE_OPTIONS : CROCHET_SIZE_OPTIONS;
}

export function needleDetailLabel(spec: NeedleSpec): string | undefined {
  if (!spec.needleDetail) return undefined;
  const found = needleDetailOptions(spec.needleType).find((o) => o.id === spec.needleDetail);
  return found?.label;
}

export function formatNeedleBadge(spec: NeedleSpec): string {
  return `${NEEDLE_TYPE_LABELS[spec.needleType]} ${spec.needleSize}`;
}

export function normalizeNeedleSize(size: string): string {
  const raw = size.trim().toLowerCase().replace(/\s+/g, "");
  const ho = raw.match(/^(\d+)(?:\/0)?호?$/);
  if (ho) return `${ho[1]}호`;
  const mm = raw.match(/^(\d+(?:\.\d+)?)mm$/);
  if (mm) {
    const n = Number.parseFloat(mm[1]);
    return Number.isFinite(n) ? `${n}mm` : raw;
  }
  const plain = raw.match(/^(\d+(?:\.\d+)?)$/);
  if (plain) return `${plain[1]}mm`;
  return raw;
}

export function needlesMatch(pattern: NeedleSpec, owned: NeedleSpec): boolean {
  return (
    pattern.needleType === owned.needleType &&
    normalizeNeedleSize(pattern.needleSize) === normalizeNeedleSize(owned.needleSize)
  );
}

export function parseNeedleFromText(text: string): NeedleSpec | null {
  const t = text.trim();
  if (!t) return null;
  const isCrochet = /코바늘|crochet|호/.test(t);
  const isKnit = /대바늘|줄바늘|곧은바늘|장갑바늘|dpn|knitting/i.test(t);
  const ho = t.match(/(\d+)\s*(?:\/0)?\s*호/);
  if (ho && (isCrochet || !isKnit)) {
    return {
      needleType: "crochet",
      needleSize: `${ho[1]}호`,
      needleDetail: "standard",
    };
  }
  const mm = t.match(/(\d+(?:\.\d+)?)\s*mm/i);
  if (mm) {
    const size = `${Number.parseFloat(mm[1])}mm`;
    const type: NeedleType = isCrochet && !isKnit ? "crochet" : "knitting";
    const detail: NeedleDetailId | undefined = /줄바늘|circular/i.test(t)
      ? "circular"
      : /장갑|dpn/i.test(t)
        ? "dpn"
        : /곧은|straight/i.test(t)
          ? "straight"
          : type === "knitting"
            ? "circular"
            : "standard";
    return { needleType: type, needleSize: size, needleDetail: detail };
  }
  return null;
}

export function resolvePatternNeedle(pattern: {
  needle?: NeedleSpec;
  finishedDetail?: { needle?: string };
}): NeedleSpec | null {
  if (pattern.needle?.needleType && pattern.needle.needleSize) {
    return pattern.needle;
  }
  if (pattern.finishedDetail?.needle) {
    return parseNeedleFromText(pattern.finishedDetail.needle);
  }
  return null;
}

export function defaultNeedleForType(type: NeedleType): NeedleSpec {
  if (type === "crochet") {
    return { needleType: "crochet", needleSize: "4호", needleDetail: "standard" };
  }
  return { ...DEFAULT_NEEDLE };
}

export function buildPatternMetadata(input: {
  title: string;
  author: string;
  needle: NeedleSpec;
  totalStitches: number;
  totalRows: number;
}): PatternMetadata {
  return {
    title: input.title,
    author: input.author,
    needleType: input.needle.needleType,
    needleSize: input.needle.needleSize,
    needleDetail: needleDetailLabel(input.needle),
    totalStitches: input.totalStitches,
    totalRows: input.totalRows,
  };
}
