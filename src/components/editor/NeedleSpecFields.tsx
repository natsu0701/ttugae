import { useEffect, useId, useState } from "react";
import {
  CROCHET_SIZE_OPTIONS,
  CUSTOM_SIZE_VALUE,
  KNITTING_SIZE_OPTIONS,
  NEEDLE_TYPE_LABELS,
  defaultNeedleForType,
  needleDetailOptions,
  needleSizeOptions,
  type NeedleSpec,
  type NeedleType,
} from "../../data/knittingMetadataLibrary.ts";

type NeedleSpecFieldsProps = {
  value: NeedleSpec;
  onChange: (next: NeedleSpec) => void;
  tone?: "light" | "dark";
};

function fieldClass(tone: "light" | "dark") {
  return tone === "dark"
    ? "w-full rounded-xl border border-stone-600/80 bg-stone-800 px-3 py-2 font-sans text-sm text-stone-100 outline-none"
    : "w-full rounded-2xl border border-stone-200 bg-white px-3 py-2 font-sans text-sm text-gray-800 outline-none";
}

function labelClass(tone: "light" | "dark") {
  return tone === "dark"
    ? "mb-1.5 block font-sans text-xs font-normal text-stone-400"
    : "mb-1.5 block font-sans text-xs font-normal text-gray-600";
}

export default function NeedleSpecFields({
  value,
  onChange,
  tone = "light",
}: NeedleSpecFieldsProps) {
  const uid = useId();
  const sizes = needleSizeOptions(value.needleType);
  const sizeInList = (sizes as readonly string[]).includes(value.needleSize);
  const [customOpen, setCustomOpen] = useState(!sizeInList);
  const selectSize = customOpen || !sizeInList ? CUSTOM_SIZE_VALUE : value.needleSize;
  const details = needleDetailOptions(value.needleType);
  const field = fieldClass(tone);
  const label = labelClass(tone);

  const setType = (needleType: NeedleType) => {
    if (needleType === value.needleType) return;
    setCustomOpen(false);
    onChange(defaultNeedleForType(needleType));
  };

  useEffect(() => {
    if (!(sizes as readonly string[]).includes(value.needleSize) && value.needleSize) {
      setCustomOpen(true);
    }
  }, [sizes, value.needleSize]);

  return (
    <div className="space-y-3">
      <div>
        <p className={label}>바늘 종류</p>
        <div className="grid grid-cols-2 gap-2">
          {(["knitting", "crochet"] as const).map((type) => {
            const active = value.needleType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setType(type)}
                className={`rounded-full px-3 py-2 font-sans text-xs font-medium transition-colors ${
                  active
                    ? "bg-coral text-white"
                    : tone === "dark"
                      ? "bg-stone-800 text-stone-300 hover:bg-stone-600 hover:text-white"
                      : "bg-white text-gray-600 hover:bg-black hover:text-white"
                }`}
              >
                {NEEDLE_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`needle-detail-${uid}`}>
          바늘 세부 타입
        </label>
        <select
          id={`needle-detail-${uid}`}
          value={value.needleDetail ?? details[0]?.id}
          onChange={(e) =>
            onChange({
              ...value,
              needleDetail: e.target.value as NeedleSpec["needleDetail"],
            })
          }
          className={field}
        >
          {details.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor={`needle-size-${uid}`}>
          바늘 사이즈
        </label>
        <select
          id={`needle-size-${uid}`}
          value={selectSize}
          onChange={(e) => {
            const next = e.target.value;
            if (next === CUSTOM_SIZE_VALUE) {
              setCustomOpen(true);
              return;
            }
            setCustomOpen(false);
            onChange({ ...value, needleSize: next });
          }}
          className={field}
        >
          {(value.needleType === "knitting" ? KNITTING_SIZE_OPTIONS : CROCHET_SIZE_OPTIONS).map(
            (size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ),
          )}
          <option value={CUSTOM_SIZE_VALUE}>직접 입력</option>
        </select>
        {customOpen || !sizeInList ? (
          <input
            type="text"
            value={value.needleSize}
            onChange={(e) => onChange({ ...value, needleSize: e.target.value })}
            placeholder={value.needleType === "crochet" ? "예: 4호" : "예: 5.5mm"}
            className={`mt-2 ${field}`}
          />
        ) : null}
      </div>
    </div>
  );
}
