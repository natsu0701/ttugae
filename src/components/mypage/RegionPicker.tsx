import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "../ui/Select.tsx";
import {
  KOREA_REGIONS,
  formatRegion,
  searchDongs,
  splitRegion,
} from "../../data/koreaRegions.ts";

type RegionPickerProps = {
  value: string;
  onChange: (next: string) => void;
};

function RegionPicker({ value, onChange }: RegionPickerProps) {
  const { t } = useTranslation();
  const parsed = splitRegion(value);
  const [query, setQuery] = useState("");
  const province = KOREA_REGIONS.find((item) => item.name === parsed.province) ?? KOREA_REGIONS[0];
  const city = province.cities.find((item) => item.name === parsed.city) ?? province.cities[0];
  const hits = useMemo(() => searchDongs(query), [query]);

  const setPart = (next: { province?: string; city?: string; dong?: string }) => {
    const p = next.province ?? parsed.province ?? KOREA_REGIONS[0].name;
    const prov = KOREA_REGIONS.find((item) => item.name === p) ?? KOREA_REGIONS[0];
    const c = next.city ?? parsed.city ?? prov.cities[0].name;
    const cit = prov.cities.find((item) => item.name === c) ?? prov.cities[0];
    const d = next.dong ?? parsed.dong ?? cit.dongs[0];
    onChange(formatRegion(prov.name, cit.name, d));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <label className="text-sm text-stone-500">
          {t("mypage.region.province")}
          <Select
            className="mt-1"
            value={province.name}
            onChange={(next) => setPart({ province: next, city: undefined, dong: undefined })}
            options={KOREA_REGIONS.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
          />
        </label>
        <label className="text-sm text-stone-500">
          {t("mypage.region.city")}
          <Select
            className="mt-1"
            value={city.name}
            onChange={(next) => setPart({ city: next, dong: undefined })}
            options={province.cities.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
          />
        </label>
        <label className="text-sm text-stone-500">
          {t("mypage.region.dong")}
          <Select
            className="mt-1"
            value={parsed.dong || city.dongs[0]}
            onChange={(next) => setPart({ dong: next })}
            options={city.dongs.map((item) => ({
              value: item,
              label: item,
            }))}
          />
        </label>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("mypage.region.searchPh")}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-base outline-none focus:border-coral focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
      />
      {query && hits.length > 0 ? (
        <ul className="overflow-hidden rounded-lg border border-stone-200">
          {hits.map((hit) => {
            const label = formatRegion(hit.province, hit.city, hit.dong);
            return (
              <li key={label}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-base hover:bg-stone-50"
                  onClick={() => {
                    onChange(label);
                    setQuery("");
                  }}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

export default memo(RegionPicker);
