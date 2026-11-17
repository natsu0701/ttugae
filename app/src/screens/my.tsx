import { useEffect, useState, type ReactNode } from "react";
import { GROUPS, LISTINGS, MY_COMMENTS, MY_POSTS, NOTICES, PURCHASES, media } from "../data.ts";
import { useApp } from "../store.tsx";
import type { ToolKind, UnitSystem } from "../types.ts";
import { BagFillIcon, BellFillIcon, BookmarkFillIcon, ChatFillIcon, ClockFillIcon, CommunityFillIcon, FileTextFillIcon, HeartFillIcon, PencilFillIcon } from "../icons/webFill.tsx";
import { ChevronRight, DragScroll, GearIcon, Mascot, cx } from "../ui.tsx";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];
const CALENDAR_EMOJIS = ["🧶", "❤️", "⭐", "✅", "🌸", "😊", "😢", "😠", "😴", "☕", "🌙", "🌧️", "🔥", "😂", "💪", "🥲"];

function calendarKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function knitShade(seconds: number) {
  if (seconds <= 0) return 0;
  const hours = Math.min(6, Math.max(1, Math.ceil(seconds / 3600)));
  return 0.16 + (hours - 1) * 0.14;
}

function formatKnit(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours && minutes) return `${hours}시간 ${minutes}분`;
  if (hours) return `${hours}시간`;
  return `${minutes}분`;
}

const STAMPS = [
  { name: "첫 바늘의 설렘", how: "첫 프로젝트를 시작하면 받아요.", image: media("badges/badge1.png"), on: true },
  { name: "푸르시오 극복가", how: "풀어 둔 단을 다시 떠서 마무리하면 받아요.", image: media("badges/badge2.png"), on: true },
  { name: "꼬막음 완성", how: "작품 하나를 끝까지 마감하면 받아요.", image: media("badges/badge3.png"), on: true },
  { name: "게이지 계산요정", how: "게이지를 한 번 저장하면 받아요.", image: media("badges/badge4.png"), on: true },
  { name: "배색 가디건 컬렉터", how: "색이 두 가지 이상인 가디건을 완성하면 받아요.", image: media("badges/badge5.png"), on: false },
  { name: "문어발 뜨개질러", how: "진행 중인 프로젝트를 세 개 이상 두면 받아요.", image: media("badges/badge6.png"), on: false },
  { name: "실 보관 마스터", how: "실 창고에 실을 다섯 개 등록하면 받아요.", image: media("badges/badge7.png"), on: true },
  { name: "따뜻한 뜨개라운지 리더", how: "라운지에 작품 글을 남기면 받아요.", image: media("badges/badge8.png"), on: true },
  { name: "뜨니의 소울메이트", how: "뜨니챗에서 대화를 열 번 이어 가면 받아요.", image: media("badges/badge9.png"), on: false },
  { name: "공방 골목대장", how: "뜨개 모임에 세 곳 이상 이름을 올리면 받아요.", image: media("badges/badge10.png"), on: false },
  { name: "한 땀의 예술가", how: "완성작을 다섯 개 모으면 받아요.", image: media("badges/badge11.png"), on: false },
];

export function MyScreen() {
  const { data, push, goTab, replace, openSheet } = useApp();
  const level = data.level ?? "입문자";

  return (
    <div className="pb-8">
      <div className="flex h-12 items-center px-2">
        <span className="w-10" />
        <h1 className="flex-1 text-center text-[17px] font-bold">마이페이지</h1>
        <button
          type="button"
          aria-label="설정"
          onClick={() => push({ name: "profile", section: "settings" })}
          className="grid h-10 w-10 place-items-center"
        >
          <GearIcon />
        </button>
      </div>

      <button type="button" aria-label="내 프로필 더 자세히 보기" onClick={() => push({ name: "profile" })} className="flex w-full items-center gap-3 border-b border-[#f2f2f2] px-4 py-3 text-left">
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
        <Shortcut icon={<BagFillIcon className="h-6 w-6" />} label="장바구니" onClick={() => push({ name: "cart" })} />
        <Shortcut icon={<HeartFillIcon className="h-6 w-6" />} label="관심 목록" onClick={() => push({ name: "likes" })} />
        <Shortcut icon={<ClockFillIcon className="h-6 w-6" />} label="최근 본 글" onClick={() => goTab("lounge", "works")} />
        <Shortcut icon={<ChatFillIcon className="h-6 w-6" />} label="내 댓글" onClick={() => push({ name: "comments" })} />
      </div>

      <section className="mx-4 rounded-lg border border-[#f0f0f0] px-4 py-4 text-center">
        <p className="text-[12px] text-[#999]">추천</p>
        <p className="mt-1 text-[16px] font-bold text-blush">나의 뜨개 레벨 확인하기</p>
        <p className="mt-1 text-[12px] text-[#888]">간단하게 나의 실력을 점검받아 보세요.</p>
        <button type="button" onClick={() => push({ name: "skill" })} className="mt-3 h-11 w-full rounded-full bg-ink text-[14px] font-semibold text-white">
          지금 확인하러 가기
        </button>
      </section>

      <Menu title="나의 거래">
        <MenuRow icon={<FileTextFillIcon className="h-5 w-5" />} label="판매 관리" onClick={() => push({ name: "orders", tab: "sell" })} />
        <MenuRow icon={<BagFillIcon className="h-5 w-5" />} label="구매 내역" onClick={() => push({ name: "orders", tab: "buy" })} />
      </Menu>
      <Menu title="나의 활동">
        <MenuRow icon={<PencilFillIcon className="h-5 w-5" />} label="내 게시물" onClick={() => push({ name: "posts" })} />
        <MenuRow icon={<ChatFillIcon className="h-5 w-5" />} label="내 댓글" onClick={() => push({ name: "comments" })} />
        <MenuRow icon={<BookmarkFillIcon className="h-5 w-5" />} label="저장한 글" onClick={() => push({ name: "likes" })} />
        <MenuRow icon={<CommunityFillIcon className="h-5 w-5" />} label="뜨개 모임" onClick={() => push({ name: "groups" })} />
      </Menu>
      <Menu title="고객 지원">
        <MenuRow icon={<BellFillIcon className="h-5 w-5" />} label="공지사항" onClick={() => push({ name: "notices" })} />
        <MenuRow icon={<ChatFillIcon className="h-5 w-5" />} label="고객센터" onClick={() => openSheet({ kind: "support" })} />
        <MenuRow icon={<ChatFillIcon className="h-5 w-5" />} label="뜨니챗" onClick={() => push({ name: "chat" })} />
        <MenuRow
          icon={<FileTextFillIcon className="h-5 w-5" />}
          label="약관 및 정책"
          onClick={() => openSheet({ kind: "info", title: "약관 및 정책", body: "이 화면은 뜨개 연습용 프로토타입이에요. 계정과 결제 정보는 저장하지 않아요." })}
        />
      </Menu>

      <button type="button" onClick={() => replace({ name: "login" })} className="mx-4 mt-4 h-12 w-[calc(100%-2rem)] rounded-lg bg-[#f6f6f6] text-[14px] font-semibold">
        로그아웃
      </button>
    </div>
  );
}

export function ProfileScreen({ section }: { section?: "settings" }) {
  const { data, patch, push, openSheet } = useApp();
  const units: { id: UnitSystem; label: string }[] = [
    { id: "metric", label: "미터법" },
    { id: "imperial", label: "영미식" },
  ];
  const tools: ToolKind[] = ["코바늘", "대바늘", "손뜨개"];
  const minutes = Math.floor(data.projects.reduce((sum, project) => sum + project.elapsed, 0) / 60);
  const calendarMarks = data.calendarMarks ?? {};
  const knitMinutes = data.knitMinutes ?? {};
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [pickedDay, setPickedDay] = useState<number | null>(null);
  useEffect(() => {
    if (section !== "settings") return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById("my-settings")?.scrollIntoView({ block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [section]);
  const shiftMonth = (delta: number) => {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
    setPickedDay(null);
  };
  const setCalendarMark = (day: number, emoji: string | null) => {
    const key = calendarKey(cursor.year, cursor.month, day);
    const next = { ...calendarMarks };
    if (emoji) next[key] = emoji;
    else delete next[key];
    patch({ calendarMarks: next });
  };
  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const pickedKey = pickedDay ? calendarKey(cursor.year, cursor.month, pickedDay) : "";
  const pickedSeconds = pickedKey ? (knitMinutes[pickedKey] ?? 0) : 0;

  return (
    <div className="pb-8">
      <section className="mx-4 mt-4 rounded-lg bg-[#ffe8ea] px-3 py-4">
        <div className="mb-1 flex items-center justify-center gap-6 text-[14px] font-semibold">
          <button type="button" aria-label="이전 달" onClick={() => shiftMonth(-1)} className="grid h-6 w-6 place-items-center text-[#e7a0ab]">
            ‹
          </button>
          <span>
            {cursor.year}년 {cursor.month + 1}월
          </span>
          <button type="button" aria-label="다음 달" onClick={() => shiftMonth(1)} className="grid h-6 w-6 place-items-center text-[#e7a0ab]">
            ›
          </button>
        </div>
        <p className="mb-1 text-center text-[11px] text-[#c98490]">오래 뜰수록 칸이 진해져요</p>
        <div className="grid grid-cols-7 text-center text-[11px] text-[#c98490]">
          {DAYS.map((day) => (
            <span key={day} className="py-1">{day}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center text-[12px]">
          {Array.from({ length: firstWeekday }, (_, index) => (
            <span key={`pad-${index}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, index) => {
            const day = index + 1;
            const key = calendarKey(cursor.year, cursor.month, day);
            const emoji = calendarMarks[key];
            const seconds = knitMinutes[key] ?? 0;
            const shade = knitShade(seconds);
            const selected = pickedDay === day;
            return (
              <button
                key={day}
                type="button"
                aria-label={[`${day}일`, emoji, seconds ? formatKnit(seconds) : ""].filter(Boolean).join(" ")}
                aria-pressed={selected}
                onClick={() => setPickedDay(selected ? null : day)}
                className="flex h-14 flex-col items-center justify-center gap-0.5 rounded-md text-[#7a4d55]"
                style={shade ? { backgroundColor: `rgba(176, 48, 82, ${shade})` } : undefined}
              >
                <span className={cx("grid h-5 w-5 place-items-center rounded-full text-[12px] leading-none", (selected || shade > 0) && "bg-white font-bold")}>{day}</span>
                <span className="flex h-7 items-center justify-center text-[24px] leading-none">{emoji ?? ""}</span>
              </button>
            );
          })}
        </div>
        {pickedDay ? (
          <div className="mt-3 rounded-lg bg-white/80 px-2 py-3">
            <p className="text-center text-[13px] font-semibold text-[#7a4d55]">{pickedDay}일에 이모티콘</p>
            {pickedSeconds ? <p className="mt-0.5 text-center text-[12px] text-[#a56a76]">이 날 {formatKnit(pickedSeconds)}</p> : null}
            <div className="mt-2 grid grid-cols-8 gap-1">
              {CALENDAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  aria-label={`${pickedDay}일에 ${emoji} 넣기`}
                  aria-pressed={calendarMarks[pickedKey] === emoji}
                  onClick={() => setCalendarMark(pickedDay, emoji)}
                  className={cx(
                    "grid h-9 place-items-center rounded-full bg-white text-[18px]",
                    calendarMarks[pickedKey] === emoji && "ring-2 ring-blush",
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
            {calendarMarks[pickedKey] ? (
              <button type="button" onClick={() => setCalendarMark(pickedDay, null)} className="mt-2 w-full text-[12px] text-[#999]">
                이모티콘 지우기
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-[#f0f0f0] px-4 py-3">
        <Mascot className="h-14 w-14" mood="cheer" />
        <div>
          <p className="text-[12px] font-semibold text-blush">연속 뜨개 기록</p>
          <p className="text-[18px] font-bold">32일 연속 달성!</p>
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
        <div className="relative mt-2 h-16">
          <svg viewBox="0 0 7 72" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <polyline fill="none" stroke="#f3b6c4" strokeWidth="2" vectorEffect="non-scaling-stroke" points="0.5,48 1.5,48 2.5,40 3.5,48 4.5,36 5.5,48 6.5,44" />
          </svg>
          <div className="absolute inset-0 grid grid-cols-7">
            {[48, 48, 40, 48, 36, 48, 44].map((y, index) => (
              <span key={DAYS[index]} className="relative">
                <span className="absolute left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f3b6c4]" style={{ top: `${(y / 72) * 100}%` }} />
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] text-[#bbb]">
          {DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-[16px] font-bold">판매 물품 {LISTINGS.length}</h2>
          <button type="button" aria-label="판매와 구매 보기" onClick={() => push({ name: "orders" })} className="grid h-6 w-6 place-items-center leading-none">
            <ChevronRight />
          </button>
        </div>
        <DragScroll as="ul" className="mt-2 flex gap-2 overflow-x-auto px-4 pb-1">
          {LISTINGS.map((item) => (
            <li key={item.id} className="w-28 shrink-0">
              <button type="button" onClick={() => push({ name: "product", id: item.id })} className="w-full text-left">
                <img src={item.image} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug">{item.title}</p>
                <p className="text-[12px] font-bold">{item.price}</p>
              </button>
            </li>
          ))}
        </DragScroll>
      </section>

      <section className="mx-4 mt-4 rounded-lg bg-[#ffe8ea] px-3 py-4">
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-[16px] font-bold">업적</h2>
          <span className="text-[12px] text-[#c98490]">대표 업적</span>
        </div>
        <ul className="grid grid-cols-3 gap-3 text-center">
          {STAMPS.map((stamp) => (
            <li key={stamp.name}>
              <button
                type="button"
                disabled={stamp.on}
                onClick={() => openSheet({ kind: "info", title: stamp.name, body: stamp.how })}
                className={cx("w-full text-[11px] leading-tight", stamp.on ? "text-[#7a4d55]" : "opacity-40 grayscale")}
              >
                <img src={stamp.image} alt="" className="mx-auto h-14 w-14 object-contain" />
                <p className="mt-1 line-clamp-2">{stamp.name}</p>
              </button>
            </li>
          ))}
        </ul>
      </section>


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

    </div>
  );
}

function Shortcut({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="text-[12px]">
      <span className="mx-auto grid h-14 w-14 place-items-center">{icon}</span>
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

export function OrdersScreen({ tab = "sell" }: { tab?: "sell" | "buy" }) {
  const { push, goTab } = useApp();
  useEffect(() => {
    if (tab !== "buy") return;
    document.getElementById("orders-buy")?.scrollIntoView({ block: "start" });
  }, [tab]);
  return (
    <div className="pb-10">
      <section className="px-4 pt-2">
        <h2 className="text-[18px] font-bold">내가 판매하는 물품 {LISTINGS.length}</h2>
        <ul className="mt-3 space-y-3">
          {LISTINGS.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => push({ name: "product", id: item.id })} className="flex w-full gap-3 rounded-lg border border-[#f0f0f0] p-3 text-left">
                <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                <span className="min-w-0">
                  <span className="text-[11px] font-semibold text-blush">판매 중 · {item.kind}</span>
                  <span className="mt-0.5 block text-[15px] font-bold">{item.title}</span>
                  <span className="mt-1 block text-[14px] font-semibold">{item.price}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section id="orders-buy" className="px-4 pt-8">
        <h2 className="text-[18px] font-bold">내가 구매한 물품 {PURCHASES.length}</h2>
        {PURCHASES.length === 0 ? (
          <div className="mt-3 rounded-lg bg-[#f7f7f7] px-4 py-6 text-center">
            <p className="text-[14px] text-[#777]">아직 구매한 물품이 없어요.</p>
            <button type="button" onClick={() => goTab("home", "market")} className="mt-4 h-11 rounded-full bg-ink px-5 text-[14px] font-semibold text-white">
              뜨개마켓 둘러보기
            </button>
          </div>
        ) : (
          <ul className="mt-3 space-y-3">
            {PURCHASES.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => push({ name: "product", id: item.id })} className="flex w-full gap-3 rounded-lg border border-[#f0f0f0] p-3 text-left">
                  <img src={item.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <span>
                    <span className="text-[11px] font-semibold text-blush">구매함 · {item.kind}</span>
                    <span className="mt-0.5 block text-[15px] font-bold">{item.title}</span>
                    <span className="mt-1 block text-[12px] text-[#888]">{item.seller}</span>
                    <span className="mt-1 block text-[14px] font-semibold">{item.price}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export function PostsScreen() {
  const { data } = useApp();
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] text-[#888]">{data.nickname}님이 남긴 글만 모았어요.</p>
      <ul className="mt-3 space-y-3">
        {MY_POSTS.map((post) => (
          <li key={post.id} className="overflow-hidden rounded-lg border border-[#f0f0f0]">
            <img src={post.image} alt="" className="aspect-square w-full object-cover" />
            <div className="px-4 py-3">
              <p className="text-[12px] text-[#999]">{post.date}</p>
              <p className="mt-1 text-[16px] font-bold">{post.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed">{post.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CommentsScreen() {
  const { data } = useApp();
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] text-[#888]">{data.nickname}님이 남긴 댓글만 모았어요.</p>
      <ul className="mt-3 space-y-3">
        {MY_COMMENTS.map((comment) => (
          <li key={comment.id} className="rounded-lg border border-[#f0f0f0] px-4 py-3">
            <p className="text-[12px] text-[#999]">{comment.date}</p>
            <p className="mt-1 text-[13px] font-semibold text-[#666]">{comment.where}</p>
            <p className="mt-1 text-[15px] leading-relaxed">{comment.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GroupsScreen() {
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] text-[#888]">모임 안내는 둘러보기만 할 수 있어요.</p>
      <ul className="mt-3 space-y-3">
        {GROUPS.map((group) => (
          <li key={group.id} className="pointer-events-none rounded-lg border border-[#f0f0f0] px-4 py-3">
            <p className="text-[16px] font-bold">{group.name}</p>
            <p className="mt-1 text-[13px] text-[#666]">
              {group.place} · {group.when}
            </p>
            <p className="mt-1 text-[12px] text-[#999]">멤버 {group.members}명</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function NoticesScreen() {
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] text-[#888]">앱에서 전하는 공지예요.</p>
      <ul className="mt-3 space-y-3">
        {NOTICES.map((notice) => (
          <li key={notice.id} className="rounded-lg border border-[#f0f0f0] px-4 py-3">
            <p className="text-[12px] text-[#999]">{notice.date}</p>
            <p className="mt-1 text-[16px] font-bold">{notice.title}</p>
            <p className="mt-1 text-[14px] leading-relaxed">{notice.body}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MenuRow({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex h-12 w-full items-center gap-3 border-t border-[#f6f6f6] text-left text-[14px]">
      <span className="grid h-5 w-5 shrink-0 place-items-center">{icon}</span>
      <span className="flex-1">{label}</span>
      <ChevronRight />
    </button>
  );
}
