import { useMemo, useState } from "react";
import { CODEX, CODEX_GROUPS, CODEX_TABS, type CodexEntry, type CodexKind } from "../codex.ts";
import { useApp } from "../store.tsx";
import { CloseIcon, FilterIcon, SearchIcon, cx } from "../ui.tsx";

const DEFAULT_RECENT = ["안뜨기", "겉뜨기", "린넨"];

export function CodexScreen({ id }: { id?: string }) {
  const entry = CODEX.find((item) => item.id === id);
  if (entry) return <CodexDetail entry={entry} />;
  return <CodexBrowse />;
}

function CodexBrowse() {
  const { push } = useApp();
  const [kind, setKind] = useState<CodexKind>("yarn");
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
