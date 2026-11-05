import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import BackButton from "../ui/BackButton.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import {
  finishedWorkImageUrl,
  type MyFinishedWork,
} from "../../data/myFinishedWorks.ts";
import {
  defaultDiaryForWork,
  loadKnitDiary,
  saveKnitDiary,
  type KnitDiary,
  type KnitDiaryMaterial,
} from "../../utils/knitDiaryStorage.ts";
import { askTteuniChat } from "../../utils/tteuniChatApi.ts";
import { readImageAsWebDataUrl } from "../../utils/webImage.ts";
import {
  CameraFillIcon,
  ClockFillIcon,
  HeartFillIcon,
  ImageFillIcon,
  PlusFillIcon,
  SparkleFillIcon,
} from "../icons/FillIcons.tsx";

type KnitDiaryPanelProps = {
  work: MyFinishedWork;
  onBack: () => void;
};

function photoSrc(value: string) {
  if (
    value.startsWith("blob:") ||
    value.startsWith("data:") ||
    value.startsWith("http") ||
    value.startsWith("/")
  ) {
    return value;
  }
  return finishedWorkImageUrl(value);
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="flex items-center gap-2 font-sans text-base font-bold text-gray-900">
      <HeartFillIcon className="h-4 w-4 text-coral" filled />
      {children}
    </h3>
  );
}

function newMaterialId() {
  return `m-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
}

export default function KnitDiaryPanel({ work, onBack }: KnitDiaryPanelProps) {
  const { t, i18n } = useTranslation();
  const photoRef = useRef<HTMLInputElement>(null);
  const [diary, setDiary] = useState<KnitDiary>(
    () => loadKnitDiary(work.id) ?? defaultDiaryForWork(work),
  );
  const [materialDraft, setMaterialDraft] = useState("");
  const [addingMaterial, setAddingMaterial] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);

  useEffect(() => {
    setDiary(loadKnitDiary(work.id) ?? defaultDiaryForWork(work));
    setCoverFailed(false);
    setAddingMaterial(false);
    setMaterialDraft("");
  }, [work.id]);

  const cover = photoSrc(work.image);
  const progress = 100;

  const update = (patch: Partial<KnitDiary>) => {
    setDiary((prev) => {
      const next = { ...prev, ...patch };
      saveKnitDiary(next);
      return next;
    });
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const uploaded: string[] = [];
    for (const file of [...files]) {
      if (!file.type.startsWith("image/")) continue;
      try {
        uploaded.push(await readImageAsWebDataUrl(file));
      } catch {
        // skip unreadable files
      }
    }
    if (uploaded.length) {
      setDiary((prev) => {
        const next = { ...prev, photos: [...prev.photos, ...uploaded] };
        saveKnitDiary(next);
        return next;
      });
    }
    if (photoRef.current) photoRef.current.value = "";
  };

  const removePhoto = (index: number) => {
    setDiary((prev) => {
      const next = { ...prev, photos: prev.photos.filter((_, i) => i !== index) };
      saveKnitDiary(next);
      return next;
    });
  };

  const addMaterial = () => {
    const label = materialDraft.trim();
    if (!label) return;
    const materials: KnitDiaryMaterial[] = [...diary.materials, { id: newMaterialId(), label }];
    update({ materials });
    setMaterialDraft("");
    setAddingMaterial(false);
  };

  const fillMemo = async () => {
    if (aiBusy) return;
    setAiBusy(true);
    const materials =
      diary.materials.map((item) => item.label).join(", ") || t("mypage.diary.noMaterials");
    const fallback = t("mypage.diary.aiFallback", {
      title: work.title,
      rows: diary.rowsToday,
      minutes: diary.minutesToday,
      materials,
    });
    try {
      const reply = await askTteuniChat(
        t("mypage.diary.aiPrompt", {
          title: work.title,
          rows: diary.rowsToday,
          minutes: diary.minutesToday,
          materials,
        }),
        [],
        i18n.language,
      );
      update({ memo: reply?.trim() || fallback });
    } catch {
      update({ memo: fallback });
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      <header className="flex items-center justify-between gap-3">
        <BackButton onClick={onBack} />
        <h2 className="font-sans text-lg font-bold text-gray-900">{t("mypage.diary.title")}</h2>
        <button
          type="button"
          onClick={() => saveKnitDiary(diary)}
          className="flex min-h-11 min-w-11 items-center justify-center rounded-lg px-3 font-sans text-base font-semibold text-gray-900 hover:bg-stone-100 hover:text-coral"
        >
          {t("common.save")}
        </button>
      </header>

      <div className="mt-6 flex items-start gap-3">
        <img
          src={TTEUNI_IMAGES.chatProfile}
          alt=""
          className="h-14 w-14 shrink-0 object-contain"
        />
        <p className="rounded-2xl bg-stone-100 px-4 py-3 font-seoyun text-base leading-relaxed text-stone-600">
          {t("mypage.diary.tteuni")}
        </p>
      </div>

      <section className="mt-8">
        <SectionTitle>{t("mypage.diary.project")}</SectionTitle>
        <article className="mt-3 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {coverFailed ? (
            <div className="flex h-56 items-center justify-center bg-stone-50">
              <p className="font-sans text-sm text-gray-500">{t("community.photoFail")}</p>
            </div>
          ) : (
            <img
              src={cover}
              alt={t("community.finishedAltOf", { title: work.title })}
              className="h-56 w-full object-cover"
              onError={() => setCoverFailed(true)}
            />
          )}
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="min-w-0 break-keep font-sans text-lg font-bold leading-snug text-gray-900">
                {work.title}
              </h3>
              <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 font-sans text-sm font-semibold text-stone-600">
                {t("mypage.diary.doneBadge")}
              </span>
            </div>
            <p className="mt-2 font-sans text-sm text-gray-500">
              {t("mypage.diary.started")}: {diary.startedAt}
            </p>
            <p className="font-sans text-sm text-gray-500">
              {t("mypage.diary.completed")}: {work.completedAt}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between font-sans text-sm text-gray-500">
                <span>{t("mypage.diary.progress")}</span>
                <span className="font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-gray-900" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-8">
        <SectionTitle>{t("mypage.diary.today")}</SectionTitle>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="rounded-2xl border border-stone-200 bg-white p-4">
            <ImageFillIcon className="h-6 w-6 text-gray-900" />
            <SmoothInput
              type="number"
              min={0}
              value={String(diary.rowsToday)}
              onChange={(e) => update({ rowsToday: Math.max(0, Number(e.target.value) || 0) })}
              className="mt-3 border-0 bg-transparent px-0 py-1 text-3xl font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("mypage.diary.rows")}
            />
            <span className="mt-1 block break-keep font-sans text-sm leading-snug text-gray-500">{t("mypage.diary.rows")}</span>
          </label>
          <label className="rounded-2xl border border-stone-200 bg-white p-4">
            <ClockFillIcon className="h-6 w-6 text-gray-900" />
            <SmoothInput
              type="number"
              min={0}
              value={String(diary.minutesToday)}
              onChange={(e) => update({ minutesToday: Math.max(0, Number(e.target.value) || 0) })}
              className="mt-3 border-0 bg-transparent px-0 py-1 text-3xl font-bold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              aria-label={t("mypage.diary.minutes")}
            />
            <span className="mt-1 block break-keep font-sans text-sm leading-snug text-gray-500">{t("mypage.diary.minutes")}</span>
          </label>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle>{t("mypage.diary.materials")}</SectionTitle>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {diary.materials.map((item) => (
            <span
              key={item.id}
              className="inline-flex min-h-11 max-w-full items-center gap-1 break-keep rounded-full border border-stone-200 bg-white px-3 font-sans text-base leading-snug text-gray-800"
            >
              {item.label}
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-stone-100 hover:text-coral"
                onClick={() =>
                  update({ materials: diary.materials.filter((row) => row.id !== item.id) })
                }
                aria-label={t("mypage.diary.removeMaterial", { label: item.label })}
              >
                  ×
                </button>
              </span>
            ))}
          {addingMaterial ? (
            <div className="flex min-w-[12rem] flex-1 items-center gap-2">
              <SmoothInput
                value={materialDraft}
                onChange={(e) => setMaterialDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMaterial();
                  }
                }}
                placeholder={t("mypage.diary.materialPh")}
                className="py-2"
                autoFocus
              />
              <button
                type="button"
                onClick={addMaterial}
                className="flex min-h-11 shrink-0 items-center rounded-full bg-gray-900 px-3 font-sans text-sm font-semibold text-white"
              >
                {t("common.save")}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingMaterial(true)}
              className="inline-flex min-h-11 items-center gap-1 break-keep rounded-full border border-dashed border-stone-300 px-3 font-sans text-base leading-snug text-gray-600 hover:border-coral hover:text-coral"
            >
              <PlusFillIcon className="h-4 w-4" />
              {t("mypage.diary.addMaterial")}
            </button>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <SectionTitle>{t("mypage.diary.memo")}</SectionTitle>
          <button
            type="button"
            onClick={() => void fillMemo()}
            disabled={aiBusy}
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 break-keep rounded-full bg-gray-900 px-3.5 font-sans text-sm font-semibold leading-snug text-white hover:bg-black disabled:opacity-50"
          >
            <SparkleFillIcon className="h-3.5 w-3.5" />
            {aiBusy ? t("mypage.diary.aiBusy") : t("mypage.diary.aiFill")}
          </button>
        </div>
        <textarea
          value={diary.memo}
          onChange={(e) => setDiary({ ...diary, memo: e.target.value })}
          placeholder={t("mypage.diary.memoPh")}
          className="mt-3 min-h-[160px] w-full resize-y rounded-xl border-l-4 border-coral bg-[#FFFBF7] px-4 py-3 font-seoyun text-base leading-8 text-gray-800 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, #f0e6dc 31px, #f0e6dc 32px)",
          }}
        />
      </section>

      <section className="mt-8">
        <SectionTitle>{t("mypage.diary.photos")}</SectionTitle>
        {diary.photos.length > 0 ? (
          <ul className="mt-3 grid grid-cols-2 gap-3">
            {diary.photos.map((src, index) => (
              <li key={`${src.slice(0, 24)}-${index}`} className="relative overflow-hidden rounded-xl">
                <img
                  src={photoSrc(src)}
                  alt={t("mypage.diary.photoAlt", { n: index + 1 })}
                  className="h-36 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 font-sans text-base text-gray-700 hover:text-coral"
                  aria-label={t("mypage.diary.removePhoto")}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => void addPhotos(e.target.files)}
        />
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 break-keep rounded-2xl border border-stone-200 bg-stone-50 font-sans text-base font-semibold leading-snug text-gray-800 hover:border-coral hover:text-coral"
        >
          <CameraFillIcon className="h-5 w-5" />
          {t("mypage.diary.addPhoto")}
        </button>
      </section>
    </div>
  );
}
