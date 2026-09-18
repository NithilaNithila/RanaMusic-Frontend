import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import VolumeControl from "./VolumeControl.jsx";
import TrackImage from "../common/TrackImage.jsx";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const PrevIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
    <polygon points="19 20 9 12 19 4 19 20" fill="currentColor" stroke="none" />
    <line x1="5" y1="19" x2="5" y2="5" />
  </svg>
);

const NextIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
    <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" stroke="none" />
    <line x1="19" y1="5" x2="19" y2="19" />
  </svg>
);

const PlayIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="8 5 19 12 8 19 8 5" />
  </svg>
);

const PauseIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="7" y="5" width="3.5" height="14" rx="1" />
    <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
  </svg>
);

const ExpandIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" {...stroke}>
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ghostBtn =
  "grid place-items-center rounded-full text-black/45 transition-colors hover:text-black dark:text-white/50 dark:hover:text-white tap-scale";

// Flat, minimal bottom bar: track info on the left, controls centered on
// desktop (right-aligned on mobile), utilities on the right. A thin progress
// hairline runs along the top edge.
export default function PlayerBar() {
  const navigate = useNavigate();
  const {
    currentTrack: track,
    isPlaying,
    playbackError,
    progress,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
  } = useAudioPlayer();

  if (!track) return null;

  const total = duration || 0;
  const pct = total ? Math.max(0, Math.min(1, progress / total)) : 0;

  return (
    <div className="relative z-20 shrink-0 border-t border-black/[0.08] bg-white/95 backdrop-blur-xl dark:border-white/10 dark:bg-brand-surface/95 playerbar-enter">
      {/* Progress hairline */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-black/[0.06] dark:bg-white/[0.06]">
        <div
          className="h-full bg-premium-primary transition-[width] duration-200 dark:bg-brand"
          style={{ width: `${pct * 100}%` }}
        />
      </div>

      <div className="mx-auto grid h-16 w-full max-w-[1720px] grid-cols-3 items-center gap-3 px-4 sm:h-[72px] sm:px-6">
        {/* Track */}
        <button
          onClick={() => navigate("/now-playing")}
          title="Open Now Playing"
          className="group flex min-w-0 items-center gap-3 rounded-lg text-left"
        >
          <TrackImage
            track={track}
            alt={track.name}
            className="h-11 w-11 shrink-0 rounded-md object-cover shadow-sm ring-1 ring-black/5 dark:ring-white/10"
          />
          <span className="min-w-0">
            <span className="block max-w-[calc(100vw-19rem)] truncate text-sm font-semibold text-black transition-colors group-hover:text-brand dark:text-white sm:max-w-[24rem]">
              {track.name}
            </span>
            <span className="block max-w-[calc(100vw-19rem)] truncate text-xs text-black/45 dark:text-white/45 sm:max-w-[24rem]">
              {track.artist_name}
            </span>
            {playbackError && (
              <span className="block max-w-[calc(100vw-19rem)] truncate text-xs text-red-500 dark:text-red-400 sm:max-w-[24rem]">
                {playbackError}
              </span>
            )}
          </span>
        </button>

        {/* Desktop transport */}
        <div className="hidden items-center justify-center gap-1.5 md:flex">
          <button
            onClick={playPrev}
            className={`${ghostBtn} h-9 w-9`}
            title="Previous"
            aria-label="Previous"
          >
            {PrevIcon}
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid h-11 w-11 place-items-center rounded-full bg-black text-white shadow-md shadow-black/20 transition-transform hover:scale-105 active:scale-95 dark:bg-white dark:text-black dark:shadow-black/30"
          >
            {isPlaying ? PauseIcon : PlayIcon}
          </button>

          <button
            onClick={playNext}
            className={`${ghostBtn} h-9 w-9`}
            title="Next"
            aria-label="Next"
          >
            {NextIcon}
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center justify-end gap-1">
          {/* Mobile transport */}
          <div className="flex items-center gap-1 md:hidden">
            <button onClick={playPrev} className={`${ghostBtn} h-8 w-8`} title="Previous" aria-label="Previous">
              {PrevIcon}
            </button>
            <button
              onClick={togglePlay}
              title={isPlaying ? "Pause" : "Play"}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="mx-1 grid h-9 w-9 place-items-center rounded-full bg-black text-white transition-transform active:scale-90 dark:bg-white dark:text-black"
            >
              {isPlaying ? PauseIcon : PlayIcon}
            </button>
            <button onClick={playNext} className={`${ghostBtn} h-8 w-8`} title="Next" aria-label="Next">
              {NextIcon}
            </button>
          </div>

          {/* Desktop utilities */}
          <div className="hidden items-center gap-1 md:flex">
            <VolumeControl volume={volume} onChange={changeVolume} className="hidden w-24 items-center gap-2 lg:flex" />
            <button
              onClick={() => navigate("/now-playing")}
              title="Open Now Playing"
              aria-label="Open Now Playing"
              className={`${ghostBtn} h-8 w-8 hidden sm:grid`}
            >
              {ExpandIcon}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}