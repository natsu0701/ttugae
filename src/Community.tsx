import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PatternCard, { communityPostPath } from "./components/community/PatternCard.tsx";
import ShowcaseFeedCard from "./components/community/ShowcaseFeedCard.tsx";
import QaList from "./components/community/QaList.tsx";
import QaDetail from "./components/community/QaDetail.tsx";
import FinishedWorkDetail from "./components/community/FinishedWorkDetail.tsx";
import { tabButtonBase, tabButtonClass } from "./components/ui/tabButtonStyles.ts";
import {
  COMMUNITY_PATTERNS,
  COMMUNITY_TABS,
  getCommunityPattern,
  type CommunityCategory,
  type CommunityPattern,
} from "./data/communityPatterns.ts";
import {
  COMMUNITY_UPDATED_EVENT,
  loadSharedCommunityPatterns,
} from "./utils/communityShare.ts";
import { getQaPost, QA_POSTS } from "./data/qaPosts.ts";
import { getPatternThumbnail } from "./data/patternThumbnails.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import { COMMUNITY_TAB_EVENT } from "./CreatePostPage.tsx";
import { deleteSharedCommunityPattern } from "./utils/communityShare.ts";
import { deleteMyFinishedWork } from "./utils/myFinishedWorksStore.ts";
import {
  loadTasteProfile,
  patternTasteScore,
} from "./utils/personalizationStorage.ts";

type CommunityProps = {
  onImportToEditor: (pattern: CommunityPattern) => void;
  onSharePattern: () => void;
  onEditPost: (pattern: CommunityPattern) => void;
};

function qaIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/community\/qa\/([^/]+)/);
  return m?.[1] ?? null;
}

function workIdFromPath(pathname: string): string | null {
  const m = pathname.match(/^\/community\/(?:post|work)\/([^/]+)/);
  return m?.[1] ?? null;
}

function syncFromPath(pathname: string) {
  return {
    qaId: qaIdFromPath(pathname),
    workId: workIdFromPath(pathname),
  };
}

export default function Community({
  onImportToEditor,
  onSharePattern,
  onEditPost,
}: CommunityProps) {
  const { t } = useTranslation();
  const initialPath = syncFromPath(window.location.pathname);
  const [activeTab, setActiveTab] = useState<CommunityCategory>(() =>
    initialPath.qaId ? "qa" : "all",
  );
  const [selectedQaId, setSelectedQaId] = useState<string | null>(initialPath.qaId);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(
    initialPath.workId,
  );
  const [sharedPatterns, setSharedPatterns] = useState<CommunityPattern[]>(() =>
    loadSharedCommunityPatterns(),
  );

  useEffect(() => {
    const refresh = () => setSharedPatterns(loadSharedCommunityPatterns());
    window.addEventListener(COMMUNITY_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(COMMUNITY_UPDATED_EVENT, refresh);
  }, []);

  useEffect(() => {
    const onTabNavigate = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: CommunityCategory }>).detail;
      if (detail?.tab === "showcase") {
        setActiveTab("showcase");
        setSelectedQaId(null);
        setSelectedWorkId(null);
        window.history.replaceState({}, "", "/community");
      }
    };
    window.addEventListener(COMMUNITY_TAB_EVENT, onTabNavigate);
    return () => window.removeEventListener(COMMUNITY_TAB_EVENT, onTabNavigate);
  }, []);

  const allPatterns = useMemo(
    () => [...sharedPatterns, ...COMMUNITY_PATTERNS],
    [sharedPatterns],
  );

  useEffect(() => {
    const onPop = () => {
      const { qaId, workId } = syncFromPath(window.location.pathname);
      setSelectedQaId(qaId);
      setSelectedWorkId(workId);
      if (qaId) setActiveTab("qa");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openQa = (postId: string) => {
    setSelectedQaId(postId);
    setSelectedWorkId(null);
    setActiveTab("qa");
    window.history.pushState({}, "", `/community/qa/${postId}`);
  };

  const closeQa = () => {
    if (qaIdFromPath(window.location.pathname)) {
      window.history.back();
      return;
    }
    setSelectedQaId(null);
  };

  const openWork = (pattern: CommunityPattern) => {
    setSelectedWorkId(pattern.id);
    setSelectedQaId(null);
    window.history.pushState({}, "", communityPostPath(pattern.id));
  };

  const closeWork = () => {
    if (workIdFromPath(window.location.pathname)) {
      window.history.back();
      return;
    }
    setSelectedWorkId(null);
  };

  const handleTabChange = (tabId: CommunityCategory) => {
    setActiveTab(tabId);
    setSelectedQaId(null);
    setSelectedWorkId(null);
    if (window.location.pathname !== "/community") {
      window.history.replaceState({}, "", "/community");
    }
  };

  const filtered = useMemo(() => {
    if (activeTab === "qa") return [];
    if (activeTab === "best") {
      return [...allPatterns]
        .filter((p) => p.category === "best")
        .sort((a, b) => b.likes - a.likes);
    }
    const base =
      activeTab === "all"
        ? allPatterns
        : allPatterns.filter((p) => p.category === activeTab);
    if (activeTab !== "all") return base;
    const taste = loadTasteProfile();
    if (taste.styles.length === 0) return base;
    return [...base].sort(
      (a, b) =>
        patternTasteScore(b.title, b.finishedCaption, taste.styles) -
        patternTasteScore(a.title, a.finishedCaption, taste.styles),
    );
  }, [activeTab, allPatterns]);

  const selectedPost = selectedQaId ? getQaPost(selectedQaId) : null;
  const selectedWork = selectedWorkId ? getCommunityPattern(selectedWorkId) : null;

  if (selectedPost) {
    return <QaDetail post={selectedPost} onBack={closeQa} />;
  }

  if (selectedWork) {
    const isMine = selectedWork.author === "나";
    return (
      <FinishedWorkDetail
        pattern={selectedWork}
        onBack={closeWork}
        onEdit={isMine ? () => onEditPost(selectedWork) : undefined}
        onDelete={
          isMine
            ? () => {
                if (!window.confirm("이 게시물을 삭제할까요?")) return;
                deleteSharedCommunityPattern(selectedWork.id);
                deleteMyFinishedWork(`fw-${selectedWork.id}`);
                closeWork();
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="relative pb-24">
      <section className="px-5 pt-8 md:px-8">
        <div className="mx-auto max-w-6xl">
          <WelcomeBanner
            chip="LOUNGE"
            title={t("community.heroTitle")}
            subtitle={t("community.heroSubtitle")}
            image={TTEUNI_IMAGES.community}
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <div className="flex flex-wrap gap-2">
          {COMMUNITY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`${tabButtonBase} ${tabButtonClass(activeTab === tab.id)}`}
            >
              {t(`community.tabs.${tab.id}`)}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        {activeTab === "qa" ? (
          <QaList posts={QA_POSTS} onSelect={openQa} />
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-gray-50 p-12 text-center">
            <p className="font-sans text-xl font-bold text-gray-900">
              {t("community.emptyTitle")}
            </p>
            <p className="mt-2 font-sans text-sm font-normal text-gray-500">
              {t("community.emptyDesc")}
            </p>
          </div>
        ) : (
          <>
            {activeTab === "all" && loadTasteProfile().styles.length > 0 ? (
              <p className="mb-4 font-sans text-sm font-medium text-stone-600">
                설정한 취향에 맞춘 추천 도안을 먼저 보여드려요.
              </p>
            ) : null}
            <div
              className={
                activeTab === "showcase"
                  ? "mx-auto grid max-w-3xl grid-cols-1 md:max-w-none md:grid-cols-2 md:gap-8"
                  : activeTab === "best"
                    ? "grid grid-cols-1 gap-4 md:grid-cols-3"
                    : "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              }
            >
              {filtered.map((pattern, index) =>
                activeTab === "showcase" ? (
                  <ShowcaseFeedCard
                    key={pattern.id}
                    pattern={pattern}
                    onImport={onImportToEditor}
                    onOpenFinished={openWork}
                  />
                ) : (
                  <PatternCard
                    key={pattern.id}
                    pattern={pattern}
                    rank={activeTab === "best" ? index + 1 : undefined}
                    onImport={onImportToEditor}
                    onOpenFinished={openWork}
                  />
                ),
              )}
            </div>
          </>
        )}
      </section>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1.5 font-sans text-xs font-normal text-gray-600">
          {t("community.shareFabLabel")}
        </span>
        <button
          type="button"
          onClick={onSharePattern}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-black font-sans text-3xl font-bold text-white transition-colors duration-200 hover:bg-coral"
          aria-label={t("community.shareFabAria")}
        >
          +
        </button>
      </div>
    </div>
  );
}

function hexToColorId(hex: string): string {
  const h = hex.toUpperCase();
  if (h === "#FC5F53") return "coral";
  if (h === "#FFFFFF") return "white";
  if (h === "#E5E7EB") return "gray";
  if (h === "#374151" || h === "#1E3A5F") return "black";
  if (h === "#E8DCC8" || h.startsWith("#FF") || h.startsWith("#BA")) return "beige";
  return "coral";
}

export function communityPatternToGrid(pattern: CommunityPattern) {
  const thumb = getPatternThumbnail(pattern.id);
  const rows = pattern.gridRows;
  const cols = pattern.gridCols;

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const tr = Math.floor((r / rows) * thumb.length);
      const tc = Math.floor((c / cols) * (thumb[0]?.length ?? 1));
      const hex = thumb[tr]?.[tc] ?? "#FFFFFF";
      return {
        colorId: hexToColorId(hex),
        stitchId: hex === "#FFFFFF" ? "empty" : "knit",
      };
    }),
  );
}
