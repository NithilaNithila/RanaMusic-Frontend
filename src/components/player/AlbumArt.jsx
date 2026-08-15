import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { DEFAULT_ARTWORK } from "../../utils/constants";

const PARTICLES = [
  { left: "8%", size: 5, delay: 0, duration: 5 },
  { left: "22%", size: 3, delay: 1.4, duration: 6 },
  { left: "38%", size: 4, delay: 0.6, duration: 4.5 },
  { left: "55%", size: 3, delay: 2.2, duration: 5.5 },
  { left: "68%", size: 5, delay: 0.9, duration: 6.5 },
  { left: "82%", size: 4, delay: 1.8, duration: 5 },
  { left: "93%", size: 3, delay: 0.3, duration: 4.8 },
];

export default function AlbumArt({ track, isPlaying, onLike }) {
  const src = track?.image || DEFAULT_ARTWORK;
  const [liked, setLiked] = useState(false);

  const bars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        height: 8 + ((i * 37) % 24),
        delay: (i % 7) * 0.11,
        duration: 0.7 + ((i * 13) % 50) / 100,
      })),
    []
  );

  const handleDoubleTap = () => {
    onLike?.();
    setLiked(true);
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative select-none"
        onDoubleClick={handleDoubleTap}
        initial={{ scale: 0.7, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.15 }}
      >
        <div className="relative aspect-square w-[min(76vw,36vh)]">
          <div
            className={`absolute inset-0 rounded-[30px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.75)] ${
              isPlaying ? "album-spin" : ""
            }`}
          >
            <img
              src={src}
              alt={track?.name}
              draggable={false}
              className="h-full w-full rounded-[30px] object-cover ring-1 ring-white/10"
            />
          </div>

          <div className="absolute inset-0 rounded-[30px] ring-1 ring-white/20 pointer-events-none" style={{ boxShadow: "inset 0 0 40px rgba(0,0,0,0.35)" }} />

          {liked && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-[30px] bg-black/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              onAnimationComplete={() => setTimeout(() => setLiked(false), 600)}
            >
              <span className="text-6xl text-[#ff5a7a]">♥</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute pointer-events-none rounded-full bg-white/30"
          style={{ left: p.left, width: p.size, height: p.size, filter: "blur(1px)" }}
          animate={{ y: [60, -320, 60], opacity: [0, 0.7, 0], x: [0, p.size * 3, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className={`mt-4 flex h-6 items-end gap-[3px] ${isPlaying ? "" : "opacity-30"}`}>
        {bars.map((b, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full bg-gradient-to-t from-[#87CEEB]/60 to-white ${
              isPlaying ? "eq-bar" : ""
            }`}
            style={{ height: b.height, animationDelay: `${b.delay}s`, animationDuration: `${b.duration}s` }}
          />
        ))}
      </div>
    </div>
  );
}
