import { useEffect, useRef, type ReactNode } from "react";
import { AppProvider, showsTabBar, useApp } from "./store.tsx";
import type { Route } from "./types.ts";
import { ForgotScreen, LoginScreen, OnboardingScreen, SignupScreen, SkillScreen, SplashScreen } from "./screens/auth.tsx";
import {
  BagScreen,
  FinishedScreen,
  NaviScreen,
  ProjectFormScreen,
  ProjectScreen,
} from "./screens/bag.tsx";
import {
  HomeScreen,
  LikesScreen,
  NewsScreen,
  NotificationsScreen,
  PatternScreen,
  ProductScreen,
  RankingScreen,
  WorkScreen,
} from "./screens/home.tsx";
import { LoungeScreen, QuestionScreen, ShortScreen } from "./screens/lounge.tsx";
import { MyScreen, OrdersScreen } from "./screens/my.tsx";
import { CodexScreen } from "./screens/codex.tsx";
import { CollectionScreen } from "./screens/collection.tsx";
import { codexById } from "./codex.ts";
import { NeedleScreen, YarnScreen } from "./screens/stash.tsx";
import {
  ChatScreen,
  CounterListScreen,
  CounterScreen,
  EditorScreen,
  GaugeFormScreen,
  GaugeHelpScreen,
  GaugeScreen,
} from "./screens/tools.tsx";
import { CameraScreen } from "./screens/camera.tsx";
import { DiaryScreen } from "./screens/diary.tsx";
import { ChevronLeft, FolderIcon, PlayBadge, SheetHost, TabBar, ToastHost } from "./ui.tsx";

function titleFor(route: Route, data: ReturnType<typeof useApp>["data"]) {
  if (route.name === "project" || route.name === "finished" || route.name === "navi") {
    return data.projects.find((project) => project.id === route.id)?.title ?? "프로젝트";
  }
  if (route.name === "counter") {
    return data.counters.find((counter) => counter.id === route.id)?.name ?? "카운터";
  }
  switch (route.name) {
    case "project-form":
      return route.id ? "프로젝트 수정" : "새 프로젝트";
    case "yarn":
      return "실 상세정보";
    case "needle":
      return "바늘 상세정보";
    case "gauge":
    case "gauge-form":
      return route.name === "gauge-form" ? "게이지 등록" : "게이지";
    case "gauge-help":
      return "도움말";
    case "counters":
      return "행/코 카운터";
    case "codex":
      if (route.id === "care") return "세탁 & 관리";
      return route.id ? (codexById(route.id)?.name ?? "뜨개도감") : "뜨개도감";
    case "chat":
      return "뜨니챗";
    case "editor":
      return "뜨개에디터";
    case "collection":
      return "뜨개컬렉션";
    case "pattern":
      return "추천 도안";
    case "work":
      return "작품";
    case "ranking":
      return "뜨개왕 프로필";
    case "news":
      return "뜨개 소식";
    case "notifications":
      return "알림";
    case "likes":
      return "좋아요";
    case "product":
      return route.id.startsWith("sale-") ? "판매 물품" : "뜨개마켓";
    case "orders":
      return "나의 거래";
    case "short":
      return "기와뜨기";
    case "question":
      return "질문";
    default:
      return data.nickname;
  }
}

const TAB_ORDER = ["home", "bag", "lounge", "my"] as const;

function tabSlide(from: string, to: string) {
  const previous = TAB_ORDER.indexOf(from as (typeof TAB_ORDER)[number]);
  const next = TAB_ORDER.indexOf(to as (typeof TAB_ORDER)[number]);
  if (previous < 0 || next < 0 || previous === next) return "";
  return next > previous ? "left" : "right";
}

const OWN_CHROME = new Set([
  "splash",
  "login",
  "signup",
  "forgot",
  "onboarding",
  "skill",
  "home",
  "bag",
  "lounge",
  "my",
  "camera",
  "diary",
]);

function Shell() {
  const { route, back, data, openSheet } = useApp();
  const screen = renderRoute(route);
  const showBack = !OWN_CHROME.has(route.name);
  const scrollRef = useRef<HTMLDivElement>(null);
  const motion = useRef({ route: route.name, slide: "" });
  if (motion.current.route !== route.name) {
    motion.current = { route: route.name, slide: tabSlide(motion.current.route, route.name) };
  }
  const slide = motion.current.slide;
  const routeKey = `${route.name}${"id" in route ? route.id : ""}${"tab" in route ? route.tab : ""}`;
  useEffect(() => {
    scrollRef.current?.scrollTo(0, 0);
  }, [routeKey]);
  const scrolling = route.name !== "chat";
  const fillScreen = route.name === "login";
  return (
    <div className="stage">
      <div className="phone">
        {showBack ? (
          <div className="flex h-12 shrink-0 items-center bg-white px-1">
            <button type="button" aria-label="뒤로" onClick={back} className="grid h-10 w-10 place-items-center">
              <ChevronLeft />
            </button>
            <h1 className="flex min-w-0 flex-1 items-center justify-center gap-1 pr-10 text-[17px] font-bold">
              <span className="truncate">{titleFor(route, data)}</span>
              {route.name === "collection" ? (
                <button
                  type="button"
                  aria-label="컬렉션 안내"
                  onClick={() =>
                    openSheet({
                      kind: "info",
                      title: "뜨개컬렉션",
                      body: "실 종류를 고른 뒤 도안을 누르면 제작자, 뜨는 부분, 도안 설명을 볼 수 있어요.",
                    })
                  }
                  className="grid h-6 w-6 shrink-0 place-items-center"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <circle cx="12" cy="12" r="8.25" fill="none" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 10.6v5.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="12" cy="7.7" r="0.9" fill="currentColor" />
                  </svg>
                </button>
              ) : null}
            </h1>
          </div>
        ) : null}
        <div ref={scrollRef} className={route.name === "camera" ? "scroll bg-black" : scrolling ? (fillScreen ? "scroll flex flex-col" : "scroll") : "flex min-h-0 flex-1 flex-col"}>
          <div
            key={route.name}
            data-tab-motion={slide || undefined}
            className={[slide ? `tab-enter-${slide}` : "", fillScreen ? "flex min-h-full w-full flex-1 flex-col" : ""].filter(Boolean).join(" ") || undefined}
          >
            {screen}
          </div>
        </div>
        {showsTabBar(route) ? <TabBar /> : null}
        <FinishPrompt />
        <ToastHost />
        <SheetHost />
      </div>
    </div>
  );
}

function FinishPrompt() {
  const { finishId, dismissFinish, openDiary } = useApp();
  if (!finishId) return null;
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-black/45 px-5">
      <div className="w-full rounded-[32px] bg-white px-6 pb-8 pt-10 text-center shadow-card">
        <h2 className="text-[28px] font-black tracking-tight">오늘의 뜨개 완료!</h2>
        <p className="mx-auto mt-4 max-w-[240px] text-[16px] font-semibold leading-snug">
          지금 기록해 두면 다음 작업을
          <br />
          더 쉽게 이어갈 수 있어요.
        </p>
        <div className="mt-8 flex gap-3">
          <button type="button" onClick={openDiary} className="flex h-[104px] flex-1 flex-col items-center justify-center gap-1.5 rounded-full bg-blush text-[16px] font-bold text-white shadow-card">
            <PlayBadge />
            작성하기
          </button>
          <button type="button" onClick={dismissFinish} className="flex h-[104px] flex-1 flex-col items-center justify-center gap-1.5 rounded-full bg-white text-[16px] font-bold text-black shadow-card">
            <FolderIcon />
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function renderRoute(route: Route): ReactNode {
  switch (route.name) {
    case "splash":
      return <SplashScreen />;
    case "login":
      return <LoginScreen />;
    case "signup":
      return <SignupScreen />;
    case "forgot":
      return <ForgotScreen />;
    case "onboarding":
      return <OnboardingScreen />;
    case "skill":
      return <SkillScreen />;
    case "home":
      return <HomeScreen />;
    case "bag":
      return <BagScreen />;
    case "lounge":
      return <LoungeScreen />;
    case "my":
      return <MyScreen />;
    case "project":
      return <ProjectScreen id={route.id} />;
    case "project-form":
      return <ProjectFormScreen id={route.id} />;
    case "navi":
      return <NaviScreen id={route.id} />;
    case "camera":
      return <CameraScreen id={route.id} />;
    case "diary":
      return <DiaryScreen id={route.id} />;
    case "yarn":
      return <YarnScreen id={route.id} />;
    case "needle":
      return <NeedleScreen id={route.id} />;
    case "finished":
      return <FinishedScreen id={route.id} />;
    case "gauge":
      return <GaugeScreen tab={route.tab} />;
    case "gauge-form":
      return <GaugeFormScreen />;
    case "gauge-help":
      return <GaugeHelpScreen />;
    case "counters":
      return <CounterListScreen />;
    case "counter":
      return <CounterScreen id={route.id} />;
    case "codex":
      return <CodexScreen id={route.id} />;
    case "collection":
      return <CollectionScreen id={route.id} />;
    case "chat":
      return <ChatScreen />;
    case "editor":
      return <EditorScreen />;
    case "pattern":
      return <PatternScreen id={route.id} />;
    case "work":
      return <WorkScreen id={route.id} />;
    case "ranking":
      return <RankingScreen />;
    case "news":
      return <NewsScreen id={route.id} />;
    case "notifications":
      return <NotificationsScreen />;
    case "likes":
      return <LikesScreen />;
    case "product":
      return <ProductScreen id={route.id} />;
    case "orders":
      return <OrdersScreen tab={route.tab} />;
    case "short":
      return <ShortScreen id={route.id} />;
    case "question":
      return <QuestionScreen id={route.id} />;
    default:
      return <HomeScreen />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
