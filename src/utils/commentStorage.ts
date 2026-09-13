import {
  FINISHED_COMMENTS,
  type FinishedComment,
} from "../data/finishedWorkComments.ts";
import { currentUserHandle } from "./identity.ts";

const COMMENT_KEY = "ttugae.comments.v1";
export const COMMENTS_CHANGED_EVENT = "ttugae:comments-changed";
const PAGE_SIZE = 5;

function readLocal(): FinishedComment[] {
  try {
    const raw = localStorage.getItem(COMMENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FinishedComment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(list: FinishedComment[]) {
  localStorage.setItem(COMMENT_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(COMMENTS_CHANGED_EVENT));
}

export function loadCommentsForPattern(patternId: string): FinishedComment[] {
  const seeded = FINISHED_COMMENTS.filter((item) => item.patternId === patternId);
  const extra = readLocal().filter((item) => item.patternId === patternId);
  const byId = new Map<string, FinishedComment>();
  for (const item of [...seeded, ...extra]) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export function addComment(patternId: string, body: string): FinishedComment {
  const now = new Date();
  const comment: FinishedComment = {
    id: `fc-local-${Date.now()}`,
    patternId,
    author: currentUserHandle(),
    createdAt: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
    body: body.trim(),
  };
  writeLocal([...readLocal(), comment]);
  return comment;
}

export function updateComment(id: string, body: string) {
  writeLocal(
    readLocal().map((item) => (item.id === id ? { ...item, body: body.trim() } : item)),
  );
}

export function deleteComment(id: string) {
  writeLocal(readLocal().filter((item) => item.id !== id));
}

export function commentPageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function paginateComments(
  comments: FinishedComment[],
  page: number,
  pageSize = PAGE_SIZE,
): FinishedComment[] {
  const start = (page - 1) * pageSize;
  return comments.slice(start, start + pageSize);
}

export { PAGE_SIZE as COMMENT_PAGE_SIZE };
