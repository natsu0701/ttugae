import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import {
  DEFAULT_EMAIL,
  DEFAULT_HANDLE,
  DEFAULT_NICKNAME,
  loadProfile,
  saveProfileAccount,
} from "../../utils/profileStorage.ts";

type AccountManagePanelProps = {
  onWithdraw: () => void;
};

export default function AccountManagePanel({ onWithdraw }: AccountManagePanelProps) {
  const { t } = useTranslation();
  const stored = loadProfile();
  const [nickname, setNickname] = useState(stored.nickname || DEFAULT_NICKNAME);
  const [handle, setHandle] = useState(stored.handle || DEFAULT_HANDLE);
  const [email, setEmail] = useState(stored.email || DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (message: string) => {
    setHint(message);
    window.setTimeout(() => setHint(null), 2200);
  };

  const handleSave = () => {
    const nextHandle = handle.replace(/^@/, "").trim();
    if (!nickname.trim() || !nextHandle) {
      setError("닉네임과 아이디를 입력해 주세요.");
      return;
    }
    if (password && password.length < 8) {
      setError("비밀번호는 8자 이상이어야 해요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호 확인이 일치하지 않아요.");
      return;
    }
    setError(null);
    saveProfileAccount({
      nickname: nickname.trim(),
      handle: nextHandle,
      email: email.trim(),
    });
    setPassword("");
    setConfirmPassword("");
    flash("계정 정보를 저장했어요.");
  };

  return (
    <div className="max-w-lg">
      <h2 className="font-sans text-2xl font-bold text-gray-900">
        {t("mypage.account.manage")}
      </h2>
      <p className="mt-1 font-sans text-sm font-normal text-gray-600">
        닉네임, 아이디, 이메일과 비밀번호를 관리해요.
      </p>
      {hint ? (
        <p className="mt-3 font-sans text-xs font-medium text-coral">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-3 font-sans text-xs font-medium text-coral">{error}</p>
      ) : null}

      <div className={`mt-8 space-y-4 rounded-2xl bg-white p-6 ${softShadow}`}>
        <SmoothInput
          label={t("mypage.profile.nickname")}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className="border-stone-200"
        />
        <div>
          <SmoothInput
            label={t("mypage.account.handle")}
            value={handle.replace(/^@/, "")}
            onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
            className="border-stone-200"
          />
          <p className="mt-1.5 font-sans text-[11px] text-stone-400">
            커뮤니티에 @{handle.replace(/^@/, "") || DEFAULT_HANDLE} 로 표시돼요.
          </p>
        </div>
        <SmoothInput
          label={t("mypage.profile.email")}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border-stone-200"
        />
        <SmoothInput
          label={t("mypage.profile.newPassword")}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("mypage.profile.passwordPlaceholder")}
          className="border-stone-200"
        />
        <SmoothInput
          label={t("mypage.profile.confirmPassword")}
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t("mypage.profile.confirmPlaceholder")}
          className="border-stone-200"
        />
        <Button type="button" onClick={handleSave} className="mt-2 px-5 py-2.5 text-sm">
          {t("mypage.profile.save")}
        </Button>
      </div>

      <div className={`mt-6 rounded-2xl bg-white p-6 ${softShadow}`}>
        <h3 className="font-sans text-sm font-bold text-gray-900">
          {t("mypage.account.withdraw")}
        </h3>
        <p className="mt-1 font-rounded text-xs font-normal text-gray-500">
          탈퇴 후에는 현재 기기에서 로그인 상태가 해제됩니다.
        </p>
        <button
          type="button"
          onClick={onWithdraw}
          className="mt-4 rounded-full bg-stone-900 px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-coral"
        >
          {t("mypage.account.withdraw")}
        </button>
      </div>
    </div>
  );
}
