export type UnitSystem = "metric" | "imperial";
export type ToolKind = "코바늘" | "대바늘" | "손뜨개";
export type BagTab = "projects" | "done" | "yarn" | "needles";
export type HomeTab = "home" | "market";
export type LoungeTab = "works" | "qa" | "shorts";
export type GaugeTab = "manage" | "calc";
export type SortField = "recent" | "registered" | "name" | "stock";
export type SortDir = "asc" | "desc";
export type SortKey = { field: SortField; dir: SortDir };

export type Route =
  | { name: "splash" }
  | { name: "login" }
  | { name: "signup" }
  | { name: "forgot" }
  | { name: "onboarding" }
  | { name: "skill" }
  | { name: "home" }
  | { name: "bag" }
  | { name: "lounge" }
  | { name: "my" }
  | { name: "project"; id: string }
  | { name: "project-form"; id?: string }
  | { name: "navi"; id: string }
  | { name: "camera"; id: string }
  | { name: "diary"; id: string }
  | { name: "diary-entry"; id: string; index: number }
  | { name: "yarn"; id: string }
  | { name: "needle"; id: string }
  | { name: "finished"; id: string }
  | { name: "gauge"; tab: GaugeTab }
  | { name: "gauge-form" }
  | { name: "gauge-help" }
  | { name: "counters" }
  | { name: "counter"; id: string }
  | { name: "codex"; id?: string }
  | { name: "chat" }
  | { name: "editor" }
  | { name: "collection"; id?: string }
  | { name: "pattern"; id: string }
  | { name: "work"; id: string }
  | { name: "ranking" }
  | { name: "news"; id: string }
  | { name: "notifications" }
  | { name: "likes" }
  | { name: "product"; id: string }
  | { name: "orders"; tab?: "sell" | "buy" }
  | { name: "short"; id: string }
  | { name: "question"; id: string };

export type ProjectPart = {
  id: string;
  name: string;
  count: number | null;
  done: boolean;
  ago: string;
};

export type DiaryEntry = {
  title: string;
  body: string;
  date: string;
};

export type Project = {
  id: string;
  title: string;
  progress: number;
  started: string;
  elapsed: number;
  running: boolean;
  category: string;
  image: string;
  ago: string;
  parts: ProjectPart[];
  diary: DiaryEntry[];
  patternId: string;
  yarnIds?: string[];
  needleIds?: string[];
};

export type Yarn = {
  id: string;
  name: string;
  brandLine: string;
  code: string;
  thickness: string;
  balls: number;
  material: string;
  weight: string;
  length: string;
  needle: string;
  place: string;
  memo: string;
  shop: string;
  shopUrl: string;
  category: string;
  lot: string;
  colorName: string;
  image: string;
  recent: boolean;
  linkedProject?: string;
};

export type Needle = {
  id: string;
  name: string;
  category: string;
  size: string;
  material: string;
  kind: string;
  cable: string;
  place: string;
  memo: string;
  shop: string;
  shopUrl: string;
  lot: string;
  image: string;
  recent: boolean;
  brandLine: string;
  meta: string;
};

export type GaugeRecord = {
  id: string;
  name: string;
  thickness: string;
  yarnName: string;
  before: string;
  after: string;
  image: string;
  projectId?: string;
  needle?: string;
  pattern?: string;
  memo?: string;
};

export type CounterRow = {
  id: string;
  label: string;
  value: number;
};

export type Counter = {
  id: string;
  name: string;
  projectId: string | null;
  rows: CounterRow[];
};

export type Pattern = {
  id: string;
  title: string;
  needles: string;
  summary: string;
  tags: string[];
  image: string;
  price: string;
  seller: string;
};

export type Work = {
  id: string;
  author: string;
  title: string;
  likes: number;
  image: string;
};

export type NewsItem = {
  id: string;
  title: string;
  body: string;
  image: string;
};

export type Product = {
  id: string;
  title: string;
  seller: string;
  price: string;
  kind: string;
  image: string;
  blurb: string;
};

export type ShortClip = {
  id: string;
  title: string;
  author: string;
  length: string;
  image: string;
  video: string;
};

export type Question = {
  id: string;
  title: string;
  body: string;
  author: string;
  answers: number;
};

export type Sheet =
  | { kind: "info"; title: string; body: string }
  | { kind: "filter"; scope: "yarn" | "needle" }
  | { kind: "camera" }
  | null;

export type Persisted = {
  onboarded: boolean;
  unit: UnitSystem;
  tool: ToolKind | null;
  nickname: string;
  level: string | null;
  projects: Project[];
  yarns: Yarn[];
  needles: Needle[];
  gauges: GaugeRecord[];
  counters: Counter[];
  likes: string[];
  calendarMarks: Record<string, string>;
  knitMinutes: Record<string, number>;
  notifRead: boolean;
  naviDone: Record<string, string[]>;
  catalogVersion?: number;
};
