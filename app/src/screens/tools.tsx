import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { formatClock, media } from "../data.ts";
import { useApp } from "../store.tsx";
import type { GaugeRecord, GaugeTab } from "../types.ts";
import { BlackButton, CameraIcon, ChevronDown, DoneMark, Fab, GearIcon, Mascot, MinusIcon, PencilIcon, PinkButton, PlusIcon, Segment, TrashIcon, YarnBallIcon, cx } from "../ui.tsx";

export function GaugeScreen({ tab }: { tab: GaugeTab }) {
  const { replace } = useApp();
  return (
    <div className="relative min-h-full pb-24">
      <div className="px-4 pt-3">
        <Segment
          value={tab}
          onChange={(next) => replace({ name: "gauge", tab: next })}
          options={[
            { id: "manage", label: "게이지관리" },
            { id: "calc", label: "게이지 계산기" },
          ]}
        />
      </div>
      {tab === "calc" ? <Calculator /> : <GaugeList />}
    </div>
  );
}

export function GaugeHelpScreen() {
  const [tab, setTab] = useState<"tutorial" | "navi">("tutorial");
  return (
    <div className="px-4 pb-12">
      <p className="rounded-lg bg-[#f4f4f4] px-4 py-3 text-[13px] leading-relaxed">
        도안과 사이즈가 달라 속상했던 적 있나요?
        <br />
        사람마다 뜨는 힘이 달라서 그래요!
        <br />
        게이지 확인으로 사이즈 오차를 막을 수 있어요.
      </p>
      <div className="mt-4 flex gap-2">
        <button type="button" onClick={() => setTab("tutorial")} className={cx("h-11 flex-1 rounded-full text-[14px] font-semibold", tab === "tutorial" ? "bg-ink text-white" : "border border-[#e4e4e4] bg-white")}>
          튜토리얼
        </button>
        <button type="button" onClick={() => setTab("navi")} className={cx("h-11 flex-1 rounded-full text-[14px] font-semibold", tab === "navi" ? "bg-ink text-white" : "border border-[#e4e4e4] bg-white")}>
          뜨개 내비
        </button>
      </div>
      {tab === "tutorial" ? <GaugeTutorial /> : <NaviHelp />}
    </div>
  );
}

const HELP_HEADINGS = [
  { n: "1", title: "스와치 뜨기", top: "2.7%" },
  { n: "2", title: "코 세기", top: "29.59%" },
  { n: "3", title: "결과 확인", top: "53.67%" },
];

function GaugeTutorial() {
  return (
    <div className="relative mt-6 [container-type:inline-size]">
      <img src={media("media/gauge-help-tutorial.png")} alt="스와치 예시와 10cm 코 세기, 필요한 코수 계산식" className="w-full" />
      {HELP_HEADINGS.map((heading) => (
        <h2
          key={heading.n}
          className="absolute flex items-center gap-[1.6cqw] text-[#3a3a3a]"
          style={{ top: heading.top, left: "8%", transform: "translateY(-50%)" }}
        >
          <span className="text-[6.2cqw] font-black leading-none">{heading.n}</span>
          <span className="text-[4.8cqw] font-bold leading-none">{heading.title}</span>
        </h2>
      ))}
    </div>
  );
}

function NaviHelp() {
  const steps = [
    { n: "1", title: "프로젝트에서 열기", body: "진행 중인 프로젝트의 뜨개내비를 누르면 지금 할 단계만 순서대로 나와요." },
    { n: "2", title: "한 단계씩 체크", body: "끝난 단계는 체크하고 다음으로 넘어가면 돼요. 막힌 단계는 뜨니챗에 물어볼 수 있어요." },
    { n: "3", title: "끝나면 기록", body: "단계를 모두 마치면 완료 안내가 뜨고, 뜨개 일기에 오늘 한 코를 남길 수 있어요." },
  ];
  return (
    <div className="mt-6 space-y-5">
      {steps.map((step) => (
        <section key={step.n}>
          <h2 className="flex items-center gap-2">
            <span className="text-[32px] font-black leading-none text-blush">{step.n}</span>
            <span className="text-[18px] font-bold leading-none">{step.title}</span>
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-[#555]">{step.body}</p>
        </section>
      ))}
      <div className="flex items-end justify-end gap-2 pt-2">
        <span className="max-w-[12rem] rounded-lg bg-[#f6f6f6] px-3 py-2 text-[12px] leading-snug">순서가 헷갈리면 뜨개 내비가 지금 할 일만 보여줄게요.</span>
        <Mascot mood="cheer" className="h-20 w-20" />
      </div>
    </div>
  );
}

function Calculator() {
  const { calcSts, calcLen, calcResult, setCalc, data, push, openSheet } = useApp();
  const [ruler, setRuler] = useState(false);
  const unitLabel = data.unit === "imperial" ? "in" : "cm";
  const span = data.unit === "imperial" ? "4in" : "10cm";
  const divisor = data.unit === "imperial" ? 4 : 10;

  const calculate = () => {
    const sts = Number(calcSts);
    const len = Number(calcLen);
    if (!sts || !len) {
      setCalc({ result: null });
      return;
    }
    setCalc({ result: Math.ceil((sts / divisor) * len) });
  };

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-bold">{span} 측정한 코수</p>
        <button type="button" aria-label="스와치 사진으로 읽기" onClick={() => openSheet({ kind: "camera" })} className="grid h-6 w-6 place-items-center leading-none">
          <CameraIcon />
        </button>
      </div>
      <label className="mt-2 flex h-12 items-center rounded-full border border-[#eee] px-4">
        <input
          value={calcSts}
          onChange={(event) => setCalc({ sts: event.target.value.replace(/[^\d.]/g, ""), result: null })}
          inputMode="decimal"
          placeholder="예: 20"
          aria-label="측정한 코수"
          className="w-full bg-transparent outline-none"
        />
        <span className="text-[13px] text-[#999]">코</span>
      </label>
      <p className="mt-5 text-[16px] font-bold">목표 길이</p>
      <label className="mt-2 flex h-12 items-center rounded-full border border-[#eee] px-4">
        <input
          value={calcLen}
          onChange={(event) => setCalc({ len: event.target.value.replace(/[^\d.]/g, ""), result: null })}
          inputMode="decimal"
          placeholder={data.unit === "imperial" ? "예: 24" : "예: 60"}
          aria-label="목표 길이"
          className="w-full bg-transparent outline-none"
        />
        <span className="text-[13px] text-[#999]">{unitLabel}</span>
      </label>
      <BlackButton className="mt-5" onClick={calculate}>
        계산하기
      </BlackButton>
      {calcResult !== null ? (
        <div className="mt-4 rounded-lg border border-blush px-4 py-5 text-center">
          <p className="text-[14px]">계산 결과</p>
          <p className="text-[36px] font-bold">{calcResult}코</p>
          <p className="text-[12px] text-[#999]">(올림 처리된 값)</p>
        </div>
      ) : null}
      <PinkButton className="mt-3" disabled={calcResult === null} onClick={() => push({ name: "gauge-form" })}>
        게이지 저장하기
      </PinkButton>
      <button type="button" aria-label="자 열기" onClick={() => setRuler(true)} className="mt-8 flex w-full items-center justify-end gap-1 text-left">
        <span className="relative max-w-[180px] rounded-lg bg-[#f4f4f4] px-3 py-2 text-[13px] leading-snug">
          자가 필요하면
          <br />
          저를 클릭하세요!
          <span aria-hidden className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-[#f4f4f4]" />
        </span>
        <Mascot mood="cheer" className="h-28 w-28 shrink-0" />
      </button>
      {ruler ? <GaugeRuler onClose={() => setRuler(false)} /> : null}
    </div>
  );
}

const SWATCH_EDGE = (() => {
  const edge: string[] = [];
  for (let y = 0; y <= 1000; y += 10) {
    const x = 36 + Math.sin(y / 26) * 11 + Math.sin(y / 8.5) * 4;
    edge.push(`${x.toFixed(1)} ${y}`);
  }
  return `M0 0 H${edge[0]?.split(" ")[0] ?? 36} L${edge.join(" L")} L0 1000 Z`;
})();

function GaugeRuler({ onClose }: { onClose: () => void }) {
  const [y, setY] = useState(100);
  const [motion, setMotion] = useState(true);
  const yRef = useRef(100);
  const drag = useRef<{ startY: number; start: number; height: number } | null>(null);
  const closing = useRef(false);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.querySelector(".phone") as HTMLElement | null);
    const frame = requestAnimationFrame(() => {
      yRef.current = 0;
      setY(0);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const dismiss = () => {
    if (closing.current) return;
    closing.current = true;
    setMotion(true);
    yRef.current = 100;
    setY(100);
    window.setTimeout(onClose, 340);
  };

  const moveY = (next: number) => {
    const clamped = Math.max(0, next);
    yRef.current = clamped;
    setY(clamped);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (closing.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setMotion(false);
    drag.current = { startY: event.clientY, start: yRef.current, height: event.currentTarget.getBoundingClientRect().height };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;
    const delta = ((event.clientY - current.startY) / current.height) * 100;
    moveY(current.start + delta);
  };

  const onPointerUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setMotion(true);
    if (yRef.current > 12) dismiss();
    else moveY(0);
  };

  if (!host) return null;
  const marks = Array.from({ length: 16 }, (_, cm) => cm);
  const millimeters = Array.from({ length: 150 }, (_, mm) => mm + 1).filter((mm) => mm % 10 !== 0);

  return createPortal(
    <div
      role="dialog"
      aria-label="게이지 자"
      className="absolute inset-0 z-50 touch-none select-none bg-white"
      style={{ transform: `translateY(${y}%)`, transition: motion ? "transform 320ms ease" : "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="flex justify-center pt-3">
        <span className="h-1.5 w-16 rounded-full bg-[#d5d5d5]" />
      </div>
      <div className="relative mx-3 mt-2 h-[calc(100%-2.25rem)]">
        <svg className="pointer-events-none absolute left-[4.25rem] w-16" style={{ bottom: 28, top: 44 }} viewBox="0 0 64 1000" preserveAspectRatio="none" aria-hidden>
          <path d={SWATCH_EDGE} fill="#f6aeb6" />
        </svg>
        {millimeters.map((mm) => (
          <span
            key={mm}
            className="pointer-events-none absolute right-1 bg-[#d5d5d5]"
            style={{ bottom: `calc(40px + (100% - 96px) * ${mm / 150})`, width: mm % 5 === 0 ? 16 : 8, height: 1 }}
          />
        ))}
        {marks.map((cm) => {
          const major = cm % 5 === 0;
          const decade = cm % 10 === 0;
          return (
            <div key={cm} className="absolute left-0 right-0" style={{ bottom: `calc(40px + (100% - 96px) * ${cm / 15})` }}>
              {major ? (
                <span className="absolute left-0 w-14 text-center text-[40px] font-black leading-none" style={{ top: "50%", transform: "translateY(-50%) rotate(-90deg)" }}>
                  {cm}
                </span>
              ) : null}
              <span
                className="absolute right-1"
                style={{
                  left: "7.5rem",
                  height: decade ? 4 : major ? 3 : 1,
                  marginTop: decade ? -2 : major ? -1 : 0,
                  background: major ? "#171717" : "#d9d9d9",
                }}
              />
              <span className="absolute left-[7.7rem] top-0 -translate-y-1/2 bg-white pr-1 text-[11px] font-medium leading-none text-[#9a9a9a]">
                {cm * 10}mm
              </span>
            </div>
          );
        })}
        <div
          className="pointer-events-none absolute right-1"
          style={{ left: "11.25rem", bottom: "calc(48px + (100% - 96px) * 10 / 15)" }}
        >
          <p className="relative rounded-2xl bg-white px-3 py-2 text-[13px] leading-snug text-[#8a8a8a] shadow-card">
            <span className="font-bold text-blush">10cm</span>
            에 총 몇 코가 들어가는지 세어보세요!
            <span aria-hidden className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 bg-white" />
          </p>
        </div>
      </div>
    </div>,
    host,
  );
}

function GaugeList() {
  const { data, push, removeGauge } = useApp();
  if (data.gauges.length === 0) {
    return (
      <div className="grid place-items-center px-8 pt-16 text-center">
        <span className="rounded-lg bg-[#f4f4f4] px-4 py-3 text-[14px] leading-relaxed">
          세탁 전후 게이지,
          <br />
          뜨니가 체크해 드려요!
        </span>
        <Mascot mood="knit" className="h-36 w-36" />
        <Fab label="게이지 등록" onClick={() => push({ name: "gauge-form" })} />
      </div>
    );
  }
  return (
    <div>
      <ul className="space-y-3 px-4 pt-5">
        {data.gauges.map((gauge) => (
          <li key={gauge.id} className="relative flex gap-3 rounded-lg border border-[#f0f0f0] p-3">
            <button
              type="button"
              aria-label={`${gauge.name} 정보`}
              onClick={() => push({ name: "gauge-detail", id: gauge.id })}
              className="flex min-w-0 flex-1 gap-3 text-left"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-bold">{gauge.name}</span>
                <span className="mt-1 flex items-center gap-1 text-[12px] text-[#777]"><PencilIcon /> {gauge.thickness}</span>
                <span className="flex items-center gap-1 text-[12px] text-[#777]"><YarnBallIcon /> {gauge.yarnName}</span>
                <span className="mt-2 block text-[12px] text-[#999]">세탁 전</span>
                <span className="block text-[13px] font-semibold">{gauge.before}</span>
                <span className="mt-1 block text-[12px] text-[#999]">세탁 후</span>
                <span className="block text-[13px] font-semibold">{gauge.after}</span>
              </span>
              <img src={gauge.image} alt="" className="mt-8 h-16 w-16 shrink-0 rounded-lg object-cover" />
            </button>
            <button type="button" aria-label={`${gauge.name} 삭제`} onClick={() => removeGauge(gauge.id)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center text-[#bbb]">
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
      <Fab label="게이지 등록" onClick={() => push({ name: "gauge-form" })} />
    </div>
  );
}

export function GaugeDetailScreen({ id }: { id: string }) {
  const { data, push } = useApp();
  const gauge = data.gauges.find((item) => item.id === id);
  if (!gauge) return <p className="px-6 py-16 text-center text-[14px]">게이지를 찾지 못했어요.</p>;
  const project = data.projects.find((item) => item.id === gauge.projectId);
  return (
    <div className="px-4 pb-12">
      {gauge.image ? <img src={gauge.image} alt="" className="mx-auto mt-2 h-48 w-48 rounded-lg object-cover" /> : null}
      <h2 className="mt-4 text-center text-[20px] font-bold">{gauge.name}</h2>
      <p className="text-center text-[13px] text-[#888]">{gauge.thickness}</p>
      <div className="mt-5 space-y-3">
        <InfoRow label="실" value={gauge.yarnName} />
        <InfoRow label="바늘" value={gauge.needle || "기록 없음"} />
        <InfoRow label="도안" value={gauge.pattern || "기록 없음"} />
        <div className="rounded-lg border border-[#f0f0f0] px-4 py-3">
          <p className="text-[12px] text-[#999]">연결된 프로젝트</p>
          <div className="mt-1">
            {project ? (
              <button type="button" onClick={() => push({ name: "project", id: project.id })} className="text-left text-[15px] font-bold text-blush">
                {project.title}
              </button>
            ) : (
              <p className="text-[15px] font-bold">연결된 프로젝트 없음</p>
            )}
          </div>
        </div>
        <InfoRow label="세탁 전" value={gauge.before} />
        <InfoRow label="세탁 후" value={gauge.after} />
        <div className="memo-lines rounded-lg border border-[#f0f0f0] border-l-4 border-l-blush px-4 py-3">
          <p className="text-[12px] text-[#999]">메모</p>
          <p className="mt-1 whitespace-pre-wrap text-[14px] leading-7">{gauge.memo?.trim() || "적어 둔 메모가 없어요."}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#f0f0f0] px-4 py-3">
      <p className="text-[12px] text-[#999]">{label}</p>
      <p className="mt-1 text-[15px] font-bold">{value}</p>
    </div>
  );
}

export function GaugeFormScreen() {
  const { data, calcSts, calcLen, calcResult, saveGauge, back } = useApp();
  const [done, setDone] = useState(false);
  const [name, setName] = useState("울 3합");
  const [projectId, setProjectId] = useState(data.projects[0]?.id ?? "");
  const [yarnName, setYarnName] = useState(data.yarns[0]?.name ?? "");
  const [needle, setNeedle] = useState(data.needles[0]?.name ?? "");
  const [pattern, setPattern] = useState("벤쿠버 가디건");
  const [beforeSts, setBeforeSts] = useState(calcSts);
  const [beforeRows, setBeforeRows] = useState("");
  const [afterSts, setAfterSts] = useState("");
  const [afterRows, setAfterRows] = useState("");
  const [memo, setMemo] = useState(calcResult ? `계산 결과 ${calcResult}코 / 목표 ${calcLen}${data.unit === "imperial" ? "in" : "cm"}` : "");

  return (
    <form
      className="space-y-4 px-4 pb-12"
      onSubmit={(event) => {
        event.preventDefault();
        const gauge: GaugeRecord = {
          id: `g-${Date.now()}`,
          name: name.trim() || "게이지",
          thickness: data.needles.find((item) => item.name === needle)?.size ?? "3mm",
          yarnName,
          before: `${beforeRows || "-"}단 × ${beforeSts || "-"}코`,
          after: `${afterRows || "-"}단 × ${afterSts || "-"}코`,
          image: data.yarns[0]?.image ?? "",
          projectId,
          needle,
          pattern,
          memo,
        };
        saveGauge(gauge);
        setDone(true);
      }}
    >
      {done ? <DoneMark message={"게이지 등록을\n완료했어요!"} onDone={back} /> : null}
      <label className="block text-[14px] font-bold">
        게이지 이름
        <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-3 font-normal outline-none" />
      </label>
      <label className="block text-[14px] font-bold">
        연결된 프로젝트
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-3 font-normal">
          <option value="">프로젝트 없음</option>
          {data.projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        실 정보
        <select value={yarnName} onChange={(event) => setYarnName(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-3 font-normal">
          {data.yarns.map((yarn) => (
            <option key={yarn.id}>{yarn.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        바늘 정보
        <select value={needle} onChange={(event) => setNeedle(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-3 font-normal">
          {data.needles.map((item) => (
            <option key={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        도안명
        <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-3 font-normal outline-none" />
      </label>
      <Pair title="세탁 전 게이지" sts={beforeSts} rows={beforeRows} onSts={setBeforeSts} onRows={setBeforeRows} />
      <Pair title="세탁 후 게이지" sts={afterSts} rows={afterRows} onSts={setAfterSts} onRows={setAfterRows} />
      <label className="block text-[14px] font-bold">
        메모
        <textarea value={memo} onChange={(event) => setMemo(event.target.value)} className="mt-2 h-24 w-full rounded-lg bg-[#f6f6f6] px-3 py-3 font-normal outline-none" />
      </label>
      <button type="submit" className="h-12 w-full rounded-full bg-blush font-semibold text-white">
        저장
      </button>
    </form>
  );
}

function Pair({
  title,
  sts,
  rows,
  onSts,
  onRows,
}: {
  title: string;
  sts: string;
  rows: string;
  onSts: (value: string) => void;
  onRows: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-[14px] font-bold">{title}</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <input value={sts} onChange={(event) => onSts(event.target.value)} placeholder="코수" aria-label={`${title} 코수`} className="h-11 rounded-xl bg-[#f6f6f6] px-3 outline-none" />
        <input value={rows} onChange={(event) => onRows(event.target.value)} placeholder="단수" aria-label={`${title} 단수`} className="h-11 rounded-xl bg-[#f6f6f6] px-3 outline-none" />
      </div>
    </div>
  );
}

export function CounterListScreen() {
  const { data, push, addCounter, removeCounter, renameCounter } = useApp();
  const [editingId, setEditingId] = useState<string | null>(null);
  return (
    <div className="relative min-h-full pb-24">
      <ul className="space-y-3 px-4 pt-3">
        {data.counters.map((counter) => (
          <li key={counter.id} className="flex items-center rounded-lg border border-[#f3f3f3] shadow-card">
            <div className="min-w-0 flex-1 px-4 py-4">
              <NameField
                value={counter.name}
                editing={editingId === counter.id}
                onClose={() => setEditingId((current) => (current === counter.id ? null : current))}
                onCommit={(next) => renameCounter(counter.id, next)}
                onOpen={() => push({ name: "counter", id: counter.id })}
                label="카운터 이름"
                className="text-[18px]"
              />
              <button type="button" onClick={() => push({ name: "counter", id: counter.id })} className="mt-0.5 text-[13px] text-[#999]">
                카운터 {counter.rows.length}개
              </button>
            </div>
            <button
              type="button"
              aria-label={`${counter.name} 수정`}
              onClick={() => setEditingId(counter.id)}
              className="grid h-10 w-10 shrink-0 place-items-center text-[#bbb]"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              aria-label={`${counter.name} 삭제`}
              onClick={() => removeCounter(counter.id)}
              className="grid h-14 w-12 shrink-0 place-items-center text-[#bbb]"
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
      <Fab label="카운터 추가" onClick={addCounter} />
    </div>
  );
}

type VoiceRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0?: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function voiceRecognition(): (new () => VoiceRecognition) | null {
  const host = window as Window & { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition };
  return host.SpeechRecognition ?? host.webkitSpeechRecognition ?? null;
}

function spokenAmount(text: string) {
  const digit = text.match(/(\d+)/);
  if (digit) {
    const amount = Number(digit[1]);
    if (amount > 0 && amount <= 99) return amount;
  }
  const words: [string, number][] = [
    ["열", 10],
    ["아홉", 9],
    ["여덟", 8],
    ["일곱", 7],
    ["여섯", 6],
    ["다섯", 5],
    ["넷", 4],
    ["셋", 3],
    ["둘", 2],
    ["두코", 2],
    ["두단", 2],
    ["하나", 1],
  ];
  for (const [word, amount] of words) {
    if (text.includes(word)) return amount;
  }
  return 1;
}

function voiceCounterStep(transcript: string, rows: { id: string; label: string }[]) {
  const text = transcript.replace(/\s+/g, "");
  const rowAt = text.search(/단수|단/);
  const stitchAt = text.search(/코수|코/);
  if (rowAt < 0 && stitchAt < 0) return null;
  const keyword = rowAt < 0 ? "코" : stitchAt < 0 || rowAt <= stitchAt ? "단" : "코";
  const downAt = Math.max(text.lastIndexOf("빼"), text.lastIndexOf("감소"), text.lastIndexOf("내려"), text.lastIndexOf("줄여"));
  const upAt = Math.max(text.lastIndexOf("추가"), text.lastIndexOf("올려"), text.lastIndexOf("증가"), text.lastIndexOf("더해"));
  if (downAt < 0 && upAt < 0) return null;
  const row = rows.find((item) => item.label.includes(keyword));
  if (!row) return null;
  const sign = downAt > upAt ? -1 : 1;
  return { rowId: row.id, delta: sign * spokenAmount(text), label: row.label };
}

function voiceRunStep(transcript: string, rows: { id: string; label: string }[], currentId: string) {
  const text = transcript.replace(/\s+/g, "");
  const downWords = ["이전", "빼", "감소", "내려", "줄여"];
  const upWords = ["다음", "추가", "올려", "증가", "더해"];
  const downAt = downWords.reduce((at, word) => Math.max(at, text.lastIndexOf(word)), -1);
  const upAt = upWords.reduce((at, word) => Math.max(at, text.lastIndexOf(word)), -1);
  if (downAt < 0 && upAt < 0) return null;
  const rowAt = text.search(/단수|단/);
  const stitchAt = text.search(/코수|코/);
  let row = rows.find((item) => item.id === currentId) ?? rows[0];
  if (rowAt >= 0 || stitchAt >= 0) {
    const keyword = rowAt < 0 ? "코" : stitchAt < 0 || rowAt <= stitchAt ? "단" : "코";
    row = rows.find((item) => item.label.includes(keyword)) ?? row;
  }
  if (!row) return null;
  return { rowId: row.id, delta: (downAt > upAt ? -1 : 1) * spokenAmount(text) };
}

function useCounterVoice(onPhrase: (transcript: string) => void) {
  const { notify } = useApp();
  const onPhraseRef = useRef(onPhrase);
  const notifyRef = useRef(notify);
  onPhraseRef.current = onPhrase;
  notifyRef.current = notify;
  const [listening, setListening] = useState(false);
  const listeningRef = useRef(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const heardAt = useRef({ text: "", at: 0 });

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const stop = () => {
    listeningRef.current = false;
    setListening(false);
    recognitionRef.current?.stop();
  };

  const start = () => {
    const Recognition = voiceRecognition();
    if (!Recognition) {
      notifyRef.current("이 브라우저에서는 음성 인식을 쓸 수 없어요");
      return;
    }
    const recognition = recognitionRef.current ?? new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.isFinal ? result[0]?.transcript ?? "" : "";
        if (!transcript) continue;
        const now = Date.now();
        if (transcript === heardAt.current.text && now - heardAt.current.at < 900) continue;
        heardAt.current = { text: transcript, at: now };
        onPhraseRef.current(transcript);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        listeningRef.current = false;
        setListening(false);
        notifyRef.current("마이크 권한을 허용해 주세요");
      }
    };
    recognition.onend = () => {
      if (!listeningRef.current) return;
      try {
        recognition.start();
      } catch {
        listeningRef.current = false;
        setListening(false);
      }
    };
    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
      notifyRef.current("음성 인식을 시작하지 못했어요");
    }
  };

  return { listening, start, stop };
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="currentColor" d="M12 14.2a3.2 3.2 0 003.2-3.2V6.2a3.2 3.2 0 10-6.4 0v4.8a3.2 3.2 0 003.2 3.2z" />
      <path fill="currentColor" d="M6.2 11.2a.9.9 0 011.8 0 4 4 0 008 0 .9.9 0 011.8 0 5.8 5.8 0 01-4.9 5.73V19h2.2a.9.9 0 010 1.8H8.9a.9.9 0 010-1.8h2.2v-2.07A5.8 5.8 0 016.2 11.2z" />
    </svg>
  );
}

export function CounterScreen({ id }: { id: string }) {
  const { data, notify, push, setCounterProject, bumpCounter, removeCounterRow, addCounterRow, renameCounter, renameCounterRow } = useApp();
  const counter = data.counters.find((item) => item.id === id);
  const [openProjects, setOpenProjects] = useState(false);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const listeningRef = useRef(false);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const rowsRef = useRef(counter?.rows ?? []);
  const bumpRef = useRef(bumpCounter);
  const notifyRef = useRef(notify);
  const heardAt = useRef({ text: "", at: 0 });
  rowsRef.current = counter?.rows ?? [];
  bumpRef.current = bumpCounter;
  notifyRef.current = notify;

  useEffect(() => {
    return () => {
      listeningRef.current = false;
      recognitionRef.current?.abort();
    };
  }, []);

  const stopListening = () => {
    listeningRef.current = false;
    setListening(false);
    recognitionRef.current?.stop();
  };

  const startListening = () => {
    const Recognition = voiceRecognition();
    if (!Recognition) {
      notify("이 브라우저에서는 음성 인식을 쓸 수 없어요");
      return;
    }
    const recognition = recognitionRef.current ?? new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.isFinal ? result[0]?.transcript ?? "" : "";
        if (!transcript) continue;
        const now = Date.now();
        if (transcript === heardAt.current.text && now - heardAt.current.at < 900) continue;
        heardAt.current = { text: transcript, at: now };
        setHeard(transcript);
        const step = voiceCounterStep(transcript, rowsRef.current);
        if (!step) {
          notifyRef.current("단수 추가, 코수 추가처럼 말해 주세요");
          continue;
        }
        bumpRef.current(id, step.rowId, step.delta);
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        listeningRef.current = false;
        setListening(false);
        notifyRef.current("마이크 권한을 허용해 주세요");
      }
    };
    recognition.onend = () => {
      if (!listeningRef.current) return;
      try {
        recognition.start();
      } catch {
        listeningRef.current = false;
        setListening(false);
      }
    };
    recognitionRef.current = recognition;
    listeningRef.current = true;
    setListening(true);
    setHeard("");
    try {
      recognition.start();
    } catch {
      listeningRef.current = false;
      setListening(false);
      notify("음성 인식을 시작하지 못했어요");
    }
  };

  if (!counter) return <p className="px-6 py-16 text-center">카운터를 찾지 못했어요.</p>;
  const linked = data.projects.find((project) => project.id === counter.projectId);
  return (
    <div className="space-y-4 px-4 pb-10">
      <label className="block">
        <span className="text-[14px] font-bold">카운터 이름</span>
        <input
          value={counter.name}
          onChange={(event) => renameCounter(counter.id, event.target.value)}
          aria-label="카운터 이름"
          className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-4 text-[16px] font-semibold outline-none"
        />
      </label>
      <div className="rounded-lg border border-[#f2f2f2] p-4">
        <span className="text-[14px] font-bold">연결 프로젝트</span>
        <button
          type="button"
          onClick={() => setOpenProjects((value) => !value)}
          className="mt-2 flex h-12 w-full items-center justify-between rounded-lg bg-[#f6f6f6] px-4 text-left text-[14px]"
          aria-expanded={openProjects}
        >
          <span className="truncate">{linked ? linked.title : "프로젝트 선택하기"}</span>
          <ChevronDown up={openProjects} />
        </button>
        {openProjects ? (
          <ul className="mt-3 space-y-2">
            <li>
              <button
                type="button"
                onClick={() => {
                  setCounterProject(counter.id, null);
                  setOpenProjects(false);
                }}
                className={cx("w-full rounded-lg border px-4 py-3 text-left text-[14px]", !linked ? "border-blush bg-blush-soft" : "border-[#f0f0f0]")}
              >
                연결 안 함
              </button>
            </li>
            {data.projects.map((project) => {
              const selected = project.id === counter.projectId;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCounterProject(counter.id, project.id);
                      setOpenProjects(false);
                    }}
                    className={cx("flex w-full items-center gap-3 rounded-lg border p-2 text-left", selected ? "border-blush bg-blush-soft" : "border-[#f0f0f0] bg-white")}
                  >
                    <img src={project.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-bold">{project.title}</span>
                      <span className="text-[12px] text-[#888]">{project.progress}% · {project.ago}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
      <div>
        <button
          type="button"
          aria-pressed={listening}
          onClick={() => (listening ? stopListening() : startListening())}
          className={cx(
            "flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold",
            listening ? "bg-blush text-white" : "bg-[#f6f6f6]",
          )}
        >
          <MicIcon />
          {listening ? "듣는 중 · 누르면 멈춰요" : "음성으로 세기"}
        </button>
        <p className="mt-2 text-center text-[12px] text-[#999]" aria-live="polite">
          {heard ? `“${heard}”` : "단수 추가, 코수 추가, 단수 빼, 코수 빼"}
        </p>
      </div>
      {counter.rows.map((row) => (
        <section key={row.id} className="overflow-hidden rounded-lg border border-[#eee]">
          <div className="flex items-center justify-between gap-2 bg-ink px-4 py-2 text-white">
            <div className="min-w-0 flex-1">
              <NameField
                value={row.label}
                editing={editingRow === row.id}
                onClose={() => setEditingRow((current) => (current === row.id ? null : current))}
                onCommit={(next) => renameCounterRow(counter.id, row.id, next)}
                onOpen={() => push({ name: "counter-run", id: counter.id, row: row.id })}
                label="칸 이름"
                className="text-[14px] text-white caret-white"
                dark
              />
            </div>
            <button
              type="button"
              aria-label={`${row.label} 수정`}
              onClick={() => setEditingRow(row.id)}
              className="grid h-8 w-8 place-items-center"
            >
              <PencilIcon />
            </button>
            <button
              type="button"
              aria-label={`${row.label} 삭제`}
              onClick={() => removeCounterRow(counter.id, row.id)}
              className="grid h-8 w-8 place-items-center"
            >
              <TrashIcon />
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-4">
            <StepButton label="감소" disabled={row.value === 0} onClick={() => bumpCounter(counter.id, row.id, -1)}>
              <MinusIcon className="h-5 w-5" />
            </StepButton>
            <button
              type="button"
              onClick={() => push({ name: "counter-run", id: counter.id, row: row.id })}
              className="flex min-w-0 flex-1 items-center justify-center"
              aria-label={`${row.label} 세기`}
            >
              <span className="text-[40px] font-bold">{row.value}</span>
            </button>
            <StepButton label="증가" pink onClick={() => bumpCounter(counter.id, row.id, 1)}>
              <PlusIcon className="h-5 w-5" />
            </StepButton>
          </div>
        </section>
      ))}
      <button type="button" onClick={() => addCounterRow(counter.id)} className="flex h-16 w-full items-center justify-center gap-2 rounded-[20px] bg-[#f6f6f6] font-semibold">
        <PlusIcon className="h-4 w-4" /> 카운터 추가
      </button>
    </div>
  );
}

const COUNT_COLORS = [
  { id: "pink", label: "분홍", value: "#f47c7b" },
  { id: "blue", label: "파랑", value: "#4f8fe0" },
  { id: "green", label: "초록", value: "#5aaa72" },
  { id: "purple", label: "보라", value: "#9a7ed0" },
  { id: "gray", label: "회색", value: "#8d9399" },
] as const;
const COUNT_SIZES = [
  { id: "sm", label: "작게", number: "text-[72px]", button: "h-48 w-48", word: "text-[32px]" },
  { id: "md", label: "보통", number: "text-[104px]", button: "h-64 w-64", word: "text-[40px]" },
  { id: "lg", label: "크게", number: "text-[128px]", button: "h-72 w-72", word: "text-[48px]" },
] as const;

function speakCount(word: string, enabled: boolean) {
  if (!enabled || !window.speechSynthesis) return;
  try {
    const utter = new SpeechSynthesisUtterance(word);
    utter.lang = "ko-KR";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } catch {
    // 이 브라우저에서 소리 재생을 못해도 숫자는 그대로 올라간다.
  }
}

export function CounterRunScreen({ id, row }: { id: string; row: string }) {
  const { data, back, notify, push, bumpCounter, setCounterRowValue, resetCounterRow, setProjectRunning } = useApp();
  const [counterId, setCounterId] = useState(id);
  const [rowId, setRowId] = useState(row);
  const counter = data.counters.find((item) => item.id === counterId);
  const [seconds, setSeconds] = useState(0);
  const [heard, setHeard] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [scale, setScale] = useState<(typeof COUNT_SIZES)[number]["id"]>("md");
  const [colorId, setColorId] = useState<(typeof COUNT_COLORS)[number]["id"] | "custom">("pink");
  const [customColor, setCustomColor] = useState("#f47c7b");
  const [draftValue, setDraftValue] = useState("");
  const rowsRef = useRef(counter?.rows ?? []);
  const rowRef = useRef(rowId);
  const counterIdRef = useRef(counterId);
  const soundRef = useRef(soundOn);
  const setRunningRef = useRef(setProjectRunning);
  const tracked = useRef<{ projectId: string | null; started: boolean } | null>(null);
  rowsRef.current = counter?.rows ?? [];
  rowRef.current = rowId;
  counterIdRef.current = counterId;
  soundRef.current = soundOn;
  setRunningRef.current = setProjectRunning;
  const boot = useRef<{ projectId: string | null; running: boolean } | null>(null);
  if (!boot.current) {
    const project = data.projects.find((item) => item.id === counter?.projectId);
    boot.current = { projectId: counter?.projectId ?? null, running: project?.running ?? false };
  }
  const { listening, start, stop } = useCounterVoice((transcript) => {
    setHeard(transcript);
    const step = voiceRunStep(transcript, rowsRef.current, rowRef.current);
    if (!step) {
      notify("다음, 이전, 단수 추가처럼 말해 주세요");
      return;
    }
    setRowId(step.rowId);
    bumpCounter(counterIdRef.current, step.rowId, step.delta);
    if (step.delta !== 0) speakCount(step.delta > 0 ? "다음" : "이전", soundRef.current);
  });

  useEffect(() => {
    const projectId = boot.current?.projectId ?? null;
    const already = boot.current?.running ?? false;
    if (projectId && !already) {
      setRunningRef.current(projectId, true);
      tracked.current = { projectId, started: true };
    } else {
      tracked.current = { projectId, started: false };
    }
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => {
      window.clearInterval(timer);
      const current = tracked.current;
      if (current?.started && current.projectId) setRunningRef.current(current.projectId, false);
    };
  }, []);

  if (!counter) return <p className="px-6 py-16 text-center text-white">카운터를 찾지 못했어요.</p>;
  const active = counter.rows.find((item) => item.id === rowId) ?? counter.rows[0];
  if (!active) return <p className="px-6 py-16 text-center text-white">셀 칸이 없어요.</p>;
  const linked = data.projects.find((project) => project.id === counter.projectId);
  const title = linked?.title ?? counter.name;
  const color = colorId === "custom" ? customColor : (COUNT_COLORS.find((item) => item.id === colorId)?.value ?? COUNT_COLORS[0].value);
  const clock = linked ? formatClock(linked.elapsed) : formatClock(seconds);
  const size = COUNT_SIZES.find((item) => item.id === scale) ?? COUNT_SIZES[1];
  const finishWork = () => {
    if (!linked) {
      notify("연결된 프로젝트가 없어 일기를 열 수 없어요");
      return;
    }
    setProjectRunning(linked.id, false);
    if (tracked.current) tracked.current = { projectId: linked.id, started: false };
    push({ name: "diary", id: linked.id });
  };
  const switchItem = (nextCounterId: string, nextRowId: string) => {
    const next = data.counters.find((item) => item.id === nextCounterId);
    if (!next) return;
    const nextProjectId = next.projectId;
    const current = tracked.current;
    if ((current?.projectId ?? null) !== (nextProjectId ?? null)) {
      if (current?.started && current.projectId) setProjectRunning(current.projectId, false);
      const nextProject = data.projects.find((item) => item.id === nextProjectId);
      if (nextProjectId && !nextProject?.running) {
        setProjectRunning(nextProjectId, true);
        tracked.current = { projectId: nextProjectId, started: true };
      } else {
        tracked.current = { projectId: nextProjectId, started: false };
      }
      if (!nextProjectId) setSeconds(0);
    }
    setCounterId(nextCounterId);
    setRowId(nextRowId);
    setListOpen(false);
  };
  const openSettings = () => {
    setDraftValue(String(active.value));
    setSettingsOpen(true);
  };

  return (
    <div className="relative flex min-h-full flex-1 flex-col text-white" style={{ backgroundColor: color }}>
      <header className="grid h-12 grid-cols-[40px_1fr_auto] items-center px-2">
        <button type="button" aria-label="뒤로" onClick={back} className="grid h-10 w-10 place-items-center">
          <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
            <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <h1 className="truncate text-center text-[17px] font-bold">{title}</h1>
        <button type="button" onClick={finishWork} className="mr-1 h-8 rounded-full bg-black px-3 text-[13px] font-semibold">
          완료
        </button>
      </header>

      <div className="flex items-center justify-between gap-1 px-4 pt-3">
        <button
          type="button"
          aria-label={listening ? "음성 인식 끄기" : "음성 인식 켜기"}
          aria-pressed={listening}
          onClick={() => (listening ? stop() : start())}
          className={cx("grid h-10 w-10 shrink-0 place-items-center rounded-full", listening && "bg-white text-[#f47c7b]")}
        >
          <MicGlyph off={!listening} />
        </button>
        <button
          type="button"
          aria-label={soundOn ? "소리 끄기" : "소리 켜기"}
          aria-pressed={soundOn}
          onClick={() => setSoundOn((value) => !value)}
          className="grid h-10 w-10 shrink-0 place-items-center"
        >
          <SpeakerGlyph off={!soundOn} />
        </button>
        <p className="min-w-0 flex-1 text-center font-mono text-[18px] font-semibold tracking-wide">{clock}</p>
        <button
          type="button"
          aria-label="숫자 초기화"
          onClick={() => {
            resetCounterRow(counter.id, active.id);
            notify("숫자를 0으로 돌렸어요");
          }}
          className="grid h-10 w-10 shrink-0 place-items-center"
        >
          <RefreshGlyph />
        </button>
        <button type="button" aria-label="세기 설정" onClick={openSettings} className="grid h-10 w-10 shrink-0 place-items-center">
          <GearIcon />
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {heard ? `${active.label} ${heard}` : ""}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4">
        <p className="text-[15px] font-semibold text-white/90">{active.label}</p>
        <p className={cx("mt-1 font-bold leading-none", size.number)}>{active.value}</p>
        <button
          type="button"
          aria-label="다음"
          onClick={() => {
            bumpCounter(counter.id, active.id, 1);
            speakCount("다음", soundOn);
          }}
          className={cx("mt-6 grid place-items-center rounded-full bg-black", size.button)}
        >
          <span className="flex flex-col items-center gap-1">
            <CountChevron />
            <span className={cx("font-bold leading-none", size.word)}>다음</span>
          </span>
        </button>
      </div>

      <div className="px-6 pb-8">
        <button
          type="button"
          aria-expanded={listOpen}
          onClick={() => setListOpen(true)}
          className="h-12 w-full rounded-full bg-black text-[16px] font-semibold"
        >
          카운터 목록
        </button>
      </div>

      {listOpen ? (
        <div className="absolute inset-0 z-20 flex items-end bg-black/35" onClick={() => setListOpen(false)}>
          <div
            className="sheet-up max-h-[72%] w-full overflow-y-auto rounded-t-lg bg-white px-5 pb-8 pt-4 text-ink"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-label="카운터 목록"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e6e6e6]" />
            <h2 className="text-[17px] font-bold">카운터 목록</h2>
            <ul className="mt-4 space-y-4">
              {data.counters.map((item) => (
                <li key={item.id}>
                  <p className="text-[13px] font-semibold text-[#888]">{item.name}</p>
                  <ul className="mt-2 space-y-2">
                    {item.rows.map((entry) => {
                      const selected = item.id === counter.id && entry.id === active.id;
                      return (
                        <li key={`${item.id}-${entry.id}`}>
                          <button
                            type="button"
                            aria-pressed={selected}
                            onClick={() => switchItem(item.id, entry.id)}
                            className={cx(
                              "flex h-12 w-full items-center justify-between rounded-lg px-4 text-left",
                              selected ? "bg-blush-soft" : "bg-[#f6f6f6]",
                            )}
                          >
                            <span className="font-semibold">{entry.label}</span>
                            <span className="text-[18px] font-bold">{entry.value}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {settingsOpen ? (
        <div className="absolute inset-0 z-20 flex items-end bg-black/35" onClick={() => setSettingsOpen(false)}>
          <div className="w-full rounded-t-lg bg-white px-5 pb-8 pt-4 text-ink" onClick={(event) => event.stopPropagation()} role="dialog" aria-label="세기 설정">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#e6e6e6]" />
            <h2 className="text-[17px] font-bold">세기 설정</h2>
            <p className="mt-4 text-[13px] font-semibold text-[#888]">크기</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {COUNT_SIZES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={scale === item.id}
                  onClick={() => setScale(item.id)}
                  className={cx("h-10 rounded-full text-[14px] font-semibold", scale === item.id ? "bg-ink text-white" : "bg-[#f6f6f6]")}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-[13px] font-semibold text-[#888]">색</p>
            <div className="mt-2 flex flex-wrap gap-3">
              {COUNT_COLORS.map((swatch) => (
                <button
                  key={swatch.id}
                  type="button"
                  aria-label={`${swatch.label} 계열`}
                  aria-pressed={colorId === swatch.id}
                  onClick={() => setColorId(swatch.id)}
                  className={cx("h-10 w-10 rounded-full", colorId === swatch.id && "ring-2 ring-ink ring-offset-2")}
                  style={{ backgroundColor: swatch.value }}
                />
              ))}
              <label className="relative h-10 w-10">
                <span
                  aria-hidden
                  className={cx("block h-10 w-10 rounded-full", colorId === "custom" && "ring-2 ring-ink ring-offset-2")}
                  style={{ background: "conic-gradient(#ff4d4d, #ffd24d, #5dce6a, #4db7ff, #7a6bff, #e85aad, #ff4d4d)" }}
                />
                <input
                  type="color"
                  aria-label="직접 고르기"
                  value={customColor}
                  onChange={(event) => {
                    setCustomColor(event.target.value);
                    setColorId("custom");
                  }}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>
            </div>
            <label className="mt-4 block text-[13px] font-semibold text-[#888]">
              {active.label}
              <input
                inputMode="numeric"
                aria-label={`${active.label} 숫자`}
                value={draftValue}
                onChange={(event) => {
                  const next = event.target.value.replace(/[^\d]/g, "");
                  setDraftValue(next);
                  if (next !== "") setCounterRowValue(counter.id, active.id, Number(next));
                }}
                className="mt-2 h-12 w-full rounded-lg bg-[#f6f6f6] px-4 text-[18px] font-semibold text-ink outline-none"
              />
            </label>
            <button type="button" onClick={() => setSettingsOpen(false)} className="mt-5 h-11 w-full rounded-full bg-[#f6f6f6] text-[14px] font-semibold">
              닫기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SpeakerGlyph({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M4.5 10h2.8L11 7.2v9.6L7.3 14H4.5v-4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      {off ? (
        <path d="M15.5 10.2 19.5 14.2M19.5 10.2 15.5 14.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      ) : (
        <path d="M15.2 9.2a3.8 3.8 0 010 5.6M17.4 7.2a6.4 6.4 0 010 9.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      )}
    </svg>
  );
}

function MicGlyph({ off = false }: { off?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 11.2a5.5 5.5 0 0011 0M12 16.7V20M9 20h6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      {off ? <path d="M5 5.5 19 18.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /> : null}
    </svg>
  );
}

function RefreshGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path d="M19.5 12a7.5 7.5 0 11-2.1-5.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19.8 4.8V9h-4.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CountChevron({ down = false }: { down?: boolean }) {
  return (
    <svg viewBox="0 0 48 28" className={down ? "h-6 w-10" : "h-9 w-14"} aria-hidden>
      <path
        d={down ? "M6 6 24 23 42 6" : "M6 22 24 5 42 22"}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NameField({
  value,
  editing,
  onClose,
  onCommit,
  onOpen,
  className,
  dark,
  label,
}: {
  value: string;
  editing: boolean;
  onClose: () => void;
  onCommit: (next: string) => void;
  onOpen?: () => void;
  className?: string;
  dark?: boolean;
  label: string;
}) {
  const [draft, setDraft] = useState(value);
  const cancelRef = useRef(false);
  useEffect(() => {
    if (editing) setDraft(value);
  }, [editing, value]);
  if (!editing) {
    if (onOpen) {
      return (
        <button type="button" onClick={onOpen} className={cx("block w-full truncate text-left font-semibold", className)}>
          {value}
        </button>
      );
    }
    return <p className={cx("truncate font-semibold", className)}>{value}</p>;
  }
  return (
    <input
      autoFocus
      aria-label={label}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (!cancelRef.current) {
          const next = draft.trim();
          if (next) onCommit(next);
        }
        cancelRef.current = false;
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          cancelRef.current = true;
          event.currentTarget.blur();
        }
      }}
      className={cx(
        "h-8 w-full bg-transparent font-semibold outline-none",
        dark ? "placeholder:text-white/60" : "placeholder:text-[#bbb]",
        className,
      )}
    />
  );
}

function StepButton({
  children,
  onClick,
  label,
  pink,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  label: string;
  pink?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "grid h-14 w-14 place-items-center rounded-full text-2xl",
        pink ? "bg-blush text-white" : "bg-[#ededed]",
        disabled && "opacity-40",
      )}
    >
      {children}
    </button>
  );
}

const REPLIES: { test: RegExp; text: string }[] = [
  { test: /게이지/, text: "10cm 안의 코 수를 재고, 목표 길이를 넣으면 필요한 코를 올림해 드려요. 홈의 게이지 도구를 열어 보세요." },
  { test: /나비|내비/, text: "프로젝트 카드의 뜨개내비를 누르면 지금 할 단계부터 체크할 수 있어요." },
  { test: /바늘/, text: "실 상세의 권장 바늘을 먼저 보고, 바늘 창고에서 굵기를 맞춰 보세요." },
  { test: /코|단/, text: "행/코 카운터에서 단과 코를 따로 셀 수 있어요. 프로젝트에 연결해 두면 다음에 찾기 쉬워요." },
];

export function ChatScreen() {
  const { data } = useApp();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<{ from: "bot" | "me"; text: string }[]>([
    { from: "bot", text: `안녕하세요, ${data.nickname}님. 뜨니예요. 게이지, 바늘, 내비, 뭐든 물어보세요.` },
  ]);

  const send = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const found = REPLIES.find((reply) => reply.test.test(trimmed));
    const answer = found?.text ?? "그 부분은 프로젝트 일기나 게이지 메모에 남겨 두면 다음에 뜨니가 같이 볼게요.";
    setMessages((current) => [...current, { from: "me", text: trimmed }, { from: "bot", text: answer }]);
    setText("");
  };

  const suggestions = useMemo(() => ["게이지가 뭐예요?", "내비 어떻게 써요?", "바늘 추천"], []);

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col bg-white">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={cx("flex", message.from === "me" ? "justify-end" : "justify-start gap-2")}>
            {message.from === "bot" ? <Mascot className="h-11 w-11 shrink-0" /> : null}
            <p className={cx("max-w-[75%] rounded-lg px-3 py-2 text-[14px] leading-relaxed", message.from === "me" ? "bg-ink text-white" : "bg-[#f5f5f5]")}>
              {message.text}
            </p>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button key={item} type="button" onClick={() => send(item)} className="rounded-full bg-blush-soft px-3 py-1 text-[12px]">
              {item}
            </button>
          ))}
        </div>
      </div>
      <form
        className="mt-auto flex shrink-0 gap-2 border-t border-[#f2f2f2] bg-white px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          send(text);
        }}
      >
        <input value={text} onChange={(event) => setText(event.target.value)} placeholder="뜨니에게 물어보기" aria-label="메시지" className="h-11 flex-1 rounded-full bg-[#f6f6f6] px-4 outline-none" />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-blush px-4 text-[14px] font-semibold text-white">
          보내기
        </button>
      </form>
    </div>
  );
}

