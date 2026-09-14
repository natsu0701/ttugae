import { lazy, Suspense, useCallback, useEffect, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import LandingPage from "./LandingPage.tsx";
import LoginModal from "./components/LoginModal.tsx";
import { type StoredPattern } from "./types/storedPattern.ts";
import { getPatternEditorGrid } from "./data/patternThumbnails.ts";
import type { CommunityPattern } from "./data/communityPatterns.ts";
import { CommunityActionsProvider } from "./context/CommunityActionsContext.tsx";
import { UnsavedChangesProvider, useUnsavedChanges } from "./context/UnsavedChangesContext.tsx";
import AppShell, { type AppNavPage } from "./components/layout/AppShell.tsx";
import Toast from "./components/ui/Toast.tsx";
import ConfirmDialog from "./components/ui/ConfirmDialog.tsx";
import EditorEntryModal from "./components/ui/EditorEntryModal.tsx";
import YarnStitchTrail from "./components/effects/YarnStitchTrail.tsx";
import { saveShareDraft } from "./utils/shareDraft.ts";
import { openShareDraftFromPatterns } from "./utils/createShareDraft.ts";
import { openCommunityPostForEdit } from "./utils/communityPostDraft.ts";
import { loadStoredPatterns, saveStoredPatterns } from "./utils/patternStorage.ts";
import { forkPatternToWorkspace } from "./utils/offlineReviewBridge.ts";
import {
  readFreshWorkspaceGrid,
  workspaceGridToStoredPattern,
} from "./utils/workspaceGridStorage.ts";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./utils/authStorage.ts";
import { clearProfile } from "./utils/profileStorage.ts";
import { consumeNavReturn, goBack, resolvePathFallback, setNavReturn } from "./utils/navReturn.ts";
import { closeLoungeFilters } from "./utils/communityTabEvent.ts";
import { appPath, currentRouteHref, routePath } from "./utils/appPath.ts";
import type { EditorYarn } from "./types/editorYarn.ts";
import {
  ACCOUNTS_CHANGED_EVENT,
  addAccount,
  clearActiveAccount,
  ensureActiveAccount,
  loadAccounts,
  loadActiveAccount,
  switchAccount,
  type UserAccount,
} from "./utils/accountStorage.ts";
import { currentUserAvatar } from "./utils/identity.ts";

const PatternEditor = lazy(() => import("./PatternEditor.tsx"));
const MyPage = lazy(() => import("./MyPage.tsx"));
const CreatePostPage = lazy(() => import("./CreatePostPage.tsx"));
const Community = lazy(() => import("./Community.tsx"));

function RouteFallback({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`flex min-h-screen items-center justify-center ${
        dark ? "bg-stone-800" : "bg-[#FFFBF7]"
      }`}
      aria-busy="true"
    >
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-coral/20">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-coral" />
      </div>
    </div>
  );
}

type AppView = "landing" | "mypage" | "community" | "editor" | "create-post";

function viewFromPath(pathname: string): AppView {
  const path = routePath(pathname);
  if (path.startsWith("/create-post")) return "create-post";
  if (path.startsWith("/community")) return "community";
  if (path.startsWith("/mypage") || path.startsWith("/dashboard")) {
    return "mypage";
  }
  if (path.startsWith("/editor")) return "editor";
  return "landing";
}

function pathFromView(view: AppView): string {
  if (view === "community") return "/community";
  if (view === "mypage") return "/mypage";
  if (view === "create-post") return "/create-post";
  if (view === "editor") return "/editor";
  return "/";
}

function commitPath(path: string, replace: boolean) {
  const url = appPath(path);
  const current = `${window.location.pathname}${window.location.search}`;
  if (current === url) return;
  if (replace) window.history.replaceState({}, "", url);
  else window.history.pushState({}, "", url);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

function AppRoutes() {
  const { t } = useTranslation();
  const [view, setView] = useState<AppView>(() =>
    viewFromPath(window.location.pathname),
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() => loadAuthSession());
  const [showLogin, setShowLogin] = useState(false);
  const [editorEntryOpen, setEditorEntryOpen] = useState(false);
  const [loginMode, setLoginMode] = useState<"login" | "add">("login");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [incomingShare, setIncomingShare] = useState<StoredPattern | null>(null);
  const [patterns, setPatterns] = useState<StoredPattern[]>(() => loadStoredPatterns());
  const [accounts, setAccounts] = useState<UserAccount[]>(() => loadAccounts());
  const [activeAccount, setActiveAccount] = useState(() => loadActiveAccount());
  const { pending, resolveLeave } = useUnsavedChanges();

  const persistPatterns = useCallback((next: StoredPattern[]) => {
    saveStoredPatterns(next);
    setPatterns(next);
  }, []);

  const refreshAccounts = useCallback(() => {
    setAccounts(loadAccounts());
    setActiveAccount(loadActiveAccount());
  }, []);

  useEffect(() => {
    window.addEventListener(ACCOUNTS_CHANGED_EVENT, refreshAccounts);
    return () => window.removeEventListener(ACCOUNTS_CHANGED_EVENT, refreshAccounts);
  }, [refreshAccounts]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2800);
  }, []);

  const navigate = useCallback(
    (next: AppView, pathOverride?: string, replace = false) => {
      const path = pathOverride ?? pathFromView(next);
      setView(next);
      commitPath(path, replace);
    },
    [],
  );

  const rememberReturn = useCallback(() => {
    setNavReturn({
      view,
      path: currentRouteHref() || pathFromView(view),
    });
  }, [view]);

  const openEditor = useCallback(
    (options?: { patternId?: string | null; share?: StoredPattern | null }) => {
      rememberReturn();
      if (options && "patternId" in options) {
        setActivePatternId(options.patternId ?? null);
      }
      if (options && "share" in options) {
        setIncomingShare(options.share ?? null);
      }
      navigate("editor");
    },
    [navigate, rememberReturn],
  );

  const leaveEditor = useCallback(() => {
    setIncomingShare(null);
    setActivePatternId(null);
    goBack(isLoggedIn ? "/mypage" : "/");
  }, [isLoggedIn]);

  const leaveCreatePost = useCallback(() => {
    goBack(resolvePathFallback(window.location.pathname).path ?? "/community");
  }, []);

  const requestMypage = useCallback(() => {
    if (!isLoggedIn) {
      showToast(t("toast.loginRequired"));
      setShowLogin(true);
      if (view === "mypage") {
        setView("landing");
        window.history.replaceState({}, "", appPath("/"));
      }
      return;
    }
    navigate("mypage");
  }, [isLoggedIn, navigate, showToast, view, t]);

  const handleLogin = (e?: FormEvent) => {
    e?.preventDefault();
    saveAuthSession();
    setIsLoggedIn(true);
    setShowLogin(false);
    if (loginMode === "add") {
      addAccount({});
    } else if (!loadActiveAccount()) {
      const list = loadAccounts();
      if (list[0]) switchAccount(list[0].id);
      else ensureActiveAccount();
    }
    setLoginMode("login");
    refreshAccounts();
    showToast(t("toast.loggedIn"));
  };

  const handleLogout = () => {
    clearAuthSession();
    clearActiveAccount();
    setIsLoggedIn(false);
    refreshAccounts();
    navigate("landing");
  };

  const handleDeleteAccount = () => {
    clearAuthSession();
    clearProfile();
    clearActiveAccount();
    setIsLoggedIn(false);
    refreshAccounts();
    navigate("landing");
    showToast(t("toast.accountDeleted"));
  };

  const handleSwitchAccount = (id: string) => {
    switchAccount(id);
    refreshAccounts();
  };

  const importCommunityPattern = (pattern: CommunityPattern) => {
    forkPatternToWorkspace(pattern);
    const grid = getPatternEditorGrid(pattern);
    setIncomingShare({
      id: `import-${pattern.id}-${Date.now()}`,
      title: pattern.title,
      updatedAt: Date.now(),
      gridSize: Math.max(pattern.gridRows, pattern.gridCols),
      grid,
      colorMap: pattern.colorMap,
      needle: pattern.needle,
    });
    setActivePatternId(null);
    rememberReturn();
    navigate("editor");
  };

  const openCreatePostFromEditor = useCallback(
    (payload: {
      pattern: StoredPattern;
      yarns: EditorYarn[];
      colorMap: Record<string, string>;
      gridRows: number;
      gridCols: number;
    }) => {
      const existing = patterns.slice();
      const idx = existing.findIndex((p) => p.id === payload.pattern.id);
      if (idx >= 0) existing[idx] = payload.pattern;
      else existing.unshift(payload.pattern);
      persistPatterns(existing);
      setActivePatternId(payload.pattern.id);

      saveShareDraft({
        pattern: payload.pattern,
        yarns: payload.yarns,
        colorMap: payload.colorMap,
        gridRows: payload.gridRows,
        gridCols: payload.gridCols,
      });
      setNavReturn({ view: "editor", path: "/editor" });
      navigate("create-post");
    },
    [navigate, patterns, persistPatterns],
  );

  const openCreatePostFromCommunity = useCallback(() => {
    openShareDraftFromPatterns(patterns);
    setNavReturn({ view: "community", path: "/community" });
    navigate("create-post");
  }, [navigate, patterns]);

  useEffect(() => {
    const onPopState = () => {
      const next = viewFromPath(window.location.pathname);
      if (next === "mypage" && !isLoggedIn) {
        showToast(t("toast.loginRequired"));
        setShowLogin(true);
        setView("landing");
        window.history.replaceState({}, "", appPath("/"));
        return;
      }
      setView(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isLoggedIn, showToast, t]);

  useEffect(() => {
    if (view === "mypage" && !isLoggedIn) {
      showToast(t("toast.loginRequired"));
      setShowLogin(true);
      setView("landing");
      window.history.replaceState({}, "", appPath("/"));
    }
  }, [view, isLoggedIn, showToast, t]);

  useEffect(() => {
    if (
      routePath(window.location.pathname).startsWith("/dashboard") &&
      view === "mypage"
    ) {
      window.history.replaceState({}, "", appPath("/mypage"));
    }
  }, [view]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const share = params.get("share");
    if (!share) return;
    try {
      const padded = share.replace(/-/g, "+").replace(/_/g, "/");
      const json = decodeURIComponent(
        Array.prototype.map
          .call(atob(padded), (c: string) =>
            "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2),
          )
          .join(""),
      );
      const parsed = JSON.parse(json) as StoredPattern;
      if (parsed?.grid && parsed?.id) {
        setIncomingShare({
          ...parsed,
          id: `shared-${crypto.randomUUID?.() ?? Date.now()}`,
          title: parsed.title || t("toast.sharedPattern"),
          updatedAt: Date.now(),
        });
        setView("editor");
        window.history.replaceState({}, "", appPath("/editor"));
      }
    } catch {
      // ignore
    } finally {
      params.delete("share");
      const next = params.toString();
      window.history.replaceState(
        {},
        "",
        next ? `${window.location.pathname}?${next}` : window.location.pathname,
      );
    }
  }, []);

  const shellPage: AppNavPage =
    view === "community" ? "community" : view === "mypage" ? "mypage" : "landing";

  const yarnTrailDisabled = view === "editor" || view === "create-post";
  const yarnTrail = <YarnStitchTrail disabled={yarnTrailDisabled} />;

  if (view === "create-post") {
    return (
      <>
        {yarnTrail}
        <Suspense fallback={<RouteFallback />}>
          <CreatePostPage
            savedPatterns={patterns}
            onCancel={leaveCreatePost}
            onPublished={() => {
              showToast(t("toast.postUploaded"));
              navigate("community", undefined, true);
            }}
            onSavePattern={(pattern) => {
              const existing = patterns.slice();
              const idx = existing.findIndex((p) => p.id === pattern.id);
              if (idx >= 0) existing[idx] = pattern;
              else existing.unshift(pattern);
              persistPatterns(existing);
            }}
          />
        </Suspense>
        <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
        <ConfirmDialog
          open={pending}
          title={t("unsaved.title")}
          body={t("unsaved.body")}
          onConfirm={() => resolveLeave("save")}
          onDiscard={() => resolveLeave("discard")}
          onCancel={() => resolveLeave("cancel")}
        />
      </>
    );
  }

  if (view === "editor") {
    const fromWorkspace =
      incomingShare || activePatternId ? null : readFreshWorkspaceGrid();
    const initial =
      incomingShare ??
      (fromWorkspace ? workspaceGridToStoredPattern(fromWorkspace) : null) ??
      (activePatternId
        ? patterns.find((p) => p.id === activePatternId) ?? null
        : null);

    return (
      <>
        {yarnTrail}
        <Suspense fallback={<RouteFallback dark />}>
          <PatternEditor
            initialPattern={initial}
            onExit={leaveEditor}
            onGoDashboard={() => {
              setIncomingShare(null);
              setActivePatternId(null);
              consumeNavReturn();
              if (!isLoggedIn) {
                showToast(t("toast.loginRequired"));
                setShowLogin(true);
                return;
              }
              navigate("mypage", "/mypage/patterns");
            }}
            onSave={(pattern) => {
              const existing = patterns.slice();
              const idx = existing.findIndex((p) => p.id === pattern.id);
              if (idx >= 0) existing[idx] = pattern;
              else existing.unshift(pattern);
              persistPatterns(existing);
              setActivePatternId(pattern.id);
              showToast(t("toast.patternSaved"));
            }}
            onShare={openCreatePostFromEditor}
          />
        </Suspense>
        <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
        )}
        <ConfirmDialog
          open={pending}
          title={t("unsaved.title")}
          body={t("unsaved.body")}
          onConfirm={() => resolveLeave("save")}
          onDiscard={() => resolveLeave("discard")}
          onCancel={() => resolveLeave("cancel")}
        />
      </>
    );
  }

  return (
    <>
      {yarnTrail}
      <AppShell
        currentPage={shellPage}
        isLoggedIn={isLoggedIn}
        avatarUrl={currentUserAvatar()}
        accounts={accounts}
        activeAccountId={activeAccount?.id ?? null}
        onGoHome={() => navigate("landing")}
        onGoCommunity={() => {
          closeLoungeFilters();
          navigate("community");
        }}
        onGoMypage={requestMypage}
        onGoEditor={() => setEditorEntryOpen(true)}
        onLogin={() => {
          setLoginMode("login");
          setShowLogin(true);
        }}
        onLogout={handleLogout}
        onAddAccount={() => {
          setLoginMode("add");
          setShowLogin(true);
        }}
        onSwitchAccount={handleSwitchAccount}
      >
        {view === "mypage" && isLoggedIn && (
          <Suspense fallback={<RouteFallback />}>
            <MyPage
              patterns={patterns}
              onLogout={handleLogout}
              onAddAccount={() => {
                setLoginMode("add");
                setShowLogin(true);
              }}
              onDeleteAccount={handleDeleteAccount}
              onCreateNew={() => openEditor({ patternId: null, share: null })}
              onOpenPattern={(id) => openEditor({ patternId: id, share: null })}
              onDeletePattern={(id) => {
                persistPatterns(patterns.filter((p) => p.id !== id));
                showToast(t("toast.patternDeleted"));
              }}
              onEditCommunityPost={(pattern) => {
                openCommunityPostForEdit(pattern, patterns);
                setNavReturn({ view: "mypage", path: "/mypage" });
                navigate("create-post");
              }}
              onImportCommunity={importCommunityPattern}
            />
          </Suspense>
        )}
        {view === "community" && (
          <Suspense fallback={<RouteFallback />}>
            <Community
              onImportToEditor={importCommunityPattern}
              onGoEditor={() => {
                const data = readFreshWorkspaceGrid();
                const share = data ? workspaceGridToStoredPattern(data) : null;
                openEditor({ patternId: null, share });
              }}
              onSharePattern={openCreatePostFromCommunity}
              onEditPost={(pattern) => {
                if (pattern.author !== "나") return;
                openCommunityPostForEdit(pattern, patterns);
                setNavReturn({ view: "community", path: "/community" });
                navigate("create-post");
              }}
            />
          </Suspense>
        )}
        {view === "landing" && (
          <LandingPage onOpenEditor={() => setEditorEntryOpen(true)} />
        )}
      </AppShell>
      <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      )}
      <EditorEntryModal
        open={editorEntryOpen}
        patterns={patterns}
        onClose={() => setEditorEntryOpen(false)}
        onCreateNew={() => {
          setEditorEntryOpen(false);
          openEditor({ patternId: null, share: null });
        }}
        onLoadExisting={(id) => {
          setEditorEntryOpen(false);
          openEditor({ patternId: id, share: null });
        }}
      />
      <ConfirmDialog
        open={pending}
        title={t("unsaved.title")}
        body={t("unsaved.body")}
        onConfirm={() => resolveLeave("save")}
        onDiscard={() => resolveLeave("discard")}
        onCancel={() => resolveLeave("cancel")}
      />
    </>
  );
}

export default function App() {
  return (
    <UnsavedChangesProvider>
      <CommunityActionsProvider>
        <AppRoutes />
      </CommunityActionsProvider>
    </UnsavedChangesProvider>
  );
}
