import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { getTteuniReply } from "../../utils/aiPatternApply.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import { ChatFillIcon, CloseFillIcon } from "../icons/FillIcons.tsx";

type ChatMessage = {
  id: string;
  role: "user" | "tteuni";
  text: string;
};

type TteuniChatWidgetProps = {
  open: boolean;
  onClose: () => void;
};

export default function TteuniChatWidget({ open, onClose }: TteuniChatWidgetProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  if (!open) return null;

  const submit = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text }]);
    setInput("");
    let reply = getTteuniReply(text, t);
    const askedInventory = /보관함|재고|내 실|바늘|stash|inventory|yarn|needle|gram|保管|在庫/.test(text);
    if (askedInventory) {
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
        reply = `${reply}\n\n${t("editor.tteuniInventory", { list })}`;
      } else {
        reply = `${reply}\n\n${t("editor.tteuniInventoryEmpty")}`;
      }
    }
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: `t-${Date.now()}`, role: "tteuni", text: reply }]);
    }, 280);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="fixed bottom-24 right-5 z-[70] flex w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
      <div className="flex items-center gap-2 border-b border-stone-100 px-4 py-3">
        <img src={TTEUNI_IMAGES.chatProfile} alt="" className="h-8 w-8 object-contain" />
        <div className="min-w-0 flex-1">
          <p className="font-sans text-sm font-bold text-stone-900">{t("chat.widgetTitle")}</p>
          <p className="font-sans text-[11px] text-stone-500">{t("chat.widgetHint")}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
      </div>
      <div ref={listRef} className="max-h-72 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex gap-2">
            <ChatFillIcon className="mt-0.5 h-4 w-4 shrink-0 text-coral" />
            <p className="font-seoyun text-sm leading-relaxed text-stone-600">{t("editor.tteuniHint")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-coral text-white" : "bg-stone-100 text-stone-800"
                }`}
              >
                <p className="whitespace-pre-wrap font-seoyun">{msg.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="flex gap-2 border-t border-stone-100 p-3">
        <SmoothInput
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("editor.tteuniPlaceholder")}
          className="min-w-0 flex-1 rounded-xl border-stone-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={submit}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white hover:bg-black"
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
