import type { TFunction } from "i18next";
import type { CommunityPattern } from "../data/communityPatterns.ts";
import type { QaAnswer, QaPost } from "../data/qaPosts.ts";
import type { FinishedComment } from "../data/finishedWorkComments.ts";

export function loc(t: TFunction, key: string, fallback: string) {
  const value = t(key, { defaultValue: fallback });
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function displayAuthor(t: TFunction, author: string) {
  return author === "나" ? t("common.me") : author;
}

export function localizedPattern(t: TFunction, pattern: CommunityPattern): CommunityPattern {
  const base = `content.patterns.${pattern.id}`;
  return {
    ...pattern,
    title: loc(t, `${base}.title`, pattern.title),
    finishedCaption: loc(t, `${base}.caption`, pattern.finishedCaption),
    finishedDetail: {
      ...pattern.finishedDetail,
      yarn: loc(t, `${base}.yarn`, pattern.finishedDetail.yarn),
      needle: loc(t, `${base}.needle`, pattern.finishedDetail.needle),
      duration: loc(t, `${base}.duration`, pattern.finishedDetail.duration),
      review: loc(t, `${base}.review`, pattern.finishedDetail.review),
    },
  };
}

export function localizedQaPost(t: TFunction, post: QaPost): QaPost {
  const base = `content.qa.${post.id}`;
  return {
    ...post,
    title: loc(t, `${base}.title`, post.title),
    excerpt: loc(t, `${base}.excerpt`, post.excerpt),
    body: loc(t, `${base}.body`, post.body),
  };
}

export function localizedQaAnswer(t: TFunction, answer: QaAnswer): QaAnswer {
  return {
    ...answer,
    author: displayAuthor(t, answer.author),
    body: loc(t, `content.answers.${answer.id}`, answer.body),
  };
}

export function localizedComment(t: TFunction, comment: FinishedComment): FinishedComment {
  return {
    ...comment,
    author: displayAuthor(t, comment.author),
    body: loc(t, `content.comments.${comment.id}`, comment.body),
  };
}

const NEEDLE_DETAIL_KEYS: Record<string, string> = {
  straight: "editor.detailStraight",
  circular: "editor.detailCircular",
  dpn: "editor.detailDpn",
  cable: "editor.detailCable",
  standard: "editor.detailStandard",
  tunisian: "editor.detailTunisian",
  steel: "editor.detailSteel",
};

export function formatNeedleSizeI18n(t: TFunction, size: string) {
  const ho = size.match(/^(\d+)호$/);
  if (ho) return t("editor.crochetSize", { n: ho[1] });
  return size;
}

export function formatNeedleTypeI18n(t: TFunction, type: "knitting" | "crochet") {
  return type === "knitting" ? t("editor.knitting") : t("editor.crochet");
}

export function formatNeedleDetailI18n(t: TFunction, detail?: string) {
  if (!detail) return undefined;
  const key = NEEDLE_DETAIL_KEYS[detail];
  return key ? t(key) : detail;
}

export function formatNeedleBadgeI18n(
  t: TFunction,
  spec: { needleType: "knitting" | "crochet"; needleSize: string; needleDetail?: string },
) {
  const detail = formatNeedleDetailI18n(t, spec.needleDetail);
  const base = `${formatNeedleTypeI18n(t, spec.needleType)} ${formatNeedleSizeI18n(t, spec.needleSize)}`;
  return detail ? `${base} · ${detail}` : base;
}

export function badgeName(t: TFunction, id: string, fallback: string) {
  return loc(t, `content.badges.${id}.name`, fallback);
}

export function badgeDesc(t: TFunction, id: string, fallback: string) {
  return loc(t, `content.badges.${id}.desc`, fallback);
}

const CHART_PART_KEYS: Record<string, string> = {
  body: "editor.partBody",
  bodyBack: "editor.partBack",
  sleeveLeft: "editor.partSleeveLeft",
  sleeveRight: "editor.partSleeveRight",
  collar: "editor.partCollar",
};

export function chartPartLabel(t: TFunction, part: string, fallback: string) {
  const key = CHART_PART_KEYS[part];
  return key ? loc(t, key, fallback) : fallback;
}
