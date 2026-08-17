import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import PatternCard, { communityPostPath } from "./components/community/PatternCard.tsx";
import ShowcaseFeedCard from "./components/community/ShowcaseFeedCard.tsx";
import QaList from "./components/community/QaList.tsx";
import QaDetail from "./components/community/QaDetail.tsx";
import FinishedWorkDetail from "./components/community/FinishedWorkDetail.tsx";
import CommunityFilterBar from "./components/ui/CommunityFilterBar.tsx";
import KnitOfflineHub from "./components/community/KnitOfflineHub.tsx";
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
import { getPatternEditorGrid } from "./data/patternThumbnails.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import { COMMUNITY_TAB_EVENT } from "./CreatePostPage.tsx";
import { deleteSharedCommunityPattern } from "./utils/communityShare.ts";
import { deleteMyFinishedWork } from "./utils/myFinishedWorksStore.ts";
import {
  loadTasteProfile,
  patternTasteScore,
} from "./utils/personalizationStorage.ts";
import {
  applyLoungeFilters,
  DEFAULT_LOUNGE_FILTERS,
  type LoungeFilters,
} from "./data/loungeFilters.ts";

type CommunityProps = {
  onImportToEditor: (pattern: CommunityPattern) => void;
  onSharePattern: () => void;
  onEditPost: (pattern: CommunityPattern) => void;
  onGoEditor: () => void;
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
  onGoEditor,
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
  const [loungeFilters, setLoungeFilters] = useState<LoungeFilters>(DEFAULT_LOUNGE_FILTERS);

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
    if (activeTab === "qa" || activeTab === "offline") return [];
    let ranked: CommunityPattern[];
    if (activeTab === "best") {
      ranked = [...allPatterns]
        .filter((p) => p.category === "best")
        .sort((a, b) => b.likes - a.likes);
    } else {
      const base =
        activeTab === "all"
          ? allPatterns
          : allPatterns.filter((p) => p.category === activeTab);
      if (activeTab !== "all") {
        ranked = base;
      } else {
        const taste = loadTasteProfile();
        ranked =
          taste.styles.length === 0
            ? base
            : [...base].sort(
                (a, b) =>
                  patternTasteScore(b.title, b.finishedCaption, taste.styles) -
                  patternTasteScore(a.title, a.finishedCaption, taste.styles),
              );
      }
    }

    return applyLoungeFilters(ranked, loungeFilters);
  }, [activeTab, allPatterns, loungeFilters]);

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
        <div className="flex flex-wrap items-center gap-2">
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
        ) : activeTab === "offline" ? (
          <KnitOfflineHub onGoEditor={onGoEditor} />
        ) : (
          <>
            <div className="mb-6">
              <CommunityFilterBar
                filters={loungeFilters}
                resultCount={filtered.length}
                onChange={setLoungeFilters}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-2xl bg-gray-50 p-12 text-center">
                <p className="font-sans text-xl font-bold text-gray-900">
                  일치하는 뜨개 조건의 완성 도안이 아직 없습니다.
                </p>
                <p className="mt-2 font-seoyun text-sm font-normal text-gray-500">
                  상단의 상세 필터를 끄거나 조건을 초기화해 더 넓은 작품을 살펴보세요.
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
                  <AnimatePresence mode="popLayout">
                    {filtered.map((pattern, index) => (
                      <motion.div
                        key={pattern.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.28, ease: "easeOut" }}
                      >
                        {activeTab === "showcase" ? (
                          <ShowcaseFeedCard
                            pattern={pattern}
                            onImport={onImportToEditor}
                            onOpenFinished={openWork}
                          />
                        ) : (
                          <PatternCard
                            pattern={pattern}
                            rank={activeTab === "best" ? index + 1 : undefined}
                            onImport={onImportToEditor}
                            onOpenFinished={openWork}
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}
          </>
        )}
      </section>

      {activeTab !== "offline" ? (
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
      ) : null}
    </div>
  );
}

export function communityPatternToGrid(pattern: CommunityPattern) {
  return getPatternEditorGrid(pattern);
}
