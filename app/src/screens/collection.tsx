import { useMemo, useState } from "react";
import { media } from "../data.ts";
import { useApp } from "../store.tsx";
import { ChevronRight, FilterIcon, PencilIcon, PlusIcon, SearchIcon, cx } from "../ui.tsx";

type Fiber = "코튼" | "린넨" | "울" | "폴리에스터" | "나일론";

type PatternCard = {
  id: string;
  title: string;
  blurb: string;
  image: string;
  fiber: Fiber;
  maker: string;
  recent?: boolean;
  popular?: boolean;
  description: string;
  parts: { name: string; note: string }[];
  photos: string[];
  tutorial: string;
};

const FIBERS: { id: Fiber; image: string }[] = [
  { id: "코튼", image: media("media/swatch-pink.jpg") },
  { id: "린넨", image: media("media/swatch-linen.jpg") },
  { id: "울", image: media("media/swatch-wool.jpg") },
  { id: "폴리에스터", image: media("media/swatch-rose.jpg") },
  { id: "나일론", image: media("media/swatch-gray.jpg") },
];

const PATTERNS: PatternCard[] = [
  {
    id: "cardigan",
    title: "그라니 가디건",
    blurb: "모티브를 이어 만든 가디건.",
    image: media("media/cardigan.jpg"),
    fiber: "코튼",
    maker: "김뜨개",
    recent: true,
    description:
      "코바늘 모티브를 따로 떠서 하나로 잇는 가디건이에요. 사각 모서리의 사슬 수를 같게 맞추고, 색을 바꿔 가며 몸통과 소매를 채운 뒤 이음선만 정리하면 형태가 나와요.",
    parts: [
      { name: "목", note: "부드러운 둘레" },
      { name: "소매", note: "깔끔한 곡선" },
      { name: "몸통", note: "모티브 반복" },
      { name: "연결", note: "이음선 정리" },
    ],
    photos: [media("media/swatch-gray.jpg"), media("media/needle-wood.jpg"), media("media/news-knit.jpg")],
    tutorial: media("media/swatch-linen.jpg"),
  },
  {
    id: "sweater",
    title: "풀오버 스웨터",
    blurb: "둥근 목으로 떠 올리는 스웨터.",
    image: media("media/pattern-sweater.jpg"),
    fiber: "울",
    maker: "김뜨개",
    popular: true,
    description:
      "가터와 겉뜨기만으로 몸통과 소매를 따로 떠 합치는 스웨터예요. 기법보다 치수와 게이지에 집중하면서, 조각을 어깨에서 이어 한 벌로 만드는 순서를 연습해요.",
    parts: [
      { name: "목", note: "고무단 둘레" },
      { name: "소매", note: "좁혀 올리는 단" },
      { name: "몸통", note: "앞뒤 같은 코" },
      { name: "연결", note: "어깨 이음" },
    ],
    photos: [media("media/swatch-wool.jpg"), media("media/yarn-pink.jpg"), media("media/swatch-gray.jpg")],
    tutorial: media("media/swatch-wool.jpg"),
  },
  {
    id: "beanie",
    title: "노란 비니",
    blurb: "접어 입는 모자.",
    image: media("media/pop-beanie.jpg"),
    fiber: "울",
    maker: "김미니",
    popular: true,
    description: "고무단을 길게 떠 접어 입고, 몸통을 둥글게 올린 뒤 정수리에서 코를 줄여 모아요. 머리 둘레에서 조금 여유를 빼면 딱 맞아요.",
    parts: [
      { name: "둘레", note: "접는 고무단" },
      { name: "몸통", note: "같은 코 수" },
      { name: "정수리", note: "고르게 줄이기" },
      { name: "마무리", note: "실 정리" },
    ],
    photos: [media("media/pop-beanie.jpg"), media("media/swatch-wool.jpg"), media("media/yarn-pink.jpg")],
    tutorial: media("media/swatch-gray.jpg"),
  },
  {
    id: "coat",
    title: "롱 코트",
    blurb: "칼라가 있는 겉옷.",
    image: media("media/coat.jpg"),
    fiber: "울",
    maker: "이현수",
    popular: true,
    description: "굵은 울로 형태를 잡는 코트예요. 몸통을 먼저 길게 뜨고, 칼라와 앞여밈, 주머니는 코 수를 나눠 이어서 떠요.",
    parts: [
      { name: "칼라", note: "접어 세우는 단" },
      { name: "소매", note: "통통한 둘레" },
      { name: "몸통", note: "긴 단" },
      { name: "여밈", note: "단추 자리" },
    ],
    photos: [media("media/coat.jpg"), media("media/swatch-wool.jpg"), media("media/needles.jpg")],
    tutorial: media("media/swatch-wool.jpg"),
  },
  {
    id: "socks",
    title: "겨울 양말",
    blurb: "뒤꿈치와 발끝을 이은 양말.",
    image: media("media/pop-sock.jpg"),
    fiber: "울",
    maker: "이현수",
    description: "발목부터 둥글게 떠 뒤꿈치에서 코를 줄였다 늘리고, 발등과 발끝을 이어 마무리해요. 두 짝의 단 수를 같게 적어두면 짝이 맞아요.",
    parts: [
      { name: "발목", note: "고무단" },
      { name: "뒤꿈치", note: "줄였다 늘리기" },
      { name: "발등", note: "겉뜨기" },
      { name: "발끝", note: "코 모으기" },
    ],
    photos: [media("media/pop-sock.jpg"), media("media/proj-socks.jpg"), media("media/swatch-wool.jpg")],
    tutorial: media("media/swatch-gray.jpg"),
  },
  {
    id: "mittens",
    title: "컬러 장갑",
    blurb: "엄지를 따로 뜬 장갑.",
    image: media("media/pop-mittens.jpg"),
    fiber: "울",
    maker: "이현수",
    description: "손바닥을 작은 둘레로 뜨다가 엄지 자리를 남겨 두고, 나중에 그 코를 집어 엄지를 이어 떠요.",
    parts: [
      { name: "손목", note: "신축 단" },
      { name: "손바닥", note: "엄지 구멍" },
      { name: "손가락", note: "끝을 줄이기" },
      { name: "엄지", note: "따로 잇기" },
    ],
    photos: [media("media/pop-mittens.jpg"), media("media/swatch-pink.jpg"), media("media/needle-wood.jpg")],
    tutorial: media("media/swatch-pink.jpg"),
  },
  {
    id: "linen",
    title: "린넨 티",
    blurb: "시원한 여름 상의.",
    image: media("media/swatch-linen.jpg"),
    fiber: "린넨",
    maker: "김뜨개",
    description: "마 실의 까슬한 결을 살려 성기게 뜨는 여름 티예요. 처음엔 뻣뻣해도 입을수록 부드러워지고, 구김이 그대로 분위기가 돼요.",
    parts: [
      { name: "목", note: "얕은 라운드" },
      { name: "소매", note: "짧은 단" },
      { name: "몸통", note: "여유 있는 폭" },
      { name: "밑단", note: "말림 방지" },
    ],
    photos: [media("media/swatch-linen.jpg"), media("media/needle-wood.jpg"), media("media/swatch-gray.jpg")],
    tutorial: media("media/swatch-linen.jpg"),
  },
  {
    id: "nylon",
    title: "나일론 베스트",
    blurb: "가벼운 겹쳐 입기.",
    image: media("media/swatch-gray.jpg"),
    fiber: "나일론",
    maker: "김미니",
    description: "나일론이 섞여 가볍고 잘 늘어나지 않는 베스트예요. 셔츠 위에 걸치도록 품을 조금 여유 있게 떠요.",
    parts: [
      { name: "목", note: "얕은 V" },
      { name: "암홀", note: "매끈한 곡선" },
      { name: "몸통", note: "짧은 기장" },
      { name: "밑단", note: "고무단" },
    ],
    photos: [media("media/swatch-gray.jpg"), media("media/needles.jpg"), media("media/news-yarn.jpg")],
    tutorial: media("media/swatch-gray.jpg"),
  },
  {
    id: "blanket",
    title: "포근 담요",
    blurb: "기모가 있는 무릎 담요.",
    image: media("media/pop-blanket.jpg"),
    fiber: "폴리에스터",
    maker: "가민",
    description: "수면사처럼 기모가 있는 실로 넓게 뜨는 담요예요. 무늬는 단순하게 두고, 너무 촘촘히 뜨지 않아야 숨구멍이 남아요.",
    parts: [
      { name: "시작", note: "네모 바닥" },
      { name: "단", note: "같은 코 수" },
      { name: "모서리", note: "늘어짐 없이" },
      { name: "테두리", note: "한 단 마감" },
    ],
    photos: [media("media/pop-blanket.jpg"), media("media/swatch-rose.jpg"), media("media/yarn-pink.jpg")],
    tutorial: media("media/swatch-rose.jpg"),
  },
  {
    id: "bag",
    title: "코튼 토트",
    blurb: "바닥부터 세운 가방.",
    image: media("media/proj-bag.jpg"),
    fiber: "코튼",
    maker: "김뜨개",
    description: "면실을 조밀하게 떠 힘을 받는 가방이에요. 바닥은 코를 늘려 평평하게 두고, 옆면은 곧게 세운 뒤 손잡이를 달아요.",
    parts: [
      { name: "바닥", note: "평평한 원" },
      { name: "옆면", note: "늘리기 멈춤" },
      { name: "입구", note: "단단한 단" },
      { name: "손잡이", note: "조밀한 코" },
    ],
    photos: [media("media/proj-bag.jpg"), media("media/swatch-pink.jpg"), media("media/needle-eti.jpg")],
    tutorial: media("media/swatch-pink.jpg"),
  },
];

export function CollectionScreen({ id }: { id?: string }) {
  const pattern = PATTERNS.find((item) => item.id === id);
  if (pattern) return <PatternDetail pattern={pattern} />;
  return <CollectionBrowse />;
}

function CollectionBrowse() {
  const { push } = useApp();
  const [query, setQuery] = useState("");
  const [fiber, setFiber] = useState<Fiber | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const needle = query.trim();
  const items = useMemo(
    () =>
      PATTERNS.filter((item) => {
        if (fiber && item.fiber !== fiber) return false;
        if (!needle) return true;
        return `${item.title} ${item.blurb} ${item.fiber}`.includes(needle);
      }),
    [fiber, needle],
  );
  const recent = items.find((item) => item.recent) ?? items[0];
  const all = items.filter((item) => item.id !== recent?.id);
  const popular = items.filter((item) => item.popular);

  return (
    <div className="relative pb-16">
      <div className="relative px-4 pt-2">
        <div className="flex items-center gap-2">
          <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#ececec] bg-white px-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="실 이름을 검색해보세요."
              aria-label="도안 검색"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-[#b0b0b0]"
            />
            <SearchIcon />
          </label>
          <button
            type="button"
            aria-label="필터"
            aria-expanded={filterOpen}
            onClick={() => setFilterOpen((open) => !open)}
            className={cx(
              "grid h-11 w-11 shrink-0 place-items-center rounded-full border",
              filterOpen || fiber ? "border-ink bg-ink text-white" : "border-[#e6e6e6] bg-white text-[#666]",
            )}
          >
            <FilterIcon />
          </button>
        </div>
        {filterOpen ? (
          <div className="absolute right-4 top-14 z-20 w-36 overflow-hidden rounded-2xl border border-[#eee] bg-white py-1 shadow-card">
            <button type="button" onClick={() => { setFiber(null); setFilterOpen(false); }} className={cx("block w-full px-4 py-2.5 text-left text-[13px]", fiber === null && "font-bold")}>
              전체
            </button>
            {FIBERS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => { setFiber(item.id); setFilterOpen(false); }}
                className={cx("block w-full px-4 py-2.5 text-left text-[13px]", fiber === item.id && "font-bold")}
              >
                {item.id}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <section className="px-4 pt-5">
        <h2 className="text-[16px] font-bold">카테고리</h2>
        <ul className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {FIBERS.map((item) => {
            const on = fiber === item.id;
            return (
              <li key={item.id}>
                <button type="button" onClick={() => setFiber(on ? null : item.id)} className="w-16 text-center text-[12px]">
                  <img src={item.image} alt="" className={cx("h-16 w-16 rounded-full object-cover", on && "ring-2 ring-ink ring-offset-2")} />
                  <span className="mt-1 block">{item.id}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {recent ? (
        <section className="px-4 pt-6">
          <p className="text-[12px] text-[#999]">최근 사용</p>
          <h2 className="text-[18px] font-bold">가장 최근에 사용한 도안</h2>
          <button type="button" onClick={() => push({ name: "collection", id: recent.id })} className="mt-3 block w-full text-left">
            <img src={recent.image} alt="" className="aspect-[16/10] w-full rounded-lg object-cover" />
            <span className="mt-2 block text-[15px] font-bold">{recent.title}</span>
          </button>
        </section>
      ) : null}

      <section className="relative px-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-bold">모든 도안</h2>
          <button type="button" onClick={() => setFiber(null)} className="text-[13px] text-[#999]">
            더 보기
          </button>
        </div>
        {all.length === 0 ? (
          <p className="py-10 text-center text-[14px] text-[#888]">해당하는 도안이 없어요.</p>
        ) : (
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {all.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => push({ name: "collection", id: item.id })} className="w-full text-left">
                  <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                  <span className="mt-2 block text-[14px] font-bold">{item.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-snug text-[#888]">{item.blurb}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          aria-label="이 도안으로 프로젝트 만들기"
          onClick={() => push({ name: "project-form" })}
          className="absolute right-3 top-24 grid h-12 w-12 place-items-center rounded-full bg-blush text-white shadow-card"
        >
          <PencilIcon />
        </button>
      </section>

      {popular.length > 0 ? (
        <section className="pt-7">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-[18px] font-bold">지금 인기</h2>
            <ChevronRight />
          </div>
          <p className="px-4 text-[12px] text-[#999]">지금 주목받고 있는 도안을 살펴보세요.</p>
          <ul className="mt-3 flex gap-3 overflow-x-auto px-4 pb-2">
            {popular.map((item) => (
              <li key={item.id} className="w-36 shrink-0">
                <button type="button" onClick={() => push({ name: "collection", id: item.id })} className="w-full text-left">
                  <img src={item.image} alt="" className="aspect-[3/4] w-full rounded-lg object-cover" />
                  <span className="mt-2 block text-[14px] font-bold">{item.title}</span>
                  <span className="block text-[12px] text-[#888]">{item.fiber}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function PatternDetail({ pattern }: { pattern: PatternCard }) {
  const { push, data, notify } = useApp();
  const [menu, setMenu] = useState(false);
  const [added, setAdded] = useState(false);
  const projectId = data.projects[0]?.id;
  return (
    <article className="pb-12">
      <img src={pattern.image} alt="" className="aspect-[4/3] w-full object-cover" />
      <div className="flex items-center gap-3 px-4 pt-4">
        <img src={media("media/news-hands.jpg")} alt="" className="h-14 w-14 rounded-full object-cover object-top" />
        <div className="min-w-0 flex-1">
          <p className="text-[12px] text-[#999]">제작자</p>
          <p className="text-[16px] font-bold">{pattern.maker}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => projectId && push({ name: "navi", id: projectId })}
          className="h-9 rounded-full bg-blush px-4 text-[13px] font-semibold text-white"
        >
          뜨개내비
        </button>
        <button type="button" aria-label="더보기" onClick={() => setMenu((open) => !open)} className="grid h-9 w-9 place-items-center rounded-full bg-[#f4f4f4]">
          <span className="text-[16px] tracking-widest">···</span>
        </button>
      </div>
      {menu ? (
        <div className="mx-4 mt-2 overflow-hidden rounded-lg border border-[#eee]">
          <button type="button" onClick={() => push({ name: "project-form" })} className="block w-full px-4 py-3 text-left text-[14px]">
            이 도안으로 프로젝트 만들기
          </button>
        </div>
      ) : null}

      <ul className="mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
        {pattern.parts.map((part) => (
          <li key={part.name} className="w-24 shrink-0">
            <p className="text-[14px] font-bold">{part.name}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-[#888]">{part.note}</p>
          </li>
        ))}
        <li className="grid w-8 shrink-0 place-items-center text-[#ccc]">
          <ChevronRight />
        </li>
      </ul>

      <section className="px-4 pt-6">
        <h2 className="text-[18px] font-bold">도안 설명</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#333]">{pattern.description}</p>
      </section>

      <ul className="mt-4 flex gap-2 overflow-x-auto px-4">
        {pattern.photos.map((photo) => (
          <li key={photo} className="w-40 shrink-0">
            <img src={photo} alt="" className="aspect-[4/3] w-full rounded-lg object-cover" />
          </li>
        ))}
      </ul>

      <section className="mt-6 flex items-center justify-between px-4">
        <h2 className="text-[16px] font-bold">뜨개 풀착장 입기</h2>
        <button
          type="button"
          onClick={() => {
            setAdded(true);
            notify("풀착장에 추가했어요");
          }}
          className="inline-flex items-center gap-1 text-[14px] font-semibold"
        >
          {added ? "추가됨" : "추가"} <PlusIcon className="h-4 w-4" />
        </button>
      </section>

      <section className="px-4 pt-5">
        <h2 className="text-[18px] font-bold">튜토리얼</h2>
        <img src={pattern.tutorial} alt="" className="mt-3 aspect-[4/3] w-full rounded-lg object-cover" />
      </section>
    </article>
  );
}
