import type { CommunityPattern } from "../data/communityPatterns.ts";
import type { AttachedPatternData } from "../data/offlineCommunity.ts";
import { getPatternEditorGrid } from "../data/patternThumbnails.ts";
import { writeWorkspaceGrid } from "./workspaceGridStorage.ts";

export function attachedFromCommunityPattern(pattern: CommunityPattern): AttachedPatternData {
  const gridCells = getPatternEditorGrid(pattern);
  return {
    id: pattern.id,
    title: pattern.title,
    gridCols: pattern.gridCols,
    gridRows: pattern.gridRows,
    gridCells,
    colorMap: pattern.colorMap,
    needle: pattern.needle,
  };
}

export function forkPatternToWorkspace(pattern: CommunityPattern) {
  writeWorkspaceGrid(attachedFromCommunityPattern(pattern));
}
