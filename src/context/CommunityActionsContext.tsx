import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { COMMUNITY_PATTERNS } from "../data/communityPatterns.ts";
import { loadSharedCommunityPatterns } from "../utils/communityShare.ts";

type CountMap = Record<string, number>;

type InteractionState = {
  likedIds: Set<string>;
  savedIds: Set<string>;
  likeCounts: CountMap;
  saveCounts: CountMap;
};

type CommunityActionsContextValue = {
  isLiked: (patternId: string) => boolean;
  isSaved: (patternId: string) => boolean;
  getLikeCount: (patternId: string) => number;
  getSaveCount: (patternId: string) => number;
  toggleLike: (patternId: string) => void;
  toggleSave: (patternId: string) => void;
  likedPatternIds: string[];
  savedPatternIds: string[];
};

const CommunityActionsContext = createContext<CommunityActionsContextValue | null>(
  null,
);

/** undefined·null·문자열·NaN → 0, 음수는 0으로 클램프 */
export function safeInteractionCount(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.floor(n));
}

function allKnownPatterns() {
  const byId = new Map(
    [...COMMUNITY_PATTERNS, ...loadSharedCommunityPatterns()].map((p) => [p.id, p]),
  );
  return [...byId.values()];
}

function buildInitialCounts(key: "likes" | "scraps"): CountMap {
  return Object.fromEntries(
    allKnownPatterns().map((p) => [p.id, safeInteractionCount(p[key])]),
  );
}

const SEED_LIKED = new Set(["cp-1", "cp-2", "cp-5"]);
const SEED_SAVED = new Set(["cp-2", "cp-6"]);

function createInitialState(): InteractionState {
  return {
    likedIds: new Set(SEED_LIKED),
    savedIds: new Set(SEED_SAVED),
    likeCounts: buildInitialCounts("likes"),
    saveCounts: buildInitialCounts("scraps"),
  };
}

export function CommunityActionsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InteractionState>(createInitialState);

  const toggleLike = useCallback((patternId: string) => {
    setState((prev) => {
      const wasLiked = prev.likedIds.has(patternId);
      const likedIds = new Set(prev.likedIds);
      if (wasLiked) likedIds.delete(patternId);
      else likedIds.add(patternId);
      const current = safeInteractionCount(prev.likeCounts[patternId]);
      const next = Math.max(0, current + (wasLiked ? -1 : 1));
      return {
        ...prev,
        likedIds,
        likeCounts: {
          ...prev.likeCounts,
          [patternId]: next,
        },
      };
    });
  }, []);

  const toggleSave = useCallback((patternId: string) => {
    setState((prev) => {
      const wasSaved = prev.savedIds.has(patternId);
      const savedIds = new Set(prev.savedIds);
      if (wasSaved) savedIds.delete(patternId);
      else savedIds.add(patternId);
      const current = safeInteractionCount(prev.saveCounts[patternId]);
      const next = Math.max(0, current + (wasSaved ? -1 : 1));
      return {
        ...prev,
        savedIds,
        saveCounts: {
          ...prev.saveCounts,
          [patternId]: next,
        },
      };
    });
  }, []);

  const value = useMemo<CommunityActionsContextValue>(
    () => ({
      isLiked: (id) => state.likedIds.has(id),
      isSaved: (id) => state.savedIds.has(id),
      getLikeCount: (id) => safeInteractionCount(state.likeCounts[id]),
      getSaveCount: (id) => safeInteractionCount(state.saveCounts[id]),
      toggleLike,
      toggleSave,
      likedPatternIds: [...state.likedIds],
      savedPatternIds: [...state.savedIds],
    }),
    [state, toggleLike, toggleSave],
  );

  return (
    <CommunityActionsContext.Provider value={value}>
      {children}
    </CommunityActionsContext.Provider>
  );
}

export function useCommunityActions() {
  const ctx = useContext(CommunityActionsContext);
  if (!ctx) {
    throw new Error("useCommunityActions must be used within CommunityActionsProvider");
  }
  return ctx;
}
