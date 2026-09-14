import { memo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { BookmarkFillIcon, HeartFillIcon } from "../icons/FillIcons.tsx";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import { getPatternPreviewModel } from "../../data/patternThumbnails.ts";
import PatternChartGrid from "./PatternChartGrid.tsx";
import { displayAuthor, localizedPattern } from "../../utils/i18nContent.ts";
import { appPath } from "../../utils/appPath.ts";

export function communityPostPath(patternId: string) {
  return appPath(`/community/post/${patternId}`);
}

function PatternGridPreview({ pattern }: { pattern: CommunityPattern }) {
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

function FinishedHoverLayer({ pattern }: { pattern: CommunityPattern }) {
  const { t } = useTranslation();
  const view = localizedPattern(t, pattern);
  const [failed, setFailed] = useState(false);
  const src = finishedImageUrl(pattern.finishedImage);

  if (failed) {
    return <PatternGridPreview pattern={pattern} />;
  }

  return (
    <img
      src={src}
      alt={t("community.finishedAltOf", { title: view.title })}
      className="absolute inset-0 h-full w-full object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

type PatternCardProps = {
  pattern: CommunityPattern;
  rank?: number;
  onImport?: (pattern: CommunityPattern) => void;
  onOpenFinished?: (pattern: CommunityPattern) => void;
  onOpenAuthor?: (pattern: CommunityPattern) => void;
  showImportOverlay?: boolean;
};

function PatternCard({
  pattern,
  rank,
  onImport,
  onOpenFinished,
  onOpenAuthor,
  showImportOverlay = true,
}: PatternCardProps) {
  const { t } = useTranslation();
  const view = localizedPattern(t, pattern);
  const { isLiked, isSaved, getLikeCount, getSaveCount, toggleLike, toggleSave } =
    useCommunityActions();

  const [hoverPhoto, setHoverPhoto] = useState(false);
  const liked = isLiked(pattern.id);
  const saved = isSaved(pattern.id);
  const likeCount = getLikeCount(pattern.id);
  const saveCount = getSaveCount(pattern.id);
  const href = communityPostPath(pattern.id);
  const sizeLabel = t("community.stitchCount", {
    cols: pattern.gridCols,
    rows: pattern.gridRows,
  });

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
    <article
      className="group overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-200 hover:shadow-md"
      onPointerEnter={() => setHoverPhoto(true)}
      onPointerLeave={() => setHoverPhoto(false)}
    >
      <a
        href={href}
        onClick={openDetail}
        className="block"
        aria-label={view.title}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-stone-50">
          {hoverPhoto ? (
            <PatternGridPreview pattern={pattern} />
          ) : (
            <FinishedHoverLayer pattern={pattern} />
          )}

          {rank != null && rank <= 10 ? (
            <span
              className={`pointer-events-none absolute left-3.5 top-3.5 z-[2] rounded-lg px-2.5 py-1 font-sans text-base font-bold text-white ${
                rank === 1
                  ? "bg-coral"
                  : rank === 2
                    ? "bg-gray-800"
                    : rank === 3
                      ? "bg-gray-600"
                      : "bg-stone-950/80"
              }`}
            >
              {t("community.rank", { rank })}
            </span>
          ) : (
            <span className="pointer-events-none absolute left-3.5 top-3.5 z-[2] rounded-lg bg-stone-950/80 px-2.5 py-1 font-sans text-sm font-bold tracking-wider text-white backdrop-blur-sm">
              {sizeLabel}
            </span>
          )}
        </div>

        <div className="bg-white p-4">
          <h3 className="line-clamp-1 font-sans text-base font-bold text-stone-900 transition-colors group-hover:text-coral">
            {view.title}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 font-sans text-sm font-medium text-stone-500">
            <button
              type="button"
              className="hover:text-coral"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenAuthor?.(pattern);
              }}
            >
              @{displayAuthor(t, pattern.author)}
            </button>
            <span className="text-stone-300" aria-hidden>
              |
            </span>
            <time dateTime={pattern.publishedAt}>{pattern.publishedAt}</time>
          </p>
          <dl className="mt-3 grid grid-cols-2 gap-2 font-sans text-sm text-stone-500">
            <div>
              <dt className="text-stone-400">{t("community.yarnUsed")}</dt>
              <dd className="mt-0.5 truncate font-medium text-stone-700">{view.finishedDetail.yarn}</dd>
            </div>
            <div>
              <dt className="text-stone-400">{t("community.needleSize")}</dt>
              <dd className="mt-0.5 truncate font-medium text-stone-700">{view.finishedDetail.needle}</dd>
            </div>
          </dl>
        </div>
      </a>

      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        {showImportOverlay && onImport ? (
          <button
            type="button"
            onClick={() => onImport(pattern)}
            className="rounded-full bg-stone-900 px-3 py-1.5 font-sans text-sm font-bold text-white hover:bg-coral"
          >
            {t("community.importToEditor")}
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => toggleLike(pattern.id)}
          className={`flex items-center gap-1.5 text-sm ${
            liked ? "font-semibold text-coral" : "text-stone-400 hover:text-stone-600"
          }`}
          aria-pressed={liked}
          aria-label={t("community.like")}
        >
          <HeartFillIcon className="h-3.5 w-3.5" filled={liked} />
          <span className="font-bold text-stone-800">{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSave(pattern.id)}
          className={`flex items-center gap-1.5 text-sm ${
            saved ? "font-semibold text-stone-800" : "text-stone-400 hover:text-stone-600"
          }`}
          aria-pressed={saved}
          aria-label={t("community.save")}
        >
          <BookmarkFillIcon className="h-3.5 w-3.5" filled={saved} />
          <span className="font-bold text-stone-800">{saveCount}</span>
        </button>
        </div>
      </div>
    </article>
  );
}

export default memo(PatternCard);
