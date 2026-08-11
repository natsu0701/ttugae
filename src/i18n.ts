import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ko from "./locales/ko.json";
import en from "./locales/en.json";
import ja from "./locales/ja.json";

export const SUPPORTED_LANGUAGES = ["ko", "en", "ja"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const STORAGE_KEY = "ttugae.lang";

function readStoredLanguage(): AppLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "ko" || stored === "en" || stored === "ja") return stored;
  } catch {
    // ignore
  }
  return "ko";
}

const initialLanguage = readStoredLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    ko: { translation: ko },
    en: { translation: en },
    ja: { translation: ja },
  },
  lng: initialLanguage,
  fallbackLng: "ko",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (lng === "ko" || lng === "en" || lng === "ja") {
    try {
      localStorage.setItem(STORAGE_KEY, lng);
    } catch {
      // ignore
    }
  }
  document.documentElement.lang = lng;
});

document.documentElement.lang = initialLanguage;

export default i18n;
