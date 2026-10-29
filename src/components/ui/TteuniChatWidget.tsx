import { memo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { askTteuniChat } from "../../utils/tteuniChatApi.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import { CloseFillIcon } from "../icons/FillIcons.tsx";

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
  const dim = size === "lg" ? "h-16 w-16" : "h-8 w-8";
  return (
    <img
      src={TTEUNI_IMAGES.chatProfile}
      alt={alt ?? ""}
      className={`${dim} shrink-0 rounded-full bg-stone-100 object-cover`}
      aria-hidden={alt ? undefined : true}
    />
  );
}

function TteuniChatWidget({ open, onClose }: TteuniChatWidgetProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const idle = messages.length === 0 && !busy;

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, busy]);

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

  return (
    <div className="fixed bottom-24 right-5 z-[70] flex w-[min(100vw-2.5rem,23.5rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
        <TteuniAvatar size="sm" />
        <p className="min-w-0 flex-1 font-sans text-base font-bold text-stone-900">{t("chat.widgetTitle")}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
      </div>
      <div ref={listRef} className="max-h-80 min-h-[16.5rem] space-y-3 overflow-y-auto px-4 py-4">
        {idle ? (
          <div className="flex min-h-[14.5rem] flex-col">
            <div className="flex flex-1 flex-col items-center justify-center px-2 text-center">
              <TteuniAvatar size="lg" alt={t("editor.tteuniName")} />
              <p className="mt-3 font-sans text-lg font-bold text-stone-900">{t("editor.tteuniName")}</p>
              <p className="mt-1 break-keep font-seoyun text-base leading-relaxed text-stone-600">{t("chat.greetLead")}</p>
              <p className="mt-0.5 break-keep font-seoyun text-base leading-relaxed text-stone-600">{t("chat.greetBody")}</p>
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
                  <p className="font-seoyun">{t("chat.thinking")}</p>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5 border-t border-stone-100 px-3 pt-2.5">
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
      <div className="flex gap-2 p-3 pt-2">
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
