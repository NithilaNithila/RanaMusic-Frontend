import { useState } from "react";
import { motion } from "framer-motion";

const SearchIcon = (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const CloseIcon = (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default function LibrarySearch({ value, onChange, loading, onClear }) {
  const [focused, setFocused] = useState(false);

  return (
    <motion.div
      animate={{
        scale: focused ? 1.015 : 1,
        boxShadow: focused
          ? "0 8px 30px -8px rgba(79,156,249,0.45)"
          : "0 8px 24px -14px rgba(0,0,0,0.25)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`relative flex w-full items-center gap-2.5 rounded-full border bg-white/70 px-5 py-2.5 backdrop-blur-xl transition-colors duration-300 sm:w-[800px] dark:bg-white/[0.06] ${
        focused
          ? "border-premium-primary/70 ring-4 ring-premium-primary/15 dark:border-premium-primary/60"
          : "border-black/10 hover:border-black/25 dark:border-white/10 dark:hover:border-white/20"
      }`}
    >
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-premium-primary/25 to-premium-secondary/20 shadow-[0_0_10px_rgba(79,156,249,0.4)] ring-1 ring-premium-primary/30 dark:shadow-[0_0_12px_rgba(79,156,249,0.5)]">
        <motion.span
          animate={{ color: focused ? "#7EB8FF" : "rgba(255,255,255,0.9)" }}
          className="shrink-0"
        >
          {SearchIcon}
        </motion.span>
      </span>

      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search songs, albums, artists..."
        aria-label="Search songs, albums, artists and playlists"
        className="peer w-full bg-transparent text-sm font-normal text-black outline-none placeholder:text-black/40 [&::-webkit-search-cancel-button]:hidden dark:text-white dark:placeholder:text-white/40"
      />

      {loading && value && (
        <span className="grid h-5 w-5 shrink-0 place-items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-premium-primary dark:border-white/20" />
        </span>
      )}

      {value && !loading && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          title="Clear"
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-white transition-colors hover:bg-white/20 active:scale-90"
          style={{ backgroundColor: focused ? "#4F9CF9" : "rgba(120,120,120,0.5)" }}
        >
          {CloseIcon}
        </button>
      )}
    </motion.div>
  );
}
