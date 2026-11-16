export const YARN_KIND_IDS = [
  "cotton",
  "wool",
  "merino",
  "mohair",
  "alpaca",
  "cashmere",
  "acrylic",
  "linen",
  "silk",
  "blend",
] as const;

export type YarnKindId = (typeof YARN_KIND_IDS)[number];

export function yarnKindFromNote(
  note: string,
  labels: Record<YarnKindId, string>,
): YarnKindId | "" {
  const trimmed = note.trim();
  if (!trimmed) return "";
  if ((YARN_KIND_IDS as readonly string[]).includes(trimmed)) {
    return trimmed as YarnKindId;
  }
  return YARN_KIND_IDS.find((id) => labels[id] === trimmed) ?? "";
}
