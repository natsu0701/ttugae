import { memo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { BookmarkFillIcon, ChatFillIcon, HeartFillIcon } from "../icons/FillIcons.tsx";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import { getPatternPreviewModel } from "../../data/patternThumbnails.ts";
import { loadCommentsForPattern } from "../../utils/commentStorage.ts";
import { communityPostPath } from "./PatternCard.tsx";
import EquippedAuthorChip from "./EquippedAuthorChip.tsx";
import NeedleBadge from "./NeedleBadge.tsx";
import PatternChartGrid from "./PatternChartGrid.tsx";
import { getLoungeMeta } from "../../data/loungeFilters.ts";
import { localizedPattern } from "../../utils/i18nContent.ts";

type ShowcaseFeedCardProps = {
  pattern: CommunityPattern;
  onImport?: (pattern: CommunityPattern) => void;
  onOpenFinished?: (pattern: CommunityPattern) => void;
  onOpenAuthor?: (pattern: CommunityPattern) => void;
};

function skillBadgeKey(pattern: CommunityPattern): string {
  const level = getLoungeMeta(pattern).level;
  if (level === "beginner") return "community.skillBeginner";
  if (level === "intermediate") return "community.skillIntermediate";
  return "community.skillAdvanced";
}

function PatternOverlay({ pattern }: { pattern: CommunityPattern }) {
  const { cells, colorMap } = getPatternPreviewModel(pattern);
  const rows = cells.length;
  const cols = cells[0]?.length ?? 1;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-stone-50 p-3">
      <div
        className="max-h-full max-w-full"
        style={{
          aspectRatio: `${cols} / ${rows}`,
          width: cols >= rows ? "100%" : "auto",
          height: rows > cols ? "100%" : "auto",
        }}
      >
        <PatternChartGrid cells={cells} colorMap={colorMap} />
      </div>
    </div>
  );
}

function ShowcaseFeedCard({
  pattern,
  onImport,
  onOpenFinished,
  onOpenAuthor,
}: ShowcaseFeedCardProps) {
  const { t } = useTranslation();
  const view = localizedPattern(t, pattern);
  const [imageFailed, setImageFailed] = useState(false);
  const { isLiked, isSaved, getLikeCount, getSaveCount, toggleLike, toggleSave } =
    useCommunityActions();

  const liked = isLiked(pattern.id);
  const saved = isSaved(pattern.id);
  const likeCount = getLikeCount(pattern.id);
  const saveCount = getSaveCount(pattern.id);
  const commentCount = loadCommentsForPattern(pattern.id).length;
  const href = communityPostPath(pattern.id);
  const photoSrc = finishedImageUrl(pattern.finishedImage);
  const body = view.finishedDetail.review || view.finishedCaption;
  const badge = t(skillBadgeKey(pattern));

  const openDetail = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    if (onOpenFinished) {
      onOpenFinished(pattern);
      return;
    }
    window.history.pushState({ loungeNested: true }, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <article className="mb-8 rounded-xl bg-stone-50/60 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 text-left"
          onClick={() => onOpenAuthor?.(pattern)}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral/15 font-sans text-sm font-bold text-coral">
            {pattern.author.slice(0, 1)}
          </span>
          <p className="min-w-0 truncate font-sans text-sm font-semibold text-stone-800">
            {pattern.author}
          </p>
          <EquippedAuthorChip author={pattern.author} />
        </button>
        <span className="ml-auto rounded-full bg-white px-2.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-stone-500">
          {badge}
        </span>
      </div>

      <a
        href={href}
        onClick={openDetail}
        className="group relative block overflow-hidden rounded-2xl"
        aria-label={view.title}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          {imageFailed ? (
            <div className="flex h-full items-center justify-center font-sans text-sm text-stone-400">
              {t("community.photoFail")}
            </div>
          ) : (
            <img
              src={photoSrc}
              alt={t("community.finishedAltOf", { title: view.title })}
              className="h-full w-full object-cover group-hover:hidden"
              loading="lazy"
              decoding="async"
              onError={() => setImageFailed(true)}
            />
          )}

          <div className="absolute inset-0 hidden group-hover:block">
            <PatternOverlay pattern={pattern} />
          </div>
          <NeedleBadge
            spec={pattern.needle}
            needleText={pattern.finishedDetail.needle}
            className="pointer-events-none absolute bottom-3 right-3 z-[2] shadow-sm"
          />
        </div>
      </a>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-bold text-stone-900">
            {view.title}
          </h3>
          <p className="mt-2 font-sans text-sm font-light leading-relaxed text-stone-500">
            {body}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 pb-0.5">
          {onImport ? (
            <button
              type="button"
              onClick={() => onImport(pattern)}
              className="rounded-full bg-stone-900 px-3 py-1.5 font-sans text-[11px] font-bold text-white hover:bg-coral"
            >
              {t("community.importToEditor")}
            </button>
          ) : null}
          <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toggleLike(pattern.id)}
            className={`flex items-center gap-1 text-xs ${
              liked ? "font-semibold text-coral" : "text-stone-400 hover:text-stone-600"
            }`}
            aria-pressed={liked}
            aria-label={t("community.like")}
          >
            <HeartFillIcon className="h-4 w-4" filled={liked} />
            <span className="font-bold text-stone-800">{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSave(pattern.id)}
            className={`flex items-center gap-1 text-xs ${
              saved ? "font-semibold text-stone-800" : "text-stone-400 hover:text-stone-600"
            }`}
            aria-pressed={saved}
            aria-label={t("community.save")}
          >
            <BookmarkFillIcon className="h-4 w-4" filled={saved} />
            <span className="font-bold text-stone-800">{saveCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenFinished?.(pattern)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"
            aria-label={t("community.comment")}
          >
            <ChatFillIcon className="h-4 w-4" />
            <span className="font-bold text-stone-800">{commentCount}</span>
          </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(ShowcaseFeedCard);
