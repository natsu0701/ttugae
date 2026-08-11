import { motion, AnimatePresence } from "framer-motion";

type ToastProps = {
  message: string;
  visible: boolean;
};

export default function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-black px-6 py-3 font-sans text-sm font-normal text-white"
          role="status"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
