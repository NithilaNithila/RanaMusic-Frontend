import { memo, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/formatDuration";
import { sameTrack } from "../../utils/helpers";
import TrackImage from "../common/TrackImage.jsx";
import Equalizer from "../common/Equalizer.jsx";

const EMPTY_QUEUE = [];

export default memo(function TrackRow({ track, index, queue = EMPTY_QUEUE }) {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay, addToQueueNext } = useAudioPlayer();
  const [queued, setQueued] = useState(false);
  const queuedTimerRef = useRef(null);
  const isCurrent = sameTrack(currentTrack, track);

  useEffect(() => {
    return () => {
      if (queuedTimerRef.current) clearTimeout(queuedTimerRef.current);
    };
  }, []);

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue.length ? queue : [track]);
    navigate("/now-playing");
  };

  const handlePlayNext = (e) => {
    e.stopPropagation();
    addToQueueNext(track);
    setQueued(true);
    if (queuedTimerRef.current) clearTimeout(queuedTimerRef.current);
    queuedTimerRef.current = setTimeout(() => setQueued(false), 1400);
  };

  return (
    <motion.div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") handleClick();
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: Math.min((index % 20) * 0.025, 0.4),
      }}
      className={`group grid cursor-pointer grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl px-2 py-2 transition-all duration-200 ${
        isCurrent
          ? "bg-brand/10 ring-1 ring-brand/30 shadow-sm shadow-brand/10 dark:bg-brand/[0.09] dark:ring-brand/25"
          : "hover:bg-black/5 dark:hover:bg-white/[0.06]"
      }`}
    >
      <span className="grid place-items-center text-sm tabular-nums">
        {isCurrent ? (
          <Equalizer playing={isPlaying} className="text-brand" />
        ) : (
          <>
            <span className="text-black/35 dark:text-white/35 group-hover:hidden">{index + 1}</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="hidden text-black dark:text-white group-hover:block"
            >
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
          </>
        )}
      </span>

      <div className="flex min-w-0 items-center gap-3">
        <TrackImage
          track={track}
          alt=""
          className={`h-10 w-10 rounded-lg object-cover transition-all duration-300 group-hover:scale-[1.07] ${
            isCurrent
              ? "ring-2 ring-brand/60 shadow-md shadow-brand/30 dark:shadow-brand/20"
              : ""
          }`}
        />
        <div className="min-w-0">
          <p className={`truncate text-sm ${isCurrent ? "font-semibold text-brand" : "font-medium"}`}>{track.name}</p>
          <p className={`truncate text-xs ${isCurrent ? "text-black/60 dark:text-white/60" : "text-black/50 dark:text-white/50"}`}>{track.artist_name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handlePlayNext}
          title={queued ? "Added to play next" : "Add to play next"}
          aria-label="Add to play next"
          className={`grid h-7 w-7 place-items-center rounded-full transition-all duration-200 ${
            queued
              ? "scale-110 bg-brand text-black"
              : "text-black/40 opacity-0 hover:bg-black/5 hover:text-brand dark:text-white/40 dark:hover:bg-white/10 focus-visible:opacity-100 group-hover:opacity-100"
          }`}
        >
          {queued ? (
            <motion.svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ scale: 0.4, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </motion.svg>
          ) : (
            /* list-plus: add to queue */
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="4" y1="6" x2="13" y2="6" />
              <line x1="4" y1="12" x2="13" y2="12" />
              <line x1="4" y1="18" x2="9" y2="18" />
              <line x1="17" y1="13" x2="17" y2="21" />
              <line x1="13" y1="17" x2="21" y2="17" />
            </svg>
          )}
        </button>
        <span className="w-9 text-right text-xs tabular-nums text-black/40 dark:text-white/40">
          {formatDuration(track.duration)}
        </span>
      </div>
    </motion.div>
  );
})
