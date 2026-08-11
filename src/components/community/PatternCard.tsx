import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import { getPatternThumbnail } from "../../data/patternThumbnails.ts";
import { BookmarkFillIcon, HeartFillIcon } from "../icons/FillIcons.tsx";

function PatternGridPreview({
  pattern,
  rank,
}: {
  pattern: CommunityPattern;
  rank?: number;
}) {
  const { t } = useTranslation();
  const cells = getPatternThumbnail(pattern.id);
  const cols = cells[0]?.length ?? 12;
  const aspect = pattern.gridCols / pattern.gridRows;
  const minH =
    aspect > 1.2 ? "min-h-[140px]" : aspect < 0.85 ? "min-h-[220px]" : "min-h-[180px]";

  return (
    <div className={`bg-gray-100 p-3 ${minH}`}>
      <div className="mb-2 flex items-start justify-between gap-3">
        {rank != null && rank <= 10 ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-2xl font-bold text-white ${
              rank === 1
                ? "bg-coral"
                : rank === 2
                  ? "bg-gray-800"
                  : rank === 3
                    ? "bg-gray-600"
                    : "bg-gray-500"
            }`}
          >
            {t("community.rank", { rank })}
          </span>
        ) : (
          <span />
        )}
        <p className="shrink-0 font-sans text-[10px] font-normal text-gray-500">
          {t("community.stitchCount", {
            cols: pattern.gridCols,
            rows: pattern.gridRows,
          })}
        </p>
      </div>
      <div
        className="grid gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((hex, c) => (
            <div
              key={`${r}-${c}`}
              className="aspect-square rounded-sm"
              style={{ backgroundColor: hex }}
            />
          )),
        )}
      </div>
    </div>
  );
}

function FinishedThumb({ pattern }: { pattern: CommunityPattern }) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const src = finishedImageUrl(pattern.finishedImage);

  if (failed) {
    return (
      <div className="flex min-h-[200px] items-center justify-center bg-gray-100 p-4">
        <p className="text-center font-sans text-xs font-normal text-gray-500">
          {pattern.finishedImage}
        </p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={t("community.finishedAlt")}
      className="h-52 w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export type FeedViewMode = "pattern" | "finished";

type PatternCardProps = {
  pattern: CommunityPattern;
  viewMode: FeedViewMode;
  rank?: number;
  onImport?: (pattern: CommunityPattern) => void;
  onOpenFinished?: (pattern: CommunityPattern) => void;
  showImportOverlay?: boolean;
};

export default function PatternCard({
  pattern,
  viewMode,
  rank,
  onImport,
  onOpenFinished,
  showImportOverlay = true,
}: PatternCardProps) {
  const { t } = useTranslation();
  const { isLiked, isSaved, getLikeCount, getSaveCount, toggleLike, toggleSave } =
    useCommunityActions();

  const liked = isLiked(pattern.id);
  const saved = isSaved(pattern.id);
  const likeCount = getLikeCount(pattern.id);
  const saveCount = getSaveCount(pattern.id);

  const handleMediaClick = () => {
    if (viewMode === "finished" && onOpenFinished) {
      onOpenFinished(pattern);
      return;
    }
    if (viewMode === "pattern" && onImport) {
      onImport(pattern);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-gray-50 transition-colors hover:bg-gray-100">
      <div className="relative">
        {viewMode === "pattern" ? (
          <PatternGridPreview pattern={pattern} rank={rank} />
        ) : (
          <FinishedThumb pattern={pattern} />
        )}

        {viewMode === "pattern" && showImportOverlay && onImport && (
          <button
            type="button"
            onClick={handleMediaClick}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            aria-label={t("community.importToEditor")}
          >
            <span className="px-4 text-center font-sans text-2xl font-bold leading-tight text-white md:text-3xl">
              {t("community.importOverlayLine1")}
              <br />
              {t("community.importOverlayLine2")}
            </span>
          </button>
        )}

        {viewMode === "finished" && onOpenFinished && (
          <button
            type="button"
            onClick={handleMediaClick}
            className="absolute inset-0 z-10 cursor-pointer bg-transparent"
            aria-label={t("community.finishedDetailAria")}
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-sans text-lg font-bold text-gray-900">{pattern.title}</h3>
        <p className="mt-1 font-sans text-sm font-normal text-gray-500">
          @{pattern.author}
        </p>
        {viewMode === "finished" && (
          <p className="mt-2 line-clamp-2 font-sans text-xs font-normal text-gray-600">
            {pattern.finishedCaption}
          </p>
        )}

        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => toggleLike(pattern.id)}
            className={`flex items-center gap-1.5 font-sans text-sm font-normal transition-colors ${
              liked ? "text-coral" : "text-gray-500 hover:text-coral"
            }`}
            aria-pressed={liked}
          >
            <HeartFillIcon filled={liked} />
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSave(pattern.id)}
            className={`flex items-center gap-1.5 font-sans text-sm font-normal transition-colors ${
              saved ? "text-coral" : "text-gray-500 hover:text-coral"
            }`}
            aria-pressed={saved}
          >
            <BookmarkFillIcon filled={saved} />
            <span>{saveCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
