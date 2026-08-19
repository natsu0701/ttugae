import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import type { AppLanguage } from "../../i18n.ts";
import { currentAppLanguage } from "../../i18n.ts";
import {
  loadNeedleInventory,
  loadTasteProfile,
  loadYarnInventory,
  saveNeedleInventory,
  saveTasteProfile,
  saveYarnInventory,
  type NeedleStock,
  type SkillLevel,
  type TasteStyle,
  type YarnStock,
} from "../../utils/personalizationStorage.ts";
import NeedleSpecFields from "../editor/NeedleSpecFields.tsx";
import {
  DEFAULT_NEEDLE,
  formatNeedleBadge,
  needleDetailLabel,
  type NeedleSpec,
} from "../../data/knittingMetadataLibrary.ts";
import {
  loadYarnTrailEnabled,
  saveYarnTrailEnabled,
} from "../../utils/yarnTrailStorage.ts";
import { GlobeFillIcon } from "../icons/FillIcons.tsx";

const LANG_OPTIONS: { id: AppLanguage; labelKey: string }[] = [
  { id: "ko", labelKey: "mypage.settings.langKo" },
  { id: "en", labelKey: "mypage.settings.langEn" },
  { id: "ja", labelKey: "mypage.settings.langJa" },
];

const SKILL_OPTIONS: SkillLevel[] = ["beginner", "intermediate", "advanced"];
const STYLE_OPTIONS: TasteStyle[] = ["nordic", "aran", "colorwork", "amigurumi", "simple"];
const SKILL_KEY: Record<SkillLevel, string> = {
  beginner: "mypage.settings.skillBeginner",
  intermediate: "mypage.settings.skillIntermediate",
  advanced: "mypage.settings.skillAdvanced",
};
const STYLE_KEY: Record<TasteStyle, string> = {
  nordic: "mypage.settings.styleNordic",
  aran: "mypage.settings.styleAran",
  colorwork: "mypage.settings.styleColorwork",
  amigurumi: "mypage.settings.styleAmigurumi",
  simple: "mypage.settings.styleSimple",
};

export type { AppLanguage };

function SettingsCard({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className={`mt-6 rounded-2xl bg-white p-6 ${softShadow}`}>
      <h3 className="font-sans text-sm font-bold text-gray-900">{title}</h3>
      <p className="mt-1 font-seoyun text-xs font-normal text-gray-500">{hint}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const current = currentAppLanguage();

  const [isYarnTrailEnabled, setIsYarnTrailEnabled] = useState(loadYarnTrailEnabled);
  const [yarns, setYarns] = useState<YarnStock[]>(() => loadYarnInventory());
  const [needles, setNeedles] = useState<NeedleStock[]>(() => loadNeedleInventory());
  const [needleDraft, setNeedleDraft] = useState<NeedleSpec>(DEFAULT_NEEDLE);
  const [taste, setTaste] = useState(() => loadTasteProfile());
  const [yarnDraft, setYarnDraft] = useState({
    name: "",
    grams: "",
    meters: "",
    needle: "",
  });
  const [savedHint, setSavedHint] = useState<string | null>(null);

  const flash = (message: string) => {
    setSavedHint(message);
    window.setTimeout(() => setSavedHint(null), 2200);
  };

  const handleLanguageChange = (lng: AppLanguage) => {
    void i18n.changeLanguage(lng);
  };

  const addYarn = () => {
    const name = yarnDraft.name.trim();
    if (!name) return;
    const next: YarnStock[] = [
      ...yarns,
      {
        id: `yarn-${Date.now()}`,
        name,
        grams: yarnDraft.grams.trim(),
        meters: yarnDraft.meters.trim(),
        needle: yarnDraft.needle.trim(),
      },
    ];
    setYarns(next);
    saveYarnInventory(next);
    setYarnDraft({ name: "", grams: "", meters: "", needle: "" });
    flash(t("mypage.settings.yarnAdded"));
  };

  const removeYarn = (id: string) => {
    const next = yarns.filter((y) => y.id !== id);
    setYarns(next);
    saveYarnInventory(next);
  };

  const addNeedle = () => {
    const size = needleDraft.needleSize.trim();
    if (!size) return;
    const next: NeedleStock[] = [
      ...needles,
      { id: `needle-${Date.now()}`, ...needleDraft, needleSize: size },
    ];
    setNeedles(next);
    saveNeedleInventory(next);
    setNeedleDraft(DEFAULT_NEEDLE);
    flash(t("mypage.settings.needleAdded"));
  };

  const removeNeedle = (id: string) => {
    const next = needles.filter((n) => n.id !== id);
    setNeedles(next);
    saveNeedleInventory(next);
  };

  const toggleStyle = (style: TasteStyle) => {
    const styles = taste.styles.includes(style)
      ? taste.styles.filter((s) => s !== style)
      : [...taste.styles, style];
    const next = { ...taste, styles };
    setTaste(next);
    saveTasteProfile(next);
  };

  const changeSkill = (skill: SkillLevel) => {
    const next = { ...taste, skill };
    setTaste(next);
    saveTasteProfile(next);
  };

  const yarnRows = useMemo(() => yarns, [yarns]);

  return (
    <div className="max-w-lg">
      <h2 className="font-sans text-2xl font-bold text-gray-900">
        {t("mypage.settings.title")}
      </h2>
      <p className="mt-1 font-sans text-sm font-normal text-gray-600">
        {t("mypage.settings.subtitle")}
      </p>
      {savedHint ? (
        <p className="mt-3 font-sans text-xs font-medium text-coral">{savedHint}</p>
      ) : null}

      <SettingsCard
        title={t("mypage.settings.envTitle")}
        hint={t("mypage.settings.envHint")}
      >
        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50 p-3.5">
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-stone-700">{t("mypage.settings.yarnTrail")}</span>
            <span className="mt-0.5 text-[10px] text-stone-400">
              {t("mypage.settings.yarnTrailHint")}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = !isYarnTrailEnabled;
              setIsYarnTrailEnabled(next);
              saveYarnTrailEnabled(next);
            }}
            aria-pressed={isYarnTrailEnabled}
            className={`flex h-6 w-10 items-center rounded-full p-0.5 transition-colors duration-200 ${
              isYarnTrailEnabled ? "bg-coral" : "bg-stone-300"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isYarnTrailEnabled ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <div className="mt-4">
          <label
            htmlFor="language-select"
            className="flex items-center gap-2 font-sans text-sm font-bold text-gray-900"
          >
            <GlobeFillIcon className="h-5 w-5 text-stone-500" />
            {t("mypage.settings.languageLabel")}
          </label>
          <p className="mt-2 font-seoyun text-xs font-normal text-gray-500">
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
      </SettingsCard>

      <SettingsCard
        title={t("mypage.settings.yarnStashTitle")}
        hint={t("mypage.settings.yarnStashHint")}
      >
        {yarnRows.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {yarnRows.map((yarn) => (
              <li
                key={yarn.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-medium text-gray-900">
                    {yarn.name}
                  </span>
                  <span className="block font-sans text-[11px] font-normal text-gray-500">
                    {[yarn.grams && `${yarn.grams}g`, yarn.meters && `${yarn.meters}m`, yarn.needle]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeYarn(yarn.id)}
                  className="shrink-0 font-sans text-xs text-gray-400 transition-colors hover:text-coral"
                >
                  {t("common.delete")}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 font-seoyun text-xs font-normal text-gray-500">
            {t("mypage.settings.yarnEmpty")}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <SmoothInput
            label={t("mypage.settings.yarnName")}
            value={yarnDraft.name}
            onChange={(e) => setYarnDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder={t("mypage.settings.yarnNamePh")}
            className="border-stone-200"
          />
          <SmoothInput
            label={t("mypage.settings.yarnGrams")}
            value={yarnDraft.grams}
            onChange={(e) => setYarnDraft((d) => ({ ...d, grams: e.target.value }))}
            inputMode="numeric"
            className="border-stone-200"
          />
          <SmoothInput
            label={t("mypage.settings.yarnMeters")}
            value={yarnDraft.meters}
            onChange={(e) => setYarnDraft((d) => ({ ...d, meters: e.target.value }))}
            inputMode="numeric"
            className="border-stone-200"
          />
          <SmoothInput
            label={t("mypage.settings.yarnNeedle")}
            value={yarnDraft.needle}
            onChange={(e) => setYarnDraft((d) => ({ ...d, needle: e.target.value }))}
            placeholder={t("mypage.settings.yarnNeedlePh")}
            className="border-stone-200"
          />
        </div>
        <Button type="button" onClick={addYarn} className="mt-4 px-5 py-2.5 text-sm">
          {t("mypage.settings.yarnAdd")}
        </Button>
      </SettingsCard>

      <SettingsCard
        title={t("mypage.settings.needleTitle")}
        hint={t("mypage.settings.needleHint")}
      >
        {needles.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {needles.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-sans text-sm font-medium text-gray-900">
                    {formatNeedleBadge(item)}
                  </span>
                  {needleDetailLabel(item) ? (
                    <span className="block font-sans text-[11px] font-normal text-gray-500">
                      {needleDetailLabel(item)}
                    </span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => removeNeedle(item.id)}
                  className="shrink-0 font-sans text-xs text-gray-400 transition-colors hover:text-coral"
                >
                  {t("common.delete")}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mb-4 font-seoyun text-xs font-normal text-gray-500">
            {t("mypage.settings.needleEmpty")}
          </p>
        )}
        <NeedleSpecFields value={needleDraft} onChange={setNeedleDraft} tone="light" />
        <Button type="button" onClick={addNeedle} className="mt-4 px-5 py-2.5 text-sm">
          {t("mypage.settings.needleAdd")}
        </Button>
      </SettingsCard>

      <SettingsCard
        title={t("mypage.settings.tasteTitle")}
        hint={t("mypage.settings.tasteHint")}
      >
        <p className="mb-2 font-sans text-xs font-medium text-gray-700">{t("mypage.settings.skillLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {SKILL_OPTIONS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => changeSkill(level)}
              className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                taste.skill === level
                  ? "bg-coral text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t(SKILL_KEY[level])}
            </button>
          ))}
        </div>
        <p className="mb-2 mt-4 font-sans text-xs font-medium text-gray-700">{t("mypage.settings.styleLabel")}</p>
        <div className="flex flex-wrap gap-2">
          {STYLE_OPTIONS.map((style) => {
            const on = taste.styles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`rounded-full px-3.5 py-1.5 font-sans text-xs font-medium transition-colors ${
                  on ? "bg-stone-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t(STYLE_KEY[style])}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
}
