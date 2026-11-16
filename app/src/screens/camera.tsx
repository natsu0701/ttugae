import { useCallback, useEffect, useRef, useState } from "react";
import { useApp } from "../store.tsx";
import { CloseIcon, PauseIcon, PlayIcon } from "../ui.tsx";

type Track = {
  id: string;
  title: string;
  src: string;
  fallback: string;
};

const TRACKS: Track[] = [
  {
    id: "knitting",
    title: "대바늘",
    src: "overlays/knitting-needles.webm",
    fallback: "overlays/knitting-needles.webp",
  },
  {
    id: "crochet",
    title: "코바늘",
    src: "overlays/crochet-hook.webm",
    fallback: "overlays/crochet-hook.webp",
  },
];

function asset(path: string) {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");
}

function canPlayWebmVp9Alpha() {
  if (typeof document === "undefined") return true;
  const ua = navigator.userAgent;
  if (/iP(ad|hone|od)/.test(ua)) return false;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return false;
  if (/Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/.test(ua)) return false;
  const probe = document.createElement("video");
  return probe.canPlayType('video/webm; codecs="vp9"') !== "";
}

type CameraStatus = "starting" | "live" | "blocked" | "missing";

export function CameraScreen({ id }: { id: string }) {
  const { completeSession } = useApp();
  const cameraRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>("starting");
  const [trackId, setTrackId] = useState(TRACKS[0].id);
  const [opacity, setOpacity] = useState(0.9);
  const [paused, setPaused] = useState(false);
  const useFallback = !canPlayWebmVp9Alpha();
  const track = TRACKS.find((item) => item.id === trackId) ?? TRACKS[0];

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((item) => item.stop());
    streamRef.current = null;
    const video = cameraRef.current;
    if (video) video.srcObject = null;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const video = cameraRef.current;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("missing");
      return;
    }
    if (video) {
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
    }
    void (async () => {
      try {
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: { ideal: "environment" } },
          });
        } catch {
          stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
        }
        if (cancelled) {
          stream.getTracks().forEach((item) => item.stop());
          return;
        }
        streamRef.current = stream;
        if (video) {
          video.srcObject = stream;
          try {
            await video.play();
          } catch {
            // 재생은 사용자가 화면을 누르면 다시 시도한다.
          }
        }
        setStatus("live");
      } catch {
        if (!cancelled) setStatus("blocked");
      }
    })();
    return () => {
      cancelled = true;
      stopStream();
    };
  }, [stopStream]);

  useEffect(() => {
    if (useFallback) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.muted = true;
    overlay.playsInline = true;
    overlay.loop = true;
    overlay.src = asset(track.src);
    setPaused(false);
    void overlay.play().catch(() => setPaused(true));
  }, [track, useFallback]);

  useEffect(() => {
    if (useFallback) return;
    const video = overlayRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    let frame = 0;
    const draw = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (width > 0 && height > 0) {
        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(video, 0, 0, width, height);
      }
      frame = window.requestAnimationFrame(draw);
    };
    frame = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(frame);
  }, [track, useFallback]);

  const togglePlay = () => {
    const overlay = overlayRef.current;
    if (!overlay || useFallback) {
      setPaused((value) => !value);
      return;
    }
    if (overlay.paused) {
      void overlay.play().then(() => setPaused(false)).catch(() => setPaused(true));
    } else {
      overlay.pause();
      setPaused(true);
    }
  };

  return (
    <div className="relative h-full min-h-full bg-black text-white">
      <video ref={cameraRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted autoPlay />
      <div className="pointer-events-none absolute inset-0" style={{ opacity }}>
        {useFallback ? (
          <img src={asset(track.fallback)} alt="" className="h-full w-full object-contain" style={{ opacity: paused ? 0.35 : 1 }} />
        ) : (
          <>
            <video ref={overlayRef} className="absolute h-px w-px opacity-0" playsInline muted loop />
            <canvas ref={canvasRef} className="h-full w-full object-contain" />
          </>
        )}
      </div>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 pt-3">
        <p className="rounded-full bg-black px-3 py-1 text-[13px] font-semibold">뜨개 오버레이</p>
        <button
          type="button"
          aria-label="작업 완료"
          onClick={() => completeSession(id)}
          className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"
        >
          <CloseIcon size={20} />
        </button>
      </div>
      {status !== "live" ? (
        <p className="absolute left-4 right-4 top-20 rounded-lg bg-black px-4 py-3 text-center text-[13px] leading-relaxed">
          {status === "starting"
            ? "카메라를 켜는 중이에요."
            : "카메라를 열지 못했어요. 브라우저에서 카메라 권한을 허용하면 바늘 영상이 화면 위에 겹쳐져요. 오른쪽 위 버튼으로 오늘 작업을 마칠 수 있어요."}
        </p>
      ) : null}
      <div className="absolute inset-x-0 bottom-0 bg-black px-4 pb-6 pt-4">
        <div className="flex items-center gap-2">
          {TRACKS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTrackId(item.id)}
              className={item.id === track.id ? "h-9 rounded-full bg-white px-4 text-[13px] font-semibold text-black" : "h-9 rounded-full bg-[#2a2a2a] px-4 text-[13px] text-white"}
            >
              {item.title}
            </button>
          ))}
          <button type="button" aria-label={paused ? "오버레이 재생" : "오버레이 일시정지"} onClick={togglePlay} className="ml-auto grid h-11 w-11 place-items-center rounded-full bg-white text-black">
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
        <label className="mt-3 flex items-center gap-3 text-[12px]">
          <span className="shrink-0">투명도</span>
          <input
            type="range"
            min={0.2}
            max={1}
            step={0.05}
            value={opacity}
            aria-label="오버레이 투명도"
            onChange={(event) => setOpacity(Number(event.target.value))}
            className="w-full accent-white"
          />
        </label>
      </div>
    </div>
  );
}
