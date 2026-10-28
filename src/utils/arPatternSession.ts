import type { StoredPattern } from "../types/storedPattern.ts";
import { createRealisticDemoGrid, type EditorCell } from "./patternGrid.ts";
import { loadStoredPatterns } from "./patternStorage.ts";
import {
  readFreshWorkspaceGrid,
  workspaceGridToStoredPattern,
} from "./workspaceGridStorage.ts";

export const AR_SESSION_KEY = "ttugae.ar.session.v1";

export type ArSessionPattern = {
  id: string;
  title: string;
  grid: EditorCell[][];
  colorMap?: Record<string, string>;
};

function isEditorGrid(value: unknown): value is EditorCell[][] {
  return (
    Array.isArray(value) &&
    Array.isArray(value[0]) &&
    Boolean((value as EditorCell[][])[0]?.[0]?.colorId)
  );
}

function toSession(pattern: StoredPattern | ArSessionPattern): ArSessionPattern | null {
  if (!isEditorGrid(pattern.grid)) return null;
  return {
    id: pattern.id || "ar-pattern",
    title: pattern.title || "",
    grid: pattern.grid,
    colorMap: pattern.colorMap,
  };
}

export function writeArSession(pattern: ArSessionPattern): void {
  try {
    sessionStorage.setItem(AR_SESSION_KEY, JSON.stringify(pattern));
  } catch {
    // private mode
  }
}

export function readArSession(): ArSessionPattern | null {
  try {
    const raw = sessionStorage.getItem(AR_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ArSessionPattern;
    return toSession(parsed);
  } catch {
    return null;
  }
}

export function createArDemoPattern(): ArSessionPattern {
  return {
    id: "ar-demo",
    title: "",
    grid: createRealisticDemoGrid(12, 16, "ar-demo"),
  };
}

function decodeSharePattern(share: string): ArSessionPattern | null {
  try {
    const padded = share.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.prototype.map
        .call(atob(padded), (c: string) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    const parsed = JSON.parse(json) as StoredPattern;
    return toSession(parsed);
  } catch {
    return null;
  }
}

export function resolveArPattern(search = ""): ArSessionPattern {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const share = params.get("share");
  if (share) {
    const decoded = decodeSharePattern(share);
    if (decoded) return decoded;
  }

  const id = params.get("id");
  const stored = loadStoredPatterns();
  if (id) {
    const found = stored.find((pattern) => pattern.id === id);
    const session = found ? toSession(found) : null;
    if (session) return session;
  }

  const session = readArSession();
  if (session && (!id || session.id === id)) return session;

  const latest = stored.slice().sort((a, b) => b.updatedAt - a.updatedAt)[0];
  const latestSession = latest ? toSession(latest) : null;
  if (latestSession) return latestSession;

  const workspace = readFreshWorkspaceGrid();
  if (workspace) {
    const asStored = workspaceGridToStoredPattern(workspace);
    const fromWorkspace = toSession(asStored);
    if (fromWorkspace) return fromWorkspace;
  }

  return createArDemoPattern();
}
