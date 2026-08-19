import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import { useLocalStorage } from "../../hooks/useLocalStorage.ts";

const STORAGE_KEY = "ttugae.editor.onboarding.completed";

type Rect = { top: number; left: number; width: number; height: number };

function measureRect(el: HTMLElement | null): Rect | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width <= 0 || r.height <= 0) return null;
  return {
    top: r.top,
    left: r.left,
    width: r.width,
    height: r.height,
  };
}

/** 스포트라이트 구멍 주변만 어둡게 덮고, 구멍 영역은 클릭이 통과되도록 4분할 백드롭 */
function SpotlightDimPanels({
  hole,
  onBackdropClick,
  skipLabel,
}: {
  hole: Rect;
  onBackdropClick: () => void;
  skipLabel: string;
}) {
  const bottom = hole.top + hole.height;
  const right = hole.left + hole.width;

  const panels: { className: string; style: CSSProperties }[] = [
    { className: "left-0 right-0 top-0", style: { height: Math.max(0, hole.top) } },
    {
      className: "left-0 right-0",
      style: { top: bottom, bottom: 0 },
    },
    {
      className: "top-0 bottom-0 left-0",
      style: {
        width: Math.max(0, hole.left),
        top: hole.top,
        height: hole.height,
      },
    },
    {
      className: "top-0 bottom-0",
      style: {
        left: right,
        right: 0,
        top: hole.top,
        height: hole.height,
      },
    },
  ];

  return (
    <>
      {panels.map((panel, i) => (
        <button
          key={i}
          type="button"
          aria-label={skipLabel}
          className={`absolute bg-black/60 pointer-events-auto ${panel.className}`}
          style={panel.style}
          onClick={onBackdropClick}
        />
      ))}
    </>
  );
}

type EditorOnboardingSpotlightProps = {
  toolbarRef: RefObject<HTMLElement | null>;
  chatbotRef: RefObject<HTMLElement | null>;
};

export default function EditorOnboardingSpotlight({
  toolbarRef,
  chatbotRef,
}: EditorOnboardingSpotlightProps) {
  const { t } = useTranslation();
  const [completed, setCompleted] = useLocalStorage(STORAGE_KEY, false);
  const [step, setStep] = useState<1 | 2>(1);
  const [spot, setSpot] = useState<Rect | null>(null);

  const active = !completed;

  const finish = useCallback(() => {
    setCompleted(true);
  }, [setCompleted]);

  const updateSpot = useCallback(() => {
    const target = step === 1 ? toolbarRef.current : chatbotRef.current;
    setSpot(measureRect(target));
  }, [step, toolbarRef, chatbotRef]);

  useEffect(() => {
    if (!active) return;
    updateSpot();
    window.addEventListener("resize", updateSpot);
    window.addEventListener("scroll", updateSpot, true);
    const t = window.setTimeout(updateSpot, 120);
    const raf = requestAnimationFrame(updateSpot);
    return () => {
      window.removeEventListener("resize", updateSpot);
      window.removeEventListener("scroll", updateSpot, true);
      window.clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [active, step, updateSpot]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  useEffect(() => {
    if (!active || spot) return;
    const t = window.setTimeout(() => {
      updateSpot();
      if (!measureRect(step === 1 ? toolbarRef.current : chatbotRef.current)) {
        finish();
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [active, spot, step, updateSpot, finish, toolbarRef, chatbotRef]);

  if (!active) return null;

  const pad = 10;
  const hole = spot
    ? {
        top: spot.top - pad,
        left: spot.left - pad,
        width: spot.width + pad * 2,
        height: spot.height + pad * 2,
      }
    : null;

  const bubbleTop = hole ? Math.min(hole.top + hole.height + 12, window.innerHeight - 160) : "50%";
  const bubbleLeft = hole ? hole.left + hole.width / 2 : "50%";

  return (
    <div
      className="fixed inset-0 z-[200] pointer-events-none"
      role="dialog"
      aria-modal
      aria-label={t("editor.onboardTitle")}
    >
      {hole ? (
        <>
          <SpotlightDimPanels hole={hole} onBackdropClick={finish} skipLabel={t("editor.onboardSkip")} />
          <div
            className="absolute rounded-2xl ring-2 ring-coral pointer-events-none"
            style={{
              top: hole.top,
              left: hole.left,
              width: hole.width,
              height: hole.height,
            }}
            aria-hidden
          />
        </>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="absolute z-10 max-w-xs -translate-x-1/2 rounded-2xl bg-white px-4 py-4 pointer-events-auto"
          style={{ top: bubbleTop, left: bubbleLeft }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          <p className="relative font-sans text-sm font-normal leading-relaxed text-gray-800">
            <span
              className="absolute -top-2 left-6 h-3 w-3 -translate-y-full rotate-45 bg-white"
              aria-hidden
            />
            {step === 1
              ? t("editor.onboardStep1")
              : t("editor.onboardStep2")}
          </p>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-2 text-sm"
              onClick={finish}
            >
              {t("editor.onboardSkipShort")}
            </Button>
            {step === 1 ? (
              <Button
                type="button"
                className="px-4 py-2 text-sm"
                onClick={() => setStep(2)}
              >
                {t("editor.onboardNext")}
              </Button>
            ) : (
              <Button type="button" className="px-4 py-2 text-sm" onClick={finish}>
                {t("editor.onboardStart")}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
