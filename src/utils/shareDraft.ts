import type { StoredPattern } from "../Dashboard.tsx";
import type { EditorYarn } from "../types/editorYarn.ts";

const DRAFT_KEY = "ttugae.share.draft.v1";

export type ShareDraftPayload = {
  pattern: StoredPattern;
  yarns: EditorYarn[];
  colorMap: Record<string, string>;
  gridRows: number;
  gridCols: number;
  finishedPhotoDataUrl?: string;
  /** 기존 커뮤니티 게시물 수정 시 */
  editCommunityId?: string;
};

export function saveShareDraft(draft: ShareDraftPayload): void {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // ignore quota
  }
}

export function loadShareDraft(): ShareDraftPayload | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ShareDraftPayload;
  } catch {
    return null;
  }
}

export function clearShareDraft(): void {
  sessionStorage.removeItem(DRAFT_KEY);
}
