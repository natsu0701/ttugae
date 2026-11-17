import { useEffect, useRef, useState } from "react";
import { QUESTIONS, SHORTS, WORKS } from "../data.ts";
import { HeartFillIcon } from "../icons/webFill.tsx";
import { useApp } from "../store.tsx";
import type { LoungeTab } from "../types.ts";
import { ChevronLeft, HeartIcon, UnderlineTabs } from "../ui.tsx";

const REEL_LIKES: Record<string, number> = {
  s1: 248,
  s2: 91,
  s3: 163,
  s4: 74,
  s5: 120,
};

function SpeakerIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path d="M4 9h3.2L12 5.2v13.6L7.2 15H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z" fill="currentColor" />
      {off ? (
        <path d="M16 9.5 21 14.5M21 9.5 16 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : (
        <path d="M16 9.2a4 4 0 0 1 0 5.6M18.2 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      )}
    </svg>
  );
}

function ReelFeed({ startId }: { startId?: string }) {
  const { data, toggleLike } = useApp();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef(false);
  const pausedRef = useRef(false);
  const activeRef = useRef(0);
  const [sound, setSound] = useState(false);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);

  const playActive = () => {
    const root = scrollerRef.current;
    if (!root) return;
    const slides = [...root.querySelectorAll<HTMLElement>("[data-reel]")];
    slides.forEach((slide, index) => {
      const video = slide.querySelector("video");
      if (!video) return;
      video.muted = !soundRef.current;
      if (index === activeRef.current && !pausedRef.current) void video.play().catch(() => {});
      else video.pause();
    });
  };

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;
    if (startId) {
      const target = root.querySelector<HTMLElement>(`[data-reel="${CSS.escape(startId)}"]`);
      if (target) root.scrollTop = target.offsetTop;
    }
    const slides = [...root.querySelectorAll<HTMLElement>("[data-reel]")];
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.6)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        const index = slides.indexOf(hit.target as HTMLElement);
        if (index < 0) return;
        if (index !== activeRef.current) {
          pausedRef.current = false;
          setPaused(false);
        }
        activeRef.current = index;
        setActive(index);
        slides.forEach((slide, slideIndex) => {
          const video = slide.querySelector("video");
          if (!video) return;
          video.muted = !soundRef.current;
          if (slideIndex === index && !pausedRef.current) void video.play().catch(() => {});
          else video.pause();
        });
      },
      { root, threshold: [0.6, 0.85] },
    );
    slides.forEach((slide) => observer.observe(slide));
    return () => observer.disconnect();
  }, [startId]);

  return (
    <div ref={scrollerRef} data-reels className="min-h-0 flex-1 snap-y snap-mandatory overflow-y-scroll overscroll-y-contain bg-black">
      {SHORTS.map((clip, index) => {
        const liked = data.likes.includes(clip.id);
        return (
          <article
            key={clip.id}
            data-reel={clip.id}
            className="relative h-full shrink-0 snap-start snap-always"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              const video = event.currentTarget.querySelector("video");
              if (!video) return;
              if (video.paused) {
                pausedRef.current = false;
                setPaused(false);
                void video.play().catch(() => {});
              } else {
                pausedRef.current = true;
                setPaused(true);
                video.pause();
              }
            }}
          >
            <video src={clip.video} poster={clip.image} playsInline loop muted preload="metadata" className="h-full w-full object-cover" />
            {paused && active === index ? (
              <span className="pointer-events-none absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white">
                <svg viewBox="0 0 24 24" className="ml-1 h-8 w-8" aria-hidden>
                  <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
                </svg>
              </span>
            ) : null}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent px-4 pb-5 pt-20 text-white">
              <p className="text-[15px] font-bold">{clip.author}</p>
              <p className="mt-1 max-w-[75%] text-[14px] leading-snug">{clip.title}</p>
            </div>
            <div className="absolute bottom-8 right-3 flex flex-col items-center gap-4 text-white">
              <button
                type="button"
                aria-label={liked ? "좋아요 취소" : "좋아요"}
                aria-pressed={liked}
                onClick={() => toggleLike(clip.id)}
                className="flex flex-col items-center gap-1"
              >
                <HeartFillIcon filled={liked} className="h-8 w-8" />
                <span className="text-[12px] font-semibold">{(REEL_LIKES[clip.id] ?? 12) + (liked ? 1 : 0)}</span>
              </button>
              <button
                type="button"
                aria-label={sound ? "소리 끄기" : "소리 켜기"}
                aria-pressed={sound}
                onClick={() => {
                  soundRef.current = !soundRef.current;
                  setSound(soundRef.current);
                  playActive();
                }}
                className="grid h-11 w-11 place-items-center"
              >
                <SpeakerIcon off={!sound} />
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function LoungeScreen() {
  const { loungeTab, setLoungeTab, push, data, toggleLike } = useApp();
  const tabs: { id: LoungeTab; label: string }[] = [
    { id: "works", label: "작품" },
    { id: "qa", label: "질문" },
    { id: "shorts", label: "뜨개소통" },
  ];
  const reels = loungeTab === "shorts";
  return (
    <div className={reels ? "flex h-full min-h-0 flex-col" : "pb-6"}>
      <h1 className="shrink-0 px-4 pt-1 text-[20px] font-bold">뜨개 라운지</h1>
      <div className="mt-3 shrink-0">
        <UnderlineTabs value={loungeTab} options={tabs} onChange={setLoungeTab} />
      </div>
      {loungeTab === "works" ? (
        <ul className="mt-3 grid grid-cols-3 gap-px bg-[#f4f4f4]">
          {WORKS.map((work) => (
            <li key={work.id} className="relative bg-white">
              <button type="button" onClick={() => push({ name: "work", id: work.id })} className="block w-full">
                <img src={work.image} alt={work.title} className="aspect-square w-full object-cover" />
              </button>
              <button
                type="button"
                aria-label="좋아요"
                aria-pressed={data.likes.includes(work.id)}
                onClick={() => toggleLike(work.id)}
                className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded-full bg-white px-1.5 py-1 text-[11px] text-black"
              >
                <HeartIcon filled={data.likes.includes(work.id)} className="h-4 w-4" />
                {work.likes + (data.likes.includes(work.id) ? 1 : 0)}
              </button>
            </li>
          ))}
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
      {reels ? <ReelFeed /> : null}
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
  return (
    <div className="relative flex h-full min-h-0 flex-col bg-black">
      <ReelFeed startId={id} />
      <button type="button" aria-label="뒤로" onClick={back} className="absolute left-1 top-1 z-30 grid h-10 w-10 place-items-center text-white">
        <ChevronLeft />
      </button>
    </div>
  );
}
