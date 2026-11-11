import type { ReactNode } from "react";
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
import { MyScreen } from "./screens/my.tsx";
import { CodexScreen, NeedleScreen, YarnScreen } from "./screens/stash.tsx";
import {
  ChatScreen,
  CounterListScreen,
  CounterScreen,
  EditorScreen,
  GaugeFormScreen,
  GaugeScreen,
} from "./screens/tools.tsx";
import { ChevronLeft, SheetHost, StatusBar, TabBar, ToastHost } from "./ui.tsx";

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
    case "counters":
      return "행/코 카운터";
    case "codex":
      return "실 도감";
    case "chat":
      return "뜨니챗";
    case "editor":
      return "뜨개에디터";
    case "pattern":
      return "추천 도안";
    case "work":
      return "작품";
    case "ranking":
      return "뜨개왕";
    case "news":
      return "뜨개 소식";
    case "notifications":
      return "알림";
    case "likes":
      return "좋아요";
    case "product":
      return "뜨개마켓";
    case "short":
      return "기와뜨기";
    case "question":
      return "질문";
    default:
      return data.nickname;
  }
}

const OWN_CHROME = new Set(["splash", "login", "signup", "forgot", "onboarding", "skill", "home", "bag", "lounge", "my"]);

function Shell() {
  const { route, back, data } = useApp();
  const screen = renderRoute(route);
  const showBack = !OWN_CHROME.has(route.name);
  return (
    <div className="stage">
      <div className="phone">
        <StatusBar />
        {showBack ? (
          <div className="flex h-12 shrink-0 items-center px-1">
            <button type="button" aria-label="뒤로" onClick={back} className="grid h-10 w-10 place-items-center">
              <ChevronLeft />
            </button>
            <h1 className="flex-1 truncate pr-10 text-center text-[17px] font-bold">{titleFor(route, data)}</h1>
          </div>
        ) : null}
        <div className="scroll">{screen}</div>
        {showsTabBar(route) ? <TabBar /> : null}
        <ToastHost />
        <SheetHost />
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
    case "counters":
      return <CounterListScreen />;
    case "counter":
      return <CounterScreen id={route.id} />;
    case "codex":
      return <CodexScreen id={route.id} />;
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
