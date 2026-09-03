import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/40 bg-white/85 p-6 shadow-2xl shadow-black/20 backdrop-blur-2xl dark:border-white/10 dark:bg-ink-900/90 dark:shadow-black/70"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            {/* Top brand hairline */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/60 to-transparent" />
            {/* Ambient brand glow */}
            <div className="pointer-events-none absolute -top-16 right-0 h-40 w-40 rounded-full bg-brand/20 blur-3xl dark:bg-brand/15" />

            <div className="relative mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/5 text-black/50 ring-1 ring-black/10 backdrop-blur-md transition-colors hover:bg-black/10 hover:text-black dark:bg-white/[0.08] dark:text-white/50 dark:ring-white/10 dark:hover:bg-white/[0.15] dark:hover:text-white"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="relative">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
