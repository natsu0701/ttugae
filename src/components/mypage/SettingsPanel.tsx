import { useTranslation } from "react-i18next";
import { softShadow } from "../ui/tabButtonStyles.ts";
import type { AppLanguage } from "../../i18n.ts";
import { SUPPORTED_LANGUAGES } from "../../i18n.ts";

const LANG_OPTIONS: { id: AppLanguage; labelKey: string }[] = [
  { id: "ko", labelKey: "mypage.settings.langKo" },
  { id: "en", labelKey: "mypage.settings.langEn" },
  { id: "ja", labelKey: "mypage.settings.langJa" },
];

export type { AppLanguage };

export default function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const current =
    SUPPORTED_LANGUAGES.includes(i18n.language as AppLanguage)
      ? (i18n.language as AppLanguage)
      : "ko";

  const handleLanguageChange = (lng: AppLanguage) => {
    void i18n.changeLanguage(lng);
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-sans text-2xl font-bold text-gray-900">
        {t("mypage.settings.title")}
      </h2>
      <p className="mt-1 font-sans text-sm font-normal text-gray-600">
        {t("mypage.settings.subtitle")}
      </p>

      <div className={`mt-8 rounded-2xl bg-white p-6 ${softShadow}`}>
        <label
          htmlFor="language-select"
          className="block font-sans text-sm font-bold text-gray-900"
        >
          {t("mypage.settings.languageLabel")}
        </label>
        <p className="mt-2 font-rounded text-xs font-normal text-gray-500">
          {t("mypage.settings.appliedHint")}
        </p>

        <select
          id="language-select"
          value={current}
          onChange={(e) => handleLanguageChange(e.target.value as AppLanguage)}
          className={`mt-4 w-full rounded-xl bg-gray-50 px-4 py-3 font-sans text-sm font-normal text-gray-800 outline-none transition-colors focus:bg-white ${softShadow}`}
        >
          {LANG_OPTIONS.map((lang) => (
            <option key={lang.id} value={lang.id}>
              {t(lang.labelKey)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
