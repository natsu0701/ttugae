import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import BackButton from "../ui/BackButton.tsx";
import ReportModal from "../ui/ReportModal.tsx";
import MiniPatternCanvas from "./MiniPatternCanvas.tsx";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import type { FinishedComment } from "../../data/finishedWorkComments.ts";
import EquippedAuthorChip from "./EquippedAuthorChip.tsx";
import NeedleBadge from "./NeedleBadge.tsx";
import {
  displayAuthor,
  localizedComment,
  localizedPattern,
} from "../../utils/i18nContent.ts";
import { BookmarkFillIcon, HeartFillIcon } from "../icons/FillIcons.tsx";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import {
  addComment,
  commentPageCount,
  deleteComment,
  loadCommentsForPattern,
  paginateComments,
  updateComment,
} from "../../utils/commentStorage.ts";
import { currentUserHandle, isOwnAuthor } from "../../utils/identity.ts";
import { handleFromAuthor } from "../../data/loungeAuthors.ts";
import { appPath } from "../../utils/appPath.ts";
import { loadAuthSession } from "../../utils/authStorage.ts";

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
      <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-gray-50 p-6">
        <p className="font-sans text-sm font-normal text-gray-500">{filename}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={t("community.aiPreview")}
      className="w-full rounded-xl object-cover"
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
    loadCommentsForPattern(pattern.id),
  );
  const [draft, setDraft] = useState("");
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [reportTarget, setReportTarget] = useState<{ type: "post" | "comment"; id: string } | null>(
    null,
  );
  const { isLiked, isSaved, getLikeCount, getSaveCount, toggleLike, toggleSave } =
    useCommunityActions();

  const displayPattern = localizedPattern(t, pattern);
  const { finishedDetail: d } = displayPattern;
  const liked = isLiked(pattern.id);
  const saved = isSaved(pattern.id);
  const likeCount = getLikeCount(pattern.id);
  const saveCount = getSaveCount(pattern.id);
  const pages = commentPageCount(comments.length);
  const visibleComments = useMemo(() => paginateComments(comments, page), [comments, page]);
  const myHandle = currentUserHandle();
  const loggedIn = loadAuthSession();

  const refreshComments = () => setComments(loadCommentsForPattern(pattern.id));

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !loggedIn) return;
    addComment(pattern.id, text);
    setDraft("");
    refreshComments();
    setPage(commentPageCount(loadCommentsForPattern(pattern.id).length));
  };

  const openAuthor = () => {
    window.history.pushState(
      {},
      "",
      appPath(`/community/author/${encodeURIComponent(handleFromAuthor(pattern.author))}`),
    );
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="pb-20">
      <div className="page-shell py-4">
        <BackButton onClick={onBack} />
      </div>

      <article className="page-shell">
        <header className="pb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-display font-sans text-gray-900">{displayPattern.title}</h1>
              <NeedleBadge
                spec={pattern.needle}
                needleText={d.needle}
                className="mt-3 bg-gray-100 px-3 py-1 text-xs text-gray-600"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {(onEdit || onDelete) && (
                <>
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
                </>
              )}
              <button
                type="button"
                onClick={() => setReportTarget({ type: "post", id: pattern.id })}
                className="rounded-lg px-3 py-2 text-sm text-stone-500 hover:text-coral"
              >
                {t("report.action")}
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={openAuthor} className="flex items-center gap-3 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-sans text-sm font-bold text-coral">
                {displayAuthor(t, pattern.author).slice(0, 1)}
              </span>
              <div>
                <p className="flex items-center gap-1.5 font-sans text-sm font-normal text-gray-800">
                  @{displayAuthor(t, pattern.author)}
                  <EquippedAuthorChip author={pattern.author} />
                </p>
                <p className="font-sans text-xs font-normal text-gray-500">{pattern.publishedAt}</p>
              </div>
            </button>
            <div className="ml-auto flex items-center gap-4">
              <button
                type="button"
                onClick={() => toggleLike(pattern.id)}
                className={`flex items-center gap-1.5 text-sm ${liked ? "font-semibold text-coral" : "text-stone-500"}`}
              >
                <HeartFillIcon className="h-4 w-4" filled={liked} />
                <span>{likeCount}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleSave(pattern.id)}
                className={`flex items-center gap-1.5 text-sm ${saved ? "font-semibold text-stone-800" : "text-stone-500"}`}
              >
                <BookmarkFillIcon className="h-4 w-4" filled={saved} />
                <span>{saveCount}</span>
              </button>
            </div>
          </div>
        </header>

        <div className="mt-8 overflow-hidden rounded-xl bg-gray-50">
          {imageFailed ? (
            <div className="flex min-h-[320px] items-center justify-center p-8 text-center">
              <p className="font-sans text-sm font-normal text-gray-500">{pattern.finishedImage}</p>
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

        <section className="mt-10 space-y-6">
          <p className="font-seoyun text-base font-normal leading-relaxed text-gray-600">
            {displayPattern.finishedCaption}
          </p>
          <div className="grid gap-4 rounded-xl bg-gray-50 p-6 sm:grid-cols-3">
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-gray-500">{t("community.yarnUsed")}</p>
              <p className="mt-1 font-sans text-sm text-gray-800">{d.yarn}</p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-gray-500">{t("community.needleSize")}</p>
              <p className="mt-1 font-sans text-sm text-gray-800">{d.needle}</p>
            </div>
            <div>
              <p className="font-sans text-xs uppercase tracking-wide text-gray-500">{t("community.duration")}</p>
              <p className="mt-1 font-sans text-sm text-gray-800">{d.duration}</p>
            </div>
          </div>
          <div className="rounded-xl bg-gray-50 p-6">
            <h2 className="font-sans text-lg font-bold text-gray-900">{t("community.reviewTitle")}</h2>
            <p className="mt-4 font-sans text-base leading-relaxed text-gray-700">{d.review}</p>
          </div>
        </section>

        <section className="mt-12">
          {pattern.hasAttachedPattern ? (
            <>
              <h2 className="font-sans text-xl font-bold text-gray-900">{t("community.attachedPattern")}</h2>
              <p className="mt-2 font-sans text-sm text-gray-500">
                {t("community.attachedHint", { cols: pattern.gridCols, rows: pattern.gridRows })}
              </p>
              <div className="mt-4">
                <MiniPatternCanvas
                  pattern={pattern}
                  label={`${pattern.gridCols}x${pattern.gridRows}`}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="font-sans text-xl font-bold text-gray-900">{t("community.aiAnalyzed")}</h2>
              <p className="mt-2 font-sans text-sm text-gray-500">{t("community.noPatternOnlyPhoto")}</p>
              <div className="mt-4">
                <AiPredictedImage filename={pattern.aiPredictedImage ?? "completed_muffler_rainbow.jpg"} />
              </div>
            </>
          )}
        </section>

        <section className="mt-14 pt-10">
          <h2 className="font-sans text-lg font-bold text-gray-900">
            {t("community.commentCount", { count: comments.length })}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {visibleComments.map((c) => {
              const comment = localizedComment(t, c);
              const mine = isOwnAuthor(c.author) || c.author === myHandle;
              return (
                <li key={c.id} className="rounded-xl bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-2 font-sans text-xs text-gray-500">
                    <span className="text-gray-700">@{comment.author}</span>
                    <span>{c.createdAt}</span>
                    <button
                      type="button"
                      className="ml-auto hover:text-coral"
                      onClick={() => setReportTarget({ type: "comment", id: c.id })}
                    >
                      {t("report.action")}
                    </button>
                  </div>
                  {editingId === c.id ? (
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <SmoothInput
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        className="flex-1 border-stone-200"
                      />
                      <Button
                        type="button"
                        className="px-3 py-2 text-sm"
                        onClick={() => {
                          updateComment(c.id, editDraft);
                          setEditingId(null);
                          refreshComments();
                        }}
                      >
                        {t("common.save")}
                      </Button>
                    </div>
                  ) : (
                    <p className="mt-2 font-sans text-sm leading-relaxed text-gray-700">{comment.body}</p>
                  )}
                  {mine ? (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        className="text-xs text-stone-500 hover:text-coral"
                        onClick={() => {
                          setEditingId(c.id);
                          setEditDraft(c.body);
                        }}
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        type="button"
                        className="text-xs text-stone-500 hover:text-coral"
                        onClick={() => {
                          deleteComment(c.id);
                          refreshComments();
                        }}
                      >
                        {t("common.delete")}
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {pages > 1 ? (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((n) => Math.max(1, n - 1))}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40"
              >
                {t("community.prevPage")}
              </button>
              <span className="text-xs text-stone-500">
                {page} / {pages}
              </span>
              <button
                type="button"
                disabled={page >= pages}
                onClick={() => setPage((n) => Math.min(pages, n + 1))}
                className="rounded-lg px-3 py-1 text-sm disabled:opacity-40"
              >
                {t("community.nextPage")}
              </button>
            </div>
          ) : null}

          <form onSubmit={handleComment} className="mt-6 rounded-xl bg-gray-50 p-5">
            <label className="font-sans text-sm text-gray-700">{t("community.writeComment")}</label>
            <p className="mt-1 font-sans text-xs text-stone-500">
              {loggedIn ? t("community.commentAs", { handle: myHandle }) : t("community.commentNeedLogin")}
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <SmoothInput
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t("community.commentPlaceholder")}
                className="flex-1 border-stone-200"
                disabled={!loggedIn}
              />
              <Button type="submit" className="shrink-0 px-4 py-2" disabled={!loggedIn}>
                {t("community.submitComment")}
              </Button>
            </div>
          </form>
        </section>
      </article>
      <ReportModal
        open={Boolean(reportTarget)}
        targetType={reportTarget?.type ?? "post"}
        targetId={reportTarget?.id ?? pattern.id}
        onClose={() => setReportTarget(null)}
      />
    </div>
  );
}
