import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MEETUP_RESERVATION_EVENT,
  OFFLINE_UPDATED_EVENT,
  ensureHostedMeetup,
  loadJoinedMeetups,
  meetupJoinedCount,
} from "../../utils/offlineActivityStorage.ts";
import { loadHubReservedMeetups } from "../../data/hubMeetups.ts";
import { loc } from "../../utils/i18nContent.ts";
import {
  attendancePayload,
  checkInMeetup,
  isCheckedIn,
  isMeetupHost,
  loadMeetupDiaries,
  qrImageUrl,
  saveMeetupDiary,
} from "../../utils/meetupExtraStorage.ts";
import { currentUserHandle } from "../../utils/identity.ts";
import Button from "../ui/Button.tsx";
import Textarea from "../ui/Textarea.tsx";

type ActiveMeetup = {
  meetupId: string;
  title: string;
  region: string;
  custom?: boolean;
  memberIds?: string[];
  hostHandle?: string;
  maxCapacity?: number;
  currentMembers?: number;
};

function readPhotoAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function MyMeetupsPanel() {
  const { t } = useTranslation();
  const [tick, setTick] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [diaryBody, setDiaryBody] = useState("");
  const [diaryPhoto, setDiaryPhoto] = useState<string | undefined>();
  const photoRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    ensureHostedMeetup();
    const bump = () => setTick((n) => n + 1);
    bump();
    window.addEventListener(OFFLINE_UPDATED_EVENT, bump);
    window.addEventListener(MEETUP_RESERVATION_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(OFFLINE_UPDATED_EVENT, bump);
      window.removeEventListener(MEETUP_RESERVATION_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);

  const storeMeetups = useMemo(() => loadJoinedMeetups(), [tick]);
  const hubMeetups = useMemo(() => loadHubReservedMeetups(), [tick]);
  const handle = currentUserHandle();

  const hubAsMeetups: ActiveMeetup[] = hubMeetups.map((meetup) => ({
    meetupId: meetup.id,
    title: loc(t, `content.meetups.${meetup.id}.title`, meetup.title),
    region: loc(t, `content.meetups.${meetup.id}.region`, meetup.region),
    maxCapacity: meetup.maxCapacity,
    currentMembers: meetup.currentMembers,
  }));

  const allMeetups: ActiveMeetup[] = [
    ...storeMeetups.map((meetup) => ({
      meetupId: meetup.meetupId,
      title: loc(t, `content.meetups.${meetup.meetupId}.title`, meetup.title),
      region: loc(t, `content.meetups.${meetup.meetupId}.region`, meetup.region),
      custom: meetup.custom,
      memberIds: meetup.memberIds,
      hostHandle: meetup.hostHandle,
      maxCapacity: meetup.maxCapacity,
      currentMembers: meetup.currentMembers,
    })),
    ...hubAsMeetups.filter((hub) => !storeMeetups.some((item) => item.meetupId === hub.meetupId)),
  ];

  const empty = allMeetups.length === 0;
  const active = allMeetups.find((item) => item.meetupId === activeId) ?? null;
  const host = active ? isMeetupHost(active, handle) : false;
  const payload = active ? attendancePayload(active.meetupId) : "";
  const diaries = active ? loadMeetupDiaries(active.meetupId) : [];

  const resetDiary = () => {
    setDiaryBody("");
    setDiaryPhoto(undefined);
    if (photoRef.current) photoRef.current.value = "";
  };

  return (
    <div>
      <h2 className="text-title text-gray-900">{t("mypage.meetupsTitle")}</h2>
      <p className="mt-1 font-seoyun text-sm text-stone-500">{t("mypage.meetupsSubtitle")}</p>
      {empty ? (
        <div className="mt-6 rounded-xl bg-gray-50 p-10 text-center">
          <p className="font-sans text-xl font-bold text-gray-900">{t("mypage.meetupsEmptyTitle")}</p>
          <p className="mt-2 font-seoyun text-sm text-gray-500">{t("mypage.meetupsEmptyDesc")}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4">
          {allMeetups.map((meetup) => {
            const joined = meetupJoinedCount({
              meetupId: meetup.meetupId,
              title: meetup.title,
              region: meetup.region,
              requiredNeedle: "",
              requiredYarn: "",
              maxCapacity: meetup.maxCapacity ?? 0,
              currentMembers: meetup.currentMembers ?? 0,
              memberIds: meetup.memberIds ?? [],
            });
            return (
              <button
                key={meetup.meetupId}
                type="button"
                onClick={() => {
                  setActiveId(meetup.meetupId);
                  resetDiary();
                }}
                className="rounded-xl bg-stone-50 p-5 text-left"
              >
                <p className="font-sans text-[11px] leading-4 text-stone-400">{meetup.region}</p>
                <h3 className="mt-1.5 font-sans text-lg font-bold leading-7">{meetup.title}</h3>
                <p className="mt-3 font-seoyun text-xs leading-5 text-stone-500">
                  {t("mypage.meetupsJoined", { max: meetup.maxCapacity ?? 0, joined })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-stone-900/30"
            onClick={() => {
              setActiveId(null);
              resetDiary();
            }}
          />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6">
            <h3 className="text-title">{active.title}</h3>
            {host ? (
              <div className="mt-4">
                <p className="text-sm font-medium">{t("mypage.meetups.qrHost")}</p>
                <img src={qrImageUrl(payload)} alt="" className="mx-auto mt-3 h-48 w-48" />
                <p className="mt-2 break-all text-center text-[11px] text-stone-400">{payload}</p>
              </div>
            ) : (
              <div className="mt-4">
                <Button
                  type="button"
                  className="px-4 py-2 text-sm"
                  onClick={() => {
                    checkInMeetup(active.meetupId);
                    setTick((n) => n + 1);
                  }}
                >
                  {isCheckedIn(active.meetupId) ? t("mypage.meetups.checkedIn") : t("mypage.meetups.checkIn")}
                </Button>
              </div>
            )}
            <div className="mt-6">
              <h4 className="font-sans text-sm font-bold">{t("mypage.meetups.diaryTitle")}</h4>
              <p className="mt-1 font-sans text-xs leading-5 text-stone-400">{t("mypage.meetups.diaryHint")}</p>
              <input
                ref={photoRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  void readPhotoAsDataUrl(file).then(setDiaryPhoto);
                }}
              />
              <button
                type="button"
                className="mt-3 rounded-lg border border-dashed border-stone-200 px-3 py-2 font-sans text-xs text-stone-500"
                onClick={() => photoRef.current?.click()}
              >
                {t("mypage.meetups.diaryPhoto")}
              </button>
              {diaryPhoto ? (
                <img src={diaryPhoto} alt="" className="mt-3 max-h-40 rounded-lg object-cover" />
              ) : null}
              <Textarea
                value={diaryBody}
                onChange={(e) => setDiaryBody(e.target.value)}
                className="mt-2"
                placeholder={t("mypage.meetups.diaryBodyPh")}
              />
              <Button
                type="button"
                className="mt-2 px-4 py-2 text-sm"
                onClick={() => {
                  if (!diaryBody.trim() && !diaryPhoto) return;
                  saveMeetupDiary({
                    meetupId: active.meetupId,
                    body: diaryBody.trim(),
                    photoUrl: diaryPhoto,
                  });
                  resetDiary();
                  setTick((n) => n + 1);
                }}
              >
                {t("mypage.meetups.diarySave")}
              </Button>
              <ul className="mt-4 space-y-3">
                {diaries.map((entry) => (
                  <li key={entry.id} className="rounded-lg bg-stone-50 p-3 text-sm">
                    <p className="text-xs leading-4 text-stone-400">@{entry.author}</p>
                    {entry.photoUrl ? (
                      <img src={entry.photoUrl} alt="" className="mt-2 max-h-40 rounded-lg object-cover" />
                    ) : null}
                    {entry.body ? <p className="mt-1.5 leading-6">{entry.body}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
