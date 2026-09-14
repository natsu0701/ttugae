type ToastProps = {
  message: string;
  visible: boolean;
  placement?: "top" | "bottom";
};

export default function Toast({ message, visible, placement = "top" }: ToastProps) {
  if (!visible) return null;

  return (
    <div
      className={`fade-in fixed left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black px-6 py-3 font-sans text-base font-normal text-white ${
        placement === "top" ? "top-6" : "bottom-6"
      }`}
      role="status"
    >
      {message}
    </div>
  );
}
