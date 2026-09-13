import {
  FINISHED_COMMENTS,
  type FinishedComment,
} from "../data/finishedWorkComments.ts";
import { currentUserHandle } from "./identity.ts";

const COMMENT_KEY = "ttugae.comments.v1";
export const COMMENTS_CHANGED_EVENT = "ttugae:comments-changed";
const PAGE_SIZE = 5;

type CommentDb = {
  extra: FinishedComment[];
  deletedIds: string[];
  edits: Record<string, string>;
};

function emptyDb(): CommentDb {
  return { extra: [], deletedIds: [], edits: {} };
}

function readDb(): CommentDb {
  try {
    const raw = localStorage.getItem(COMMENT_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as CommentDb | FinishedComment[];
    if (Array.isArray(parsed)) {
      return { extra: parsed, deletedIds: [], edits: {} };
    }
    return {
      extra: Array.isArray(parsed.extra) ? parsed.extra : [],
      deletedIds: Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [],
      edits: parsed.edits && typeof parsed.edits === "object" ? parsed.edits : {},
    };
  } catch {
    return emptyDb();
  }
}

function writeDb(db: CommentDb) {
  localStorage.setItem(COMMENT_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event(COMMENTS_CHANGED_EVENT));
}

export function loadCommentsForPattern(patternId: string): FinishedComment[] {
  const db = readDb();
  const deleted = new Set(db.deletedIds);
  const seeded = FINISHED_COMMENTS.filter(
    (item) => item.patternId === patternId && !deleted.has(item.id),
  ).map((item) => (db.edits[item.id] ? { ...item, body: db.edits[item.id] } : item));
  const extra = db.extra.filter((item) => item.patternId === patternId && !deleted.has(item.id));
  const byId = new Map<string, FinishedComment>();
  for (const item of [...seeded, ...extra]) byId.set(item.id, item);
  return [...byId.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
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
  const db = readDb();
  writeDb({ ...db, extra: [...db.extra, comment] });
  return comment;
}

export function updateComment(id: string, body: string) {
  const text = body.trim();
  if (!text) return;
  const db = readDb();
  const extraIndex = db.extra.findIndex((item) => item.id === id);
  if (extraIndex >= 0) {
    const next = db.extra.slice();
    next[extraIndex] = { ...next[extraIndex], body: text };
    writeDb({ ...db, extra: next });
    return;
  }
  writeDb({ ...db, edits: { ...db.edits, [id]: text } });
}

export function deleteComment(id: string) {
  const db = readDb();
  writeDb({
    extra: db.extra.filter((item) => item.id !== id),
    deletedIds: db.deletedIds.includes(id) ? db.deletedIds : [...db.deletedIds, id],
    edits: db.edits,
  });
}

export function commentPageCount(total: number, pageSize = PAGE_SIZE) {
  return Math.max(1, Math.ceil(Math.max(0, total) / pageSize));
}

export function paginateComments(
  comments: FinishedComment[],
  page: number,
  pageSize = PAGE_SIZE,
): FinishedComment[] {
  const start = (Math.max(1, page) - 1) * pageSize;
  return comments.slice(start, start + pageSize);
}

export { PAGE_SIZE as COMMENT_PAGE_SIZE };
