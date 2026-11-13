import { useEffect, useMemo, useRef, useState } from "react";
import { formatClock } from "../data.ts";
import { useApp } from "../store.tsx";
import { CheckIcon, ChevronLeft, ClockIcon, CloseIcon, HeartIcon, ImagePlusIcon, Mascot, PencilIcon, PlusIcon, RowsIcon, SearchIcon, SparkIcon, TrashIcon, cx } from "../ui.tsx";

const MATERIAL_KINDS = ["바늘", "실", "기타"] as const;
type MaterialKind = (typeof MATERIAL_KINDS)[number];

export function DiaryScreen({ id }: { id: string }) {
  const { data, back, saveDiary, updateDiary, removeDiary, notify } = useApp();
  const project = data.projects.find((item) => item.id === id);
  const fileRef = useRef<HTMLInputElement>(null);
  const memoRef = useRef<HTMLTextAreaElement>(null);
  const typingRef = useRef<number | null>(null);
  const writingRef = useRef(false);
  const targetRef = useRef("");
  const [memo, setMemo] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const materials = useMemo(() => {
    if (!project) return [];
    return data.yarns
      .filter((yarn) => yarn.linkedProject === project.title)
      .map((yarn) => `${yarn.name} ${yarn.balls}볼`);
  }, [data.yarns, project]);
  const [chips, setChips] = useState<string[]>(materials);
  const [picking, setPicking] = useState(false);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<MaterialKind>("실");
  const [addingYarn, setAddingYarn] = useState(false);
  const [newYarn, setNewYarn] = useState("");
  const [customYarns, setCustomYarns] = useState<{ id: string; label: string }[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const catalog = useMemo(
    () => [
      ...data.yarns.map((yarn) => ({
        id: `yarn-${yarn.id}`,
        kind: "실" as const,
        label: `${yarn.name} ${yarn.balls}볼`,
        image: yarn.image,
      })),
      ...customYarns.map((yarn) => ({
        id: yarn.id,
        kind: "실" as const,
        label: yarn.label,
        image: "",
      })),
      ...data.needles.map((needle) => ({
        id: `needle-${needle.id}`,
        kind: (needle.category === "기타" ? "기타" : "바늘") as MaterialKind,
        label: `${needle.name} ${needle.size}`,
        image: needle.image,
      })),
    ],
    [customYarns, data.needles, data.yarns],
  );
  const visible = useMemo(() => {
    const text = query.trim();
    return catalog.filter((item) => item.kind === kind && (!text || item.label.includes(text)));
  }, [catalog, kind, query]);

  const stopTyping = () => {
    writingRef.current = false;
    if (typingRef.current !== null) {
      window.clearTimeout(typingRef.current);
      typingRef.current = null;
    }
  };

  useEffect(() => {
    const field = memoRef.current;
    if (!field || !writingRef.current) return;
    const end = field.value.length;
    field.setSelectionRange(end, end);
    field.scrollTop = field.scrollHeight;
    if (field.value === targetRef.current) writingRef.current = false;
  }, [memo]);

  useEffect(() => stopTyping, []);

  if (!project) return <p className="px-6 py-16 text-center text-[14px]">프로젝트를 찾지 못했어요.</p>;

  const active = project.parts.find((part) => !part.done) ?? project.parts[0];
  const rows = active?.count ?? project.parts.reduce((sum, part) => sum + (part.count ?? 0), 0);
  const statusLine = active
    ? `${active.name}${active.count ? ` ${active.count}단` : ""} ${active.done ? "완료" : "진행중"}`
    : "진행 중인 부위가 없어요";
  const minutes = Math.max(0, Math.round(project.elapsed / 60));

  const fillMemo = () => {
    stopTyping();
    const materialLine = chips.length ? `재료는 ${chips.join(", ")}를 썼어요.` : "";
    const text = `${project.title}을 이어서 기록해요. ${statusLine}. 오늘까지 ${formatClock(project.elapsed)}을 들였어요. ${materialLine}`.trim();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setMemo(text);
      return;
    }
    writingRef.current = true;
    targetRef.current = text;
    memoRef.current?.focus();
    setMemo("");
    let index = 0;
    const step = () => {
      index += 1;
      setMemo(text.slice(0, index));
      if (index >= text.length) {
        typingRef.current = null;
        return;
      }
      const previous = text[index - 1];
      const delay = previous === "." || previous === "!" || previous === "?" ? 220 : 34;
      typingRef.current = window.setTimeout(step, delay);
    };
    typingRef.current = window.setTimeout(step, 34);
  };

  const toggleChip = (label: string) => {
    setChips((current) => (current.includes(label) ? current.filter((item) => item !== label) : [...current, label]));
  };

  const addNewYarn = () => {
    const name = newYarn.trim();
    if (!name) return;
    setCustomYarns((current) => (current.some((item) => item.label === name) ? current : [...current, { id: `custom-${name}`, label: name }]));
    setChips((current) => (current.includes(name) ? current : [...current, name]));
    setNewYarn("");
    setAddingYarn(false);
    setKind("실");
    setQuery("");
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
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon /> 진행 중인 프로젝트</h2>
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
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon /> 오늘의 기록</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="flex flex-col items-center rounded-lg bg-white px-4 py-5 text-center shadow-card">
            <span className="grid h-7 w-7 place-items-center">
              <RowsIcon />
            </span>
            <p className="mt-2 text-[28px] font-bold">{rows}단</p>
            <p className="text-[13px] text-[#888]">작업량</p>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-white px-4 py-5 text-center shadow-card">
            <ClockIcon className="h-7 w-7" />
            <p className="mt-2 text-[28px] font-bold">{minutes}분</p>
            <p className="text-[13px] text-[#888]">소요 시간</p>
            <p className="mt-1 font-mono text-[12px] text-[#aaa]">{formatClock(project.elapsed)}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pt-6">
        <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon /> 사용한 재료</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((chip) => (
            <span key={chip} className="inline-flex h-9 items-center gap-1 rounded-full border border-[#eee] bg-white px-3 text-[13px]">
              {chip}
              <button type="button" aria-label={`${chip} 빼기`} onClick={() => toggleChip(chip)} className="grid h-5 w-5 place-items-center">
                <CloseIcon size={12} />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => setPicking((value) => !value)} className="inline-flex h-9 items-center gap-1 rounded-full bg-[#f4f4f4] px-4 text-[13px] font-semibold">
            <PlusIcon className="h-3.5 w-3.5" /> 추가
          </button>
        </div>
        {picking ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-[#f0f0f0] bg-white">
            <label className="flex h-11 items-center gap-2 border-b border-[#f4f4f4] px-3">
              <SearchIcon />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="재료 검색"
                aria-label="재료 검색"
                className="w-full bg-transparent text-[14px] outline-none"
              />
            </label>
            {addingYarn ? (
              <form
                className="flex items-center gap-3 border-b border-[#f4f4f4] px-3 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  addNewYarn();
                }}
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f4f4f4]">
                  <PlusIcon className="h-4 w-4" />
                </span>
                <input
                  value={newYarn}
                  onChange={(event) => setNewYarn(event.target.value)}
                  placeholder="새 실 이름"
                  aria-label="새 실 이름"
                  autoFocus
                  className="h-10 min-w-0 flex-1 bg-transparent text-[14px] outline-none"
                />
                <button type="submit" className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[12px] font-semibold text-white">
                  추가
                </button>
              </form>
            ) : (
              <button type="button" onClick={() => setAddingYarn(true)} className="flex w-full items-center gap-3 border-b border-[#f4f4f4] px-3 py-2 text-left">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f4f4f4]">
                  <PlusIcon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] text-[#999]">실</span>
                  <span className="block text-[14px] font-semibold">목록에 없는 실 추가</span>
                </span>
              </button>
            )}
            <div className="grid grid-cols-3 border-b border-[#f4f4f4]">
              {MATERIAL_KINDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={kind === item}
                  onClick={() => setKind(item)}
                  className={cx("h-10 border-b-2 text-[13px]", kind === item ? "border-ink font-bold text-ink" : "border-transparent text-[#b0b0b0]")}
                >
                  {item}
                </button>
              ))}
            </div>
            <ul className="max-h-52 overflow-y-auto">
              {visible.length === 0 ? (
                <li className="px-4 py-6 text-center text-[13px] text-[#888]">{query.trim() ? "찾는 재료가 없어요." : `가진 ${kind} 재료가 없어요.`}</li>
              ) : null}
              {visible.map((item) => {
                const selected = chips.includes(item.label);
                return (
                  <li key={item.id} className="border-t border-[#f4f4f4] first:border-t-0">
                    <button type="button" onClick={() => toggleChip(item.label)} className="flex w-full items-center gap-3 px-3 py-2 text-left">
                      {item.image ? (
                        <img src={item.image} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                      ) : (
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#f3f3f3] text-[14px] font-bold">{item.label.slice(0, 1)}</span>
                      )}
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
          </div>
        ) : null}
      </section>

      <section className="px-4 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1 text-[16px] font-bold"><HeartIcon /> 나의 메모</h2>
          <button type="button" onClick={fillMemo} className="inline-flex h-8 items-center gap-1 rounded-full bg-ink px-3 text-[12px] font-semibold text-white">
            <SparkIcon />
            AI 채우기
          </button>
        </div>
        <textarea
          ref={memoRef}
          value={memo}
          onChange={(event) => {
            stopTyping();
            setMemo(event.target.value);
          }}
          placeholder="오늘의 뜨개 느낌이나 팁을 적어보세요."
          aria-label="나의 메모"
          className="memo-lines mt-3 h-40 w-full resize-none rounded-lg border border-[#f0e4d8] bg-[#fffdf8] px-4 py-3 text-[14px] leading-[28px] outline-none"
        />
        {project.diary.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {project.diary.map((entry, index) => (
              <li key={`${entry.date}-${index}`} className="rounded-lg bg-[#fafafa] px-3 py-2 text-[13px]">
                {editing === index ? (
                  <>
                    <input
                      value={entry.title}
                      aria-label="기록 제목"
                      autoFocus
                      onChange={(event) => updateDiary(project.id, index, { title: event.target.value, body: entry.body })}
                      className="w-full bg-transparent font-semibold outline-none"
                    />
                    <textarea
                      value={entry.body}
                      aria-label="기록 내용"
                      rows={Math.min(6, Math.max(2, entry.body.split("\n").length))}
                      onChange={(event) => updateDiary(project.id, index, { title: entry.title, body: event.target.value })}
                      className="mt-1 w-full resize-none bg-transparent leading-relaxed text-[#666] outline-none"
                    />
                  </>
                ) : (
                  <>
                    <span className="block font-semibold">{entry.title}</span>
                    <span className="mt-0.5 block whitespace-pre-line text-[#666]">{entry.body}</span>
                  </>
                )}
                <span className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-[12px] text-[#999]">{entry.date}</span>
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label={editing === index ? "수정 완료" : "기록 수정"}
                      onClick={() => setEditing(editing === index ? null : index)}
                      className="grid h-8 w-8 place-items-center"
                    >
                      {editing === index ? <CheckIcon /> : <PencilIcon />}
                    </button>
                    <button
                      type="button"
                      aria-label="기록 삭제"
                      onClick={() => {
                        if (editing === index) setEditing(null);
                        removeDiary(project.id, index);
                      }}
                      className="grid h-8 w-8 place-items-center"
                    >
                      <TrashIcon />
                    </button>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <div className="px-4 pt-6">
        {photos.length > 0 ? (
          <ul className={photos.length === 1 ? "mb-3" : "mb-3 grid grid-cols-3 gap-2"}>
            {photos.map((url) => (
              <li key={url} className="relative">
                <img src={url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                <button
                  type="button"
                  aria-label="이미지 빼기"
                  onClick={() => {
                    URL.revokeObjectURL(url);
                    setPhotos((current) => current.filter((item) => item !== url));
                  }}
                  className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white text-black shadow-sm"
                >
                  <CloseIcon size={12} />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
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
            if (photos.length >= 9) {
              notify("사진은 3줄, 9장까지 넣을 수 있어요");
              return;
            }
            setPhotos((current) => [...current, URL.createObjectURL(file)]);
          }}
        />
      </div>
    </div>
  );
}
