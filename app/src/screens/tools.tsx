import { useMemo, useState } from "react";
import { useApp } from "../store.tsx";
import type { GaugeRecord, GaugeTab } from "../types.ts";
import { BlackButton, CameraIcon, ChevronDown, Fab, InfoButton, Mascot, PencilIcon, PinkButton, Segment, TrashIcon, YarnBallIcon, cx } from "../ui.tsx";

export function GaugeScreen({ tab }: { tab: GaugeTab }) {
  const { replace, openSheet } = useApp();
  return (
    <div className="relative min-h-full pb-24">
      <div className="flex items-center justify-end px-4">
        <button
          type="button"
          aria-label="게이지 안내"
          onClick={() =>
            openSheet({
              kind: "info",
              title: "게이지",
              body: "10cm 안에 들어가는 코와 목표 길이를 넣으면 필요한 코 수를 올림해서 계산해요. 세탁 전후를 둘 다 적어두면 치수가 덜 틀어져요.",
            })
          }
          className="grid h-8 w-8 place-items-center rounded-full border border-[#ddd] text-[13px] font-bold"
        >
          !
        </button>
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

function Calculator() {
  const { calcSts, calcLen, calcResult, setCalc, data, push, openSheet } = useApp();
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
        <button type="button" aria-label="스와치 사진으로 읽기" onClick={() => openSheet({ kind: "camera" })}>
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
        <div className="mt-4 rounded-[24px] border border-blush px-4 py-5 text-center">
          <p className="text-[14px]">계산 결과</p>
          <p className="text-[36px] font-bold">{calcResult}코</p>
          <p className="text-[12px] text-[#999]">(올림 처리된 값)</p>
        </div>
      ) : null}
      <PinkButton className="mt-3" disabled={calcResult === null} onClick={() => push({ name: "gauge-form" })}>
        게이지 저장하기
      </PinkButton>
      <button type="button" onClick={() => openSheet({ kind: "info", title: "자가가 필요할 때", body: "10cm 자를 스와치에 대고 그 안의 코를 세면 돼요. 사진 버튼은 예시로 20코를 넣어 줘요." })} className="mt-8 flex items-end justify-between">
        <span className="max-w-[180px] rounded-2xl bg-[#f4f4f4] px-3 py-2 text-left text-[13px] leading-snug">
          자가 필요하면
          <br />
          저를 클릭하세요!
        </span>
        <Mascot mood="cheer" className="h-28 w-28" />
      </button>
    </div>
  );
}

function GaugeList() {
  const { data, push, removeGauge } = useApp();
  if (data.gauges.length === 0) {
    return (
      <div className="grid place-items-center px-8 pt-16 text-center">
        <span className="rounded-2xl bg-[#f4f4f4] px-4 py-3 text-[14px] leading-relaxed">
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
          <li key={gauge.id} className="flex gap-3 rounded-[24px] border border-[#f0f0f0] p-3">
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
              <button type="button" aria-label="게이지 삭제" onClick={() => removeGauge(gauge.id)} className="text-[#bbb]">
                <TrashIcon />
              </button>
              <img src={gauge.image} alt="" className="mt-2 h-16 w-16 rounded-2xl object-cover" />
            </div>
          </li>
        ))}
      </ul>
      <Fab label="게이지 등록" onClick={() => push({ name: "gauge-form" })} />
    </div>
  );
}

export function GaugeFormScreen() {
  const { data, calcSts, calcLen, calcResult, saveGauge, back, notify } = useApp();
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
        notify("게이지를 저장했어요");
        back();
      }}
    >
      <label className="block text-[14px] font-bold">
        게이지 이름
        <input value={name} onChange={(event) => setName(event.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-3 font-normal outline-none" />
      </label>
      <label className="block text-[14px] font-bold">
        연결된 프로젝트
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-3 font-normal">
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
        <select value={yarnName} onChange={(event) => setYarnName(event.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-3 font-normal">
          {data.yarns.map((yarn) => (
            <option key={yarn.id}>{yarn.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        바늘 정보
        <select value={needle} onChange={(event) => setNeedle(event.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-3 font-normal">
          {data.needles.map((item) => (
            <option key={item.id}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="block text-[14px] font-bold">
        도안명
        <input value={pattern} onChange={(event) => setPattern(event.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-3 font-normal outline-none" />
      </label>
      <Pair title="세탁 전 게이지" sts={beforeSts} rows={beforeRows} onSts={setBeforeSts} onRows={setBeforeRows} />
      <Pair title="세탁 후 게이지" sts={afterSts} rows={afterRows} onSts={setAfterSts} onRows={setAfterRows} />
      <label className="block text-[14px] font-bold">
        메모
        <textarea value={memo} onChange={(event) => setMemo(event.target.value)} className="mt-2 h-24 w-full rounded-2xl bg-[#f6f6f6] px-3 py-3 font-normal outline-none" />
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
            <button type="button" onClick={() => push({ name: "counter", id: counter.id })} className="flex w-full items-center justify-between rounded-[24px] border border-[#f3f3f3] px-4 py-4 text-left shadow-card">
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
  const { data, setCounterProject, bumpCounter, resetCounterRow, addCounterRow, renameCounter } = useApp();
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
          className="mt-2 h-12 w-full rounded-2xl bg-[#f6f6f6] px-4 text-[16px] font-semibold outline-none"
        />
      </label>
      <div className="rounded-[24px] border border-[#f2f2f2] p-4">
        <span className="text-[14px] font-bold">연결 프로젝트</span>
        <button
          type="button"
          onClick={() => setOpenProjects((value) => !value)}
          className="mt-2 flex h-12 w-full items-center justify-between rounded-2xl bg-[#f6f6f6] px-4 text-left text-[14px]"
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
                className={cx("w-full rounded-2xl border px-4 py-3 text-left text-[14px]", !linked ? "border-blush bg-blush-soft" : "border-[#f0f0f0]")}
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
                    className={cx("flex w-full items-center gap-3 rounded-2xl border p-2 text-left", selected ? "border-blush bg-blush-soft" : "border-[#f0f0f0] bg-white")}
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
        <section key={row.id} className="overflow-hidden rounded-[24px] border border-[#eee]">
          <div className="flex items-center justify-between bg-ink px-4 py-2 text-white">
            <span className="text-[14px] font-semibold">{row.label}</span>
            <button type="button" aria-label={`${row.label} 초기화`} onClick={() => resetCounterRow(counter.id, row.id)}>
              ×
            </button>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <StepButton label="감소" disabled={row.value === 0} onClick={() => bumpCounter(counter.id, row.id, -1)}>
              –
            </StepButton>
            <span className="text-[40px] font-bold">{row.value}</span>
            <StepButton label="증가" pink onClick={() => bumpCounter(counter.id, row.id, 1)}>
              +
            </StepButton>
          </div>
        </section>
      ))}
      <button type="button" onClick={() => addCounterRow(counter.id)} className="flex h-16 w-full items-center justify-center gap-2 rounded-[20px] bg-[#f6f6f6] font-semibold">
        + 카운터 추가
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
  children: string;
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
            {message.from === "bot" ? <Mascot className="h-10 w-10 shrink-0" /> : null}
            <p className={cx("max-w-[75%] rounded-2xl px-3 py-2 text-[14px] leading-relaxed", message.from === "me" ? "bg-ink text-white" : "bg-[#f5f5f5]")}>
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
        <div className="grid grid-cols-12 gap-0.5 rounded-2xl bg-[#f3f3f3] p-2">
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
