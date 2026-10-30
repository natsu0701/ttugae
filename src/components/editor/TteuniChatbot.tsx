import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import { askTteuniChat } from "../../utils/tteuniChatApi.ts";
import { loadYarnInventory } from "../../utils/personalizationStorage.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import ChatTypingDots from "../ui/ChatTypingDots.tsx";
import { editorPanel } from "../ui/tabButtonStyles.ts";
import { SendFillIcon } from "../icons/FillIcons.tsx";

export type ChatMessage = {
  id: string;
  role: "user" | "tteuni";
  text: string;
};

type TteuniChatbotProps = {
  /** 사용자 메시지 처리 후 뜨니 답변 텍스트 반환 */
  onUserMessage: (message: string) => string;
};

export default function TteuniChatbot({ onUserMessage }: TteuniChatbotProps) {
  const { t, i18n } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const submit = () => {
    const text = input.trim();
    if (!text || busy) return;
    const history = messages;
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text },
    ]);
    setInput("");
    setBusy(true);
    const canned = onUserMessage(text);
    void (async () => {
      const ai = await askTteuniChat(text, history, i18n.language);
      let reply = ai ?? canned;
      const askedInventory = /보관함|재고|내 실|바늘|모카|그램|stash|inventory|yarn|needle|gram|保管|在庫/.test(text);
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
      setMessages((prev) => [
        ...prev,
        { id: `t-${Date.now()}`, role: "tteuni", text: reply },
      ]);
      setBusy(false);
    })();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={`${editorPanel} p-4`}>
      <p className="mb-3 font-sans text-base font-bold text-white">{t("editor.tteuniAi")}</p>

      <div
        ref={listRef}
        className="mb-3 max-h-52 space-y-3 overflow-y-auto hide-scrollbar"
      >
        {messages.length === 0 && !busy ? (
          <div className="flex gap-2.5">
            <img
              src={TTEUNI_IMAGES.chatProfile}
              alt={t("editor.tteuniName")}
              className="h-10 w-10 shrink-0 object-contain"
            />
            <div className="rounded-2xl rounded-tl-sm border border-stone-600/80 bg-stone-700 px-3 py-2.5">
              <p className="font-seoyun text-base font-normal leading-relaxed text-stone-100">
                {t("editor.tteuniHint")}
              </p>
            </div>
          </div>
        ) : (
          <>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {msg.role === "tteuni" && (
                <img
                  src={TTEUNI_IMAGES.chatProfile}
                  alt=""
                  className="h-8 w-8 shrink-0 object-contain"
                  aria-hidden
                />
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-coral text-white"
                    : "rounded-tl-sm border border-stone-600/80 bg-stone-700 text-stone-100"
                }`}
              >
                <p
                  className={`font-seoyun text-base font-normal leading-relaxed ${
                    msg.role === "user" ? "text-white" : "text-stone-100"
                  }`}
                >
                  {msg.text}
                </p>
              </div>
            </div>
          ))}
          {busy ? (
            <div className="flex gap-2">
              <img src={TTEUNI_IMAGES.chatProfile} alt="" className="h-8 w-8 shrink-0 object-contain" aria-hidden />
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone-600/80 bg-stone-700 px-3 py-2">
                <div className="flex items-center gap-2">
                  <ChatTypingDots tone="dark" />
                  <p className="font-seoyun text-base leading-relaxed text-stone-300">{t("chat.thinking")}</p>
                </div>
              </div>
            </div>
          ) : null}
          </>
        )}
      </div>

      <div className="flex gap-2">
        <SmoothInput
          type="text"
          tone="dark"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={t("editor.tteuniPlaceholder")}
          disabled={busy}
          className="min-w-0 flex-1 rounded-xl border-stone-700/80 px-3 py-2.5 text-base"
        />
        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-coral text-white transition-colors hover:bg-black disabled:opacity-50"
          aria-label={t("common.send")}
        >
          <SendFillIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
