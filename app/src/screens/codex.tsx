import { useMemo, useRef, useState } from "react";
import { CODEX, CODEX_GROUPS, CODEX_TABS, DISCOVER_FILTERS, POPULAR_YARNS, type CodexEntry, type CodexKind, type PopularYarn } from "../codex.ts";
import { media } from "../data.ts";
import { useApp } from "../store.tsx";
import { CloseIcon, DragScroll, FilterIcon, SearchIcon, cx } from "../ui.tsx";

const DEFAULT_RECENT = ["안뜨기", "겉뜨기", "린넨"];

const BROWSE_KIND: Record<string, CodexKind> = {
  yarns: "yarn",
  needles: "needle",
  techniques: "technique",
};

export function CodexScreen({ id }: { id?: string }) {
  if (id === "explore") return <CodexDiscover />;
  if (id === "care") return <CodexCare />;
  const entry = id ? CODEX.find((item) => item.id === id) : undefined;
  if (entry) return <CodexDetail entry={entry} />;
  return <CodexBrowse key={id ?? "home"} initialKind={id && BROWSE_KIND[id] ? BROWSE_KIND[id] : "yarn"} />;
}

function CodexBrowse({ initialKind = "yarn" }: { initialKind?: CodexKind }) {
  const { push } = useApp();
  const [kind, setKind] = useState<CodexKind>(initialKind);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [recent, setRecent] = useState(DEFAULT_RECENT);
  const groups = CODEX_GROUPS[kind];
  const needle = query.trim();
  const items = useMemo(() => {
    return CODEX.filter((entry) => {
      if (entry.kind !== kind) return false;
      if (group !== "all" && entry.group !== group) return false;
      if (!needle) return true;
      const hay = [entry.name, ...entry.keywords].join(" ");
      return hay.includes(needle);
    });
  }, [group, kind, needle]);

  const remember = (term: string) => {
    const next = term.trim();
    if (!next) return;
    setRecent((list) => [next, ...list.filter((item) => item !== next)].slice(0, 6));
  };

  const chooseKind = (next: CodexKind) => {
    setKind(next);
    setGroup("all");
    setFilterOpen(false);
  };

  const chooseChip = (term: string) => {
    setQuery(term);
    const hit = CODEX.find((entry) => entry.name === term || entry.keywords.includes(term));
    if (hit) chooseKind(hit.kind);
    remember(term);
  };

  return (
    <div className="pb-8">
      <div className="relative px-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => push({ name: "codex", id: "explore" })}
            className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#ececec] bg-white px-4 text-left"
          >
            <span className="flex-1 truncate text-[14px] text-[#b0b0b0]">검색어를 입력해보세요.</span>
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="필터"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
            className={cx(
              "grid h-11 w-11 shrink-0 place-items-center rounded-full border",
              filterOpen || group !== "all" ? "border-ink bg-ink text-white" : "border-[#e6e6e6] bg-white text-[#666]",
            )}
          >
            <FilterIcon />
          </button>
        </div>
        {filterOpen ? (
          <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#eee] bg-white py-1 shadow-card">
            {groups.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setGroup(item.id);
                  setFilterOpen(false);
                }}
                className={cx("block w-full px-4 py-2.5 text-left text-[13px]", group === item.id ? "font-bold" : "text-[#555]")}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <section className="px-4 pt-5">
        <h2 className="text-[16px] font-bold">최근 검색어</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {recent.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => chooseChip(term)}
              className={cx(
                "h-8 rounded-full px-3 text-[13px]",
                query === term ? "bg-ink font-semibold text-white" : "bg-[#f3f3f3]",
              )}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      <div className="mt-5 flex items-end bg-black px-2 pt-1">
        {CODEX_TABS.map((tab) => {
          const active = tab.id === kind;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => chooseKind(tab.id)}
              className={cx(
                "h-10 flex-1 text-[14px]",
                active ? "rounded-t-2xl bg-black font-bold text-white" : "text-[#a3a3a3]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="px-5 py-16 text-center text-[14px] text-[#888]">해당하는 항목이 없어요.</p>
      ) : (
        <ul className="grid grid-cols-3">
          {items.map((entry) => (
            <li key={entry.id}>
              <button type="button" onClick={() => push({ name: "codex", id: entry.id })} className="relative block aspect-square w-full">
                <img src={entry.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/35" />
                <span className="absolute inset-0 grid place-items-center px-1 text-center text-[15px] font-semibold text-white drop-shadow">
                  {entry.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const MORE_RECENT = ["안뜨기", "겉뜨기", "린넨", "모헤어", "코바늘", "양말"];

const CATEGORIES = [
  { id: "all" as const, label: "전체" },
  { id: "material" as const, label: "재질별" },
  { id: "use" as const, label: "용도별" },
  { id: "beginner" as const, label: "초보추천" },
];

function CodexDiscover() {
  const { push } = useApp();
  const conditionsRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState(MORE_RECENT);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]["id"]>("all");
  const [filters, setFilters] = useState<string[]>(["겨울용"]);
  const needle = query.trim();
  const landing = category === "all" && filters.length === 1 && filters[0] === "겨울용";
  const popular = landing
    ? POPULAR_YARNS.slice(0, 6)
    : POPULAR_YARNS.filter((item) => {
        const categoryOk =
          category === "all" ||
          (category === "material" && item.material) ||
          (category === "use" && item.use) ||
          (category === "beginner" && item.beginner);
        const filterOk = filters.length === 0 || filters.some((flag) => item.flags.includes(flag));
        return categoryOk && filterOk;
      });
  const results = useMemo(() => {
    if (!needle) return [];
    return CODEX.filter((entry) => [entry.name, ...entry.keywords].join(" ").includes(needle));
  }, [needle]);

  const remember = (term: string) => {
    const next = term.trim();
    if (!next) return;
    setRecent((list) => [next, ...list.filter((item) => item !== next)].slice(0, 8));
  };

  const toggleFilter = (flag: string) => {
    setFilters((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));
  };

  return (
    <div className="pb-10">
      <div className="px-4 pt-2">
        <div className="flex items-center gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#ececec] bg-white px-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") remember(query);
              }}
              placeholder="검색어를 입력해보세요."
              aria-label="도감 검색"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#b0b0b0]"
            />
            {query ? (
              <button type="button" aria-label="검색어 지우기" onClick={() => setQuery("")} className="grid h-6 w-6 place-items-center text-[#999]">
                <CloseIcon size={14} />
              </button>
            ) : null}
            <SearchIcon />
          </label>
          <button
            type="button"
            aria-label="조건 보기"
            onClick={() => conditionsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[#e6e6e6] bg-white text-[#666]"
          >
            <FilterIcon />
          </button>
        </div>
      </div>

      <section className="px-4 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-bold">최근 검색어</h2>
          <button type="button" onClick={() => setShowAllRecent((open) => !open)} className="text-[13px] text-[#999]">
            {showAllRecent ? "접기" : "모두 보기"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {(showAllRecent ? recent : recent.slice(0, 3)).map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setQuery(term);
                remember(term);
              }}
              className={cx("h-8 rounded-full px-3 text-[13px]", query === term ? "bg-ink font-semibold text-white" : "bg-[#f3f3f3]")}
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {needle ? (
        results.length === 0 ? (
          <p className="px-5 py-16 text-center text-[14px] text-[#888]">해당하는 항목이 없어요.</p>
        ) : (
          <ul className="mt-5 grid grid-cols-3">
            {results.map((entry) => (
              <li key={entry.id}>
                <button type="button" onClick={() => push({ name: "codex", id: entry.id })} className="relative block aspect-square w-full">
                  <img src={entry.image} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 bg-black/35" />
                  <span className="absolute inset-0 grid place-items-center px-1 text-center text-[15px] font-semibold text-white">
                    {entry.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : (
        <>
          <div className="mt-6 grid grid-cols-4 px-3 text-center">
            {CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <button key={item.id} type="button" onClick={() => setCategory(item.id)} className="text-[12px]">
                  <span className={cx("mx-auto grid h-16 w-16 place-items-center rounded-full border", active ? "border-ink bg-ink text-white" : "border-[#ececec] bg-white")}>
                    <CategoryGlyph id={item.id} />
                  </span>
                  <span className="mt-2 block">{item.label}</span>
                </button>
              );
            })}
          </div>

          <section ref={conditionsRef} className="px-4 pt-7">
            <h2 className="text-[16px] font-bold">필요한 조건만 빠르게 체크!</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {DISCOVER_FILTERS.map((flag) => {
                const on = filters.includes(flag);
                return (
                  <button
                    key={flag}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleFilter(flag)}
                    className={cx(
                      "inline-flex h-9 items-center gap-1 rounded-full px-3 text-[13px]",
                      on ? "bg-blush font-semibold text-white" : "bg-[#f3f3f3] text-[#666]",
                    )}
                  >
                    {on ? <FilterGlyph name={flag} /> : null}
                    {flag}
                    {on ? <CloseIcon size={12} /> : null}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="pt-7">
            <div className="px-4">
              <h2 className="text-[16px] font-bold">지금 많이 찾는 실</h2>
              <p className="mt-1 text-[12px] text-[#999]">사용 후기와 함께 빠르게 비교하세요.</p>
            </div>
            {popular.length === 0 ? (
              <p className="px-4 py-8 text-[14px] text-[#888]">이 조건에 맞는 실이 없어요.</p>
            ) : (
              <DragScroll as="ul" className="mt-3 flex gap-3 overflow-x-auto px-4 pb-1">
                {popular.map((yarn) => (
                  <PopularCard key={yarn.id} yarn={yarn} onOpen={() => push({ name: "codex", id: yarn.id })} />
                ))}
              </DragScroll>
            )}
          </section>

          <section className="px-4 pt-7">
            <h2 className="text-[16px] font-bold">오늘의 도감 트렌드</h2>
            <p className="mt-1 text-[12px] text-[#999]">뜨개가 가장 많이 저장한 실</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Trend label="저장된 수" value="12,480" delta="+8.3%" />
              <Trend label="재질 TOP" value="면/면방" delta="+5.1%" />
              <Trend label="난이도" value="초보" delta="+3.7%" />
            </div>
          </section>

          <section className="px-4 pt-7">
            <h2 className="text-[16px] font-bold">도감 한눈에 보기</h2>
            <ul className="mt-2">
              <GuideRow
                image={media("media/yarn-pink.jpg")}
                title="실 재질"
                meta="울 · 캐시미어 · 면 · 양말실"
                body="각 재질의 장단점과 계절 추천을 확인해요."
                onClick={() => push({ name: "codex", id: "yarns" })}
              />
              <GuideRow
                image={media("media/needle-wood.jpg")}
                title="권장 바늘/게이지"
                meta="일자 · 줄 · 양면 · 코바늘"
                body="실 굵기에 맞는 바늘 호수를 손쉽게 찾아요."
                onClick={() => push({ name: "codex", id: "needles" })}
              />
              <GuideRow
                image={media("media/swatch-rose.jpg")}
                title="세탁 & 관리"
                meta="손세탁/세탁망/건조"
                body="세탁 방법과 주의사항을 요약해 제공합니다."
                onClick={() => push({ name: "codex", id: "care" })}
              />
              <GuideRow
                image={media("media/pop-beanie.jpg")}
                title="색상 & 추천"
                meta="목적에 맞는 선택"
                body="모자/가디건/양말/소품 등 용도별로 추천해요."
                onClick={() => push({ name: "codex", id: "techniques" })}
              />
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

function PopularCard({ yarn, onOpen }: { yarn: PopularYarn; onOpen: () => void }) {
  const badge = yarn.tone === "green" ? "bg-[#3e9b78]" : yarn.tone === "pink" ? "bg-blush" : "bg-ink/80";
  return (
    <li className="w-[168px] shrink-0">
      <button type="button" onClick={onOpen} className="w-full text-left">
        <span className="relative block">
          <img src={yarn.image} alt="" className="aspect-[4/5] w-full rounded-lg object-cover" />
          <span className={cx("absolute left-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white", badge)}>{yarn.badge}</span>
        </span>
        <span className="mt-2 block text-[14px] font-bold leading-tight">{yarn.title}</span>
        {yarn.tags.map((tag) => (
          <span key={tag.label} className="mt-0.5 block text-[12px] text-[#777]">
            <span className="mr-1 font-semibold text-blush">{tag.label}</span>
            {tag.value}
          </span>
        ))}
      </button>
    </li>
  );
}

function Trend({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="rounded-lg border border-[#f2f2f2] bg-white px-2 py-3 text-center shadow-card">
      <p className="text-[11px] text-[#999]">{label}</p>
      <p className="mt-1 text-[16px] font-bold leading-tight">{value}</p>
      <p className="mt-1 text-[12px] font-semibold text-blush">{delta}</p>
    </div>
  );
}

function GuideRow({
  image,
  title,
  meta,
  body,
  onClick,
}: {
  image: string;
  title: string;
  meta: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <li className="border-b border-[#f4f4f4]">
      <button type="button" onClick={onClick} className="flex w-full gap-3 py-3 text-left">
        <img src={image} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover" />
        <span className="min-w-0">
          <span className="block text-[15px] font-bold">{title}</span>
          <span className="mt-0.5 block text-[12px] text-[#999]">{meta}</span>
          <span className="mt-1 block text-[12px] leading-snug text-[#666]">{body}</span>
        </span>
      </button>
    </li>
  );
}

function CategoryGlyph({ id }: { id: (typeof CATEGORIES)[number]["id"] }) {
  if (id === "all") return <span className="text-[15px] font-black tracking-wide">ALL</span>;
  if (id === "material") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <circle cx="12" cy="12" r="2.1" fill="currentColor" />
        <circle cx="12" cy="4.5" r="1.7" fill="currentColor" />
        <circle cx="18.5" cy="8.2" r="1.7" fill="currentColor" />
        <circle cx="18.5" cy="15.8" r="1.7" fill="currentColor" />
        <circle cx="12" cy="19.5" r="1.7" fill="currentColor" />
        <circle cx="5.5" cy="15.8" r="1.7" fill="currentColor" />
        <circle cx="5.5" cy="8.2" r="1.7" fill="currentColor" />
      </svg>
    );
  }
  if (id === "use") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
        <path fill="currentColor" d="M4 4h7v7H4V4zm9 0h7v5a2 2 0 01-2 2h-5V4zM4 13h5a2 2 0 012 2v5H4v-7zm9 2h7v5h-7v-5z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path fill="currentColor" d="M12 19s-6.2-3.7-6.2-8.1C5.8 8.4 7.6 6.8 9.6 6.8c1.2 0 2.1.6 2.4 1.5.3-.9 1.2-1.5 2.4-1.5 2 0 3.8 1.6 3.8 4.1C18.2 15.3 12 19 12 19z" />
    </svg>
  );
}

function FilterGlyph({ name }: { name: string }) {
  if (name === "여름용") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
        <circle cx="8" cy="8" r="2.4" fill="currentColor" />
        <path fill="currentColor" d="M7.2 1h1.6v2.2H7.2V1zm0 11.8h1.6V15H7.2v-2.2zM1 7.2h2.2v1.6H1V7.2zm11.8 0H15v1.6h-2.2V7.2zM3.1 3.1l1.1-1.1 1.6 1.6-1.1 1.1-1.6-1.6zm7.1 8.3 1.1-1.1 1.6 1.6-1.1 1.1-1.6-1.6zM11.3 3.6l1.6-1.6 1.1 1.1-1.6 1.6-1.1-1.1zM3.1 12.9l1.6-1.6 1.1 1.1-1.6 1.6-1.1-1.1z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path fill="currentColor" d="M8 1.2 9.3 5.4 13.6 6.2 10.2 8.7 11.2 13 8 10.8 4.8 13 5.8 8.7 2.4 6.2 6.7 5.4 8 1.2z" />
    </svg>
  );
}

function CodexCare() {
  return (
    <div className="px-5 pb-12 pt-2">
      <img src={media("media/swatch-rose.jpg")} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
      <h2 className="mt-5 text-[24px] font-bold">세탁 & 관리</h2>
      <Explain title="손세탁" body="미지근한 물에 중성세제를 풀어 짧게 눌러 빨아요. 비비거나 탈수기로 짜면 코가 늘어지고 털이 뭉칩니다." />
      <Explain title="세탁망" body="수면사, 모헤어, 레이스는 세탁망에 넣어 마찰을 줄여요. 색이 진한 실은 처음 몇 번은 따로 빨아요." />
      <Explain title="건조" body="수건 위에 눕혀 눌러 물기를 빼고, 그늘에서 말려요. 아크릴과 수면사는 건조기 열에 눌리면 자국이 남아요." />
      <Explain title="캐시미어 · 실크 · 알파카" body="고급 동물성 섬유는 미지근한 물에 짧게 담그고 비틀어 짜지 않아요. 캐시미어와 앙고라는 보풀과 털 빠짐이 있어 세탁망에 넣고, 실크는 광택이 상하지 않게 그늘에서 눕혀 말려요." />
    </div>
  );
}

function CodexDetail({ entry }: { entry: CodexEntry }) {
  const { push } = useApp();
  const related = CODEX.filter((item) => item.kind === entry.kind && item.id !== entry.id).slice(0, 6);
  const kindLabel = CODEX_TABS.find((tab) => tab.id === entry.kind)?.label ?? "";
  return (
    <div className="pb-10">
      <img src={entry.image} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="px-5 pt-5">
        <p className="text-[12px] font-semibold text-[#999]">{kindLabel}</p>
        <h2 className="mt-1 text-[26px] font-bold">{entry.name}</h2>
        <Explain title="특징" body={entry.trait} />
        <Explain title="보통 이렇게 써요" body={entry.usual} />
        <Explain title="이런 걸 만들어요" body={entry.makes} />
      </div>
      <section className="px-5 pt-8">
        <h3 className="text-[16px] font-bold">이어서 보기</h3>
        <ul className="mt-3 grid grid-cols-3 gap-1">
          {related.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => push({ name: "codex", id: item.id })} className="relative block aspect-square w-full overflow-hidden rounded-lg">
                <img src={item.image} alt="" className="h-full w-full object-cover" />
                <span className="absolute inset-0 bg-black/35" />
                <span className="absolute inset-0 grid place-items-center px-1 text-center text-[12px] font-semibold text-white">
                  {item.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Explain({ title, body }: { title: string; body: string }) {
  return (
    <section className="pt-6">
      <h3 className="text-[16px] font-bold">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[#333]">{body}</p>
    </section>
  );
}
