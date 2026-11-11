import { useMemo, useState } from "react";
import { NEEDLE_CATEGORIES, PATTERNS, YARN_CATEGORIES, ballsLabel, formatClock } from "../data.ts";
import { useApp } from "../store.tsx";
import type { BagTab, Needle, Project, Yarn } from "../types.ts";
import type { SortDir, SortField } from "../types.ts";
import { CheckIcon, ChevronDown, Fab, FilterIcon, GearIcon, GridIcon, InfoButton, NaviIcon, PauseIcon, PencilIcon, PlayIcon, ProgressRing, SearchIcon, TrashIcon, UnderlineTabs, cx } from "../ui.tsx";

const TABS: { id: BagTab; label: string }[] = [
  { id: "projects", label: "프로젝트" },
  { id: "done", label: "완성작" },
  { id: "yarn", label: "실장고" },
  { id: "needles", label: "바늘 창고" },
];

export function BagScreen() {
  const { bagTab, setBagTab, push, notify } = useApp();
  return (
    <div className="pb-28">
      <div className="sticky top-0 z-20 bg-white">
        <div className="flex items-center justify-center gap-1 pt-1">
          <h1 className="text-[18px] font-bold">뜨개가방</h1>
          <InfoButton
            title="뜨개가방"
            body={"진행 중인 프로젝트, 완성작, 실, 바늘을 한곳에 모아 둬요.\n카드의 + 로 새로 추가하고, 휴지통으로 실장고에서 뺄 수 있어요."}
          />
        </div>
        <div className="mt-3">
          <UnderlineTabs value={bagTab} options={TABS} onChange={setBagTab} />
        </div>
      </div>
      {bagTab === "projects" ? <ProjectPane /> : null}
      {bagTab === "done" ? <DonePane /> : null}
      {bagTab === "yarn" ? <YarnPane /> : null}
      {bagTab === "needles" ? <NeedlePane /> : null}
      <Fab
        label="추가"
        onClick={() => {
          if (bagTab === "projects" || bagTab === "done") push({ name: "project-form" });
          else notify(bagTab === "yarn" ? "가진 실 카드에서 남은 볼 수를 바꿔 주세요" : "가진 바늘 카드에서 보관 위치를 확인해 주세요");
        }}
      />
    </div>
  );
}

function CategoryRow({
  items,
  value,
  onChange,
}: {
  items: readonly string[];
  value: string | null;
  onChange: (value: string | null) => void;
}) {
  const tones = ["#e7b15a", "#d9d9d9", "#3f6f74", "#e6d2b8", "#c5c7ce", "#9bb7c9"];
  return (
    <div className="px-4 pt-4">
      <p className="text-[14px] font-semibold">카테고리</p>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        {items.map((item, index) => {
          const active = value === item;
          return (
            <button key={item} type="button" onClick={() => onChange(active ? null : item)} className="w-16 shrink-0 text-center">
              <span
                className={cx("mx-auto block h-14 w-14 rounded-full border-2", active ? "border-ink" : "border-transparent")}
                style={{ background: tones[index % tones.length] }}
              />
              <span className="mt-1 block text-[12px]">{item}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProjectPane() {
  const { data, push } = useApp();
  const [category, setCategory] = useState<string | null>(null);
  const projects = data.projects.filter((project) => !category || project.category === category);
  const current = projects[0];
  return (
    <div>
      <CategoryRow items={YARN_CATEGORIES} value={category} onChange={setCategory} />
      {current ? (
        <section className="px-4 pt-2">
          <h2 className="text-[16px] font-bold">진행 중인 프로젝트</h2>
          <button type="button" onClick={() => push({ name: "project", id: current.id })} className="mt-3 w-full overflow-hidden rounded-lg bg-white text-left shadow-card">
            <img src={current.image} alt="" className="h-44 w-full object-cover" />
            <div className="flex items-end justify-between px-4 py-3">
              <span>
                <span className="block text-[18px] font-bold">{current.title}</span>
                <span className="text-[12px] text-[#999]">
                  시작일: {current.started} {formatClock(current.elapsed)}
                </span>
              </span>
              <span className="text-[28px] font-bold">{current.progress}%</span>
            </div>
            <div className="px-4 pb-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-[#f3f3f3]">
                <div className="h-full rounded-full bg-blush" style={{ width: `${current.progress}%` }} />
              </div>
            </div>
          </button>
        </section>
      ) : (
        <p className="px-4 pt-8 text-center text-[14px] text-[#999]">이 카테고리의 프로젝트가 없어요.</p>
      )}
      <ProjectCatalog projects={projects} />
    </div>
  );
}

function ProjectCatalog({ projects }: { projects: Project[] }) {
  const [mode, setMode] = useState<"card" | "list">("card");
  return (
    <section>
      <div className="flex items-center justify-between px-4 pt-6">
        <h2 className="text-[16px] font-bold">전체 프로젝트</h2>
        <div className="flex rounded-full bg-[#f4f4f4] p-1 text-[12px] font-semibold">
          <button type="button" onClick={() => setMode("card")} className={cx("h-8 rounded-full px-3", mode === "card" ? "bg-white shadow-card" : "text-[#888]")}>
            카드
          </button>
          <button type="button" onClick={() => setMode("list")} className={cx("h-8 rounded-full px-3", mode === "list" ? "bg-white shadow-card" : "text-[#888]")}>
            목록
          </button>
        </div>
      </div>
      {mode === "card" ? <ProjectGrid projects={projects} /> : <ProjectList projects={projects} />}
    </section>
  );
}

function ProjectList({ projects }: { projects: Project[] }) {
  const { push } = useApp();
  return (
    <ul className="space-y-2 px-4 pt-3">
      {projects.map((project) => (
        <li key={project.id}>
          <button type="button" onClick={() => push({ name: "project", id: project.id })} className="flex w-full items-center gap-3 rounded-lg border border-[#f0f0f0] p-2 text-left">
            <img src={project.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] font-bold">{project.title}</span>
              <span className="text-[12px] text-[#888]">시작일 {project.started} · {project.ago}</span>
            </span>
            <span className="text-[16px] font-bold text-blush">{project.progress}%</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ProjectGrid({ projects }: { projects: Project[] }) {
  const { push } = useApp();
  return (
    <ul className="grid grid-cols-2 gap-3 px-4 pt-3">
      {projects.map((project) => (
        <li key={project.id}>
          <button type="button" onClick={() => push({ name: "project", id: project.id })} className="w-full text-left">
            <img src={project.image} alt="" className="aspect-square w-full rounded-lg object-cover object-bottom" />
            <span className="mt-2 flex items-center gap-2">
              <ProgressRing value={project.progress} size={40} />
              <span>
                <span className="block text-[14px] font-bold leading-tight">{project.title}</span>
                <span className="text-[12px] text-[#999]">{project.ago}</span>
              </span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function DonePane() {
  const { data, push } = useApp();
  const done = data.projects.filter((project) => project.progress >= 50);
  return (
    <ul className="grid grid-cols-2 gap-3 px-4 pt-4">
      {(done.length ? done : data.projects.slice(0, 2)).map((project) => (
        <li key={project.id}>
          <button type="button" onClick={() => push({ name: "finished", id: project.id })} className="w-full text-left">
            <img src={project.image} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" />
            <span className="mt-2 block text-[14px] font-bold">{project.title}</span>
            <span className="text-[12px] text-[#999]">완성 기록</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function sortItems<T extends { id: string; name: string; recent: boolean }>(list: T[], sort: { field: SortField; dir: SortDir }, stock: (item: T) => number) {
  const sign = sort.dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    if (sort.field === "name") return a.name.localeCompare(b.name, "ko") * sign;
    if (sort.field === "stock") return (stock(a) - stock(b)) * sign;
    if (sort.field === "registered") return a.id.localeCompare(b.id) * sign;
    return (Number(a.recent) - Number(b.recent)) * sign;
  });
}

const SORTS: { field: SortField; label: string }[] = [
  { field: "recent", label: "최근 사용순" },
  { field: "registered", label: "등록일순" },
  { field: "name", label: "이름순" },
  { field: "stock", label: "재고순" },
];

function SearchRow({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const { sort, setSort } = useApp();
  const [open, setOpen] = useState(false);
  const choose = (field: SortField, dir: SortDir) => {
    setSort({ field, dir });
    setOpen(false);
  };
  return (
    <div className="relative px-4 pt-4">
      <div className="flex gap-2">
        <label className="flex h-11 flex-1 items-center gap-2 rounded-lg bg-[#f5f5f5] px-4">
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-[14px] outline-none"
            aria-label={placeholder}
          />
          <SearchIcon />
        </label>
        <button
          type="button"
          aria-label="정렬"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={cx("grid h-11 w-11 place-items-center rounded-full border", open ? "border-ink bg-ink text-white" : "border-[#e6e6e6] bg-white text-[#666]")}
        >
          <FilterIcon />
        </button>
      </div>
      {open ? (
        <>
          <button type="button" aria-label="정렬 닫기" className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-4 top-[4.25rem] z-30 w-[15.5rem] rounded-2xl border border-[#eee] bg-white p-3 shadow-card">
            <p className="px-1 text-[14px] font-bold">정렬</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {SORTS.map((item) => (
                <div key={item.field} className={cx("flex h-9 items-center justify-center gap-1 rounded-full border px-2 text-[12px]", sort.field === item.field ? "border-[#ddd] bg-[#fafafa] font-semibold" : "border-[#ececec]")}>
                  <span>{item.label}</span>
                  <span className="flex flex-col">
                    <button type="button" aria-label={`${item.label} 오름차순`} onClick={() => choose(item.field, "asc")} className={cx("grid h-3 w-3 place-items-center", sort.field === item.field && sort.dir === "asc" ? "text-ink" : "text-[#c8c8c8]")}>
                      <ChevronDown up className="h-3 w-3" />
                    </button>
                    <button type="button" aria-label={`${item.label} 내림차순`} onClick={() => choose(item.field, "desc")} className={cx("grid h-3 w-3 place-items-center", sort.field === item.field && sort.dir === "desc" ? "text-ink" : "text-[#c8c8c8]")}>
                      <ChevronDown className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function YarnPane() {
  const { data, push, removeYarn, notify, sort } = useApp();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const yarns = useMemo(() => {
    const list = data.yarns.filter((yarn) => {
      const text = `${yarn.name} ${yarn.code} ${yarn.category}`;
      return (!category || yarn.category === category) && text.includes(query.trim());
    });
    return sortItems(list, sort, (yarn) => yarn.balls);
  }, [category, data.yarns, query, sort]);
  const recent = yarns.filter((yarn) => yarn.recent);

  return (
    <div>
      <SearchRow value={query} onChange={setQuery} placeholder="실 이름을 검색해보세요." />
      <CategoryRow items={YARN_CATEGORIES} value={category} onChange={setCategory} />
      <h2 className="px-4 pt-2 text-[16px] font-bold">최근 사용한 실</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4">
        {recent.map((yarn) => (
          <button key={yarn.id} type="button" onClick={() => push({ name: "yarn", id: yarn.id })} className="w-36 shrink-0 rounded-lg border border-[#f0f0f0] p-2 text-left">
            <img src={yarn.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
            <p className="mt-2 truncate text-[13px] font-bold">{yarn.name}</p>
            <p className="truncate text-[11px] text-[#999]">{yarn.code}</p>
            <p className="text-[11px] text-[#999]">
              {yarn.thickness} · {ballsLabel(yarn.balls)}
            </p>
          </button>
        ))}
      </div>
      <h2 className="px-4 pt-6 text-[16px] font-bold">모든 실</h2>
      <ul className="mt-3 space-y-3 px-4">
        {yarns.map((yarn) => (
          <YarnRow
            key={yarn.id}
            yarn={yarn}
            onOpen={() => push({ name: "yarn", id: yarn.id })}
            onRemove={() => {
              removeYarn(yarn.id);
              notify("실장고에서 뺐어요");
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function YarnRow({ yarn, onOpen, onRemove }: { yarn: Yarn; onOpen: () => void; onRemove: () => void }) {
  return (
    <li className="rounded-lg border border-[#f0f0f0] p-3">
      <div className="flex gap-3">
        <button type="button" onClick={onOpen} className="flex flex-1 gap-3 text-left">
          <img src={yarn.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
          <span>
            <span className="rounded-full bg-[#f6f6f6] px-2 py-0.5 text-[11px]">{yarn.category}</span>
            <span className="mt-1 block font-bold">{yarn.name}</span>
            <span className="mt-1 flex items-center gap-1 text-[12px] text-[#777]"><PencilIcon /> {yarn.code}</span>
            <span className="text-[12px] text-[#777]">
              <PencilIcon /> {yarn.thickness} · {ballsLabel(yarn.balls)}
            </span>
          </span>
        </button>
        <button type="button" aria-label="실 삭제" onClick={onRemove} className="h-8 text-[16px] text-[#bbb]">
          <TrashIcon />
        </button>
      </div>
      <div className="mt-2 flex gap-3 text-[12px] text-[#888]">
        <span>⌂ {yarn.shop}</span>
        {yarn.linkedProject ? <span>↗ {yarn.linkedProject}</span> : null}
      </div>
    </li>
  );
}

function NeedlePane() {
  const { data, push, removeNeedle, notify, sort } = useApp();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const needles = useMemo(() => {
    const list = data.needles.filter((needle) => {
      const text = `${needle.name} ${needle.category} ${needle.size}`;
      return (!category || needle.category === category) && text.includes(query.trim());
    });
    return sortItems(list, sort, (needle) => Number.parseFloat(needle.size) || 0);
  }, [category, data.needles, query, sort]);

  return (
    <div>
      <SearchRow value={query} onChange={setQuery} placeholder="바늘 이름을 검색해보세요." />
      <CategoryRow items={NEEDLE_CATEGORIES} value={category} onChange={setCategory} />
      <h2 className="px-4 pt-2 text-[16px] font-bold">최근 사용한 바늘</h2>
      <div className="mt-3 flex gap-3 overflow-x-auto px-4">
        {needles
          .filter((needle) => needle.recent)
          .map((needle) => (
            <button key={needle.id} type="button" onClick={() => push({ name: "needle", id: needle.id })} className="w-36 shrink-0 rounded-lg border border-[#f0f0f0] p-2 text-left">
              <img src={needle.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
              <p className="mt-2 truncate text-[13px] font-bold">{needle.name}</p>
              <p className="text-[11px] text-[#999]">{needle.brandLine}</p>
            </button>
          ))}
      </div>
      <h2 className="px-4 pt-6 text-[16px] font-bold">모든 바늘</h2>
      <ul className="mt-3 space-y-3 px-4">
        {needles.map((needle) => (
          <NeedleRow
            key={needle.id}
            needle={needle}
            onOpen={() => push({ name: "needle", id: needle.id })}
            onRemove={() => {
              removeNeedle(needle.id);
              notify("바늘 창고에서 뺐어요");
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function NeedleRow({ needle, onOpen, onRemove }: { needle: Needle; onOpen: () => void; onRemove: () => void }) {
  return (
    <li className="rounded-lg border border-[#f0f0f0] p-3">
      <div className="flex gap-3">
        <button type="button" onClick={onOpen} className="flex-1 text-left">
          <span className="rounded-full bg-[#f6f6f6] px-2 py-0.5 text-[11px]">{needle.category}</span>
          <span className="mt-1 block font-bold">{needle.name}</span>
          <span className="mt-1 flex items-center gap-1 text-[12px] text-[#777]"><PencilIcon /> {needle.size} · {needle.meta}</span>
          <span className="text-[12px] text-[#777]">⌂ {needle.material}</span>
        </button>
        <img src={needle.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
        <button type="button" aria-label="바늘 삭제" onClick={onRemove} className="h-8 text-[#bbb]">
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

export function ProjectScreen({ id }: { id: string }) {
  const { data, push, toggleTimer, resetTimer, togglePart, openSheet } = useApp();
  const project = data.projects.find((item) => item.id === id);
  const [tab, setTab] = useState<"diary" | "chart" | "tutorial">("diary");
  if (!project) return <Missing />;
  return (
    <div className="pb-10">
      <div className="mt-1 flex justify-between px-5 text-[13px]">
        <span className="inline-flex items-center gap-1"><CheckIcon /> {project.progress}% 완성</span>
        <span className="flex items-center gap-2">
          <GridIcon /> 시작일 {project.started}
        </span>
      </div>
      <img src={project.image} alt="" className="mx-4 mt-3 h-52 w-[calc(100%-2rem)] rounded-lg object-cover" />
      <div className="mx-4 mt-4 rounded-lg bg-[#fafafa] p-4">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[28px] font-semibold tracking-wider">{formatClock(project.elapsed)}</p>
          <span className="flex gap-2">
            <button type="button" aria-label={project.running ? "일시정지" : "시작"} onClick={() => toggleTimer(project.id)} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
              {project.running ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button type="button" aria-label="시간 초기화" onClick={() => resetTimer(project.id)} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
              <GearIcon />
            </button>
          </span>
        </div>
        <div className="mt-4 flex justify-around">
          {project.parts.map((part) => (
            <button key={part.id} type="button" onClick={() => togglePart(project.id, part.id)} className="text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#eee] bg-white text-[18px] font-bold">
                {part.done ? <CheckIcon /> : part.count}
              </span>
              <span className="mt-1 block text-[13px] font-semibold">{part.name}</span>
              <span className="text-[11px] text-[#999]">{part.ago}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => push({ name: "camera", id: project.id })} className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blush font-semibold text-white">
          <NaviIcon />
          뜨개내비
        </button>
        <div className="mt-3 flex items-center gap-2 text-[12px]">
          <span>{project.progress}%</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ececec]">
            <span className="block h-full bg-ink" style={{ width: `${project.progress}%` }} />
          </span>
        </div>
      </div>
      <div className="mt-4">
        <UnderlineTabs
          value={tab}
          options={[
            { id: "diary", label: "뜨개 일기" },
            { id: "chart", label: "도안" },
            { id: "tutorial", label: "튜토리얼" },
          ]}
          onChange={setTab}
        />
      </div>
      {tab === "diary" ? (
        <ul className="mt-2 divide-y divide-[#f2f2f2] px-4">
          {project.diary.length === 0 ? <li className="py-8 text-center text-[13px] text-[#999]">아직 일기가 없어요.</li> : null}
          {project.diary.map((entry) => (
            <li key={entry.title} className="flex justify-between gap-3 py-4">
              <span>
                <span className="block font-bold">{entry.title}</span>
                <span className="text-[13px] text-[#777]">{entry.body}</span>
              </span>
              <span className="shrink-0 text-[12px] text-[#999]">{entry.date}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "chart" ? (
        <div className="px-4 pt-4">
          <MiniChart />
          <button type="button" onClick={() => push({ name: "pattern", id: project.patternId })} className="mt-3 text-[13px] font-semibold text-[#777]">
            도안 설명 보기
          </button>
        </div>
      ) : null}
      {tab === "tutorial" ? (
        <ul className="divide-y divide-[#f3f3f3] px-4 pt-2">
          {["모티브 뜨기", "모티브 잇기", "소매 달기"].map((title, index) => (
            <li key={title}>
              <button type="button" onClick={() => openSheet({ kind: "info", title, body: "3-2-1 순으로 천천히 따라가면 돼요. 막히면 뜨니챗에 물어보세요." })} className="flex w-full items-center gap-3 py-3 text-left">
                <span className="grid h-12 w-16 place-items-center rounded-xl bg-[#f6f6f6] text-[12px]">0{index + 1}:2</span>
                <span className="font-semibold">{title}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function MiniChart() {
  const colors = ["#f4e7d8", "#e7b7a8", "#c98686", "#8d5b49", "#f7f1ea"];
  return (
    <div className="grid grid-cols-12 gap-0.5 rounded-lg bg-[#f7f7f7] p-2">
      {Array.from({ length: 96 }, (_, index) => (
        <span key={index} className="aspect-square rounded-[2px]" style={{ background: colors[(index * 3 + Math.floor(index / 12)) % colors.length] }} />
      ))}
    </div>
  );
}

export function NaviScreen({ id }: { id: string }) {
  const { data, toggleNavi } = useApp();
  const project = data.projects.find((item) => item.id === id);
  const done = new Set(data.naviDone[id] ?? []);
  const steps = [
    "코 120개로 사슬을 시작해요",
    "고무단을 8단 떠요",
    "몸통 무늬를 23단까지 올려요",
    `${project?.parts[0]?.name ?? "소매"}를 이어서 떠요`,
    "시보리로 마감하고 실을 정리해요",
  ];
  const next = steps.findIndex((step) => !done.has(step));
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] text-[#888]">{project?.title ?? "프로젝트"} · 지금 할 단계</p>
      <ol className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const checked = done.has(step);
          const current = index === next;
          return (
            <li key={step}>
              <button
                type="button"
                onClick={() => toggleNavi(id, step)}
                className={cx(
                  "flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left",
                  current ? "border-blush bg-blush-soft" : "border-[#f0f0f0]",
                )}
              >
                <span className={cx("grid h-6 w-6 shrink-0 place-items-center rounded-full text-[12px]", checked ? "bg-ink text-white" : "bg-[#f3f3f3]")}>
                  {checked ? <CheckIcon /> : index + 1}
                </span>
                <span>
                  <span className="block text-[14px] font-semibold">{step}</span>
                  {current ? <span className="text-[12px] text-[#888]">지금 여기예요</span> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function ProjectFormScreen({ id }: { id?: string }) {
  const { data, saveProject, back, notify } = useApp();
  const existing = data.projects.find((project) => project.id === id);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [category, setCategory] = useState(existing?.category ?? "울");
  const [patternId, setPatternId] = useState(existing?.patternId ?? PATTERNS[0].id);
  const [beforeSts, setBeforeSts] = useState("");
  const [beforeRows, setBeforeRows] = useState("");
  const [afterSts, setAfterSts] = useState("");
  const [afterRows, setAfterRows] = useState("");
  const [memo, setMemo] = useState("");
  const [yarnIds, setYarnIds] = useState<string[]>(() => {
    if (existing?.yarnIds) return existing.yarnIds;
    if (!existing) return [];
    return data.yarns.filter((yarn) => yarn.linkedProject === existing.title).map((yarn) => yarn.id);
  });
  const [needleIds, setNeedleIds] = useState<string[]>(existing?.needleIds ?? []);
  const toggleId = (list: string[], idValue: string, setList: (next: string[]) => void) => {
    setList(list.includes(idValue) ? list.filter((item) => item !== idValue) : [...list, idValue]);
  };

  return (
    <form
      className="space-y-5 px-4 pb-12"
      onSubmit={(event) => {
        event.preventDefault();
        if (!title.trim()) {
          notify("프로젝트 이름을 입력해 주세요");
          return;
        }
        saveProject({ id, title: title.trim(), category, patternId, yarnIds, needleIds });
        notify(id ? "프로젝트를 수정했어요" : "프로젝트를 만들었어요");
        back();
      }}
    >
      <label className="block">
        <span className="text-[14px] font-bold">프로젝트 이름</span>
        <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="프로젝트 이름을 입력하세요." className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-4 text-[14px] outline-none" />
      </label>
      <label className="block">
        <span className="text-[14px] font-bold">도안</span>
        <select value={patternId} onChange={(event) => setPatternId(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-4 text-[14px]">
          {PATTERNS.map((pattern) => (
            <option key={pattern.id} value={pattern.id}>
              {pattern.title}
            </option>
          ))}
        </select>
      </label>
      <div>
        <p className="text-[14px] font-bold">사용한 실</p>
        <p className="mt-1 text-[12px] text-[#888]">가진 실에서 이 프로젝트에 쓴 것을 골라 주세요.</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {data.yarns.map((yarn) => {
            const selected = yarnIds.includes(yarn.id);
            return (
              <button
                key={yarn.id}
                type="button"
                onClick={() => toggleId(yarnIds, yarn.id, setYarnIds)}
                aria-pressed={selected}
                className={cx("w-28 shrink-0 rounded-lg border p-2 text-left text-[12px]", selected ? "border-blush bg-blush-soft" : "border-[#f0f0f0]")}
              >
                <img src={yarn.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <span className="mt-1 block font-semibold">{yarn.name}</span>
                <span className="text-[#888]">{selected ? "사용함" : "사용 안 함"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <p className="text-[14px] font-bold">사용한 바늘</p>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {data.needles.map((needle) => {
            const selected = needleIds.includes(needle.id);
            return (
              <button
                key={needle.id}
                type="button"
                onClick={() => toggleId(needleIds, needle.id, setNeedleIds)}
                aria-pressed={selected}
                className={cx("w-28 shrink-0 rounded-lg border p-2 text-left text-[12px]", selected ? "border-blush bg-blush-soft" : "border-[#f0f0f0]")}
              >
                <img src={needle.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <span className="mt-1 block font-semibold">{needle.name}</span>
                <span className="text-[#888]">{needle.size} · {selected ? "사용함" : "사용 안 함"}</span>
              </button>
            );
          })}
        </div>
      </div>
      <label className="block">
        <span className="text-[14px] font-bold">카테고리</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-4 text-[14px]">
          {YARN_CATEGORIES.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </label>
      <GaugePair label="세탁 전 게이지" sts={beforeSts} rows={beforeRows} onSts={setBeforeSts} onRows={setBeforeRows} />
      <GaugePair label="세탁 후 게이지" sts={afterSts} rows={afterRows} onSts={setAfterSts} onRows={setAfterRows} />
      <label className="block">
        <span className="text-[14px] font-bold">메모</span>
        <textarea value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="게이지 측정에 대한 추가 정보를 입력하세요." className="mt-2 h-24 w-full rounded-lg bg-[#f6f6f6] px-4 py-3 text-[14px] outline-none" />
      </label>
      <button type="submit" className="h-12 w-full rounded-full bg-blush font-semibold text-white">
        저장
      </button>
    </form>
  );
}

function GaugePair({
  label,
  sts,
  rows,
  onSts,
  onRows,
}: {
  label: string;
  sts: string;
  rows: string;
  onSts: (value: string) => void;
  onRows: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[14px] font-bold">{label}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input value={sts} onChange={(event) => onSts(event.target.value)} inputMode="numeric" placeholder="코수" aria-label={`${label} 코수`} className="h-11 rounded-xl bg-[#f6f6f6] px-3 text-[14px] outline-none" />
        <input value={rows} onChange={(event) => onRows(event.target.value)} inputMode="numeric" placeholder="단수" aria-label={`${label} 단수`} className="h-11 rounded-xl bg-[#f6f6f6] px-3 text-[14px] outline-none" />
      </div>
    </div>
  );
}

export function FinishedScreen({ id }: { id: string }) {
  const project = useApp().data.projects.find((item) => item.id === id);
  if (!project) return <Missing />;
  return (
    <article className="pb-10">
      <img src={project.image} alt="" className="h-72 w-full object-cover" />
      <div className="px-5 pt-4">
        <h2 className="text-[22px] font-bold">{project.title}</h2>
        <p className="mt-2 text-[14px] text-[#777]">시작 {project.started} · 기록 {formatClock(project.elapsed)}</p>
        <p className="mt-3 text-[14px] leading-relaxed">완성작 탭에 모아 둔 기록이에요. 같은 도안으로 다시 뜨려면 프로젝트를 새로 만들면 돼요.</p>
      </div>
    </article>
  );
}

function Missing() {
  return <p className="px-6 py-16 text-center text-[14px] text-[#888]">화면을 찾지 못했어요.</p>;
}
