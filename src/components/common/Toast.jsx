import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const icons = {
  info: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <circle cx="12" cy="8" r="0.5" fill="currentColor" />
    </svg>
  ),
  success: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

const styles = {
  info: "border-black/15 dark:border-white/15 bg-white/95 dark:bg-ink-800/95 text-black dark:text-white",
  success: "border-brand/40 bg-brand/15 text-brand",
  error: "border-red-500/40 bg-red-500/15 text-red-300",
};

export default function Toast({ message, type = "info", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className={`fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-medium shadow-2xl shadow-black/10 dark:shadow-black/50 backdrop-blur-md ${styles[type] || styles.info}`}
          role="status"
        >
          {icons[type] || icons.info}
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
