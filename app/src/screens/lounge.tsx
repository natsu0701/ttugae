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
        <ul className="mt-3 divide-y divide-[#f4f4f4]">
          {WORKS.map((work) => (
            <li key={work.id} className="flex gap-3 px-4 py-3">
              <button type="button" onClick={() => push({ name: "work", id: work.id })} className="flex flex-1 gap-3 text-left">
                <img src={work.image} alt="" className="h-20 w-20 rounded-2xl object-cover object-top" />
                <span>
                  <span className="text-[12px] text-[#999]">{work.author}</span>
                  <span className="mt-1 block font-bold">{work.title}</span>
                </span>
              </button>
              <button type="button" aria-label="좋아요" onClick={() => toggleLike(work.id)} className="text-[13px] text-blush">
                <HeartIcon filled={data.likes.includes(work.id)} />
                {work.likes}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {loungeTab === "qa" ? (
        <ul className="mt-3 space-y-3 px-4">
          {QUESTIONS.map((question) => (
            <li key={question.id}>
              <button type="button" onClick={() => push({ name: "question", id: question.id })} className="w-full rounded-3xl border border-[#f0f0f0] p-4 text-left">
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
        <div>
          <h2 className="px-4 pt-4 text-[18px] font-bold">기와뜨기</h2>
          <ul className="mt-2 divide-y divide-[#f2f2f2]">
            {SHORTS.map((clip) => (
              <li key={clip.id}>
                <button type="button" onClick={() => push({ name: "short", id: clip.id })} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className="relative h-16 w-24 shrink-0 overflow-hidden rounded-xl">
                    <img src={clip.image} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1 text-[10px] text-white">{clip.length}</span>
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold leading-snug">{clip.title}</span>
                    <span className="text-[12px] text-[#999]">{clip.author}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
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
      <div className="mt-5 rounded-2xl bg-[#f7f7f7] p-4 text-[14px] leading-relaxed">
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
      <div className="relative mx-4 mt-2 overflow-hidden rounded-[28px] bg-ink">
        <img src={clip.image} alt="" className="h-80 w-full object-cover opacity-80" />
        <p className="absolute bottom-4 left-4 right-4 text-white">
          <span className="block text-[18px] font-bold">{clip.title}</span>
          <span className="text-[13px]">
            {clip.author} · {clip.length}
          </span>
        </p>
      </div>
      <p className="px-5 pt-4 text-[14px] leading-relaxed text-[#666]">짧은 뜨개 영상이에요. 재생 파일은 이 프로토타입에 포함하지 않았어요.</p>
    </article>
  );
}
