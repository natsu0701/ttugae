import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  seedCounters,
  seedGauges,
  seedNeedles,
  seedProjects,
  seedYarns,
} from "./data.ts";
import type {
  BagTab,
  Counter,
  GaugeRecord,
  GaugeTab,
  HomeTab,
  LoungeTab,
  Persisted,
  Project,
  Route,
  Sheet,
  SortKey,
} from "./types.ts";

const STORAGE_KEY = "ttg-app-state-v1";

const TAB_ROUTES = new Set(["home", "bag", "lounge", "my"]);

function freshPersisted(): Persisted {
  return {
    onboarded: false,
    unit: "metric",
    tool: null,
    nickname: "뜨개더",
    level: null,
    projects: seedProjects(),
    yarns: seedYarns(),
    needles: seedNeedles(),
    gauges: seedGauges(),
    counters: seedCounters(),
    likes: [],
    notifRead: false,
    naviDone: {},
    catalogVersion: 2,
  };
}

function loadPersisted(): Persisted {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshPersisted();
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    const base = freshPersisted();
    return {
      ...base,
      ...parsed,
      projects: parsed.projects?.length ? parsed.projects.map((p) => ({ ...p, running: false })) : base.projects,
      yarns: parsed.catalogVersion === 2 && parsed.yarns?.length ? parsed.yarns : base.yarns,
      needles: parsed.catalogVersion === 2 && parsed.needles?.length ? parsed.needles : base.needles,
      catalogVersion: 2,
      gauges: parsed.gauges ?? base.gauges,
      counters: parsed.counters?.length ? parsed.counters : base.counters,
      likes: parsed.likes ?? [],
      naviDone: parsed.naviDone ?? {},
    };
  } catch {
    return freshPersisted();
  }
}

function routeToHash(route: Route) {
  switch (route.name) {
    case "splash":
      return "#/";
    case "project":
    case "navi":
    case "camera":
    case "diary":
    case "yarn":
    case "needle":
    case "finished":
    case "counter":
    case "pattern":
    case "work":
    case "news":
    case "product":
    case "short":
    case "question":
      return `#/${route.name}/${route.id}`;
    case "project-form":
      return route.id ? `#/project-form/${route.id}` : "#/project-form";
    case "gauge":
      return `#/gauge/${route.tab}`;
    case "codex":
      return route.id ? `#/codex/${route.id}` : "#/codex";
    default:
      return `#/${route.name}`;
  }
}

function hashToRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [name, id] = parts;
  if (!name) return { name: "splash" };
  if (name === "project" && id) return { name: "project", id };
  if (name === "navi" && id) return { name: "navi", id };
  if (name === "camera" && id) return { name: "camera", id };
  if (name === "diary" && id) return { name: "diary", id };
  if (name === "yarn" && id) return { name: "yarn", id };
  if (name === "needle" && id) return { name: "needle", id };
  if (name === "finished" && id) return { name: "finished", id };
  if (name === "counter" && id) return { name: "counter", id };
  if (name === "codex") return { name: "codex", id };
  if (name === "pattern" && id) return { name: "pattern", id };
  if (name === "work" && id) return { name: "work", id };
  if (name === "news" && id) return { name: "news", id };
  if (name === "product" && id) return { name: "product", id };
  if (name === "short" && id) return { name: "short", id };
  if (name === "question" && id) return { name: "question", id };
  if (name === "project-form") return { name: "project-form", id };
  if (name === "gauge") return { name: "gauge", tab: id === "manage" ? "manage" : "calc" };
  const known: Route["name"][] = [
    "login",
    "signup",
    "forgot",
    "onboarding",
    "skill",
    "home",
    "bag",
    "lounge",
    "my",
    "gauge-form",
    "gauge-help",
    "counters",
    "chat",
    "editor",
    "ranking",
    "notifications",
    "likes",
  ];
  if (known.includes(name as Route["name"])) return { name: name as Route["name"] } as Route;
  return { name: "splash" };
}

type AppApi = {
  route: Route;
  data: Persisted;
  homeTab: HomeTab;
  bagTab: BagTab;
  loungeTab: LoungeTab;
  sort: SortKey;
  toast: string | null;
  sheet: Sheet;
  calcSts: string;
  calcLen: string;
  calcResult: number | null;
  push: (route: Route) => void;
  replace: (route: Route) => void;
  back: () => void;
  goTab: (name: "home" | "bag" | "lounge" | "my") => void;
  setHomeTab: (tab: HomeTab) => void;
  setBagTab: (tab: BagTab) => void;
  setLoungeTab: (tab: LoungeTab) => void;
  setSort: (sort: SortKey) => void;
  notify: (message: string) => void;
  openSheet: (sheet: Exclude<Sheet, null>) => void;
  closeSheet: () => void;
  patch: (partial: Partial<Persisted>) => void;
  setCalc: (partial: { sts?: string; len?: string; result?: number | null }) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  togglePart: (projectId: string, partId: string) => void;
  saveProject: (input: { id?: string; title: string; category: string; patternId: string; yarnIds: string[]; needleIds: string[] }) => void;
  setBalls: (id: string, balls: number) => void;
  removeYarn: (id: string) => void;
  removeNeedle: (id: string) => void;
  saveGauge: (gauge: GaugeRecord) => void;
  removeGauge: (id: string) => void;
  addCounter: () => void;
  renameCounter: (id: string, name: string) => void;
  setCounterProject: (id: string, projectId: string | null) => void;
  bumpCounter: (counterId: string, rowId: string, delta: number) => void;
  resetCounterRow: (counterId: string, rowId: string) => void;
  addCounterRow: (counterId: string) => void;
  toggleLike: (workId: string) => void;
  toggleNavi: (projectId: string, step: string) => void;
  finishOnboarding: (level: string | null) => void;
  finishId: string | null;
  completeSession: (id: string) => void;
  dismissFinish: () => void;
  openDiary: () => void;
  saveDiary: (id: string, body: string) => void;
};

const AppContext = createContext<AppApi | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("AppProvider가 필요해요");
  return value;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(() => loadPersisted());
  const [stack, setStack] = useState<Route[]>(() => [hashToRoute(window.location.hash)]);
  const [homeTab, setHomeTab] = useState<HomeTab>("home");
  const [bagTab, setBagTab] = useState<BagTab>("projects");
  const [loungeTab, setLoungeTab] = useState<LoungeTab>("works");
  const [sort, setSort] = useState<SortKey>({ field: "recent", dir: "desc" });
  const [toast, setToast] = useState<string | null>(null);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [calcSts, setCalcSts] = useState("20");
  const [calcLen, setCalcLen] = useState("60");
  const [calcResult, setCalcResult] = useState<number | null>(120);
  const [finishId, setFinishId] = useState<string | null>(null);

  const route = stack[stack.length - 1] ?? { name: "splash" as const };
  const stackRef = useRef(stack);
  stackRef.current = stack;

  useEffect(() => {
    const current = hashToRoute(window.location.hash);
    window.history.replaceState({ ttg: 1 }, "", routeToHash(current));
  }, []);

  useEffect(() => {
    const onPop = () => {
      const marker = window.history.state as { ttg?: number } | null;
      setStack((current) => {
        if (current.length > 1 && marker?.ttg) return current.slice(0, -1);
        const next = hashToRoute(window.location.hash);
        if (next.name === "splash") return [{ name: "home" }];
        return [next];
      });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    let timer = 0;
    const arm = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const name = stackRef.current[stackRef.current.length - 1]?.name;
        if (name === "login" || name === "splash") return;
        setFinishId(null);
        setSheet(null);
        const login = { name: "login" as const };
        setStack([login]);
        window.history.replaceState({ ttg: 1 }, "", routeToHash(login));
      }, 10 * 60 * 1000);
    };
    arm();
    const events = ["pointerdown", "touchstart", "keydown"] as const;
    events.forEach((event) => window.addEventListener(event, arm, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, arm));
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  const running = data.projects.some((project) => project.running);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setData((current) => ({
        ...current,
        projects: current.projects.map((project) =>
          project.running ? { ...project, elapsed: project.elapsed + 1 } : project,
        ),
      }));
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const api = useMemo<AppApi>(() => {
    const writeHash = (next: Route) => {
      const hash = routeToHash(next);
      const marker = window.history.state as { ttg?: number } | null;
      window.history.replaceState({ ttg: marker?.ttg ?? 1 }, "", hash);
    };

    const push = (next: Route) => {
      const marker = window.history.state as { ttg?: number } | null;
      window.history.pushState({ ttg: (marker?.ttg ?? 1) + 1 }, "", routeToHash(next));
      setStack((current) => [...current, next]);
    };
    const replace = (next: Route) => {
      writeHash(next);
      setStack((current) => [...(current.length > 0 ? current.slice(0, -1) : []), next]);
    };
    const back = () => {
      const current = stackRef.current;
      const marker = window.history.state as { ttg?: number } | null;
      if (current.length > 1 && (marker?.ttg ?? 1) > 1) {
        window.history.back();
        return;
      }
      if (current.length > 1) {
        const next = current.slice(0, -1);
        const top = next[next.length - 1];
        if (top) writeHash(top);
        setStack(next);
        return;
      }
      const top = current[current.length - 1];
      if (!top || top.name === "home") return;
      const home = { name: "home" as const };
      window.history.replaceState({ ttg: 1 }, "", routeToHash(home));
      setStack([home]);
    };
    const goTab = (name: "home" | "bag" | "lounge" | "my") => {
      const next = { name } as Route;
      const marker = window.history.state as { ttg?: number } | null;
      window.history.pushState({ ttg: (marker?.ttg ?? 1) + 1 }, "", routeToHash(next));
      if (name === "home") setHomeTab("home");
      setStack([next]);
    };

    const patch = (partial: Partial<Persisted>) => setData((current) => ({ ...current, ...partial }));

    const updateProject = (id: string, map: (project: Project) => Project) => {
      setData((current) => ({
        ...current,
        projects: current.projects.map((project) => (project.id === id ? map(project) : project)),
      }));
    };

    return {
      route,
      data,
      homeTab,
      bagTab,
      loungeTab,
      sort,
      toast,
      sheet,
      calcSts,
      calcLen,
      calcResult,
      push,
      replace,
      back,
      goTab,
      setHomeTab,
      setBagTab,
      setLoungeTab,
      setSort,
      notify: (message) => setToast(message),
      openSheet: (next) => setSheet(next),
      closeSheet: () => setSheet(null),
      patch,
      setCalc: (partial) => {
        if (partial.sts !== undefined) setCalcSts(partial.sts);
        if (partial.len !== undefined) setCalcLen(partial.len);
        if (partial.result !== undefined) setCalcResult(partial.result);
      },
      toggleTimer: (id) => updateProject(id, (project) => ({ ...project, running: !project.running })),
      resetTimer: (id) => updateProject(id, (project) => ({ ...project, elapsed: 0, running: false })),
      togglePart: (projectId, partId) =>
        updateProject(projectId, (project) => {
          const parts = project.parts.map((part) =>
            part.id === partId ? { ...part, done: !part.done } : part,
          );
          const done = parts.filter((part) => part.done).length;
          const progress = Math.max(project.progress, Math.round((done / parts.length) * 100));
          return { ...project, parts, progress };
        }),
      saveProject: ({ id, title, category, patternId, yarnIds, needleIds }) => {
        setData((current) => {
          if (id) {
            return {
              ...current,
              projects: current.projects.map((project) =>
                project.id === id ? { ...project, title, category, patternId, yarnIds, needleIds } : project,
              ),
            };
          }
          const created: Project = {
            id: `p-${Date.now()}`,
            title,
            progress: 0,
            started: new Date().toISOString().slice(0, 10).replace(/-/g, "."),
            elapsed: 0,
            running: false,
            category,
            image: current.projects[0]?.image ?? "",
            ago: "방금",
            patternId,
            yarnIds,
            needleIds,
            parts: [{ id: "body", name: "몸통", count: 0, done: false, ago: "방금" }],
            diary: [],
          };
          return { ...current, projects: [created, ...current.projects] };
        });
      },
      setBalls: (id, balls) =>
        setData((current) => ({
          ...current,
          yarns: current.yarns.map((yarn) =>
            yarn.id === id ? { ...yarn, balls: Math.max(0, Math.round(balls * 2) / 2) } : yarn,
          ),
        })),
      removeYarn: (id) =>
        setData((current) => ({ ...current, yarns: current.yarns.filter((yarn) => yarn.id !== id) })),
      removeNeedle: (id) =>
        setData((current) => ({
          ...current,
          needles: current.needles.filter((needle) => needle.id !== id),
        })),
      saveGauge: (gauge) =>
        setData((current) => ({ ...current, gauges: [gauge, ...current.gauges.filter((item) => item.id !== gauge.id)] })),
      removeGauge: (id) =>
        setData((current) => ({ ...current, gauges: current.gauges.filter((gauge) => gauge.id !== id) })),
      addCounter: () => {
        const created: Counter = {
          id: `c-${Date.now()}`,
          name: "새 카운터",
          projectId: null,
          rows: [
            { id: "rows", label: "현재 단수", value: 0 },
            { id: "sts", label: "현재 코수", value: 0 },
          ],
        };
        setData((current) => ({ ...current, counters: [created, ...current.counters] }));
        push({ name: "counter", id: created.id });
      },
      renameCounter: (id, name) =>
        setData((current) => ({
          ...current,
          counters: current.counters.map((counter) => (counter.id === id ? { ...counter, name } : counter)),
        })),
      setCounterProject: (id, projectId) =>
        setData((current) => ({
          ...current,
          counters: current.counters.map((counter) =>
            counter.id === id ? { ...counter, projectId } : counter,
          ),
        })),
      bumpCounter: (counterId, rowId, delta) =>
        setData((current) => ({
          ...current,
          counters: current.counters.map((counter) =>
            counter.id === counterId
              ? {
                  ...counter,
                  rows: counter.rows.map((row) =>
                    row.id === rowId ? { ...row, value: Math.max(0, row.value + delta) } : row,
                  ),
                }
              : counter,
          ),
        })),
      resetCounterRow: (counterId, rowId) =>
        setData((current) => ({
          ...current,
          counters: current.counters.map((counter) =>
            counter.id === counterId
              ? { ...counter, rows: counter.rows.map((row) => (row.id === rowId ? { ...row, value: 0 } : row)) }
              : counter,
          ),
        })),
      addCounterRow: (counterId) =>
        setData((current) => ({
          ...current,
          counters: current.counters.map((counter) =>
            counter.id === counterId
              ? {
                  ...counter,
                  rows: [
                    ...counter.rows,
                    { id: `extra-${Date.now()}`, label: "추가 카운터", value: 0 },
                  ],
                }
              : counter,
          ),
        })),
      toggleLike: (workId) =>
        setData((current) => ({
          ...current,
          likes: current.likes.includes(workId)
            ? current.likes.filter((id) => id !== workId)
            : [...current.likes, workId],
        })),
      toggleNavi: (projectId, step) =>
        setData((current) => {
          const done = new Set(current.naviDone[projectId] ?? []);
          if (done.has(step)) done.delete(step);
          else done.add(step);
          return { ...current, naviDone: { ...current.naviDone, [projectId]: [...done] } };
        }),
      finishOnboarding: (level) => {
        setData((current) => ({ ...current, onboarded: true, level: level ?? current.level }));
        const next: Route = { name: "home" };
        setStack([next]);
        writeHash(next);
      },
      finishId,
      completeSession: (id) => {
        updateProject(id, (project) => ({ ...project, running: false }));
        setFinishId(id);
      },
      dismissFinish: () => {
        const onCamera = stackRef.current[stackRef.current.length - 1]?.name === "camera";
        setFinishId(null);
        if (onCamera) back();
      },
      openDiary: () => {
        const id = finishId;
        setFinishId(null);
        if (!id) return;
        const current = stackRef.current;
        const base = current[current.length - 1]?.name === "camera" ? current.slice(0, -1) : current;
        const next = [...base, { name: "diary" as const, id }];
        const top = next[next.length - 1];
        if (top) writeHash(top);
        setStack(next);
      },
      saveDiary: (id, body) => {
        const date = new Intl.DateTimeFormat("ko-KR", {
          timeZone: "Asia/Seoul",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
          .format(new Date())
          .replace(/\. /g, ".")
          .replace(/\.$/, "");
        updateProject(id, (project) => ({
          ...project,
          diary: [{ title: "오늘의 뜨개", body, date }, ...project.diary],
        }));
        setToast("뜨개일기를 저장했어요");
        back();
      },
    };
  }, [bagTab, calcLen, calcResult, calcSts, data, finishId, homeTab, loungeTab, route, sheet, sort, toast]);

  return <AppContext.Provider value={api}>{children}</AppContext.Provider>;
}

export function showsTabBar(route: Route) {
  return TAB_ROUTES.has(route.name);
}

export type { GaugeTab };
