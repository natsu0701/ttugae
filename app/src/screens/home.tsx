import { useEffect, useMemo, useState, type MouseEvent, type ReactNode } from "react";
import { FAQ, KINGS, NEWS, NOTIFICATIONS, PATTERNS, PRODUCTS, WORKS, formatClock } from "../data.ts";
import { useApp } from "../store.tsx";
import { BellIcon, ChevronDown, ChevronRight, CrownIcon, DragScroll, FigmaIcon, GearIcon, HeartIcon, Mascot, MinusIcon, NaviIcon, PauseIcon, PlayIcon, PlusIcon, SearchIcon, cx } from "../ui.tsx";

export function HomeScreen() {
  const { homeTab } = useApp();
  return homeTab === "market" ? <MarketPane /> : <HomePane />;
}

function RowProgress({ value }: { value: number }) {
  const progress = Math.min(100, Math.max(0, value));
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setWidth(progress));
    return () => window.cancelAnimationFrame(frame);
  }, [progress]);
  return (
    <div className="mt-1">
      <div className="flex items-center justify-between text-[13px]">
        <span className="font-semibold">단</span>
        <span className="font-bold text-blush">{progress}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#f3f3f3]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="단 진행도">
        <div className="h-full rounded-full bg-blush transition-[width] duration-500 ease-out" style={{ width: `${width}%` }} />
      </div>
      <p className="mt-2 text-[12px] text-[#888]">단 {progress}% 완료</p>
    </div>
  );
}

function HomePane() {
  const { data, push, toggleTimer, toggleLike, setHomeTab } = useApp();
  const project = data.projects[0];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const faqs = FAQ.filter((item) => item.q.includes(query.trim()) || item.a.includes(query.trim()));

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 flex items-end justify-between bg-white px-4 pb-2">
        <div className="flex gap-4 text-[18px]">
          <button type="button" className="border-b-2 border-blush pb-1 font-bold" onClick={() => setHomeTab("home")}>
            홈
          </button>
          <button type="button" className="pb-1 text-[#b5b5b5]" onClick={() => setHomeTab("market")}>
            뜨개마켓
          </button>
        </div>
        <div className="flex gap-1">
          <button type="button" aria-label="뜨개컬렉션" onClick={() => push({ name: "collection" })} className="grid h-10 w-10 place-items-center">
            <HeartIcon filled={data.likes.length > 0} />
          </button>
          <button type="button" aria-label="알림" onClick={() => push({ name: "notifications" })} className="relative grid h-10 w-10 place-items-center">
            <Bell />
            {!data.notifRead ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blush" /> : null}
          </button>
        </div>
      </header>

      <section className="px-4 pt-4">
        <h2 className="text-[22px] font-bold leading-snug">오늘의 뜨개를 시작해보세요!</h2>
        {project ? (
          <article className="mt-3 overflow-hidden rounded-lg bg-white shadow-card">
            <button type="button" onClick={() => push({ name: "project", id: project.id })} className="block w-full text-left">
              <div className="relative">
                <img src={project.image} alt="" className="h-52 w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[12px] font-semibold">진행중</span>
                <span className="absolute bottom-3 left-3 rounded-full bg-blush px-2 py-0.5 text-[12px] font-bold text-white">
                  단 {project.progress}%
                </span>
              </div>
              <div className="px-4 pt-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[22px] font-bold">{project.title}</h3>
                  <span className="flex gap-2">
                    <RoundIcon
                      label={project.running ? "일시정지" : "타이머 시작"}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleTimer(project.id);
                      }}
                    >
                      {project.running ? <PauseIcon /> : <PlayIcon />}
                    </RoundIcon>
                    <RoundIcon
                      label="프로젝트 수정"
                      onClick={(event) => {
                        event.stopPropagation();
                        push({ name: "project-form", id: project.id });
                      }}
                    >
                      <GearIcon />
                    </RoundIcon>
                  </span>
                </div>
                <div className="mt-2 flex justify-between text-[12px] text-[#9a9a9a]">
                  <span>시작일: {project.started}</span>
                  <span>작업 시간: {formatClock(project.elapsed)}</span>
                </div>
              </div>
            </button>
            <div className="px-4 pb-4">
              <button
                type="button"
                onClick={() => push({ name: "camera", id: project.id })}
                className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blush font-semibold text-white"
              >
                <NaviIcon />
                뜨개내비
              </button>
              <button
                type="button"
                aria-label={expanded ? "진행도 접기" : "진행도 펼치기"}
                aria-expanded={expanded}
                onClick={() => setExpanded((value) => !value)}
                className="mx-auto mt-2 grid h-8 w-8 place-items-center text-[#bbb]"
              >
                <ChevronDown up={expanded} />
              </button>
              {expanded ? <RowProgress value={project.progress} /> : null}
            </div>
          </article>
        ) : null}
      </section>

      <section className="px-4 pt-8">
        <h2 className="text-[18px] font-bold">뜨개 도구</h2>
        <div className="mt-4 grid grid-cols-4 gap-2 text-center text-[12px]">
          <ToolButton label="행/코 카운터" onClick={() => push({ name: "counters" })}>
            <CounterGlyph />
          </ToolButton>
          <ToolButton label="게이지" onClick={() => push({ name: "gauge", tab: "manage" })}>
            <GaugeGlyph />
          </ToolButton>
          <ToolButton label="뜨개 도감" onClick={() => push({ name: "codex" })}>
            <BookGlyph />
          </ToolButton>
          <ToolButton label="뜨니챗" onClick={() => push({ name: "chat" })}>
            <Mascot className="h-8 w-8" mood="cheer" />
          </ToolButton>
        </div>
      </section>

      <section className="mt-8 overflow-hidden bg-[#f7b7b6] px-4 py-5 text-ink">
        <p className="text-[20px] font-bold leading-snug">뜨개 고수와 함께 도안을 제작해요!</p>
        <p className="mt-1 text-[13px]">지금 바로 체험해보세요!</p>
        <button type="button" onClick={() => push({ name: "editor" })} className="mt-3 h-10 rounded-full bg-ink px-4 text-[13px] font-semibold text-white">
          뜨개에디터 Web ›
        </button>
        <div className="mt-1 flex justify-end">
          <Mascot className="h-36 w-36" mood="knit" />
        </div>
      </section>

      <section className="pt-8">
        <SectionTitle title="오늘의 추천 도안" onMore={() => push({ name: "pattern", id: PATTERNS[0].id })} />
        <DragScroll className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
          {PATTERNS.map((pattern) => (
            <button
              key={pattern.id}
              type="button"
              onClick={() => push({ name: "pattern", id: pattern.id })}
              className="w-[86%] shrink-0 rounded-lg bg-white p-3 text-left shadow-card"
            >
              <div className="flex gap-3">
                <img src={pattern.image} alt="" className="h-28 w-28 rounded-lg object-cover" />
                <div>
                  <p className="text-[16px] font-bold">{pattern.title}</p>
                  <p className="mt-1 text-[12px] text-[#999]">{pattern.needles}</p>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-snug">{pattern.summary}</p>
                  <p className="mt-2 text-[12px] text-[#888]">{pattern.tags.join("  ")}</p>
                </div>
              </div>
            </button>
          ))}
        </DragScroll>
      </section>

      <section className="pt-6">
        <SectionTitle title="인기 뜨개 작품" onMore={() => push({ name: "lounge" })} />
        <div className="mt-3 grid grid-cols-3 gap-px bg-[#f6f6f6]">
          {WORKS.map((work) => (
            <div key={work.id} className="bg-white p-2 text-left">
              <button type="button" onClick={() => push({ name: "work", id: work.id })} className="w-full text-left">
                <img src={work.image} alt="" className="aspect-[3/4] w-full rounded-xl object-cover object-top" />
                <p className="mt-2 text-[11px] text-[#999]">{work.author}</p>
                <p className="text-[13px] font-bold leading-tight">{work.title}</p>
              </button>
              <button
                type="button"
                aria-label="좋아요 토글"
                onClick={() => toggleLike(work.id)}
                className="mt-1 flex items-center gap-1 text-[12px] text-blush"
              >
                <HeartIcon filled={data.likes.includes(work.id)} />
                {work.likes}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pt-8">
        <SectionTitle title="이번달 뜨개왕 발표!" icon={<CrownIcon />} onMore={() => push({ name: "ranking" })} />
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {KINGS.map((king) => (
            <button key={king.name} type="button" onClick={() => push({ name: "ranking" })}>
              <span className="inline-flex justify-center">
                <CrownIcon color={king.crown} />
              </span>
              <span className="mx-auto mt-1 grid h-16 w-16 place-items-center rounded-full bg-[#f6f6f6] text-[13px] font-bold">
                {king.name.slice(0, 1)}
              </span>
              <p className="mt-2 text-[13px] font-bold">{king.name}</p>
              <div className="mt-2 rounded-lg border border-[#eee] px-1 py-2 text-[12px] leading-relaxed">
                <p className="font-bold">작품 {king.works}개</p>
                <p className="text-[#777]">행: {king.rows}</p>
                <p className="text-[#777]">코: {king.sts}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="pt-8">
        <h2 className="px-4 text-[20px] font-bold">뜨개 소식</h2>
        <DragScroll className="mt-3 flex gap-3 overflow-x-auto px-4">
          {NEWS.map((item) => (
            <button key={item.id} type="button" onClick={() => push({ name: "news", id: item.id })} className="w-40 shrink-0 text-left">
              <img src={item.image} alt="" className="h-28 w-full rounded-lg object-cover" />
              <p className="mt-2 text-[13px] font-semibold">{item.title}</p>
            </button>
          ))}
        </DragScroll>
      </section>

      <section className="px-4 pb-4 pt-10 text-center">
        <p className="text-[40px] font-black tracking-wide text-blush">FAQ</p>
        <p className="text-[18px] font-bold">궁금한 점이 있으신가요?</p>
        <label className="mt-4 flex h-12 items-center gap-2 rounded-lg bg-[#f5f5f5] px-4 text-left">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="궁금한 점을 검색해보세요."
            className="w-full bg-transparent text-[14px] outline-none"
            aria-label="FAQ 검색"
          />
          <SearchIcon />
        </label>
        <div className="mt-4 space-y-2 text-left">
          {faqs.map((item) => {
            const index = FAQ.indexOf(item);
            const open = openFaq === index;
            return (
              <div key={item.q} className="rounded-lg border border-[#ececec]">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-4 py-3 text-[14px] font-semibold"
                  onClick={() => setOpenFaq(open ? null : index)}
                  aria-expanded={open}
                >
                  {item.q}
                  {open ? <MinusIcon className="h-4 w-4 shrink-0" /> : <PlusIcon className="h-4 w-4 shrink-0" />}
                </button>
                {open ? <p className="px-4 pb-3 text-[13px] leading-relaxed text-[#666]">{item.a}</p> : null}
              </div>
            );
          })}
          {faqs.length === 0 ? <p className="py-6 text-[13px] text-[#999]">같은 질문을 찾지 못했어요.</p> : null}
        </div>
      </section>
    </div>
  );
}

function MarketPane() {
  const { push, setHomeTab } = useApp();
  const [kind, setKind] = useState("전체");
  const [query, setQuery] = useState("");
  const kinds = ["전체", "도안", "실", "바늘", "클래스"];
  const items = useMemo(
    () =>
      PRODUCTS.filter((item) => (kind === "전체" || item.kind === kind) && `${item.title}${item.seller}`.includes(query.trim())),
    [kind, query],
  );

  return (
    <div className="pb-8">
      <header className="sticky top-0 z-20 flex items-end gap-4 bg-white px-4 pb-2 text-[18px]">
        <button type="button" className="pb-1 text-[#b5b5b5]" onClick={() => setHomeTab("home")}>
          홈
        </button>
        <button type="button" className="border-b-2 border-blush pb-1 font-bold" onClick={() => setHomeTab("market")}>
          뜨개마켓
        </button>
      </header>
      <div className="px-4 pt-3">
        <label className="flex h-11 items-center gap-2 rounded-lg bg-[#f5f5f5] px-4">
          <SearchIcon />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="도안, 실, 클래스를 찾아보세요"
            className="w-full bg-transparent text-[14px] outline-none"
            aria-label="마켓 검색"
          />
        </label>
        <DragScroll className="mt-3 flex gap-2 overflow-x-auto">
          {kinds.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(item)}
              className={cx("h-8 shrink-0 rounded-full px-3 text-[13px]", kind === item ? "bg-ink text-white" : "bg-[#f4f4f4]")}
            >
              {item}
            </button>
          ))}
        </DragScroll>
      </div>
      <ul className="mt-4 space-y-3 px-4">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => push({ name: "product", id: item.id })} className="flex w-full gap-3 rounded-lg bg-white p-3 text-left shadow-card">
              <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
              <span>
                <span className="text-[11px] text-blush">{item.kind}</span>
                <span className="mt-0.5 block text-[15px] font-bold">{item.title}</span>
                <span className="mt-1 block text-[12px] text-[#888]">{item.seller}</span>
                <span className="mt-1 block text-[14px] font-semibold">{item.price}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionTitle({ title, onMore, icon }: { title: string; onMore?: () => void; icon?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4">
      <h2 className="inline-flex items-center gap-1.5 text-[20px] font-bold">
        {icon}
        <span>{title}</span>
      </h2>
      {onMore ? (
        <button type="button" aria-label={`${title} 더 보기`} onClick={onMore} className="grid h-6 w-6 place-items-center leading-none">
          <ChevronRight />
        </button>
      ) : null}
    </div>
  );
}

function ToolButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-2">
      <span className="grid h-16 w-16 place-items-center rounded-full border border-[#e8e8e8]">{children}</span>
      <span className="leading-tight">{label}</span>
    </button>
  );
}

function RoundIcon({
  children,
  label,
  onClick,
}: {
  children: ReactNode;
  label: string;
  onClick: (event: MouseEvent) => void;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
      {children}
    </button>
  );
}

function Bell() {
  return <BellIcon />;
}
function CounterGlyph() {
  return <FigmaIcon name="counter" className="h-8 w-8" />;
}
function GaugeGlyph() {
  return <FigmaIcon name="gauge" className="h-8 w-5" />;
}
function BookGlyph() {
  return <FigmaIcon name="book" className="h-7 w-7" />;
}

export function RankingScreen() {
  return (
    <div className="px-4 pb-10">
      <h2 className="pt-2 text-center text-[20px] font-bold">이번달 뜨개왕</h2>
      <ul className="mt-6 space-y-3">
        {KINGS.map((king, index) => (
          <li key={king.name} className="flex items-center gap-3 rounded-lg border border-[#eee] p-4">
            <span className="text-2xl" style={{ color: king.crown }}>
              {index + 1}
            </span>
            <span>
              <span className="block font-bold">{king.name}</span>
              <span className="text-[13px] text-[#777]">
                작품 {king.works} · 행 {king.rows} · 코 {king.sts}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NewsScreen({ id }: { id: string }) {
  const item = NEWS.find((news) => news.id === id) ?? NEWS[0];
  return (
    <article className="pb-10">
      <img src={item.image} alt="" className="h-56 w-full object-cover" />
      <div className="px-5 pt-5">
        <h2 className="text-[22px] font-bold">{item.title}</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[#555]">{item.body}</p>
      </div>
    </article>
  );
}

export function LikesScreen() {
  const { data, push } = useApp();
  const items = WORKS.filter((work) => data.likes.includes(work.id));
  if (items.length === 0) {
    return (
      <div className="grid place-items-center px-8 py-16 text-center">
        <Mascot mood="wave" />
        <p className="mt-2 text-[14px] text-[#777]">마음에 드는 작품에 하트를 눌러 보세요.</p>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-3 px-4 pb-8">
      {items.map((work) => (
        <li key={work.id}>
          <button type="button" onClick={() => push({ name: "work", id: work.id })} className="w-full text-left">
            <img src={work.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
            <p className="mt-1 text-[13px] font-bold">{work.title}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function NotificationsScreen() {
  const { data, patch } = useApp();
  useEffect(() => {
    if (!data.notifRead) patch({ notifRead: true });
  }, [data.notifRead, patch]);
  return (
    <ul className="space-y-2 px-4 pb-8">
      {NOTIFICATIONS.map((item) => (
        <li key={item.title} className="rounded-lg bg-[#fafafa] px-4 py-3">
          <p className="font-bold">{item.title}</p>
          <p className="mt-1 text-[13px] leading-relaxed text-[#666]">{item.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function WorkScreen({ id }: { id: string }) {
  const { data, toggleLike } = useApp();
  const work = WORKS.find((item) => item.id === id) ?? WORKS[0];
  const liked = data.likes.includes(work.id);
  return (
    <article className="pb-10">
      <img src={work.image} alt="" className="h-72 w-full object-cover object-top" />
      <div className="px-5 pt-4">
        <p className="text-[13px] text-[#999]">{work.author}</p>
        <h2 className="text-[22px] font-bold">{work.title}</h2>
        <button type="button" onClick={() => toggleLike(work.id)} className="mt-3 flex items-center gap-1 text-[14px]">
          <HeartIcon filled={liked} /> {work.likes + (liked ? 1 : 0)}
        </button>
        <p className="mt-3 text-[14px] leading-relaxed text-[#666]">라운지에 올라온 완성작이에요. 하트는 이 기기에만 남아요.</p>
      </div>
    </article>
  );
}

export function PatternScreen({ id }: { id: string }) {
  const { push } = useApp();
  const pattern = PATTERNS.find((item) => item.id === id) ?? PATTERNS[0];
  return (
    <article className="pb-10">
      <img src={pattern.image} alt="" className="h-64 w-full object-cover" />
      <div className="px-5 pt-4">
        <h2 className="text-[22px] font-bold">{pattern.title}</h2>
        <p className="mt-1 text-[13px] text-[#999]">{pattern.needles}</p>
        <p className="mt-3 text-[14px] leading-relaxed">{pattern.summary}</p>
        <p className="mt-2 text-[13px] text-[#888]">{pattern.tags.join("  ")}</p>
        <p className="mt-4 text-[14px]">
          {pattern.seller} · {pattern.price}
        </p>
        <button type="button" onClick={() => push({ name: "project-form" })} className="mt-5 h-12 w-full rounded-full bg-blush font-semibold text-white">
          이 도안으로 프로젝트 만들기
        </button>
      </div>
    </article>
  );
}

export function ProductScreen({ id }: { id: string }) {
  const { notify } = useApp();
  const product = PRODUCTS.find((item) => item.id === id) ?? PRODUCTS[0];
  return (
    <article className="pb-10">
      <img src={product.image} alt="" className="h-64 w-full object-cover" />
      <div className="px-5 pt-4">
        <p className="text-[12px] font-semibold text-blush">{product.kind}</p>
        <h2 className="text-[22px] font-bold">{product.title}</h2>
        <p className="mt-1 text-[14px] text-[#888]">{product.seller}</p>
        <p className="mt-3 text-[20px] font-bold">{product.price}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-[#555]">{product.blurb}</p>
        <button
          type="button"
          onClick={() => notify("데모라 결제는 진행되지 않아요")}
          className="mt-6 h-12 w-full rounded-full bg-ink font-semibold text-white"
        >
          구매하기
        </button>
      </div>
    </article>
  );
}
