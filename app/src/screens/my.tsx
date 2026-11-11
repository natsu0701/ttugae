import type { ReactNode } from "react";
import { PRODUCTS } from "../data.ts";
import { useApp } from "../store.tsx";
import type { ToolKind, UnitSystem } from "../types.ts";
import { ChevronRight, FigmaIcon, GearIcon, Mascot, cx } from "../ui.tsx";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const MARKS: Record<number, "heart" | "star" | "check"> = {
  2: "heart",
  4: "star",
  8: "check",
  11: "heart",
  15: "star",
  18: "check",
};

const STAMPS = [
  { name: "첫 만남", on: true },
  { name: "한 땀의 정성", on: true },
  { name: "게이지 장인", on: true },
  { name: "프로 다작러", on: false },
  { name: "문야의 시작", on: false },
  { name: "라운지 개근러", on: true },
  { name: "도안술사", on: false },
  { name: "마법의 완성", on: false },
  { name: "철저한 기록가", on: true },
];

export function MyScreen() {
  const { data, patch, push, goTab, replace, setHomeTab, setLoungeTab, openSheet } = useApp();
  const units: { id: UnitSystem; label: string }[] = [
    { id: "metric", label: "미터법" },
    { id: "imperial", label: "영미식" },
  ];
  const tools: ToolKind[] = ["코바늘", "대바늘", "손뜨개"];
  const minutes = Math.floor(data.projects.reduce((sum, project) => sum + project.elapsed, 0) / 60);
  const level = data.level ?? "입문자";

  return (
    <div className="pb-8">
      <div className="flex h-12 items-center px-2">
        <span className="w-10" />
        <h1 className="flex-1 text-center text-[17px] font-bold">마이페이지</h1>
        <button
          type="button"
          aria-label="설정"
          onClick={() => document.getElementById("my-settings")?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="grid h-10 w-10 place-items-center"
        >
          <GearIcon />
        </button>
      </div>

      <button type="button" onClick={() => push({ name: "skill" })} className="flex w-full items-center gap-3 border-b border-[#f2f2f2] px-4 py-3 text-left">
        <Mascot className="h-14 w-14 shrink-0 rounded-full bg-[#f6f6f6]" mood="cheer" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-blush px-2 py-0.5 text-[11px] font-semibold text-white">{level}</span>
            <span className="truncate text-[16px] font-bold">{data.nickname}</span>
          </span>
          <span className="mt-1 block text-[12px] text-[#999]">#12345678 · 프로젝트 {data.projects.length}</span>
        </span>
        <ChevronRight />
      </button>

      <div className="grid grid-cols-4 gap-2 px-4 py-4 text-center">
        <Shortcut icon="bag" label="장바구니" onClick={() => { setHomeTab("market"); goTab("home"); }} />
        <Shortcut icon="heart" label="관심 목록" onClick={() => push({ name: "likes" })} />
        <Shortcut icon="clock" label="최근 본 글" onClick={() => { setLoungeTab("works"); goTab("lounge"); }} />
        <Shortcut icon="mail" label="내 댓글" onClick={() => { setLoungeTab("qa"); goTab("lounge"); }} />
      </div>

      <section className="mx-4 rounded-lg border border-[#f0f0f0] px-4 py-4 text-center">
        <p className="text-[12px] text-[#999]">추천</p>
        <p className="mt-1 text-[16px] font-bold text-blush">나의 뜨개 레벨 확인하기</p>
        <p className="mt-1 text-[12px] text-[#888]">간단하게 나의 실력을 점검받아 보세요.</p>
        <button type="button" onClick={() => push({ name: "skill" })} className="mt-3 h-11 w-full rounded-full bg-ink text-[14px] font-semibold text-white">
          지금 확인하러 가기
        </button>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {["입문뜨개러", "뜨개 중수", "뜨개 고수"].map((tag) => (
            <button key={tag} type="button" onClick={() => patch({ level: tag })} className="rounded-full bg-[#f4f4f4] px-3 py-1 text-[12px] text-[#666]">
              #{tag}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-4 mt-4 rounded-lg bg-[#ffe8ea] px-3 py-4">
        <div className="mb-2 flex items-center justify-center gap-6 text-[14px] font-semibold">
          <span className="text-[#e7a0ab]">‹</span>
          <span>2025년 1월</span>
          <span className="text-[#e7a0ab]">›</span>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] text-[#c98490]">
          {DAYS.map((day) => (
            <span key={day} className="py-1">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 text-center text-[12px]">
          {Array.from({ length: 3 }, (_, index) => (
            <span key={`pad-${index}`} />
          ))}
          {Array.from({ length: 31 }, (_, index) => {
            const day = index + 1;
            const mark = MARKS[day];
            return (
              <span key={day} className="flex h-8 flex-col items-center justify-center text-[#7a4d55]">
                {mark === "heart" ? <FigmaIcon name="heart" className="h-3.5 w-3.5 text-blush" /> : null}
                {mark === "star" ? <FigmaIcon name="star" className="h-3.5 w-3.5 text-[#f0b429]" /> : null}
                {mark === "check" ? <FigmaIcon name="check" className="h-3.5 w-3.5 text-blush" /> : null}
                {mark ? null : day}
              </span>
            );
          })}
        </div>
      </section>

      <section className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
        <Mascot className="h-14 w-14" mood="cheer" />
        <div>
          <p className="text-[12px] font-semibold text-blush">연속 뜨개 기록</p>
          <p className="text-[18px] font-bold">0일 연속 달성!</p>
        </div>
      </section>

      <section className="mx-4 mt-3 grid grid-cols-2 rounded-lg border border-[#f0f0f0] py-4 text-center">
        <div>
          <p className="text-[12px] text-[#999]">오늘 한 작업</p>
          <p className="mt-1 text-[22px] font-bold">{data.projects.filter((project) => project.running).length}개</p>
        </div>
        <div className="border-l border-[#f0f0f0]">
          <p className="text-[12px] text-[#999]">뜨개한 시간</p>
          <p className="mt-1 text-[22px] font-bold">{minutes}분</p>
        </div>
      </section>

      <section className="mx-4 mt-4">
        <h2 className="text-[14px] font-bold">최근 7일 뜨개 기록</h2>
        <svg viewBox="0 0 280 72" className="mt-2 h-16 w-full" aria-hidden>
          <polyline fill="none" stroke="#f3b6c4" strokeWidth="2" points="16,48 58,48 100,40 142,48 184,36 226,48 264,44" />
          {[16, 58, 100, 142, 184, 226, 264].map((x, index) => (
            <circle key={x} cx={x} cy={[48, 48, 40, 48, 36, 48, 44][index]} r="3.5" fill="#f3b6c4" />
          ))}
        </svg>
        <div className="grid grid-cols-7 text-center text-[11px] text-[#bbb]">
          {DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[16px] font-bold">판매 물품 {PRODUCTS.length}</h2>
          <button type="button" aria-label="마켓으로" onClick={() => { setHomeTab("market"); goTab("home"); }}>
            <ChevronRight />
          </button>
        </div>
        <ul className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {PRODUCTS.map((item) => (
            <li key={item.id} className="w-28 shrink-0">
              <button type="button" onClick={() => push({ name: "product", id: item.id })} className="w-full text-left">
                <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug">{item.title}</p>
                <p className="text-[12px] font-bold">{item.price}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-4 mt-4 rounded-lg bg-[#ffe8ea] px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[16px] font-bold">업적</h2>
          <span className="text-[12px] text-[#c98490]">대표 업적</span>
        </div>
        <ul className="grid grid-cols-3 gap-3 text-center">
          {STAMPS.map((stamp) => (
            <li key={stamp.name} className={cx("text-[11px]", stamp.on ? "text-[#7a4d55]" : "opacity-40 grayscale")}>
              <Mascot className="mx-auto h-14 w-14" mood={stamp.on ? "cheer" : "wave"} />
              <p className="mt-1">{stamp.name}</p>
            </li>
          ))}
        </ul>
      </section>

      <Menu title="나의 거래">
        <MenuRow icon="document" label="판매 관리" onClick={() => { setHomeTab("market"); goTab("home"); }} />
        <MenuRow icon="bag" label="구매 내역" onClick={() => { setHomeTab("market"); goTab("home"); }} />
      </Menu>
      <Menu title="나의 활동">
        <MenuRow icon="pencil" label="내 게시물" onClick={() => { setLoungeTab("works"); goTab("lounge"); }} />
        <MenuRow icon="mail" label="내 댓글" onClick={() => { setLoungeTab("qa"); goTab("lounge"); }} />
        <MenuRow icon="heart" label="저장한 글" onClick={() => push({ name: "likes" })} />
        <MenuRow icon="profile" label="뜨개 모임" onClick={() => goTab("lounge")} />
      </Menu>
      <Menu title="고객 지원">
        <MenuRow icon="info" label="공지사항" onClick={() => push({ name: "notifications" })} />
        <MenuRow icon="mail" label="고객센터" onClick={() => push({ name: "chat" })} />
        <MenuRow icon="pencil" label="의견 남기기" onClick={() => push({ name: "chat" })} />
        <MenuRow
          icon="document"
          label="약관 및 정책"
          onClick={() => openSheet({ kind: "info", title: "약관 및 정책", body: "이 화면은 뜨개 연습용 프로토타입이에요. 계정과 결제 정보는 저장하지 않아요." })}
        />
      </Menu>

      <section id="my-settings" className="mx-4 mt-4 rounded-lg border border-[#f0f0f0] px-4 py-4">
        <h2 className="text-[16px] font-bold">뜨개 설정</h2>
        <button type="button" onClick={() => push({ name: "skill" })} className="mt-3 flex h-11 w-full items-center justify-between text-left text-[14px] font-semibold">
          실력 다시 재기
          <ChevronRight />
        </button>
        <p className="mt-3 text-[13px] font-bold">단위</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {units.map((unit) => (
            <button
              key={unit.id}
              type="button"
              onClick={() => patch({ unit: unit.id })}
              className={cx("h-11 rounded-lg border text-[14px]", data.unit === unit.id ? "border-blush bg-blush-soft font-semibold" : "border-[#eee]")}
            >
              {unit.label}
            </button>
          ))}
        </div>
        <p className="mt-4 text-[13px] font-bold">주로 쓰는 도구</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={() => patch({ tool })}
              className={cx("h-11 rounded-lg border text-[13px]", data.tool === tool ? "border-blush bg-blush-soft font-semibold" : "border-[#eee]")}
            >
              {tool}
            </button>
          ))}
        </div>
      </section>

      <button type="button" onClick={() => replace({ name: "login" })} className="mx-4 mt-4 h-12 w-[calc(100%-2rem)] rounded-lg bg-[#f6f6f6] text-[14px] font-semibold">
        로그아웃
      </button>
    </div>
  );
}

function Shortcut({ icon, label, onClick }: { icon: "bag" | "heart" | "clock" | "mail"; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[12px]">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-lg border border-[#ececec]">
        <FigmaIcon name={icon} className="h-6 w-6" />
      </span>
      <span className="mt-1 block">{label}</span>
    </button>
  );
}

function Menu({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mx-4 mt-4 rounded-lg border border-[#f0f0f0] px-4 py-2">
      <h2 className="py-2 text-[16px] font-bold">{title}</h2>
      {children}
    </section>
  );
}

function MenuRow({
  icon,
  label,
  onClick,
}: {
  icon: "document" | "bag" | "pencil" | "mail" | "heart" | "profile" | "info";
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center gap-3 border-t border-[#f6f6f6] text-left text-[14px]">
      <FigmaIcon name={icon} className="h-5 w-5 shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight />
    </button>
  );
}
