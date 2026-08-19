export type KnitItemType =
  | "sweater"
  | "vest"
  | "beanie"
  | "glove"
  | "socks";

const ITEM_TYPE_RULES: { type: KnitItemType; keywords: string[] }[] = [
  { type: "glove", keywords: ["장갑", "글러브", "glove", "mitten", "미튼", "手袋"] },
  { type: "socks", keywords: ["양말", "삭스", "sock", "靴下"] },
  { type: "beanie", keywords: ["비니", "털모자", "모자", "beanie", "hat", "帽子", "ニット帽"] },
  { type: "vest", keywords: ["조끼", "베스트", "vest", "ベスト"] },
  { type: "sweater", keywords: ["스웨터", "가디건", "sweater", "cardigan", "풀오버", "セーター", "カーディガン"] },
];

/** 도안 제목·설명에서 3D 미리보기 종류를 고릅니다. */
export function inferKnitItemType(...texts: Array<string | undefined>): KnitItemType {
  const hay = texts.filter(Boolean).join(" ").toLowerCase();
  for (const rule of ITEM_TYPE_RULES) {
    if (rule.keywords.some((kw) => hay.includes(kw))) return rule.type;
  }
  return "sweater";
}
