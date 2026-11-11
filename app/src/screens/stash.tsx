import { CODEX_POSTS, REVIEWS, ballsLabel } from "../data.ts";
import { useApp } from "../store.tsx";
import { ClockIcon, HeartIcon, MinusIcon, PinIcon, PlusIcon, UnderlineTabs } from "../ui.tsx";
import type { ReactNode } from "react";

const YARN_DOTS: Record<string, string> = {
  "더스티 핑크": "#e8b7b0",
  "헤더 그레이": "#a39e99",
  로즈: "#e7b7b2",
  "베이비 핑크": "#f3b6c0",
  샌드: "#e6d3b4",
};

function yarnDot(color: string) {
  return YARN_DOTS[color] ?? "#dddddd";
}

export function YarnScreen({ id }: { id: string }) {
  const { data, setBagTab, goTab, setBalls } = useApp();
  const yarn = data.yarns.find((item) => item.id === id);
  if (!yarn) return <p className="px-6 py-16 text-center text-[14px]">실을 찾지 못했어요.</p>;
  return (
    <div className="pb-10">
      <div className="mt-1">
        <UnderlineTabs
          value="yarn"
          options={[
            { id: "projects", label: "프로젝트" },
            { id: "done", label: "완성작" },
            { id: "yarn", label: "실장고" },
            { id: "needles", label: "바늘 창고" },
          ]}
          onChange={(tab) => {
            setBagTab(tab);
            goTab("bag");
          }}
        />
      </div>
      <div className="px-5 pt-4">
        <div className="relative mx-auto w-52">
          <img src={yarn.image} alt="" className="aspect-square w-full rounded-lg object-cover object-center" />
          <span className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-[12px] shadow-card">
            <i className="h-2 w-2 rounded-full" style={{ background: yarnDot(yarn.colorName) }} />
            {yarn.colorName}
          </span>
        </div>
        <h2 className="mt-4 text-center text-[20px] font-bold">{yarn.name}</h2>
        <p className="text-center text-[12px] text-[#999]">{yarn.lot}</p>
        <section className="mt-5 rounded-lg border border-[#f0f0f0] px-4 py-4">
          <p className="text-center text-[13px] text-[#888]">남은 수량</p>
          <div className="mt-2 flex items-center justify-between">
            <Round onClick={() => setBalls(yarn.id, yarn.balls - 0.5)} label="수량 줄이기">
              <MinusIcon className="h-4 w-4" />
            </Round>
            <p className="text-center text-[20px] font-bold">{formatBalls(yarn.balls)} 볼 남음</p>
            <Round onClick={() => setBalls(yarn.id, yarn.balls + 0.5)} label="수량 늘리기" pink>
              <PlusIcon className="h-4 w-4" />
            </Round>
          </div>
        </section>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Spec icon={<ClockIcon />} value={yarn.material} label="소재" />
          <Spec icon={<ClockIcon />} value={yarn.weight} label="무게" />
          <Spec icon={<ClockIcon />} value={yarn.length} label="길이" />
          <Spec icon={<ClockIcon />} value={yarn.needle} label="권장 바늘" />
        </div>
        <section className="mt-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
          <p className="text-[12px] text-[#999]">보관 위치</p>
          <p className="flex items-center gap-1 font-bold"><PinIcon /> {yarn.place}</p>
        </section>
        <section className="memo-lines mt-3 rounded-lg border border-[#f0f0f0] border-l-4 border-l-blush px-4 py-3">
          <p className="text-[12px] text-[#999]">메모</p>
          <p className="whitespace-pre-wrap text-[14px] leading-7">{yarn.memo}</p>
        </section>
        <ShopCard name={yarn.shop} url={yarn.shopUrl} />
      </div>
    </div>
  );
}

export function NeedleScreen({ id }: { id: string }) {
  const { data, setBagTab, goTab } = useApp();
  const needle = data.needles.find((item) => item.id === id);
  if (!needle) return <p className="px-6 py-16 text-center text-[14px]">바늘을 찾지 못했어요.</p>;
  return (
    <div className="pb-10">
      <div className="mt-1">
        <UnderlineTabs
          value="needles"
          options={[
            { id: "projects", label: "프로젝트" },
            { id: "done", label: "완성작" },
            { id: "yarn", label: "실장고" },
            { id: "needles", label: "바늘 창고" },
          ]}
          onChange={(tab) => {
            setBagTab(tab);
            goTab("bag");
          }}
        />
      </div>
      <div className="px-5 pt-4">
        <div className="relative mx-auto w-52">
          <img src={needle.image} alt="" className="aspect-square w-full rounded-lg object-cover object-center" />
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-[12px] shadow-card">
            {needle.brandLine}
          </span>
        </div>
        <h2 className="mt-4 text-center text-[20px] font-bold">{needle.name}</h2>
        <p className="text-center text-[12px] text-[#999]">{needle.lot}</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <Spec icon={<ClockIcon />} value={needle.size} label="사이즈" />
          <Spec icon={<ClockIcon />} value={needle.material} label="소재" />
          <Spec icon={<ClockIcon />} value={needle.kind} label="종류" />
          <Spec icon={<ClockIcon />} value={needle.cable} label="케이블" />
        </div>
        <section className="mt-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
          <p className="text-[12px] text-[#999]">보관 위치</p>
          <p className="flex items-center gap-1 font-bold"><PinIcon /> {needle.place}</p>
        </section>
        <section className="memo-lines mt-3 rounded-lg border border-[#f0f0f0] border-l-4 border-l-blush px-4 py-3">
          <p className="text-[12px] text-[#999]">메모</p>
          <p className="whitespace-pre-wrap text-[14px] leading-7">{needle.memo}</p>
        </section>
        <ShopCard name={needle.shop} url={needle.shopUrl} />
      </div>
    </div>
  );
}

export function CodexScreen({ id }: { id: string }) {
  const yarn = useApp().data.yarns.find((item) => item.id === id) ?? useApp().data.yarns[0];
  if (!yarn) return null;
  return (
    <div className="pb-12">
      <div className="px-5 pt-2 text-center">
        <img src={yarn.image} alt="" className="mx-auto aspect-square w-40 rounded-lg object-cover object-top" />
        <h2 className="mt-3 text-[20px] font-bold">{yarn.name}</h2>
        <p className="text-[12px] text-[#999]">{yarn.lot}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 px-4">
        <Spec icon={<ClockIcon />} value={yarn.material} label="소재" />
        <Spec icon={<ClockIcon />} value={yarn.weight} label="무게" />
        <Spec icon={<ClockIcon />} value={yarn.length} label="길이" />
        <Spec icon={<ClockIcon />} value={yarn.needle} label="권장 바늘" />
      </div>
      <section className="px-4 pt-6">
        <h3 className="text-[16px] font-bold">실 후기</h3>
        <p className="text-[12px] text-[#999]">실 사용자 & 편집점 중심</p>
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {REVIEWS.map((review) => (
            <article key={review.name} className="w-64 shrink-0 rounded-lg bg-[#f7f7f7] p-4">
              <p className="text-[13px] font-bold">
                {review.name} <Stars count={review.stars} />
              </p>
              <p className="mt-2 text-[13px] leading-relaxed">{review.body}</p>
              <p className="mt-3 flex items-center gap-1 text-[12px] text-[#999]"><CommentMark /> {review.comments}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pt-6">
        <h3 className="text-[16px] font-bold">뜨개 커뮤니티 공유</h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {CODEX_POSTS.map((post) => (
            <article key={post.team} className="overflow-hidden rounded-lg bg-[#f7f7f7]">
              <img src={post.image} alt="" className="h-28 w-full object-cover" />
              <div className="p-3">
                <p className="text-[12px] font-bold">{post.team}</p>
                <p className="mt-1 text-[12px] leading-snug">{post.body}</p>
                <p className="mt-2 text-[11px] text-[#888]">{post.tags.join(" ")}</p>
                <p className="mt-1 flex items-center gap-1 text-[12px] text-blush"><HeartIcon filled /> {post.likes}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="px-4 pt-6">
        <h3 className="text-[16px] font-bold">지금 바로 구매</h3>
        <a href={yarn.shopUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center justify-between rounded-lg border border-[#eee] px-4 py-3">
          <span>
            <span className="block text-[12px] text-[#999]">{yarn.shop}</span>
            <span className="font-bold">{yarn.name}</span>
            <span className="block text-[12px] text-[#888]">{ballsLabel(yarn.balls)} · {yarn.weight}</span>
          </span>
          <span className="rounded-full bg-ink px-3 py-2 text-[12px] text-white">추가 구매</span>
        </a>
      </section>
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="inline-flex gap-0.5 text-blush" aria-label={`별 ${count}개`}>
      {Array.from({ length: count }, (_, index) => (
        <svg key={index} width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden>
          <path d="M6 1.2 7.3 4.3 10.6 4.6 8.1 6.8 8.9 10 6 8.3 3.1 10 3.9 6.8 1.4 4.6 4.7 4.3 6 1.2z" />
        </svg>
      ))}
    </span>
  );
}

function CommentMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
      <path d="M2.2 3.2h9.6v6.2H6.2L3.4 11.6V9.4H2.2V3.2z" />
    </svg>
  );
}

function Spec({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="rounded-[22px] border border-[#f0f0f0] px-3 py-3">
      <p className="text-[16px]">{icon}</p>
      <p className="mt-1 text-[14px] font-bold">{value}</p>
      <p className="text-[12px] text-[#999]">{label}</p>
    </div>
  );
}

function ShopCard({ name, url }: { name: string; url: string }) {
  return (
    <section className="mt-3 flex items-center justify-between rounded-lg border border-[#f0f0f0] px-4 py-3">
      <span>
        <span className="block text-[12px] text-[#999]">상점</span>
        <span className="font-bold">{name}</span>
        <a href={url} target="_blank" rel="noreferrer" className="block text-[12px] text-[#888]">
          {url.replace("http://", "")}
        </a>
      </span>
      <a href={url} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-3 py-2 text-[12px] font-semibold text-white">
        추가 구매
      </a>
    </section>
  );
}

function Round({
  children,
  onClick,
  label,
  pink,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  pink?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={pink ? "grid h-10 w-10 place-items-center rounded-full bg-blush text-xl text-white" : "grid h-10 w-10 place-items-center rounded-full bg-[#f2f2f2] text-xl"}
    >
      {children}
    </button>
  );
}

function formatBalls(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
