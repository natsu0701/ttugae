import { useCallback, useEffect, useState, type FormEvent } from "react";
import LandingPage from "./LandingPage.tsx";
import LoginModal from "./components/LoginModal.tsx";
import PatternEditor from "./PatternEditor.tsx";
import MyPage from "./MyPage.tsx";
import CreatePostPage from "./CreatePostPage.tsx";
import { type StoredPattern } from "./Dashboard.tsx";
import Community, { communityPatternToGrid } from "./Community.tsx";
import type { CommunityPattern } from "./data/communityPatterns.ts";
import { CommunityActionsProvider } from "./context/CommunityActionsContext.tsx";
import AppShell, { type AppNavPage } from "./components/layout/AppShell.tsx";
import Toast from "./components/ui/Toast.tsx";
import YarnStitchTrail from "./components/effects/YarnStitchTrail.tsx";
import { saveShareDraft } from "./utils/shareDraft.ts";
import { openShareDraftFromPatterns } from "./utils/createShareDraft.ts";
import { openCommunityPostForEdit } from "./utils/communityPostDraft.ts";
import { loadStoredPatterns, saveStoredPatterns } from "./utils/patternStorage.ts";
import {
  clearAuthSession,
  loadAuthSession,
  saveAuthSession,
} from "./utils/authStorage.ts";
import {
  consumeNavReturn,
  resolvePathFallback,
  setNavReturn,
} from "./utils/navReturn.ts";
import type { EditorYarn } from "./types/editorYarn.ts";

type AppView = "landing" | "mypage" | "community" | "editor" | "create-post";

function viewFromPath(pathname: string): AppView {
  if (pathname.startsWith("/create-post")) return "create-post";
  if (pathname.startsWith("/community")) return "community";
  if (pathname.startsWith("/mypage") || pathname.startsWith("/dashboard")) {
    return "mypage";
  }
  return "landing";
}

function pathFromView(view: AppView): string {
  if (view === "community") return "/community";
  if (view === "mypage") return "/mypage";
  if (view === "create-post") return "/create-post";
  return "/";
}

function AppRoutes() {
  const [view, setView] = useState<AppView>(() =>
    viewFromPath(window.location.pathname),
  );
  const [isLoggedIn, setIsLoggedIn] = useState(() => loadAuthSession());
  const [showLogin, setShowLogin] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activePatternId, setActivePatternId] = useState<string | null>(null);
  const [incomingShare, setIncomingShare] = useState<StoredPattern | null>(null);
  const [patterns, setPatterns] = useState<StoredPattern[]>(() => loadStoredPatterns());

  const persistPatterns = useCallback((next: StoredPattern[]) => {
    saveStoredPatterns(next);
    setPatterns(next);
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2800);
  }, []);

  const navigate = useCallback((next: AppView, pathOverride?: string) => {
    setView(next);
    if (next !== "editor") {
      window.history.pushState({}, "", pathOverride ?? pathFromView(next));
    }
  }, []);

  const leaveCreatePost = useCallback(() => {
    const target =
      consumeNavReturn() ?? resolvePathFallback(window.location.pathname);
    if (target.view === "editor") {
      setView("editor");
      window.history.replaceState({}, "", target.path ?? "/");
      return;
    }
    setView(target.view);
    window.history.replaceState(
      {},
      "",
      target.path ?? pathFromView(target.view),
    );
  }, []);

  const requestMypage = useCallback(() => {
    if (!isLoggedIn) {
      showToast("로그인이 필요한 서비스입니다.");
      setShowLogin(true);
      if (view === "mypage") {
        setView("landing");
        window.history.replaceState({}, "", "/");
      }
      return;
    }
    navigate("mypage");
  }, [isLoggedIn, navigate, showToast, view]);

  const handleLogin = (e?: FormEvent) => {
    e?.preventDefault();
    saveAuthSession();
    setIsLoggedIn(true);
    setShowLogin(false);
  };

  const handleLogout = () => {
    clearAuthSession();
    setIsLoggedIn(false);
    navigate("landing");
  };

  const importCommunityPattern = (pattern: CommunityPattern) => {
    setIncomingShare({
      id: `import-${pattern.id}-${Date.now()}`,
      title: pattern.title,
      updatedAt: Date.now(),
      gridSize: Math.max(pattern.gridRows, pattern.gridCols),
      grid: communityPatternToGrid(pattern),
    });
    setActivePatternId(null);
    setView("editor");
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
      setNavReturn({ view: "editor", path: "/" });
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
        showToast("로그인이 필요한 서비스입니다.");
        setShowLogin(true);
        setView("landing");
        window.history.replaceState({}, "", "/");
        return;
      }
      setView(next);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isLoggedIn, showToast]);

  useEffect(() => {
    if (view === "mypage" && !isLoggedIn) {
      showToast("로그인이 필요한 서비스입니다.");
      setShowLogin(true);
      setView("landing");
      window.history.replaceState({}, "", "/");
    }
  }, [view, isLoggedIn, showToast]);

  useEffect(() => {
    if (
      window.location.pathname.startsWith("/dashboard") &&
      view === "mypage"
    ) {
      window.history.replaceState({}, "", "/mypage");
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
          title: parsed.title || "공유된 도안",
          updatedAt: Date.now(),
        });
        setView("editor");
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
        <CreatePostPage
          savedPatterns={patterns}
          onCancel={leaveCreatePost}
          onPublished={() => {
            showToast("게시물이 업로드되었습니다!");
            navigate("community");
          }}
          onSavePattern={(pattern) => {
            const existing = patterns.slice();
            const idx = existing.findIndex((p) => p.id === pattern.id);
            if (idx >= 0) existing[idx] = pattern;
            else existing.unshift(pattern);
            persistPatterns(existing);
          }}
        />
        <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
      </>
    );
  }

  if (view === "editor") {
    const initial =
      incomingShare ??
      (activePatternId
        ? patterns.find((p) => p.id === activePatternId) ?? null
        : null);

    return (
      <>
        {yarnTrail}
        <PatternEditor
          initialPattern={initial}
          onExit={() => {
            setIncomingShare(null);
            setActivePatternId(null);
            if (isLoggedIn) navigate("mypage");
            else navigate("landing");
          }}
          onGoDashboard={() => {
            setIncomingShare(null);
            setActivePatternId(null);
            requestMypage();
          }}
          onSave={(pattern) => {
            const existing = patterns.slice();
            const idx = existing.findIndex((p) => p.id === pattern.id);
            if (idx >= 0) existing[idx] = pattern;
            else existing.unshift(pattern);
            persistPatterns(existing);
            setActivePatternId(pattern.id);
            showToast("도안이 저장되었습니다.");
          }}
          onShare={openCreatePostFromEditor}
        />
        <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
        )}
      </>
    );
  }

  return (
    <>
      {yarnTrail}
      <AppShell
        currentPage={shellPage}
        isLoggedIn={isLoggedIn}
        onGoHome={() => navigate("landing")}
        onGoCommunity={() => navigate("community")}
        onGoMypage={requestMypage}
        onGoEditor={() => setView("editor")}
        onLogin={() => setShowLogin(true)}
      >
        {view === "mypage" && isLoggedIn && (
          <MyPage
            patterns={patterns}
            onLogout={handleLogout}
            onAddAccount={() => setShowLogin(true)}
            onCreateNew={() => {
              setActivePatternId(null);
              setIncomingShare(null);
              setView("editor");
            }}
            onOpenPattern={(id) => {
              setActivePatternId(id);
              setIncomingShare(null);
              setView("editor");
            }}
            onDeletePattern={(id) => {
              persistPatterns(patterns.filter((p) => p.id !== id));
              showToast("도안이 삭제되었습니다.");
            }}
            onEditCommunityPost={(pattern) => {
              openCommunityPostForEdit(pattern, patterns);
              setNavReturn({ view: "mypage", path: "/mypage" });
              navigate("create-post");
            }}
            onImportCommunity={importCommunityPattern}
          />
        )}
        {view === "community" && (
          <Community
            onImportToEditor={importCommunityPattern}
            onSharePattern={openCreatePostFromCommunity}
            onEditPost={(pattern) => {
              if (pattern.author !== "나") return;
              openCommunityPostForEdit(pattern, patterns);
              setNavReturn({ view: "community", path: "/community" });
              navigate("create-post");
            }}
          />
        )}
        {view === "landing" && (
          <LandingPage onOpenEditor={() => setView("editor")} />
        )}
      </AppShell>
      <Toast message={toastMessage ?? ""} visible={Boolean(toastMessage)} />
      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      )}
    </>
  );
}

export default function App() {
  return (
    <CommunityActionsProvider>
      <AppRoutes />
    </CommunityActionsProvider>
  );
}
