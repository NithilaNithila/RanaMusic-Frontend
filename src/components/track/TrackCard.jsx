import { memo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/formatDuration";
import TrackImage from "../common/TrackImage.jsx";
import Equalizer from "../common/Equalizer.jsx";

export default memo(function TrackCard({ track, queue = [], index = 0 }) {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;
  const isPlayingHere = isCurrent && isPlaying;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue.length ? queue : [track]);
    navigate("/now-playing");
  };

  return (
    <motion.div
      onClick={handleClick}
      whileTap={{ scale: 0.97 }}
      className={`group relative h-full cursor-pointer overflow-hidden rounded-3xl border p-2.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl transition-all duration-300 ${
        isCurrent
          ? "border-brand/50 bg-gradient-to-b from-brand/[0.12] to-white/60 shadow-lg shadow-brand/15 ring-1 ring-brand/30 dark:border-brand/35 dark:from-brand/[0.15] dark:to-white/[0.06] dark:ring-brand/25 dark:shadow-brand/[0.07]"
          : "border-white/40 bg-white/60 hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/80 hover:shadow-xl hover:shadow-brand/[0.12] dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-brand/30 dark:hover:bg-white/[0.09] dark:hover:shadow-black/40"
      }`}
    >
      {/* Soft brand glow behind artwork on hover */}
      <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-brand/20" />

      {/* Artwork */}
      <div
        className={`relative mb-2.5 overflow-hidden rounded-2xl shadow-md shadow-black/15 ring-1 ring-white/20 dark:ring-white/10 ${
          isPlayingHere ? "animate-playingPulse" : ""
        }`}
      >
        <TrackImage
          track={track}
          alt={track.name}
          className={`aspect-[3/4] w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:rotate-[0.5deg] ${
            isCurrent ? "ring-2 ring-brand/60" : ""
          }`}
        />

        {/* Base scrim — always slightly present, deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Sheen sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

        {/* Duration chip on hover */}
        {track.duration > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            {formatDuration(track.duration)}
          </span>
        )}

        {/* Animated now-playing badge */}
        {isCurrent && (
          <div
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/55 px-2 py-1 backdrop-blur-sm"
            title={isPlayingHere ? "Playing" : "Paused"}
          >
            <Equalizer playing={isPlayingHere} className="!h-3" />
          </div>
        )}

        {/* Play / pause button — springs up on hover */}
        <button
          aria-label={isPlayingHere ? "Pause" : "Play"}
          className={`absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-full bg-brand text-black shadow-lg shadow-brand/40 transition-all duration-300 ease-out ${
            isCurrent
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-2 scale-90 opacity-100 sm:translate-y-3 sm:scale-75 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:scale-100 sm:group-hover:opacity-100"
          }`}
        >
          {isPlayingHere ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="7 4 21 12 7 20 7 4" />
            </svg>
          )}
        </button>
      </div>

      {/* Meta */}
      <div className="px-1 pb-1">
        <p
          className={`truncate text-[13px] font-semibold leading-tight transition-colors ${
            isCurrent ? "text-brand" : ""
          }`}
        >
          {track.name}
        </p>
        <p className="mt-0.5 truncate text-xs text-black/50 transition-colors dark:text-white/50">
          {track.artist_name}
        </p>
      </div>
    </motion.div>
  );
})
