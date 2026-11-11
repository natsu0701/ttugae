import { QUESTIONS, SHORTS, WORKS } from "../data.ts";
import { useApp } from "../store.tsx";
import type { LoungeTab } from "../types.ts";
import { HeartIcon, UnderlineTabs } from "../ui.tsx";

export function LoungeScreen() {
  const { loungeTab, setLoungeTab, push, data, toggleLike } = useApp();
  const tabs: { id: LoungeTab; label: string }[] = [
    { id: "works", label: "작품" },
    { id: "qa", label: "질문" },
    { id: "shorts", label: "기와뜨기" },
  ];
  return (
    <div className="pb-6">
      <h1 className="px-4 pt-1 text-[20px] font-bold">뜨개 라운지</h1>
      <div className="mt-3">
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
                onClick={() => toggleLike(work.id)}
                className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-black/45 text-white"
              >
                <HeartIcon filled={data.likes.includes(work.id)} />
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
      {loungeTab === "shorts" ? (
        <ul className="mt-3 space-y-4 px-4">
          {SHORTS.map((clip) => (
            <li key={clip.id} className="overflow-hidden rounded-lg bg-black text-white">
              <video
                src={clip.video}
                poster={clip.image}
                controls
                playsInline
                preload="metadata"
                className="aspect-[9/16] max-h-[70vh] w-full bg-black object-cover"
              />
              <button type="button" onClick={() => push({ name: "short", id: clip.id })} className="block w-full px-3 py-2 text-left">
                <span className="block text-[14px] font-semibold">{clip.title}</span>
                <span className="text-[12px] text-white/70">
                  {clip.author} · {clip.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
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
  const clip = SHORTS.find((item) => item.id === id) ?? SHORTS[0];
  return (
    <article className="pb-10">
      <div className="mx-4 mt-2 overflow-hidden rounded-lg bg-black">
        <video src={clip.video} poster={clip.image} controls playsInline autoPlay className="aspect-[9/16] max-h-[70vh] w-full object-cover" />
      </div>
      <p className="px-5 pt-4 text-[14px] leading-relaxed text-[#666]">
        {clip.author} · {clip.length}. {clip.title}
      </p>
    </article>
  );
}
