import { useEffect, useRef, useState } from "react";
import { QUESTIONS, SHORTS, WORKS } from "../data.ts";
import { HeartFillIcon } from "../icons/webFill.tsx";
import { useApp } from "../store.tsx";
import type { LoungeTab, ShortClip } from "../types.ts";
import { ChevronLeft, UnderlineTabs } from "../ui.tsx";

const BASE_LIKES: Record<string, number> = { s1: 248, s2: 91, s3: 163, s4: 74, s5: 120 };

export function LoungeScreen() {
  const { loungeTab, setLoungeTab, push, data, toggleLike } = useApp();
  const tabs: { id: LoungeTab; label: string }[] = [
    { id: "works", label: "작품" },
    { id: "qa", label: "질문" },
    { id: "shorts", label: "뜨개 소통" },
  ];
  return (
    <div className={loungeTab === "shorts" ? "flex h-full min-h-0 flex-col" : "pb-6"}>
      <h1 className="px-4 pt-1 text-center text-[20px] font-bold">뜨개 라운지</h1>
      <div className="mt-3 shrink-0">
        <UnderlineTabs value={loungeTab} options={tabs} onChange={setLoungeTab} />
      </div>
      {loungeTab === "works" ? (
        <ul className="mt-3 grid grid-cols-3 gap-px bg-[#f4f4f4]">
          {WORKS.map((work) => {
            const liked = data.likes.includes(work.id);
            return (
              <li key={work.id} className="relative bg-white">
                <button type="button" onClick={() => push({ name: "work", id: work.id })} className="block w-full">
                  <img src={work.image} alt={work.title} className="aspect-square w-full object-cover" />
                </button>
                <button
                  type="button"
                  aria-label="좋아요"
                  aria-pressed={liked}
                  onClick={() => toggleLike(work.id)}
                  className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 text-[12px] font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
                >
                  <HeartFillIcon filled={liked} className="h-4 w-4" />
                  {work.likes + (liked ? 1 : 0)}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {loungeTab === "qa" ? (
        <ul className="mt-3 space-y-3 px-4">
          {QUESTIONS.map((question) => (
            <li key={question.id}>
              <button type="button" onClick={() => push({ name: "question", id: question.id })} className="w-full rounded-lg border border-[#f0f0f0] p-4 text-left">
                <p className="font-bold">{question.title}</p>
                <p className="mt-1 line-clamp-2 text-[13px] text-[#666]">{question.body}</p>
                <p className="mt-2 text-[12px] text-[#999]">
                  {question.author} · 답변 {question.answers}
                </p>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loungeTab === "shorts" ? <ReelFeed /> : null}
    </div>
  );
}

export function QuestionScreen({ id }: { id: string }) {
  const { notify } = useApp();
  const question = QUESTIONS.find((item) => item.id === id) ?? QUESTIONS[0];
  return (
    <article className="px-5 pb-10">
      <p className="text-[12px] text-[#999]">{question.author}</p>
      <h2 className="mt-1 text-[22px] font-bold">{question.title}</h2>
      <p className="mt-3 text-[15px] leading-relaxed">{question.body}</p>
      <div className="mt-5 rounded-lg bg-[#f7f7f7] p-4 text-[14px] leading-relaxed">
        답변 {question.answers}개 중 첫 메모: 게이지를 세탁 후 기준으로 다시 재고, 바늘을 0.5mm만 바꿔 보세요.
      </div>
      <button type="button" onClick={() => notify("답변은 이 데모에 저장되지 않아요")} className="mt-4 h-12 w-full rounded-full bg-ink font-semibold text-white">
        답변 남기기
      </button>
    </article>
  );
}

export function ShortScreen({ id }: { id: string }) {
  const { back } = useApp();
  return <ReelFeed startId={id} onBack={back} />;
}

function ReelFeed({ startId, onBack }: { startId?: string; onBack?: () => void }) {
  const { data, toggleLike } = useApp();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(startId ?? SHORTS[0]?.id ?? "");
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (startId) {
      const start = root.querySelector<HTMLElement>(`[data-clip="${startId}"]`);
      start?.scrollIntoView();
    }
    const slides = [...root.querySelectorAll<HTMLElement>("[data-clip]")];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = visible?.target.getAttribute("data-clip");
        if (id) setActive(id);
      },
      { root, threshold: [0.6, 0.85] },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [startId]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
      const playing = video.dataset.clip === active && !paused;
      video.muted = muted;
      if (playing) void video.play().catch(() => undefined);
      else video.pause();
    });
  }, [active, muted, paused]);

  return (
    <div ref={rootRef} data-reels className="relative min-h-0 flex-1 snap-y snap-mandatory overflow-y-scroll bg-black">
      {onBack ? (
        <button type="button" aria-label="뒤로" onClick={onBack} className="absolute left-2 top-2 z-10 grid h-10 w-10 place-items-center text-white">
          <ChevronLeft />
        </button>
      ) : null}
      {SHORTS.map((clip) => (
        <ReelSlide
          key={clip.id}
          clip={clip}
          liked={data.likes.includes(clip.id)}
          muted={muted}
          paused={paused && active === clip.id}
          likes={(BASE_LIKES[clip.id] ?? 0) + (data.likes.includes(clip.id) ? 1 : 0)}
          onLike={() => toggleLike(clip.id)}
          onToggle={() => {
            if (active === clip.id) setPaused((value) => !value);
          }}
          onMute={() => setMuted((value) => !value)}
        />
      ))}
    </div>
  );
}

function ReelSlide({
  clip,
  liked,
  muted,
  paused,
  likes,
  onLike,
  onToggle,
  onMute,
}: {
  clip: ShortClip;
  liked: boolean;
  muted: boolean;
  paused: boolean;
  likes: number;
  onLike: () => void;
  onToggle: () => void;
  onMute: () => void;
}) {
  return (
    <article data-clip={clip.id} className="relative h-full snap-start snap-always">
      <video data-clip={clip.id} src={clip.video} poster={clip.image} playsInline muted loop preload="metadata" className="h-full w-full object-cover" onClick={onToggle} />
      {paused ? <p className="pointer-events-none absolute inset-0 grid place-items-center text-[15px] font-semibold text-white">일시정지</p> : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-5 pt-16 text-white">
        <p className="text-[15px] font-bold">{clip.title}</p>
        <p className="mt-1 text-[13px] text-white/80">
          {clip.author} · {clip.length}
        </p>
      </div>
      <div className="absolute bottom-6 right-3 flex flex-col items-center gap-3 text-white">
        <button type="button" aria-label="좋아요" aria-pressed={liked} onClick={onLike} className="grid place-items-center text-[12px] font-semibold drop-shadow">
          <HeartFillIcon filled={liked} className="h-7 w-7 text-white" />
          {likes}
        </button>
        <button type="button" aria-label={muted ? "소리 켜기" : "소리 끄기"} onClick={onMute} className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-[12px]">
          {muted ? "음소거" : "소리"}
        </button>
      </div>
    </article>
  );
}
