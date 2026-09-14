import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base"
            value={province.name}
            onChange={(e) => setPart({ province: e.target.value, city: undefined, dong: undefined })}
          >
            {KOREA_REGIONS.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-stone-500">
          {t("mypage.region.city")}
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base"
            value={city.name}
            onChange={(e) => setPart({ city: e.target.value, dong: undefined })}
          >
            {province.cities.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-stone-500">
          {t("mypage.region.dong")}
          <select
            className="mt-1 w-full rounded-lg border border-stone-200 px-3 py-2 text-base"
            value={parsed.dong || city.dongs[0]}
            onChange={(e) => setPart({ dong: e.target.value })}
          >
            {city.dongs.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
      </div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("mypage.region.searchPh")}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-base outline-none focus:border-coral"
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
