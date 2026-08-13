/**
 * 실시간 감성 웰컴 효과음 — 별도 음원 파일 없이 Web Audio API 오실레이터로 합성.
 * 브라우저 정책상 사용자 인터랙션(호버/클릭) 이후에 호출해야 재생된다.
 */

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

/**
 * AudioContext는 브라우저당 동시 생성 수 제한이 있어(보통 6개)
 * 호출마다 새로 만들지 않고 싱글턴으로 재사용한다.
 */
let sharedCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  const Ctor =
    window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") void sharedCtx.resume();
  return sharedCtx;
}

export const playWelcomeKnitSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // 1. 포근하고 따뜻한 웰컴 실타래 음 (Warm Triangle Wood Chime)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // 삼각형 파형을 사용하여 부드럽고 둥글둥글한 나무 실로폰 음색 연출
  osc.type = "triangle";
  osc.frequency.setValueAtTime(329.63, now); // E4 (따스한 미)
  osc.frequency.exponentialRampToValueAtTime(440.0, now + 0.35); // A4 (라)로 부드럽게 상승 활공

  gain.gain.setValueAtTime(0.12, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); // 1.5초간 은은하게 잔향 페이드아웃

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 1.5);

  // 2. 바늘 한 코씩 사락사락 통과하는 미세 스티치 효과음 (4회 연속 타라락- 탭음)
  for (let i = 0; i < 4; i++) {
    const stitchTime = now + 0.15 + i * 0.12;
    const stitchOsc = ctx.createOscillator();
    const stitchGain = ctx.createGain();

    stitchOsc.type = "sine";
    // 매 한 땀마다 주파수가 내려가면서 스티치가 아래로 흘러나가는 청각적 착시 부여
    stitchOsc.frequency.setValueAtTime(1800 - i * 250, stitchTime);

    stitchGain.gain.setValueAtTime(0.015, stitchTime);
    stitchGain.gain.exponentialRampToValueAtTime(0.001, stitchTime + 0.04); // 아주 짧고 조밀하게 끊어줌

    stitchOsc.connect(stitchGain);
    stitchGain.connect(ctx.destination);
    stitchOsc.start(stitchTime);
    stitchOsc.stop(stitchTime + 0.05);
  }
};
