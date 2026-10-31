import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { type IconTipEdge } from "../../utils/iconTip.ts";

const GAP = 8;
const PAD = 8;

type TipState = {
  text: string;
  edge: IconTipEdge;
  rect: DOMRect;
};

function hostOf(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest("[data-icon-tip]");
}

function edgeOf(host: HTMLElement): IconTipEdge {
  const edge = host.getAttribute("data-icon-tip-edge");
  if (edge === "below" || edge === "left" || edge === "right") return edge;
  return "above";
}

function place(rect: DOMRect, edge: IconTipEdge, width: number, height: number) {
  let x = rect.left + rect.width / 2 - width / 2;
  let y = rect.top - GAP - height;
  if (edge === "below") {
    y = rect.bottom + GAP;
  } else if (edge === "right") {
    x = rect.right + GAP;
    y = rect.top + rect.height / 2 - height / 2;
  } else if (edge === "left") {
    x = rect.left - GAP - width;
    y = rect.top + rect.height / 2 - height / 2;
  }
  const maxX = Math.max(PAD, window.innerWidth - width - PAD);
  const maxY = Math.max(PAD, window.innerHeight - height - PAD);
  return {
    x: Math.min(Math.max(PAD, x), maxX),
    y: Math.min(Math.max(PAD, y), maxY),
  };
}

export default function IconTipLayer() {
  const [tip, setTip] = useState<TipState | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, ready: false });
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const reveal = (host: HTMLElement) => {
      const text = host.getAttribute("data-icon-tip")?.trim();
      if (!text) return;
      if (hostRef.current === host) return;
      hostRef.current = host;
      setPos((prev) => ({ ...prev, ready: false }));
      setTip({
        text,
        edge: edgeOf(host),
        rect: host.getBoundingClientRect(),
      });
    };

    const show = (event: Event) => {
      const host = hostOf(event.target);
      if (host) reveal(host);
    };

    const hide = (event: Event) => {
      const next = hostOf("relatedTarget" in event ? (event.relatedTarget as EventTarget) : null);
      const current = hostOf(event.target);
      if (next && next === current) return;
      if (next) {
        reveal(next);
        return;
      }
      hostRef.current = null;
      setTip(null);
    };

    const clear = () => {
      hostRef.current = null;
      setTip(null);
    };

    document.addEventListener("pointerover", show);
    document.addEventListener("pointerout", hide);
    document.addEventListener("focusin", show);
    document.addEventListener("focusout", hide);
    document.addEventListener("pointerdown", clear);
    window.addEventListener("scroll", clear, true);
    window.addEventListener("resize", clear);
    return () => {
      document.removeEventListener("pointerover", show);
      document.removeEventListener("pointerout", hide);
      document.removeEventListener("focusin", show);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("pointerdown", clear);
      window.removeEventListener("scroll", clear, true);
      window.removeEventListener("resize", clear);
    };
  }, []);

  useLayoutEffect(() => {
    if (!tip || !boxRef.current) return;
    const size = boxRef.current.getBoundingClientRect();
    setPos({ ...place(tip.rect, tip.edge, size.width, size.height), ready: true });
  }, [tip]);

  if (!tip) return null;

  return createPortal(
    <div
      ref={boxRef}
      className="icon-tip-layer"
      style={{ left: pos.x, top: pos.y, visibility: pos.ready ? "visible" : "hidden" }}
      role="tooltip"
    >
      {tip.text}
    </div>,
    document.body,
  );
}
