import { memo, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";

type Preview3DViewerProps = {
  imageSrc: string;
  alt: string;
  onImageError?: () => void;
};

function Preview3DViewer({ imageSrc, alt, onImageError }: Preview3DViewerProps) {
  const [rotateY, setRotateY] = useState(-18);
  const dragging = useRef(false);
  const lastX = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    lastX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    const delta = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotateY((prev) => prev + delta * 0.45);
  }, []);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  return (
    <div
      className="relative flex h-full w-full select-none items-center justify-center overflow-hidden rounded-xl bg-gray-100"
      style={{ perspective: 920, perspectiveOrigin: "50% 42%" }}
    >
      <p className="pointer-events-none absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-0.5 font-sans text-[10px] font-normal text-gray-500">
        드래그하여 회전
      </p>

      <motion.div
        className="relative cursor-grab active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d", rotateY }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* 원통형 말림 착시 — 측면 쉐이딩 + 원호형 마스크 */}
        <div
          className="relative overflow-hidden"
          style={{
            transform: "rotateX(6deg)",
            transformStyle: "preserve-3d",
            borderRadius: "42% / 14%",
            boxShadow:
              "inset 28px 0 48px -20px rgba(0,0,0,0.22), inset -28px 0 48px -20px rgba(0,0,0,0.22), 0 12px 32px -8px rgba(0,0,0,0.12)",
          }}
        >
          <img
            src={imageSrc}
            alt={alt}
            className="block h-32 w-44 object-cover sm:h-36 sm:w-52"
            style={{
              transform: "scaleX(0.88)",
              transformOrigin: "center center",
            }}
            draggable={false}
            onError={onImageError}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.18) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.18) 100%)",
            }}
            aria-hidden
          />
        </div>

        {/* 바닥 그림자 */}
        <div
          className="absolute -bottom-3 left-1/2 h-3 w-3/4 -translate-x-1/2 rounded-[100%] bg-black/10 blur-md"
          style={{ transform: "translateX(-50%) rotateX(82deg)" }}
          aria-hidden
        />
      </motion.div>
    </div>
  );
}

export default memo(Preview3DViewer);
