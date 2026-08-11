import type { StoredPattern } from "../Dashboard.tsx";
import { communityPatternToGrid } from "../Community.tsx";
import type { CommunityPattern } from "../data/communityPatterns.ts";
import { saveShareDraft } from "./shareDraft.ts";

export function resolveStoredPatternFromCommunity(
  pattern: CommunityPattern,
  patterns: StoredPattern[],
): StoredPattern {
  const storedId = pattern.id.replace(/^user-/, "");
  return (
    patterns.find((p) => p.id === storedId) ?? {
      id: storedId,
      title: pattern.title,
      updatedAt: Date.now(),
      gridSize: Math.max(pattern.gridRows, pattern.gridCols),
      grid: communityPatternToGrid(pattern),
    }
  );
}

function finishedPhotoDataUrl(image: string): string | undefined {
  if (image.startsWith("blob:") || image.startsWith("data:")) {
    return image;
  }
  return undefined;
}

export function openCommunityPostForEdit(
  pattern: CommunityPattern,
  patterns: StoredPattern[],
): void {
  const stored = resolveStoredPatternFromCommunity(pattern, patterns);

  saveShareDraft({
    pattern: stored,
    yarns: [],
    colorMap: {},
    gridRows: pattern.gridRows,
    gridCols: pattern.gridCols,
    finishedPhotoDataUrl: finishedPhotoDataUrl(pattern.finishedImage),
    editCommunityId: pattern.id,
  });
}
