import { motion } from "framer-motion";

const stroke = {
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

const Icon = {
  Shuffle: (props) => (
    <svg viewBox="0 0 24 24" width="19" height="19" {...stroke} {...props}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  SkipBack: (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke} {...props}>
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  ),
  Play: (props) => (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" {...props}>
      <polygon points="8 5 19 12 8 19 8 5" />
    </svg>
  ),
  Pause: (props) => (
    <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor" {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1.5" />
      <rect x="14" y="5" width="4" height="14" rx="1.5" />
    </svg>
  ),
  SkipForward: (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" {...stroke} {...props}>
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  ),
  Repeat: (props) => (
    <svg viewBox="0 0 24 24" width="19" height="19" {...stroke} {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  RepeatOne: (props) => (
    <svg viewBox="0 0 24 24" width="19" height="19" {...stroke} {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8.5" fill="currentColor" stroke="none" fontWeight="bold">1</text>
    </svg>
  ),
};

function GhostRound({ onClick, title, children, size = "h-12 w-12" }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      title={title}
      aria-label={title}
      className={`grid place-items-center rounded-full text-white/70 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white/40 ${size}`}
    >
      {children}
    </motion.button>
  );
}

function Toggle({ active, onClick, title, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.88 }}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={`relative grid h-10 w-10 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-white/40 ${
        active ? "text-accent-300" : "text-white/50 hover:text-white/90"
      }`}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute -bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full transition-colors"
        style={active ? { background: "#8B6BFF" } : { background: "rgba(255,255,255,0.15)" }}
      />
    </motion.button>
  );
}

export default function PlayerControls({
  isPlaying,
  isShuffled,
  repeatMode,
  onShuffle,
  onPrev,
  onTogglePlay,
  onNext,
  onRepeat,
}) {
  return (
    <div className="flex items-center justify-center gap-4 sm:gap-5">
      <Toggle active={isShuffled} onClick={onShuffle} title="Shuffle">
        <Icon.Shuffle />
      </Toggle>

      <GhostRound onClick={onPrev} title="Previous track" size="h-11 w-11 sm:h-12 sm:w-12">
        <Icon.SkipBack />
      </GhostRound>

      {/* Play / Pause — solid, minimal centerpiece */}
      <motion.button
        onClick={onTogglePlay}
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        title={isPlaying ? "Pause" : "Play"}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="grid place-items-center rounded-full bg-white text-black shadow-[0_16px_36px_-12px_rgba(0,0,0,0.7)] transition-colors"
        style={{
          width: "clamp(66px,7vw,84px)",
          height: "clamp(66px,7vw,84px)",
        }}
      >
        <span className="drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
          {isPlaying ? <Icon.Pause /> : <Icon.Play style={{ marginLeft: 4 }} />}
        </span>
      </motion.button>

      <GhostRound onClick={onNext} title="Next track" size="h-11 w-11 sm:h-12 sm:w-12">
        <Icon.SkipForward />
      </GhostRound>

      <Toggle active={repeatMode !== "off"} onClick={onRepeat} title={repeatMode === "one" ? "Repeat one" : "Repeat"}>
        {repeatMode === "one" ? <Icon.RepeatOne /> : <Icon.Repeat />}
      </Toggle>
    </div>
  );
}