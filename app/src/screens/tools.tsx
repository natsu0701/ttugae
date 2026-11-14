import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { media } from "../data.ts";
import { useApp } from "../store.tsx";
import type { GaugeRecord, GaugeTab } from "../types.ts";
import { BlackButton, CameraIcon, ChevronDown, CloseIcon, DoneMark, Fab, InfoButton, Mascot, MinusIcon, PencilIcon, PinkButton, PlusIcon, Segment, TrashIcon, YarnBallIcon, cx } from "../ui.tsx";

export function GaugeScreen({ tab }: { tab: GaugeTab }) {
  const { replace, push } = useApp();
  return (
    <div className="relative min-h-full pb-24">
      <div className="flex items-center justify-end pr-1">
        <InfoButton label="게이지 도움말" onClick={() => push({ name: "gauge-help" })} />
      </div>
      <div className="px-4">
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
        도안과 사이즈가 달라 속상했던 적 있나요? 사람마다 손힘(또는 뜨는 힘)이 달라서 그래요! 게이지 확인으로 사이즈 오차를 막을 수 있어요.
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

function GaugeTutorial() {
  return (
    <div className="mt-6 space-y-8">
      <section>
        <h2 className="text-[18px] font-bold"><span className="text-blush">1</span> 스와치 뜨기</h2>
        <p className="mt-1 text-[14px]">15×15cm 정도의 편물(스와치)을 떠보세요!</p>
        <div className="relative mt-3 overflow-hidden rounded-lg">
          <img src={media("media/swatch-linen.jpg")} alt="" className="h-48 w-full object-cover" />
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold">2코</span>
          <span className="absolute right-3 top-8 rounded-full bg-white/90 px-2 py-0.5 text-[12px] font-semibold">3코</span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold">릴랙스드 뜨기</span>
        </div>
        <div className="mt-2 flex justify-between px-2 text-[12px] text-[#777]">
          <span>← 겉뜨기</span>
          <span>안뜨기 →</span>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-[#999]">겉뜨기는 오른쪽으로, 안뜨기는 왼쪽으로 떠요. 코의 크기가 일정하면 좋아요.</p>
      </section>

      <section>
        <h2 className="text-[18px] font-bold"><span className="text-blush">2</span> 코 세기</h2>
        <p className="mt-1 text-[14px] font-semibold">10cm 안에 몇 코가 있나요?</p>
        <p className="mt-1 text-[13px] leading-relaxed text-[#666]">게이지 계산기에 숫자를 알려주세요. 나머지 계산은 뜨니가 할게요!</p>
        <div className="relative mt-3 overflow-hidden rounded-lg">
          <img src={media("media/swatch-gray.jpg")} alt="" className="h-40 w-full object-cover" />
          <div className="absolute left-4 right-24 top-1/2">
            <span className="block border-t-2 border-ink" />
            <span className="mx-auto mt-1 block w-fit rounded-full bg-white/90 px-2 text-[12px] font-bold">10cm</span>
          </div>
          <div className="absolute bottom-2 right-2 flex items-end gap-1">
            <span className="mb-3 max-w-[9rem] rounded-lg bg-white px-2 py-1 text-[11px] leading-snug shadow-card">10cm 안에 몇 코가 있나요?</span>
            <Mascot mood="cheer" className="h-16 w-16" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-[18px] font-bold"><span className="text-blush">3</span> 결과 확인</h2>
        <p className="mt-1 text-[14px] leading-relaxed">짠! 이번 프로젝트는 예) 20코로 시작하면 완벽해요!</p>
        <div className="mt-3 flex items-end justify-end gap-2">
          <span className="max-w-[12rem] rounded-lg bg-[#f6f6f6] px-3 py-2 text-[12px] leading-snug">세탁 전후 게이지를 입력하면 더 정확하게 관리할 수 있어요!</span>
          <Mascot mood="knit" className="h-20 w-20" />
        </div>
      </section>

      <section>
        <p className="text-[28px] font-black leading-none text-[#d0d0d0]">Q.</p>
        <h2 className="mt-1 text-[18px] font-bold">게이지, 어떻게 계산할까요?</h2>
        <div className="mt-3 flex items-start gap-3">
          <Mascot mood="cheer" className="h-16 w-16 shrink-0" />
          <p className="text-[13px] leading-relaxed text-[#555]">
            뜨니가 처리하는 계산식은 다음과 같습니다. 사용하는 나의 게이지와 목표 길이를 입력하면 됩니다. 어려운 수학 계산은 뜨니한테 맡기세요!
          </p>
        </div>
        <div className="mt-4 rounded-lg bg-[#fafafa] px-3 py-4 text-center">
          <p className="text-[13px] font-semibold">10cm 안에 코가 몇 개 들어가는지만 알려주면 끝!</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[12px]">
            <span>게이지(10cm 코수)</span>
            <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-white px-2 text-[16px] font-bold">10</span>
            <span className="text-[18px]">×</span>
            <span>목표 길이(cm)</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[16px] font-bold text-white">11</span>
          </div>
          <p className="mt-3 text-[14px] font-bold">필요 코수</p>
          <p className="mt-2 text-[11px] leading-relaxed text-[#999]">아까 센 코 수와 목표 길이를 곱하면 결과가 나와요.</p>
        </div>
      </section>
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
          <h2 className="text-[18px] font-bold"><span className="text-blush">{step.n}</span> {step.title}</h2>
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
      <button type="button" aria-label="자 열기" onClick={() => setRuler(true)} className="mt-8 flex w-full items-end justify-between text-left">
        <span className="max-w-[180px] rounded-lg bg-[#f4f4f4] px-3 py-2 text-[13px] leading-snug">
          자가 필요하면
          <br />
          저를 클릭하세요!
        </span>
        <Mascot mood="cheer" className="h-28 w-28" />
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
            </div>
          );
        })}
        <div
          className="pointer-events-none absolute left-[8.4rem]"
          style={{ bottom: "calc(52px + (100% - 96px) * 10 / 15)", height: "calc((100% - 96px) * 4.2 / 15)" }}
        >
          <p
            className="relative h-full w-max rounded-2xl bg-white px-3 py-2 text-[13px] text-[#8a8a8a] shadow-card"
            style={{ writingMode: "vertical-rl", textOrientation: "mixed", lineHeight: 1.25 }}
          >
            <span className="font-bold text-blush">10cm</span>
            에 총 몇 코가 들어가는지 세어보세요!
            <span aria-hidden className="absolute -bottom-1.5 left-4 h-3 w-3 rotate-45 bg-white" />
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
          <li key={gauge.id} className="flex gap-3 rounded-lg border border-[#f0f0f0] p-3">
            <div className="flex-1">
              <p className="font-bold">{gauge.name}</p>
              <p className="mt-1 flex items-center gap-1 text-[12px] text-[#777]"><PencilIcon /> {gauge.thickness}</p>
              <p className="flex items-center gap-1 text-[12px] text-[#777]"><YarnBallIcon /> {gauge.yarnName}</p>
              <p className="mt-2 text-[12px] text-[#999]">세탁 전</p>
              <p className="text-[13px] font-semibold">{gauge.before}</p>
              <p className="mt-1 text-[12px] text-[#999]">세탁 후</p>
              <p className="text-[13px] font-semibold">{gauge.after}</p>
            </div>
            <div className="flex flex-col items-end">
              <button type="button" aria-label="게이지 삭제" onClick={() => removeGauge(gauge.id)} className="grid h-8 w-8 place-items-center text-[#bbb]">
                <TrashIcon />
              </button>
              <img src={gauge.image} alt="" className="mt-2 h-16 w-16 rounded-lg object-cover" />
            </div>
          </li>
        ))}
      </ul>
      <Fab label="게이지 등록" onClick={() => push({ name: "gauge-form" })} />
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
  const { data, push, addCounter } = useApp();
  return (
    <div className="relative min-h-full pb-24">
      <div className="flex justify-end px-4">
        <InfoButton title="행/코 카운터" body="단과 코를 따로 세고, 프로젝트에 연결해 두면 다음에 이어서 뜰 위치를 잊지 않아요." />
      </div>
      <ul className="space-y-3 px-4 pt-2">
        {data.counters.map((counter) => (
          <li key={counter.id}>
            <button type="button" onClick={() => push({ name: "counter", id: counter.id })} className="flex w-full items-center justify-between rounded-lg border border-[#f3f3f3] px-4 py-4 text-left shadow-card">
              <span>
                <span className="block text-[18px] font-bold">{counter.name}</span>
                <span className="text-[13px] text-[#999]">카운터 {counter.rows.length}개</span>
              </span>
              <span aria-hidden>›</span>
            </button>
          </li>
        ))}
      </ul>
      <Fab label="카운터 추가" onClick={addCounter} />
    </div>
  );
}

export function CounterScreen({ id }: { id: string }) {
  const { data, setCounterProject, bumpCounter, removeCounterRow, addCounterRow, renameCounter } = useApp();
  const counter = data.counters.find((item) => item.id === id);
  const [openProjects, setOpenProjects] = useState(false);
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
      {counter.rows.map((row) => (
        <section key={row.id} className="overflow-hidden rounded-lg border border-[#eee]">
          <div className="flex items-center justify-between bg-ink px-4 py-2 text-white">
            <span className="text-[14px] font-semibold">{row.label}</span>
            <button
              type="button"
              aria-label={`${row.label} 삭제`}
              onClick={() => removeCounterRow(counter.id, row.id)}
              className="grid h-8 w-8 place-items-center"
            >
              <CloseIcon size={16} />
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <StepButton label="감소" disabled={row.value === 0} onClick={() => bumpCounter(counter.id, row.id, -1)}>
              <MinusIcon className="h-5 w-5" />
            </StepButton>
            <span className="text-[40px] font-bold">{row.value}</span>
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
    <div className="flex h-full min-h-0 flex-col bg-white">
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
        className="flex shrink-0 gap-2 border-t border-[#f2f2f2] bg-white px-3 py-3"
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

const PALETTE = ["#f6efe8", "#f4d7c9", "#e7b7a8", "#c98686", "#8c5a4a", "#7d9a86"];

export function EditorScreen() {
  const [color, setColor] = useState(PALETTE[2]);
  const [cells, setCells] = useState<string[]>(() => Array.from({ length: 120 }, () => PALETTE[0]));
  const [tilt, setTilt] = useState(false);
  return (
    <div className="px-4 pb-10">
      <p className="text-[13px] leading-relaxed text-[#777]">
        웹 작업실의 도안 편집과는 분리된 앱 스케치예요. 코 칸에 색을 찍어 무늬를 남겨 두세요.
      </p>
      <div className="mt-3 flex gap-2">
        {PALETTE.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`색 ${item}`}
            onClick={() => setColor(item)}
            className={cx("h-8 w-8 rounded-full border-2", color === item ? "border-ink" : "border-white")}
            style={{ background: item }}
          />
        ))}
      </div>
      <div className={cx("mt-4 origin-center transition-transform", tilt && "[transform:rotateX(48deg)_rotateZ(-18deg)]")} style={{ perspective: "800px" }}>
        <div className="grid grid-cols-12 gap-0.5 rounded-lg bg-[#f3f3f3] p-2">
          {cells.map((cell, index) => (
            <button
              key={index}
              type="button"
              aria-label={`${index + 1}번 코`}
              className="aspect-square rounded-[2px]"
              style={{ background: cell }}
              onClick={() =>
                setCells((current) => current.map((value, cellIndex) => (cellIndex === index ? color : value)))
              }
            />
          ))}
        </div>
      </div>
      <button type="button" onClick={() => setTilt((value) => !value)} className="mt-4 h-11 w-full rounded-full bg-ink text-[14px] font-semibold text-white">
        {tilt ? "평면으로 보기" : "3D로 미리 보기"}
      </button>
    </div>
  );
}
