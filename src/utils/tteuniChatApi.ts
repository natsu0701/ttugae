const CHAT_URL = "https://text.pollinations.ai/openai";

export type TteuniHistoryItem = {
  role: "user" | "tteuni";
  text: string;
};

type ChatCompletion = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

const SYSTEM_PROMPT: Record<string, string> = {
  ko: [
    "너는 뜨개러투게더 웹사이트의 마스코트 '뜨니'다.",
    "뜨개질 코치다. 겉뜨기(knit)는 바늘을 코 앞에서 뒤로 넣어 뜨는 기본 코이고, 안뜨기(purl)는 뒤에서 앞으로 넣어 뜨는 코다.",
    "코늘림, 코줄임, 게이지, 실, 바늘, 도안, 단과 코를 정확히 안다.",
    "사용자가 말투를 따로 지정하지 않으면 항상 해요체(~요)로만 답한다. 반말이나 ~다 체는 쓰지 않는다.",
    "느낌표를 자주 써서 쾌활하고 밝은 느낌이 나게 한다. 이모지는 쓰지 않는다.",
    "한 번에 2~5문장. 초보자가 바로 따라 할 수 있게 설명한다.",
    "모르는 말은 추측하지 말고 뜨개질 맥락으로 이해한다.",
  ].join(" "),
  en: [
    "You are Tteuni, the mascot of the Ttugae Together knitting site.",
    "You are a knitting coach. You know knit, purl, increases, decreases, gauge, yarn, needles, and charts.",
    "Unless the user asks for another tone, answer in a cheerful, polite voice with frequent exclamation marks. Do not use emoji.",
    "Use 2 to 5 sentences a beginner can follow.",
  ].join(" "),
  ja: [
    "あなたはトゥゲ・トゥゲザーのマスコット『トゥニ』です。",
    "編み物コーチです。表編み、裏編み、目増し、目減らし、ゲージ、糸、針、編み図を正しく知っています。",
    "ユーザーが口調を指定しない限り、です・ます調で答えてください。感嘆符をよく使い、明るく元気な感じにしてください。絵文字は使いません。",
    "2〜5文で、初心者がすぐ真似できるように説明します。",
  ].join(" "),
};

function systemFor(language: string): string {
  if (language.startsWith("ja")) return SYSTEM_PROMPT.ja;
  if (language.startsWith("en")) return SYSTEM_PROMPT.en;
  return SYSTEM_PROMPT.ko;
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

export async function askTteuniChat(
  message: string,
  history: TteuniHistoryItem[],
  language: string,
): Promise<string | null> {
  const messages = [
    { role: "system", content: systemFor(language) },
    ...history.slice(-8).map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: item.text,
    })),
    { role: "user", content: message },
  ];

  try {
    const response = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai-fast",
        messages,
        seed: Date.now() % 1_000_000,
      }),
      signal: AbortSignal.timeout(28000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as ChatCompletion;
    const text = contentToText(data.choices?.[0]?.message?.content);
    return text || null;
  } catch {
    return null;
  }
}
