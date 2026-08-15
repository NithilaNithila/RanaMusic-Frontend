import { motion } from "framer-motion";
import { DEFAULT_ARTWORK } from "../../utils/constants";

const iconProps = { width: 22, height: 22, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" {...iconProps} fill="currentColor" stroke="none">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const EqIcon = () => (
  <span className="flex items-end gap-[2px]">
    {[0.9, 0.5, 1, 0.65].map((h, i) => (
      <span
        key={i}
        className="eq-bar w-[3px] rounded-full bg-[#87CEEB]"
        style={{ height: 12, animationDuration: `${0.6 + i * 0.15}s` }}
      />
    ))}
  </span>
);

export default function QueueSheet({ open, onClose, queue, currentTrack, onPlay }) {
  if (!open) return null;

  const currentIndex = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
  const upNext = queue.filter((t) => t.id !== currentTrack?.id);
  const nowPlaying = currentIndex >= 0 ? queue[currentIndex] : currentTrack;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-[28px] border-t border-white/10 bg-[#141414] px-6 pb-8 pt-4"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 320, damping: 34 }}
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-white/25" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Queue</h2>
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60">
            {upNext.length} up next
          </span>
        </div>

        {nowPlaying && (
          <div className="mb-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#87CEEB]/80">
              Now Playing
            </p>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <img
                src={nowPlaying.image || DEFAULT_ARTWORK}
                alt={nowPlaying.name}
                className="h-12 w-12 shrink-0 rounded-md object-cover ring-2 ring-[#87CEEB]/60"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-[#87CEEB]">{nowPlaying.name}</span>
                <span className="block truncate text-xs text-white/50">{nowPlaying.artist_name}</span>
              </span>
              <EqIcon />
            </div>
          </div>
        )}

        <div className="-mx-6 flex-1 overflow-y-auto px-6 pb-2">
          {upNext.length ? (
            <>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                Up Next
              </p>
              {upNext.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onPlay(t, queue)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/5"
                >
                  <img
                    src={t.image || DEFAULT_ARTWORK}
                    alt={t.name}
                    className="h-11 w-11 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{t.name}</span>
                    <span className="block truncate text-xs text-white/50">{t.artist_name}</span>
                  </span>
                  <PlayIcon />
                </button>
              ))}
            </>
          ) : (
            <p className="py-10 text-center text-sm text-white/40">
              {queue.length ? "No upcoming songs." : "Queue is empty. Play some songs."}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}
