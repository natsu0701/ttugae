import { memo, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { BookmarkFillIcon, HeartFillIcon } from "../icons/FillIcons.tsx";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import { getPatternPreviewModel } from "../../data/patternThumbnails.ts";
import EquippedAuthorChip from "./EquippedAuthorChip.tsx";
import NeedleBadge from "./NeedleBadge.tsx";
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

  if (failed) return null;

  return (
    <img
      src={src}
      alt={t("community.finishedAltOf", { title: view.title })}
      className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100"
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
  showImportOverlay?: boolean;
};

function PatternCard({
  pattern,
  rank,
  onImport,
  onOpenFinished,
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
    window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <article
      className="group overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:shadow-md"
      onPointerEnter={() => setHoverPhoto(true)}
    >
      <a
        href={href}
        onClick={openDetail}
        className="block"
        aria-label={view.title}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-stone-50">
          <PatternGridPreview pattern={pattern} />
          {hoverPhoto ? <FinishedHoverLayer pattern={pattern} /> : null}

          {showImportOverlay && onImport ? (
            <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onImport(pattern);
                }}
                className="translate-y-2 rounded-2xl bg-white px-5 py-3 font-sans text-xs font-bold text-stone-950 shadow-md transition-transform duration-300 group-hover:translate-y-0 hover:bg-stone-100"
                aria-label={t("community.importToEditor")}
              >
                {t("community.importToEditor")}
              </button>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          )}

          {rank != null && rank <= 10 ? (
            <span
              className={`pointer-events-none absolute left-3.5 top-3.5 z-[2] rounded-lg px-2.5 py-1 font-sans text-sm font-bold text-white ${
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
            <span className="pointer-events-none absolute left-3.5 top-3.5 z-[2] rounded-lg bg-stone-950/80 px-2.5 py-1 font-sans text-[10px] font-bold tracking-wider text-white backdrop-blur-sm">
              {sizeLabel}
            </span>
          )}
          <NeedleBadge
            spec={pattern.needle}
            needleText={view.finishedDetail.needle}
            className="pointer-events-none absolute bottom-3.5 right-3.5 z-[2] shadow-sm"
          />
        </div>

        <div className="bg-white p-4">
          <h3 className="line-clamp-1 font-sans text-sm font-bold text-stone-900 transition-colors group-hover:text-coral">
            {view.title}
          </h3>
          <p className="mt-2 flex items-center gap-1.5 font-sans text-xs font-medium text-stone-500">
            @{displayAuthor(t, pattern.author)}
            <EquippedAuthorChip author={pattern.author} />
          </p>
        </div>
      </a>

      <div className="flex items-center justify-end gap-3 px-4 pb-4">
        <button
          type="button"
          onClick={() => toggleLike(pattern.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            liked ? "font-semibold text-coral" : "text-stone-400 hover:text-stone-600"
          }`}
          aria-pressed={liked}
        >
          <HeartFillIcon className="h-3.5 w-3.5" filled={liked} />
          <span>{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => toggleSave(pattern.id)}
          className={`flex items-center gap-1.5 text-xs transition-colors ${
            saved ? "font-semibold text-stone-800" : "text-stone-400 hover:text-stone-600"
          }`}
          aria-pressed={saved}
        >
          <BookmarkFillIcon className="h-3.5 w-3.5" filled={saved} />
          <span>{saveCount}</span>
        </button>
      </div>
    </article>
  );
}

export default memo(PatternCard);
