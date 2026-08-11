import { type FormEvent } from "react";
import { motion } from "framer-motion";
import Button from "./ui/Button.tsx";
import Input from "./ui/Input.tsx";

type LoginModalProps = {
  onClose: () => void;
  onLogin: (e?: FormEvent) => void;
};

const socialBtnBase =
  "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-coral focus-visible:ring-offset-2";

function KakaoIcon() {
  return (
    <span className="font-sans text-sm font-bold text-gray-900" aria-hidden>
      K
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C4.79 15.25 3.8 8.66 7.44 5.5c1.12-1.02 2.45-1.6 3.88-1.5 1.02.08 1.75.5 2.64.5.86 0 1.52-.48 2.65-.42 1.12.05 2.3.6 3.14 1.54-2.76 1.66-2.32 5.98.45 7.16-.57 1.74-1.32 3.46-2.25 4.5zM12.03 5.04c-.17-2.36 1.9-4.4 4.14-4.62.32 2.72-2.48 4.76-4.14 4.62z" />
    </svg>
  );
}

export default function LoginModal({ onClose, onLogin }: LoginModalProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onLogin(e);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-white/80 backdrop-blur-md"
        onClick={onClose}
        aria-label="닫기"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-2xl bg-gray-50 p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 font-sans text-lg text-gray-600 transition-colors hover:bg-coral hover:text-white"
          aria-label="닫기"
        >
          ×
        </button>

        <h2 id="login-title" className="font-sans text-2xl font-bold text-gray-900">
          뜨개러투게더 시작하기
        </h2>
        <p className="mt-2 font-rounded text-sm text-gray-600">
          로그인하고 도안을 저장하고 공유해 보세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Input label="이메일" type="email" placeholder="you@example.com" required />
          <Input label="비밀번호" type="password" placeholder="••••••••" required />
          <Button type="submit" variant="primary" fullWidth className="mt-2 py-3.5">
            로그인
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="h-px w-full bg-gray-200" />
          </div>
          <p className="relative mx-auto w-fit bg-gray-50 px-4 font-rounded text-sm text-gray-500">
            또는 간편 로그인
          </p>
        </div>

        <div className="flex flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onLogin()}
            className={`${socialBtnBase} bg-[#FEE500] hover:bg-[#f5dc00]`}
            aria-label="카카오로 시작하기"
            title="카카오로 시작하기"
          >
            <KakaoIcon />
          </button>
          <button
            type="button"
            onClick={() => onLogin()}
            className={`${socialBtnBase} border border-gray-300 bg-white hover:bg-gray-50`}
            aria-label="구글로 시작하기"
            title="구글로 시작하기"
          >
            <GoogleIcon />
          </button>
          <button
            type="button"
            onClick={() => onLogin()}
            className={`${socialBtnBase} border border-gray-300 bg-black text-white hover:bg-gray-800`}
            aria-label="애플로 시작하기"
            title="애플로 시작하기"
          >
            <AppleIcon />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
