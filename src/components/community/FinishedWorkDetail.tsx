import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import MiniPatternCanvas from "./MiniPatternCanvas.tsx";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import {
  getCommentsForPattern,
  type FinishedComment,
} from "../../data/finishedWorkComments.ts";
import { getRemixLineage } from "../../data/patternRemixLineage.ts";
import RemixFamilyTree from "./RemixFamilyTree.tsx";
import EquippedAuthorChip from "./EquippedAuthorChip.tsx";
import NeedleBadge from "./NeedleBadge.tsx";
import {
  displayAuthor,
  localizedComment,
  localizedPattern,
} from "../../utils/i18nContent.ts";

type FinishedWorkDetailProps = {
  pattern: CommunityPattern;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
};

function AiPredictedImage({ filename }: { filename: string }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const src = finishedImageUrl(filename);

  if (failed) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-2xl bg-gray-50 p-6">
        <p className="font-sans text-sm font-normal text-gray-500">
          public/images/{filename}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={t("community.aiPreview")}
      className="w-full rounded-2xl object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export default function FinishedWorkDetail({
  pattern,
  onBack,
  onEdit,
  onDelete,
}: FinishedWorkDetailProps) {
  const { t } = useTranslation();
  const [imageFailed, setImageFailed] = useState(false);
  const [comments, setComments] = useState<FinishedComment[]>(() =>
    getCommentsForPattern(pattern.id),
  );
  const [draft, setDraft] = useState("");

  const displayPattern = localizedPattern(t, pattern);
  const { finishedDetail: d } = displayPattern;
  const remixLineage = getRemixLineage(pattern.id, displayPattern.title, pattern.author);

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    setComments((prev) => [
      ...prev,
      {
        id: `fc-local-${Date.now()}`,
        patternId: pattern.id,
        author: "나",
        createdAt: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
        body: text,
      },
    ]);
    setDraft("");
  };

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-3xl px-5 py-4 md:px-8">
        <button
          type="button"
          onClick={onBack}
          className="font-sans text-sm font-normal text-gray-600 transition-colors hover:text-coral"
        >
          {t("community.backToCommunity")}
        </button>
      </div>

      <article className="mx-auto max-w-3xl px-5 md:px-8">
        {/* 상단: 제목 · 작성자 · 날짜 */}
        <header className="pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-sans text-3xl font-bold leading-snug text-gray-900 md:text-4xl">
                {displayPattern.title}
              </h1>
              <NeedleBadge
                spec={pattern.needle}
                needleText={d.needle}
                className="mt-3 bg-gray-100 px-3 py-1 text-xs text-gray-600"
              />
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button type="button" variant="secondary" className="px-4 py-2 text-sm" onClick={onEdit}>
                    {t("common.edit")}
                  </Button>
                )}
                {onDelete && (
                  <Button type="button" variant="ghost" className="px-4 py-2 text-sm" onClick={onDelete}>
                    {t("common.delete")}
                  </Button>
                )}
              </div>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-sans text-sm font-bold text-coral">
              {displayAuthor(t, pattern.author).slice(0, 1)}
            </span>
            <div>
              <p className="flex items-center gap-1.5 font-sans text-sm font-normal text-gray-800">
                @{displayAuthor(t, pattern.author)}
                <EquippedAuthorChip author={pattern.author} />
              </p>
              <p className="font-sans text-xs font-normal text-gray-500">
                {pattern.publishedAt}
              </p>
            </div>
          </div>
        </header>

        {/* 메인 이미지 */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-gray-50">
          {imageFailed ? (
            <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
              <p className="font-sans text-sm font-normal text-gray-500">
                public/images/{pattern.finishedImage}
              </p>
            </div>
          ) : (
            <img
              src={finishedImageUrl(pattern.finishedImage)}
              alt={t("community.finishedAlt")}
              className="w-full object-cover"
              onError={() => setImageFailed(true)}
            />
          )}
        </div>

        {/* 중단: 실 · 바늘 · 후기 */}
        <section className="prose-like mt-10 space-y-6">
          <p className="font-seoyun text-base font-normal leading-relaxed text-gray-600">
            {displayPattern.finishedCaption}
          </p>

          <div className="grid gap-4 rounded-2xl bg-gray-50 p-6 sm:grid-cols-3">
            <div>
              <p className="font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
                {t("community.yarnUsed")}
              </p>
              <p className="mt-1 font-sans text-sm font-normal text-gray-800">{d.yarn}</p>
            </div>
            <div>
              <p className="font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
                {t("community.needleSize")}
              </p>
              <p className="mt-1 font-sans text-sm font-normal text-gray-800">{d.needle}</p>
            </div>
            <div>
              <p className="font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
                {t("community.duration")}
              </p>
              <p className="mt-1 font-sans text-sm font-normal text-gray-800">
                {d.duration}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-6">
            <h2 className="font-sans text-lg font-bold text-gray-900">{t("community.reviewTitle")}</h2>
            <p className="mt-4 font-sans text-base font-normal leading-relaxed text-gray-700">
              {d.review}
            </p>
          </div>
        </section>

        {/* 하단: 첨부 도안 / AI 예상 */}
        <section className="mt-12">
          {pattern.hasAttachedPattern ? (
            <>
              <h2 className="font-sans text-xl font-bold text-gray-900">{t("community.attachedPattern")}</h2>
              <p className="mt-2 font-sans text-sm font-normal text-gray-500">
                {t("community.attachedHint", { cols: pattern.gridCols, rows: pattern.gridRows })}
              </p>
              <div className="mt-4">
                <MiniPatternCanvas
                  pattern={pattern}
                  label={`${pattern.gridCols}×${pattern.gridRows}`}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-sans text-xl font-bold text-gray-900">
                {t("community.aiAnalyzed")}
              </h2>
              <p className="mt-2 font-sans text-sm font-normal text-gray-500">
                {t("community.noPatternOnlyPhoto")}
              </p>
              <div className="mt-4">
                <AiPredictedImage
                  filename={pattern.aiPredictedImage ?? "completed_muffler_rainbow.jpg"}
                />
              </div>
            </>
          )}
        </section>

        <RemixFamilyTree nodes={remixLineage} />

        {/* 댓글 */}
        <section className="mt-14 pt-10">
          <h2 className="font-sans text-lg font-bold text-gray-900">
            {t("community.commentCount", { count: comments.length })}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {comments.map((c) => {
              const comment = localizedComment(t, c);
              return (
                <li key={c.id} className="rounded-2xl bg-gray-50 p-4">
                  <div className="flex gap-2 font-sans text-xs font-normal text-gray-500">
                    <span className="text-gray-700">@{comment.author}</span>
                    <span>{c.createdAt}</span>
                  </div>
                  <p className="mt-2 font-sans text-sm font-normal leading-relaxed text-gray-700">
                    {comment.body}
                  </p>
                </li>
              );
            })}
          </ul>

          <form onSubmit={handleComment} className="mt-6 rounded-2xl bg-gray-50 p-5">
            <label className="font-sans text-sm font-normal text-gray-700">
              {t("community.writeComment")}
            </label>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <SmoothInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("community.commentPlaceholder")}
                className="flex-1 border-stone-200"
              />
              <Button type="submit" className="shrink-0 px-4 py-2">
                {t("community.submitComment")}
              </Button>
            </div>
          </form>
        </section>
      </article>
    </div>
  );
}
