import { motion } from "framer-motion";
import TrackImage from "../common/TrackImage.jsx";
import { sameTrack } from "../../utils/helpers";

const EqIcon = () => (
  <span className="flex items-end gap-[2px]">
    {[0.9, 0.5, 1, 0.65].map((h, i) => (
      <span
        key={i}
        className="premium-wave w-[3px] rounded-full bg-gradient-to-t from-premium-primary to-brand"
        style={{ height: 12, animationDuration: `${0.6 + i * 0.15}s` }}
      />
    ))}
  </span>
);

export default function QueueSheet({ open, onClose, queue, currentTrack, onPlay }) {
  if (!open) return null;

  const list = Array.isArray(queue) ? queue : [];
  const currentIndex = currentTrack ? list.findIndex((t) => sameTrack(t, currentTrack)) : -1;
  const upNext = list.filter((t) => !sameTrack(t, currentTrack));
  const nowPlaying = currentIndex >= 0 ? list[currentIndex] : currentTrack;

  return (
    <>
      <motion.div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-[32px] border-t border-white/10 bg-ink-900/92 px-6 pb-8 pt-4 backdrop-blur-2xl"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 34 }}
        role="dialog"
        aria-modal="true"
        aria-label="Queue"
      >
        <div className="mb-4 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white">Queue</h2>
          <span className="glass-chip rounded-full px-3 py-1.5 text-xs font-medium text-white/70">
            {upNext.length} up next
          </span>
        </div>

        {nowPlaying && (
          <div className="mb-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-brand/80">
              Now Playing
            </p>
            <div className="glass-panel flex items-center gap-3 rounded-2xl p-3">
              <TrackImage
                track={nowPlaying}
                alt={nowPlaying.name}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-2 ring-brand/60"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{nowPlaying.name}</span>
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
                  onClick={() => onPlay(t, list)}
                  className="group flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <TrackImage
                    track={t}
                    alt={t.name}
                    className="h-11 w-11 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white transition-colors group-hover:text-brand">{t.name}</span>
                    <span className="block truncate text-xs text-white/50">{t.artist_name}</span>
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent-200 to-accent-600 text-black opacity-0 shadow-lg shadow-premium-primary/40 transition-all duration-200 group-hover:opacity-100">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="7 4 21 12 7 20 7 4" />
                    </svg>
                  </span>
                </button>
              ))}
            </>
          ) : (
            <p className="py-10 text-center text-sm text-white/40">
              {list.length ? "No upcoming songs." : "Queue is empty. Play some songs."}
            </p>
          )}
        </div>
      </motion.div>
    </>
  );
}