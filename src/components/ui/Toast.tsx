type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: ToastProps) {
  if (!visible) return null;

  return (
    <div
      className="fade-in fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black px-6 py-3 font-sans text-sm font-normal text-white"
      role="status"
    >
      {message}
    </div>
  );
}
