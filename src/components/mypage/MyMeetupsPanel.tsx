import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  MEETUP_RESERVATION_EVENT,
  OFFLINE_UPDATED_EVENT,
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

export default function MyMeetupsPanel() {
  const { t } = useTranslation();
  const [tick, setTick] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [diaryBody, setDiaryBody] = useState("");

  useEffect(() => {
    const bump = () => setTick((n) => n + 1);
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
  const empty = storeMeetups.length === 0 && hubMeetups.length === 0;
  const active = storeMeetups.find((item) => item.meetupId === activeId);
  const handle = currentUserHandle();
  const host = active ? isMeetupHost(active, handle) : false;
  const payload = active ? attendancePayload(active.meetupId) : "";
  const diaries = active ? loadMeetupDiaries(active.meetupId) : [];

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
          {hubMeetups.map((meetup) => (
            <article key={meetup.id} className="rounded-xl bg-stone-50 p-5">
              <p className="font-sans text-[11px] text-stone-400">
                {loc(t, `content.meetups.${meetup.id}.region`, meetup.region)}
              </p>
              <h3 className="mt-1 font-sans text-lg font-bold">
                {loc(t, `content.meetups.${meetup.id}.title`, meetup.title)}
              </h3>
            </article>
          ))}
          {storeMeetups.map((meetup) => {
            const joined = meetupJoinedCount(meetup);
            return (
              <button
                key={meetup.meetupId}
                type="button"
                onClick={() => setActiveId(meetup.meetupId)}
                className="rounded-xl bg-stone-50 p-5 text-left"
              >
                <p className="font-sans text-[11px] text-stone-400">
                  {loc(t, `content.meetups.${meetup.meetupId}.region`, meetup.region)}
                </p>
                <h3 className="mt-1 font-sans text-lg font-bold">
                  {loc(t, `content.meetups.${meetup.meetupId}.title`, meetup.title)}
                </h3>
                <p className="mt-3 font-seoyun text-xs text-stone-500">
                  {t("mypage.meetupsJoined", { max: meetup.maxCapacity, joined })}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {active ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button type="button" className="absolute inset-0 bg-stone-900/30" onClick={() => setActiveId(null)} />
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
              <Textarea
                value={diaryBody}
                onChange={(e) => setDiaryBody(e.target.value)}
                className="mt-2"
              />
              <Button
                type="button"
                className="mt-2 px-4 py-2 text-sm"
                onClick={() => {
                  if (!diaryBody.trim()) return;
                  saveMeetupDiary({ meetupId: active.meetupId, body: diaryBody.trim() });
                  setDiaryBody("");
                  setTick((n) => n + 1);
                }}
              >
                {t("mypage.meetups.diarySave")}
              </Button>
              <ul className="mt-4 space-y-2">
                {diaries.map((entry) => (
                  <li key={entry.id} className="rounded-lg bg-stone-50 p-3 text-sm">
                    <p className="text-xs text-stone-400">@{entry.author}</p>
                    <p className="mt-1">{entry.body}</p>
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
