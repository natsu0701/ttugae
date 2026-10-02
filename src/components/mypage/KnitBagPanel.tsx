import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import NeedleSpecFields from "../editor/NeedleSpecFields.tsx";
import {
  loadGaugeEntries,
  loadNeedleInventory,
  loadYarnInventory,
  saveNeedleInventory,
  saveYarnInventory,
  type NeedleStock,
  type YarnStock,
} from "../../utils/personalizationStorage.ts";
import {
  DEFAULT_NEEDLE,
  formatNeedleBadge,
  type NeedleSpec,
} from "../../data/knittingMetadataLibrary.ts";

function KnitBagPanel() {
  const { t } = useTranslation();
  const [yarns, setYarns] = useState<YarnStock[]>(() => loadYarnInventory());
  const [needles, setNeedles] = useState<NeedleStock[]>(() => loadNeedleInventory());
  const [needleDraft, setNeedleDraft] = useState<NeedleSpec>(DEFAULT_NEEDLE);
  const [yarnDraft, setYarnDraft] = useState({
    name: "",
    grams: "",
    meters: "",
    needle: "",
  });
  const gauges = loadGaugeEntries();

  const addYarn = () => {
    const name = yarnDraft.name.trim();
    if (!name) return;
    const next = [
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
  };

  const addNeedle = () => {
    const size = needleDraft.needleSize.trim();
    if (!size) return;
    const next = [...needles, { id: `needle-${Date.now()}`, ...needleDraft, needleSize: size }];
    setNeedles(next);
    saveNeedleInventory(next);
    setNeedleDraft(DEFAULT_NEEDLE);
  };

  const gaugeCards = useMemo(
    () =>
      gauges.map((entry, index) => ({
        id: entry.id,
        title: [entry.yarn, entry.needle].filter(Boolean).join(" / ") || t("mypage.gauge.entryTitle", { n: index + 1 }),
        rows: [
          { label: t("mypage.profile.gaugeBeforeSts"), value: entry.beforeSts || "-" },
          { label: t("mypage.profile.gaugeBeforeRows"), value: entry.beforeRows || "-" },
          { label: t("mypage.profile.gaugeAfterSts"), value: entry.afterSts || "-" },
          { label: t("mypage.profile.gaugeAfterRows"), value: entry.afterRows || "-" },
        ],
      })),
    [gauges, t],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-sans text-2xl font-bold text-gray-900">{t("mypage.bag.title")}</h2>
        <p className="mt-1 font-sans text-base text-gray-600">{t("mypage.bag.subtitle")}</p>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-sans text-base font-bold text-stone-900">{t("mypage.settings.yarnStashTitle")}</h3>
        <p className="mt-1 font-sans text-sm text-stone-500">{t("mypage.settings.yarnStashHint")}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <SmoothInput
            label={t("mypage.settings.yarnName")}
            value={yarnDraft.name}
            onChange={(e) => setYarnDraft((prev) => ({ ...prev, name: e.target.value }))}
            placeholder={t("mypage.settings.yarnNamePh")}
          />
          <SmoothInput
            label={t("mypage.settings.yarnGrams")}
            value={yarnDraft.grams}
            onChange={(e) => setYarnDraft((prev) => ({ ...prev, grams: e.target.value }))}
          />
          <SmoothInput
            label={t("mypage.settings.yarnMeters")}
            value={yarnDraft.meters}
            onChange={(e) => setYarnDraft((prev) => ({ ...prev, meters: e.target.value }))}
          />
          <SmoothInput
            label={t("mypage.settings.yarnNeedle")}
            value={yarnDraft.needle}
            onChange={(e) => setYarnDraft((prev) => ({ ...prev, needle: e.target.value }))}
            placeholder={t("mypage.settings.yarnNeedlePh")}
          />
        </div>
        <Button type="button" className="mt-3 px-4 py-2 text-base" onClick={addYarn}>
          {t("mypage.settings.yarnAdd")}
        </Button>
        <ul className="mt-4 space-y-2">
          {yarns.length === 0 ? (
            <li className="font-sans text-base text-stone-400">{t("mypage.settings.yarnEmpty")}</li>
          ) : (
            yarns.map((yarn) => (
              <li
                key={yarn.id}
                className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2"
              >
                <span className="font-sans text-base text-stone-800">
                  {yarn.name}
                  {yarn.grams ? ` · ${yarn.grams}g` : ""}
                  {yarn.meters ? ` · ${yarn.meters}m` : ""}
                  {yarn.needle ? ` · ${yarn.needle}` : ""}
                </span>
                <button
                  type="button"
                  className="text-sm text-stone-400 hover:text-coral"
                  onClick={() => {
                    const next = yarns.filter((item) => item.id !== yarn.id);
                    setYarns(next);
                    saveYarnInventory(next);
                  }}
                >
                  {t("common.delete")}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-sans text-base font-bold text-stone-900">{t("mypage.settings.needleTitle")}</h3>
        <p className="mt-1 font-sans text-sm text-stone-500">{t("mypage.settings.needleHint")}</p>
        <div className="mt-4">
          <NeedleSpecFields value={needleDraft} onChange={setNeedleDraft} />
        </div>
        <Button type="button" className="mt-3 px-4 py-2 text-base" onClick={addNeedle}>
          {t("mypage.settings.needleAdd")}
        </Button>
        <ul className="mt-4 space-y-2">
          {needles.length === 0 ? (
            <li className="font-sans text-base text-stone-400">{t("mypage.settings.needleEmpty")}</li>
          ) : (
            needles.map((needle) => (
              <li
                key={needle.id}
                className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-2"
              >
                <span className="font-sans text-base text-stone-800">{formatNeedleBadge(needle)}</span>
                <button
                  type="button"
                  className="text-sm text-stone-400 hover:text-coral"
                  onClick={() => {
                    const next = needles.filter((item) => item.id !== needle.id);
                    setNeedles(next);
                    saveNeedleInventory(next);
                  }}
                >
                  {t("common.delete")}
                </button>
              </li>
            ))
          )}
        </ul>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="font-sans text-base font-bold text-stone-900">{t("mypage.bag.gaugeList")}</h3>
        <p className="mt-1 font-sans text-sm text-stone-500">{t("mypage.bag.gaugeHint")}</p>
        {gaugeCards.length === 0 ? (
          <p className="mt-4 font-sans text-base text-stone-400">{t("mypage.gauge.empty")}</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {gaugeCards.map((card) => (
              <li key={card.id}>
                <p className="font-sans text-sm font-bold text-stone-700">{card.title}</p>
                <ul className="mt-2 grid grid-cols-2 gap-3">
                  {card.rows.map((row) => (
                    <li key={row.label} className="rounded-lg bg-stone-50 px-3 py-3">
                      <p className="font-sans text-sm text-stone-500">{row.label}</p>
                      <p className="mt-1 font-sans text-lg font-bold text-stone-900">{row.value}</p>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default memo(KnitBagPanel);
