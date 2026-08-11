type ShareToCommunityButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function ShareToCommunityButton({
  onClick,
  disabled = false,
}: ShareToCommunityButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-coral px-4 py-3.5 font-sans text-base font-bold text-white shadow-sm shadow-gray-200/50 transition-colors duration-200 hover:bg-black disabled:opacity-50"
    >
      커뮤니티에 공유하기
    </button>
  );
}
