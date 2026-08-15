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
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} {...props}>
      <polyline points="16 3 21 3 21 8" />
      <line x1="4" y1="20" x2="21" y2="3" />
      <polyline points="21 16 21 21 16 21" />
      <line x1="15" y1="15" x2="21" y2="21" />
      <line x1="4" y1="4" x2="9" y2="9" />
    </svg>
  ),
  SkipBack: (props) => (
    <svg viewBox="0 0 24 24" width="30" height="30" {...stroke} {...props}>
      <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" />
      <line x1="5" y1="19" x2="5" y2="5" />
    </svg>
  ),
  Play: (props) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
      <polygon points="8 5 19 12 8 19 8 5" />
    </svg>
  ),
  Pause: (props) => (
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" {...props}>
      <rect x="6" y="5" width="4" height="14" rx="1" />
      <rect x="14" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  SkipForward: (props) => (
    <svg viewBox="0 0 24 24" width="30" height="30" {...stroke} {...props}>
      <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  ),
  Repeat: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
  RepeatOne: (props) => (
    <svg viewBox="0 0 24 24" width="22" height="22" {...stroke} {...props}>
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
      <text x="12" y="15.5" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text>
    </svg>
  ),
};

function ShuffleButton({ active, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className={`transition-colors ${active ? "text-[#87CEEB]" : "text-white/60 hover:text-white"}`}
      title="Shuffle"
    >
      <Icon.Shuffle />
    </motion.button>
  );
}

function RepeatButton({ mode, onClick }) {
  const active = mode !== "off";
  const icon = mode === "one" ? <Icon.RepeatOne /> : <Icon.Repeat />;
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.85 }}
      className={`relative transition-colors ${active ? "text-[#87CEEB]" : "text-white/60 hover:text-white"}`}
      title="Repeat"
    >
      {icon}
      {active && <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[#87CEEB]" />}
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
    <div className="flex items-center justify-center gap-5 sm:gap-10">
      <ShuffleButton active={isShuffled} onClick={onShuffle} />
      <motion.button
        onClick={onPrev}
        whileTap={{ scale: 0.85 }}
        className="text-white/70 transition-colors hover:text-white"
        title="Previous"
      >
        <Icon.SkipBack />
      </motion.button>

      <motion.button
        onClick={onTogglePlay}
        whileTap={{ scale: 0.92 }}
        className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-white text-black shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition-transform hover:scale-[1.04]"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Icon.Pause /> : <Icon.Play style={{ marginLeft: 3 }} />}
      </motion.button>

      <motion.button
        onClick={onNext}
        whileTap={{ scale: 0.85 }}
        className="text-white/70 transition-colors hover:text-white"
        title="Next"
      >
        <Icon.SkipForward />
      </motion.button>

      <RepeatButton mode={repeatMode} onClick={onRepeat} />
    </div>
  );
}
