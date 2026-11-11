import { useEffect, useState, type ReactNode } from "react";
import { useApp } from "../store.tsx";
import type { ToolKind, UnitSystem } from "../types.ts";
import { BlackButton, Mascot, TextField, Wordmark, cx } from "../ui.tsx";

export function SplashScreen() {
  const { replace } = useApp();
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setBeat(1), 700),
      window.setTimeout(() => setBeat(2), 1500),
      window.setTimeout(() => replace({ name: "login" }), 2600),
    ];
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [replace]);

  return (
    <button type="button" onClick={() => replace({ name: "login" })} className="flex h-full min-h-[70vh] w-full flex-col items-center justify-center bg-white">
      <div className={cx("transition-all duration-500", beat === 0 ? "translate-y-6 opacity-0" : "translate-y-0 opacity-100")}>
        {beat > 0 ? <Mascot className="mx-auto h-36 w-36" mood={beat > 1 ? "cheer" : "wave"} /> : <div className="h-36" />}
      </div>
      <Wordmark className={cx("mt-2 w-64 transition-transform duration-500", beat === 0 ? "scale-90" : "scale-100")} />
    </button>
  );
}

export function LoginScreen() {
  const { replace, data } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const enter = () => {
    if (!email.trim() || !password.trim()) {
      setError("이메일과 비밀번호를 입력해 주세요");
      return;
    }
    replace(data.onboarded ? { name: "home" } : { name: "onboarding" });
  };

  return (
    <div className="relative min-h-full bg-blush-wash px-6 pb-10 pt-8">
      <Flower className="left-4 top-2" />
      <Flower className="right-6 top-16 scale-75" />
      <div className="mx-auto mt-10 max-w-[280px]">
        <Wordmark className="w-full" />
      </div>
      <p className="mt-4 text-center text-[14px] font-medium leading-relaxed text-white">
        따뜻한 뜨개질 이야기,
        <br />
        함께 나누어요
      </p>
      <form
        className="mt-8 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          enter();
        }}
      >
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b9b9b9]">✉</span>
          <TextField
            type="email"
            autoComplete="username"
            placeholder="이메일 주소"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="pl-10"
            aria-label="이메일 주소"
          />
        </label>
        <label className="relative block">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#b9b9b9]">🔒</span>
          <TextField
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="pl-10"
            aria-label="비밀번호"
          />
        </label>
        {error ? <p className="text-center text-[12px] text-white">{error}</p> : null}
        <button type="submit" className="h-12 w-full rounded-full bg-white text-[15px] font-bold text-ink">
          로그인
        </button>
      </form>
      <div className="mt-4 flex justify-center gap-3 text-[13px] text-white/90">
        <button type="button" onClick={() => replace({ name: "forgot" })}>
          비밀번호 찾기
        </button>
        <span aria-hidden>|</span>
        <button type="button" onClick={() => replace({ name: "signup" })}>
          회원가입
        </button>
      </div>
      <div className="mt-10 flex justify-center gap-4">
        <SocialButton label="카카오로 로그인" className="bg-[#fee500] text-ink" onClick={enter}>
          <KakaoMark />
        </SocialButton>
        <SocialButton label="네이버로 로그인" className="bg-[#03c75a] text-white" onClick={enter}>
          <span className="font-black">N</span>
        </SocialButton>
        <SocialButton label="Apple로 로그인" className="bg-ink text-white" onClick={enter}>
          <AppleMark />
        </SocialButton>
      </div>
    </div>
  );
}

function SocialButton({
  children,
  className,
  label,
  onClick,
}: {
  children: ReactNode;
  className: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className={cx("grid h-12 w-12 place-items-center rounded-full text-[16px] font-bold", className)}>
      {children}
    </button>
  );
}

function KakaoMark() {
  return (
    <svg width="22" height="20" viewBox="0 0 22 20" aria-hidden>
      <path fill="#191919" d="M11 0C5 0 0 3.6 0 8.1c0 2.9 1.9 5.4 4.8 6.8L3.8 19l4.4-2.9c.9.1 1.8.2 2.8.2 6 0 11-3.6 11-8.1S17 0 11 0z" />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden>
      <path
        fill="currentColor"
        d="M13.2 9.5c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.7-1.7-3.2-1.7-1.4-.1-2.7.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.6 2.2-1.6 2.7-.4 6.7 1.1 8.9.7 1.1 1.6 2.3 2.7 2.2 1.1 0 1.5-.7 2.8-.7s1.7.7 2.9.7 1.9-1.1 2.6-2.2c.8-1.2 1.1-2.3 1.2-2.4-.1 0-2.2-.8-2.2-3.6zM11 3.2c.6-.7 1-1.7.9-2.7-1 .1-2.1.6-2.8 1.4-.6.7-1.1 1.7-.9 2.6 1 .1 2.1-.5 2.8-1.3z"
      />
    </svg>
  );
}

function Flower({ className }: { className?: string }) {
  return (
    <span className={cx("absolute text-2xl text-[#ffe56a]", className)} aria-hidden>
      ✿
    </span>
  );
}

export function SignupScreen() {
  const { replace, back, patch } = useApp();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-full bg-blush-wash px-6 pb-10 pt-4 text-white">
      <button type="button" onClick={back} className="text-[14px]">
        뒤로
      </button>
      <h1 className="mt-6 text-[24px] font-bold">회원가입</h1>
      <p className="mt-1 text-[13px] text-white/90">가입하면 단위와 도구를 고르는 안내로 이어져요.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!nickname.trim() || !email.trim() || !password.trim()) return;
          patch({ nickname: nickname.trim() });
          replace({ name: "onboarding" });
        }}
      >
        <TextField aria-label="닉네임" placeholder="닉네임" value={nickname} onChange={(event) => setNickname(event.target.value)} />
        <TextField aria-label="이메일" type="email" placeholder="이메일 주소" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField aria-label="비밀번호" type="password" placeholder="비밀번호" value={password} onChange={(event) => setPassword(event.target.value)} />
        <button type="submit" className="h-12 w-full rounded-full bg-white font-bold text-ink">
          가입하고 시작
        </button>
      </form>
    </div>
  );
}

export function ForgotScreen() {
  const { back, notify } = useApp();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="min-h-full bg-white px-6 pb-10">
      <button type="button" onClick={back} className="mt-2 text-[14px]">
        뒤로
      </button>
      <h1 className="mt-6 text-[24px] font-bold">비밀번호 찾기</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-[#777]">가입한 이메일로 재설정 안내를 보내요.</p>
      <form
        className="mt-6 space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!email.trim()) return;
          setSent(true);
          notify("재설정 메일을 보냈어요");
        }}
      >
        <TextField aria-label="이메일" type="email" placeholder="이메일 주소" value={email} onChange={(event) => setEmail(event.target.value)} />
        <BlackButton type="submit">메일 보내기</BlackButton>
      </form>
      {sent ? <p className="mt-4 text-center text-[13px] text-[#777]">{email} 함으로 안내를 남겼어요.</p> : null}
    </div>
  );
}

const SLIDES = [
  { title: "뜨개러투게더와\n함께하는\n새로운 뜨개라이프", body: "뜨개 흐름 읽기가 더 쉬워질게요", mood: "cheer" as const },
  { title: "푸르시오는 이제 그만!\n뜨개 내비만 따라하세요", body: "막히는 구간은 단계만 따라가면 돼요", mood: "knit" as const },
  { title: "여러 프로젝트를\n동시에 관리해요", body: "가방 하나에서 진행과 완성을 봐요", mood: "wave" as const },
  { title: "손쉽게 도안을 제작하고\n3D로 미리 확인해요", body: "코 칸에 색을 남겨 두세요", mood: "cheer" as const },
  { title: "다른 뜨개더들과\n교류하고 거래해봐요", body: "작품과 질문, 실과 바늘을 나눠요", mood: "wave" as const },
];

export function OnboardingScreen() {
  const { data, patch, push, finishOnboarding } = useApp();
  const [step, setStep] = useState(0);
  const last = step === 6;

  return (
    <div className="flex min-h-full flex-col bg-white px-6 pb-8">
      <div className="mt-2 flex gap-1">
        {Array.from({ length: 7 }, (_, index) => (
          <span key={index} className={cx("h-1 flex-1 rounded-full", index <= step ? "bg-blush" : "bg-[#f1f1f1]")} />
        ))}
      </div>
      {step < 5 ? (
        <div className="flex flex-1 flex-col">
          <div className="mt-8 grid flex-1 place-items-center">
            <Mascot mood={SLIDES[step].mood} className="h-44 w-44" />
          </div>
          <h1 className="whitespace-pre-wrap text-[26px] font-bold leading-snug">{SLIDES[step].title}</h1>
          <p className="mt-3 text-[14px] text-[#888]">{SLIDES[step].body}</p>
        </div>
      ) : null}
      {step === 5 ? (
        <UnitStep unit={data.unit} onChange={(unit) => patch({ unit })} />
      ) : null}
      {step === 6 ? (
        <ToolStep tool={data.tool} onChange={(tool) => patch({ tool })} />
      ) : null}
      <div className="mt-6 space-y-3">
        {last ? (
          <>
            <BlackButton onClick={() => push({ name: "skill" })}>실력 측정하기</BlackButton>
            <button type="button" onClick={() => finishOnboarding(null)} className="h-10 w-full text-[14px] text-[#888]">
              건너뛰기
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            {step > 0 ? (
              <button type="button" onClick={() => setStep((value) => value - 1)} className="h-12 flex-1 rounded-full bg-[#f4f4f4] font-semibold">
                이전
              </button>
            ) : null}
            <BlackButton className="flex-1" onClick={() => setStep((value) => value + 1)}>
              다음
            </BlackButton>
          </div>
        )}
      </div>
    </div>
  );
}

function UnitStep({ unit, onChange }: { unit: UnitSystem; onChange: (unit: UnitSystem) => void }) {
  return (
    <div className="flex-1 pt-10">
      <h1 className="whitespace-pre-wrap text-[26px] font-bold leading-snug">{"단위를 어떻게\n표시할까요?"}</h1>
      <p className="mt-2 text-[13px] text-[#999]">나중에 설정에서 변경할 수 있어요.</p>
      <div className="mt-6 grid gap-3">
        <Choice active={unit === "metric"} onClick={() => onChange("metric")} title="미터법 (m, cm, mm)" />
        <Choice active={unit === "imperial"} onClick={() => onChange("imperial")} title="영미식 (in, yd, US size)" />
      </div>
    </div>
  );
}

function ToolStep({ tool, onChange }: { tool: ToolKind | null; onChange: (tool: ToolKind) => void }) {
  const tools: ToolKind[] = ["코바늘", "대바늘", "손뜨개"];
  return (
    <div className="flex-1 pt-10">
      <h1 className="text-[26px] font-bold">주로 쓰는 도구는?</h1>
      <div className="mt-6 grid grid-cols-3 gap-2">
        {tools.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cx(
              "h-24 rounded-3xl border text-[14px] font-semibold",
              tool === item ? "border-blush bg-blush-soft" : "border-[#eee]",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Choice({ title, active, onClick }: { title: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx("h-14 rounded-2xl border px-4 text-left text-[15px] font-semibold", active ? "border-blush bg-blush-soft" : "border-[#eee]")}
    >
      {title}
    </button>
  );
}

const QUIZ = [
  {
    q: "뜨개를 시작한 지 얼마나 됐나요?",
    options: ["지금 시작", "1년 미만", "1년 이상"],
  },
  {
    q: "도안을 혼자 읽을 수 있나요?",
    options: ["아직이에요", "가끔요", "혼자서도 돼요"],
  },
  {
    q: "한 달에 작품을 몇 개 완성하나요?",
    options: ["아직 없어요", "한 개쯤", "두 개 이상"],
  },
];

export function SkillScreen() {
  const { finishOnboarding } = useApp();
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState<string | null>(null);
  const current = QUIZ[index];

  const pick = (option: number) => {
    const nextScore = score + option;
    if (index === QUIZ.length - 1) {
      const level = nextScore <= 1 ? "입문" : nextScore <= 3 ? "초보" : "중급";
      setDone(level);
      return;
    }
    setScore(nextScore);
    setIndex((value) => value + 1);
  };

  if (done) {
    return (
      <div className="flex min-h-full flex-col items-center px-6 pb-10 pt-16 text-center">
        <Mascot mood="cheer" className="h-40 w-40" />
        <p className="mt-4 text-[14px] text-[#888]">지금 나의 뜨개 실력은</p>
        <h1 className="mt-1 text-[32px] font-bold">{done}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-[#777]">마이페이지에서 언제든 다시 볼 수 있어요.</p>
        <BlackButton className="mt-8" onClick={() => finishOnboarding(done)}>
          홈으로
        </BlackButton>
      </div>
    );
  }

  return (
    <div className="min-h-full px-6 pb-10 pt-8">
      <p className="text-[13px] text-[#999]">
        {index + 1} / {QUIZ.length}
      </p>
      <h1 className="mt-3 text-[24px] font-bold leading-snug">{current.q}</h1>
      <div className="mt-6 grid gap-3">
        {current.options.map((option, optionIndex) => (
          <button
            key={option}
            type="button"
            onClick={() => pick(optionIndex)}
            className="h-14 rounded-2xl border border-[#eee] text-left px-4 text-[15px] font-semibold"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
