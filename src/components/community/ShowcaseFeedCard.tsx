import { memo, useState, type MouseEvent } from "react";
import { Bookmark, Heart, MessageCircle } from "lucide-react";
import {
  finishedImageUrl,
  type CommunityPattern,
} from "../../data/communityPatterns.ts";
import { useCommunityActions } from "../../context/CommunityActionsContext.tsx";
import { getPatternThumbnail } from "../../data/patternThumbnails.ts";
import { getCommentsForPattern } from "../../data/finishedWorkComments.ts";
import { communityPostPath } from "./PatternCard.tsx";
import EquippedAuthorChip from "./EquippedAuthorChip.tsx";

type ShowcaseFeedCardProps = {
  pattern: CommunityPattern;
  onImport?: (pattern: CommunityPattern) => void;
  onOpenFinished?: (pattern: CommunityPattern) => void;
};

function skillBadge(pattern: CommunityPattern): string {
  const cells = pattern.gridCols * pattern.gridRows;
  if (cells <= 225) return "초급";
  if (cells <= 900) return "중급";
  return "고급";
}

function PatternOverlay({ pattern }: { pattern: CommunityPattern }) {
  const cells = getPatternThumbnail(pattern.id);
  const cols = cells[0]?.length ?? 12;

  return (
    <div className="absolute inset-0 bg-stone-50 p-3">
      <div
        className="grid h-full w-full gap-px"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((hex, c) => (
            <div
              key={`${r}-${c}`}
              className="min-h-0 rounded-sm"
              style={{ backgroundColor: hex }}
            />
          )),
        )}
      </div>
    </div>
  );
}

function ShowcaseFeedCard({
  pattern,
  onImport,
  onOpenFinished,
}: ShowcaseFeedCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const { isLiked, isSaved, getLikeCount, getSaveCount, toggleLike, toggleSave } =
    useCommunityActions();

  const liked = isLiked(pattern.id);
  const saved = isSaved(pattern.id);
  const likeCount = getLikeCount(pattern.id);
  const saveCount = getSaveCount(pattern.id);
  const commentCount = getCommentsForPattern(pattern.id).length;
  const href = communityPostPath(pattern.id);
  const photoSrc = finishedImageUrl(pattern.finishedImage);
  const body = pattern.finishedDetail.review || pattern.finishedCaption;
  const badge = skillBadge(pattern);

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
    <article className="mb-8 rounded-3xl bg-stone-50/60 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral/15 font-sans text-sm font-bold text-coral">
          {pattern.author.slice(0, 1)}
        </span>
        <p className="min-w-0 truncate font-sans text-sm font-semibold text-stone-800">
          {pattern.author}
        </p>
        <EquippedAuthorChip author={pattern.author} />
        <span className="rounded-full bg-white px-2.5 py-0.5 font-sans text-[10px] font-bold tracking-wide text-stone-500">
          {badge}
        </span>
      </div>

      <a
        href={href}
        onClick={openDetail}
        className="group relative block overflow-hidden rounded-2xl"
        aria-label={pattern.title}
      >
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-100">
          {imageFailed ? (
            <div className="flex h-full items-center justify-center font-sans text-sm text-stone-400">
              완성작 사진을 불러오지 못했어요
            </div>
          ) : (
            <img
              src={photoSrc}
              alt={`${pattern.title} 완성작`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={() => setImageFailed(true)}
            />
          )}

          <div className="absolute inset-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100">
            <PatternOverlay pattern={pattern} />
            {onImport ? (
              <div className="absolute inset-0 z-[1] flex items-center justify-center bg-black/35">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onImport(pattern);
                  }}
                  className="rounded-2xl bg-white px-5 py-3 font-sans text-xs font-bold text-stone-950 shadow-md transition-colors hover:bg-stone-100"
                >
                  내 에디터로 불러오기
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </a>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-sans text-base font-bold text-stone-900">{pattern.title}</h3>
          <p className="mt-2 font-sans text-sm font-light leading-relaxed text-stone-500">
            {body}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pb-0.5">
          <button
            type="button"
            onClick={() => toggleLike(pattern.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              liked ? "font-semibold text-coral" : "text-stone-400 hover:text-stone-600"
            }`}
            aria-pressed={liked}
            aria-label="좋아요"
          >
            <Heart size={16} fill={liked ? "#FC5F53" : "none"} />
            <span>{likeCount}</span>
          </button>
          <button
            type="button"
            onClick={() => toggleSave(pattern.id)}
            className={`flex items-center gap-1 text-xs transition-colors ${
              saved ? "font-semibold text-stone-800" : "text-stone-400 hover:text-stone-600"
            }`}
            aria-pressed={saved}
            aria-label="저장"
          >
            <Bookmark size={16} fill={saved ? "#292524" : "none"} />
            <span>{saveCount}</span>
          </button>
          <button
            type="button"
            onClick={() => onOpenFinished?.(pattern)}
            className="flex items-center gap-1 text-xs text-stone-400 transition-colors hover:text-stone-600"
            aria-label="댓글"
          >
            <MessageCircle size={16} />
            <span>{commentCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(ShowcaseFeedCard);
