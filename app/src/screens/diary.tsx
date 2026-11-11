import { useMemo, useRef, useState } from "react";
import { formatClock } from "../data.ts";
import { useApp } from "../store.tsx";
import { CheckIcon, ChevronLeft, ClockIcon, CloseIcon, HeartIcon, ImagePlusIcon, Mascot, RowsIcon, SparkIcon } from "../ui.tsx";

export function DiaryScreen({ id }: { id: string }) {
  const { data, back, saveDiary } = useApp();
  const project = data.projects.find((item) => item.id === id);
  const fileRef = useRef<HTMLInputElement>(null);
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const materials = useMemo(() => {
    if (!project) return [];
    return data.yarns
      .filter((yarn) => yarn.linkedProject === project.title)
      .map((yarn) => `${yarn.name} ${yarn.balls}볼`);
  }, [data.yarns, project]);
  const catalog = useMemo(
    () => [
      ...data.yarns.map((yarn) => ({
        id: `yarn-${yarn.id}`,
        kind: "실",
        label: `${yarn.name} ${yarn.balls}볼`,
        image: yarn.image,
      })),
      ...data.needles.map((needle) => ({
        id: `needle-${needle.id}`,
        kind: "바늘",
        label: `${needle.name} ${needle.size}`,
        image: needle.image,
      })),
    ],
    [data.needles, data.yarns],
  );
  const [chips, setChips] = useState<string[]>(materials);
  const [picking, setPicking] = useState(false);

  if (!project) return <p className="px-6 py-16 text-center text-[14px]">프로젝트를 찾지 못했어요.</p>;

  const active = project.parts.find((part) => !part.done) ?? project.parts[0];
  const rows = active?.count ?? project.parts.reduce((sum, part) => sum + (part.count ?? 0), 0);
  const statusLine = active
    ? `${active.name}${active.count ? ` ${active.count}단` : ""} ${active.done ? "완료" : "진행중"}`
    : "진행 중인 부위가 없어요";
  const minutes = Math.max(0, Math.round(project.elapsed / 60));

  const fillMemo = () => {
    const materialLine = chips.length ? `재료는 ${chips.join(", ")}를 썼어요.` : "";
    const text = `${project.title}을 이어서 기록해요. ${statusLine}. 오늘까지 ${formatClock(project.elapsed)}을 들였어요. ${materialLine}`.trim();
    setMemo(text);
  };

  const toggleChip = (label: string) => {
    setChips((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  };

  const save = () => {
    const lines = [
      statusLine,
      `작업량 ${rows}단`,
      `소요 시간 ${minutes}분 (${formatClock(project.elapsed)})`,
      chips.length ? `재료: ${chips.join(", ")}` : "",
      memo.trim(),
      photos.length ? `사진 ${photos.length}장` : "",
    ].filter(Boolean);
    saveDiary(project.id, lines.join("\n"));
  };

  return (
    <div className="bg-white pb-4">
      <header className="sticky top-0 z-20 flex h-12 items-center bg-white px-1">
        <button type="button" aria-label="뒤로" onClick={back} className="grid h-10 w-10 place-items-center">
          <ChevronLeft />
        </button>
        <h1 className="flex-1 text-center text-[17px] font-bold">뜨개일기</h1>
        <button type="button" onClick={save} className="px-3 text-[15px] font-semibold text-blush">
          저장
        </button>
      </header>

      <div className="flex items-start gap-2 px-4 pt-3">
        <Mascot className="h-16 w-16 shrink-0" mood="cheer" />
        <p className="rounded-lg bg-white px-4 py-3 text-[14px] font-semibold leading-snug shadow-card">
          오늘의 뜨개 완료! 오늘 뜬 소중한 한 땀, 뜨니랑 같이 기록해 볼까요?
        </p>
      </div>

      <section className="px-4 pt-6">
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon filled /> 진행 중인 프로젝트</h2>
        <article className="mt-3 overflow-hidden rounded-lg bg-white shadow-card">
          <div className="flex gap-3 p-3">
            <img src={project.image} alt="" className="h-28 w-24 rounded-lg object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[16px] font-bold">{project.title}</p>
                <p className="shrink-0 text-[13px] text-[#888]">{project.ago}</p>
              </div>
              <p className="mt-1 text-[12px] text-[#888]">시작일: {project.started}</p>
              <p className="font-mono text-[13px]">{formatClock(project.elapsed)}</p>
              <p className="mt-2 text-[13px]">{statusLine}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 pb-3">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
              <span className="block h-full bg-blush" style={{ width: `${project.progress}%` }} />
            </span>
            <span className="text-[13px] font-semibold text-blush">{project.progress}%</span>
          </div>
        </article>
        {project.parts.length > 0 ? (
          <ul className="mt-2 space-y-1 px-1 text-[12px] text-[#777]">
            {project.parts.map((part) => (
              <li key={part.id}>
                {part.name} · {part.done ? "완료" : `${part.count ?? 0}단`} · {part.ago}
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="px-4 pt-6">
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon filled /> 오늘의 기록</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white px-4 py-5 text-center shadow-card">
            <RowsIcon />
            <p className="mt-2 text-[28px] font-bold">{rows}단</p>
            <p className="text-[13px] text-[#888]">작업량</p>
          </div>
          <div className="rounded-lg bg-white px-4 py-5 text-center shadow-card">
            <ClockIcon />
            <p className="mt-2 text-[28px] font-bold">{minutes}분</p>
            <p className="text-[13px] text-[#888]">소요 시간</p>
            <p className="mt-1 font-mono text-[12px] text-[#aaa]">{formatClock(project.elapsed)}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon filled /> 사용한 재료</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex h-9 items-center gap-1 rounded-full border border-[#eee] bg-white px-3 text-[13px]">
              {chip}
              <button type="button" aria-label={`${chip} 빼기`} onClick={() => toggleChip(chip)} className="grid h-5 w-5 place-items-center">
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => setPicking((value) => !value)} className="h-9 rounded-full bg-[#f4f4f4] px-4 text-[13px] font-semibold">
            + 추가
          </button>
        </div>
        {picking ? (
          <ul className="mt-3 overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
            {catalog.length === 0 ? <li className="px-4 py-4 text-[13px] text-[#888]">등록된 재료가 없어요.</li> : null}
            {catalog.map((item) => {
              const selected = chips.includes(item.label);
              return (
                <li key={item.id} className="border-t border-[#f4f4f4] first:border-t-0">
                  <button type="button" onClick={() => toggleChip(item.label)} className="flex w-full items-center gap-3 px-3 py-2 text-left">
                    <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-contain bg-[#f7f7f7]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] text-[#999]">{item.kind}</span>
                      <span className="block truncate text-[14px] font-semibold">{item.label}</span>
                    </span>
                    {selected ? <CheckIcon /> : null}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon filled /> 나의 메모</h2>
          <button type="button" onClick={fillMemo} className="inline-flex h-8 items-center gap-1 rounded-full bg-ink px-3 text-[12px] font-semibold text-white">
            <SparkIcon />
            AI 채우기
          </button>
        </div>
        <textarea
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder="오늘의 뜨개 느낌이나 팁을 적어보세요."
          aria-label="나의 메모"
          className="memo-lines mt-3 h-40 w-full resize-none rounded-lg border border-[#f0e4d8] bg-[#fffdf8] px-4 py-3 text-[14px] leading-[28px] outline-none"
        />
        {project.diary.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {project.diary.map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="rounded-lg bg-[#fafafa] px-3 py-2 text-[13px]">
                <span className="font-semibold">{entry.title}</span>
                <span className="mt-0.5 block whitespace-pre-line text-[#666]">{entry.body}</span>
                <span className="mt-1 block text-[12px] text-[#999]">{entry.date}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="px-4 pt-6">
        <button type="button" onClick={() => fileRef.current?.click()} className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#f4f4f4] text-[15px] font-semibold">
          <ImagePlusIcon />
          이미지 추가
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setPhotos((current) => [...current, URL.createObjectURL(file)]);
          }}
        />
        {photos.length > 0 ? (
          <ul className="mt-3 space-y-3">
            {photos.map((url) => (
              <li key={url} className="overflow-hidden rounded-lg bg-white shadow-card">
                <img src={url} alt="" className="block h-auto w-full bg-[#f7f7f7]" />
                <div className="flex items-center justify-between px-4 py-3">
                  <span>
                    <span className="block text-[15px] font-bold">{project.title}</span>
                    <span className="text-[12px] text-[#888]">리뷰 이미지</span>
                  </span>
                  <button
                    type="button"
                    aria-label="이미지 빼기"
                    onClick={() => setPhotos((current) => current.filter((item) => item !== url))}
                    className="grid h-8 w-8 place-items-center"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
