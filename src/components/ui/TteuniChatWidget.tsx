import { memo, useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { askTteuniChat } from "../../utils/tteuniChatApi.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import ChatTypingDots from "./ChatTypingDots.tsx";
import { CloseFillIcon, CollapseFillIcon, ExpandFillIcon } from "../icons/FillIcons.tsx";

type ChatMessage = {
  id: string;
  role: "user" | "tteuni";
  text: string;
};

type TteuniChatWidgetProps = {
  open: boolean;
  onClose: () => void;
};

const SUGGEST_KEYS = ["suggestColor", "suggestChart", "suggestYarn", "suggestGauge"] as const;
const MIN_W = 360;
const MIN_H = 460;
const DEFAULT_W = 448;
const DEFAULT_H = 580;

function withInventory(reply: string, text: string, t: (key: string, opts?: { list: string }) => string): string {
  const askedInventory = /보관함|재고|내 실|바늘|stash|inventory|yarn|needle|gram|保管|在庫/.test(text);
  if (!askedInventory) return reply;
  const stock = loadYarnInventory();
  if (stock.length > 0) {
    const list = stock
      .map((y) => {
        const bits = [y.name];
        if (y.grams) bits.push(`${y.grams}g`);
        if (y.needle) bits.push(y.needle);
        return bits.join(" ");
      })
      .join(", ");
    return `${reply}\n\n${t("editor.tteuniInventory", { list })}`;
  }
  return `${reply}\n\n${t("editor.tteuniInventoryEmpty")}`;
}

function TteuniAvatar({ size, alt }: { size: "sm" | "lg"; alt?: string }) {
  const dim = size === "lg" ? "h-20 w-20" : "h-9 w-9";
  return (
    <span className={`${dim} relative shrink-0 overflow-hidden rounded-full bg-[#fde7e2]`}>
      <img
        src={TTEUNI_IMAGES.chatProfile}
        alt={alt ?? ""}
        className="absolute left-1/2 top-[50%] h-[270%] w-[270%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        aria-hidden={alt ? undefined : true}
      />
    </span>
  );
}

function TteuniChatWidget({ open, onClose }: TteuniChatWidgetProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const listRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const idle = messages.length === 0 && !busy;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

  const onResizeMove = useCallback((event: globalThis.PointerEvent) => {
    const start = dragRef.current;
    if (!start) return;
    const maxW = Math.max(MIN_W, window.innerWidth - 40);
    const maxH = Math.max(MIN_H, window.innerHeight - 112);
    setSize({
      w: Math.min(maxW, Math.max(MIN_W, start.w + (start.x - event.clientX))),
      h: Math.min(maxH, Math.max(MIN_H, start.h + (start.y - event.clientY))),
    });
  }, []);

  const stopResize = useCallback(() => {
    dragRef.current = null;
    window.removeEventListener("pointermove", onResizeMove);
    window.removeEventListener("pointerup", stopResize);
    window.removeEventListener("pointercancel", stopResize);
  }, [onResizeMove]);

  const startResize = (event: PointerEvent<HTMLButtonElement>) => {
    if (expanded) return;
    event.preventDefault();
    event.stopPropagation();
    dragRef.current = { x: event.clientX, y: event.clientY, w: size.w, h: size.h };
    window.addEventListener("pointermove", onResizeMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  };

  useEffect(() => () => stopResize(), [stopResize]);

  if (!open) return null;

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || busy) return;
    const history = messages;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setInput("");
    setBusy(true);
    void (async () => {
      const ai = await askTteuniChat(text, history, i18n.language);
      const reply = withInventory(ai ?? t("chat.offline"), text, t);
      setMessages((prev) => [...prev, { id: `t-${Date.now()}`, role: "tteuni", text: reply }]);
      setBusy(false);
    })();
  };

  const submit = () => send(input);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  const panelStyle = expanded
    ? {
        top: "1rem",
        right: "1.25rem",
        bottom: "6.25rem",
        left: "1.25rem",
        width: "auto",
        height: "auto",
      }
    : {
        bottom: "6rem",
        right: "1.25rem",
        width: `min(${size.w}px, calc(100vw - 2.5rem))`,
        height: `min(${size.h}px, calc(100dvh - 7.5rem))`,
      };

  return (
    <div
      className="fixed z-[70] flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg"
      style={panelStyle}
    >
      {expanded ? null : (
        <button
          type="button"
          onPointerDown={startResize}
          className="absolute left-0 top-0 z-10 flex h-6 w-6 cursor-nwse-resize items-center justify-center text-stone-300 hover:text-stone-500"
          aria-label={t("chat.resize")}
        >
          <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
            <path d="M2 10h2M2 10v-2M5 10h2M2 7v-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      )}
      <div className="flex shrink-0 items-center gap-2 border-b border-stone-100 px-4 py-3">
        <TteuniAvatar size="sm" />
        <p className="min-w-0 flex-1 font-sans text-base font-bold text-stone-900">{t("chat.widgetTitle")}</p>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={expanded ? t("chat.collapse") : t("chat.expand")}
        >
          {expanded ? <CollapseFillIcon className="h-4 w-4" /> : <ExpandFillIcon className="h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
      </div>
      <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {idle ? (
          <div className="flex min-h-full flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
              <TteuniAvatar size="lg" alt={t("editor.tteuniName")} />
              <p className="mt-3 font-sans text-lg font-bold text-stone-900">{t("editor.tteuniName")}</p>
              <p className="mt-1 break-keep font-seoyun text-base leading-snug text-stone-600">{t("chat.greetLead")}</p>
              <p className="break-keep font-seoyun text-base leading-snug text-stone-600">{t("chat.greetBody")}</p>
            </div>
            <div className="mt-4 flex items-start gap-2">
              <TteuniAvatar size="sm" />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-stone-100 px-3 py-2 text-base leading-relaxed text-stone-800">
                <p className="font-seoyun">{t("chat.greetBubble")}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) =>
              msg.role === "user" ? (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-coral px-3 py-2 text-base leading-relaxed text-white">
                    <p className="whitespace-pre-wrap font-seoyun">{msg.text}</p>
                  </div>
                </div>
              ) : (
                <div key={msg.id} className="flex items-start gap-2">
                  <TteuniAvatar size="sm" />
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-stone-100 px-3 py-2 text-base leading-relaxed text-stone-800">
                    <p className="whitespace-pre-wrap font-seoyun">{msg.text}</p>
                  </div>
                </div>
              ),
            )}
            {busy ? (
              <div className="flex items-start gap-2">
                <TteuniAvatar size="sm" />
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-stone-100 px-3 py-2 text-base leading-relaxed text-stone-500">
                  <div className="flex items-center gap-2">
                    <ChatTypingDots />
                    <p className="font-seoyun">{t("chat.thinking")}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className="flex shrink-0 flex-wrap gap-1.5 border-t border-stone-100 px-3 pt-2.5">
        {SUGGEST_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => send(t(`chat.${key}`))}
            disabled={busy}
            className="rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 font-sans text-sm text-stone-600 hover:border-coral hover:bg-coral/5 hover:text-coral disabled:opacity-50"
          >
            {t(`chat.${key}`)}
          </button>
        ))}
      </div>
      <div className="flex shrink-0 gap-2 p-3 pt-2">
        <SmoothInput
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("editor.tteuniPlaceholder")}
          disabled={busy}
          className="min-w-0 flex-1 rounded-xl border-stone-200 px-3 py-2 text-base"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white hover:bg-black disabled:opacity-50"
          aria-label={t("common.send")}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M3.4 20.4l17.45-7.48a1 1 0 000-1.84L3.4 3.6a1 1 0 00-1.28 1.28L5.7 12 2.12 19.12a1 1 0 001.28 1.28z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default memo(TteuniChatWidget);
