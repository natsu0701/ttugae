import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PatternCard from "./components/community/PatternCard.tsx";
import ShowcaseFeedCard from "./components/community/ShowcaseFeedCard.tsx";
import QaList from "./components/community/QaList.tsx";
import QaDetail from "./components/community/QaDetail.tsx";
import FinishedWorkDetail from "./components/community/FinishedWorkDetail.tsx";
import AuthorProfilePage from "./components/community/AuthorProfilePage.tsx";
import CommunityFilterBar from "./components/ui/CommunityFilterBar.tsx";
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
import { appPath, routePath } from "./utils/appPath.ts";
import { leaveLoungeChild, pushLoungePath } from "./utils/navReturn.ts";
import { checkInMeetup } from "./utils/meetupExtraStorage.ts";
import { handleFromAuthor } from "./data/loungeAuthors.ts";
import { COMMUNITY_TAB_EVENT, closeLoungeFilters } from "./utils/communityTabEvent.ts";
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

const KnitOfflineHub = lazy(() => import("./components/community/KnitOfflineHub.tsx"));

type CommunityProps = {
  onImportToEditor: (pattern: CommunityPattern) => void;
  onSharePattern: () => void;
  onEditPost: (pattern: CommunityPattern) => void;
  onGoEditor: () => void;
};

function qaIdFromPath(pathname: string): string | null {
  const m = routePath(pathname).match(/^\/community\/qa\/([^/]+)/);
  return m?.[1] ?? null;
}

function workIdFromPath(pathname: string): string | null {
  const m = routePath(pathname).match(/^\/community\/(?:post|work)\/([^/]+)/);
  return m?.[1] ?? null;
}

function authorHandleFromPath(pathname: string): string | null {
  const m = routePath(pathname).match(/^\/community\/author\/([^/]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function attendIdFromPath(pathname: string): string | null {
  const m = routePath(pathname).match(/^\/community\/attend\/([^/]+)/);
  return m?.[1] ? decodeURIComponent(m[1]) : null;
}

function syncFromPath(pathname: string) {
  return {
    qaId: qaIdFromPath(pathname),
    workId: workIdFromPath(pathname),
    authorHandle: authorHandleFromPath(pathname),
    attendId: attendIdFromPath(pathname),
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
  const [authorHandle, setAuthorHandle] = useState<string | null>(initialPath.authorHandle);
  const [filterCloseSignal, setFilterCloseSignal] = useState(0);
  const [attendNotice, setAttendNotice] = useState<string | null>(null);

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
        window.history.replaceState({}, "", appPath("/community"));
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
      const { qaId, workId, authorHandle: nextAuthor } = syncFromPath(window.location.pathname);
      setSelectedQaId(qaId);
      setSelectedWorkId(workId);
      setAuthorHandle(nextAuthor);
      if (qaId) setActiveTab("qa");
      setFilterCloseSignal((n) => n + 1);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const openQa = (postId: string) => {
    setSelectedQaId(postId);
    setSelectedWorkId(null);
    setActiveTab("qa");
    closeLoungeFilters();
    pushLoungePath(`/community/qa/${postId}`);
  };

  const closeQa = () => {
    leaveLoungeChild("/community");
  };

  const openWork = (pattern: CommunityPattern) => {
    setSelectedWorkId(pattern.id);
    setSelectedQaId(null);
    setAuthorHandle(null);
    closeLoungeFilters();
    setFilterCloseSignal((n) => n + 1);
    pushLoungePath(`/community/post/${pattern.id}`);
  };

  const closeWork = () => {
    leaveLoungeChild("/community");
  };

  const openAuthor = (pattern: CommunityPattern) => {
    const handle = handleFromAuthor(pattern.author);
    setAuthorHandle(handle);
    setSelectedWorkId(null);
    setSelectedQaId(null);
    closeLoungeFilters();
    setFilterCloseSignal((n) => n + 1);
    pushLoungePath(`/community/author/${encodeURIComponent(handle)}`);
  };

  const handleTabChange = (tabId: CommunityCategory) => {
    setActiveTab(tabId);
    setSelectedQaId(null);
    setSelectedWorkId(null);
    setAuthorHandle(null);
    closeLoungeFilters();
    setFilterCloseSignal((n) => n + 1);
    if (routePath(window.location.pathname) !== "/community") {
      window.history.replaceState({}, "", appPath("/community"));
    }
  };

  useEffect(() => {
    const attendId = attendIdFromPath(window.location.pathname);
    if (!attendId) return;
    const added = checkInMeetup(attendId);
    setAttendNotice(added ? t("community.attendOk") : t("community.attendDup"));
    window.history.replaceState({}, "", appPath("/community"));
  }, [t]);

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

  if (authorHandle) {
    return (
      <AuthorProfilePage
        handle={authorHandle}
        onBack={() => leaveLoungeChild("/community")}
        onImportToEditor={onImportToEditor}
        onOpenFinished={openWork}
      />
    );
  }

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
                if (!window.confirm(t("community.deleteConfirm"))) return;
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
      {attendNotice ? (
        <p className="page-shell pt-4 font-sans text-sm font-medium text-coral">{attendNotice}</p>
      ) : null}
      <section className="pt-8">
        <div className="page-shell">
          <WelcomeBanner
            chip={t("community.loungeChip")}
            title={t("community.heroTitle")}
            subtitle={t("community.heroSubtitle")}
            image={TTEUNI_IMAGES.community}
          />
        </div>
      </section>

      <section className="page-shell pt-8">
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

      <section className="page-shell py-8">
        {activeTab === "qa" ? (
          <QaList posts={QA_POSTS} onSelect={openQa} />
        ) : activeTab === "offline" ? (
          <Suspense fallback={<div className="min-h-[480px] rounded-xl bg-gray-50" aria-busy="true" />}>
            <KnitOfflineHub onGoEditor={onGoEditor} />
          </Suspense>
        ) : (
          <>
            <div className="mb-6">
              <CommunityFilterBar
                filters={loungeFilters}
                resultCount={filtered.length}
                onChange={setLoungeFilters}
                closeSignal={filterCloseSignal}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="rounded-xl bg-gray-50 p-12 text-center">
                <p className="font-sans text-xl font-bold text-gray-900">
                  {t("community.noMatchTitle")}
                </p>
                <p className="mt-2 font-seoyun text-sm font-normal text-gray-500">
                  {t("community.noMatchDesc")}
                </p>
              </div>
            ) : (
              <>
                {activeTab === "all" && loadTasteProfile().styles.length > 0 ? (
                  <p className="mb-4 font-sans text-sm font-medium text-stone-600">
                    {t("community.tasteHint")}
                  </p>
                ) : null}
                <div
                  className={
                    activeTab === "showcase"
                      ? "mx-auto grid w-full grid-cols-1 md:grid-cols-2 md:gap-8"
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
                          onOpenAuthor={openAuthor}
                        />
                      ) : (
                        <PatternCard
                          key={pattern.id}
                          pattern={pattern}
                          rank={activeTab === "best" ? index + 1 : undefined}
                          onImport={onImportToEditor}
                          onOpenFinished={openWork}
                          onOpenAuthor={openAuthor}
                        />
                      ),
                    )}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {activeTab !== "offline" ? (
      <div className="fixed bottom-5 right-20 z-50 flex flex-col items-end gap-2">
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
