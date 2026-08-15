import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/formatDuration";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function TrackRow({ track, index, queue = [] }) {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay, addToQueueNext } = useAudioPlayer();
  const [queued, setQueued] = useState(false);
  const isCurrent = currentTrack?.id === track.id;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue.length ? queue : [track]);
    navigate("/now-playing");
  };

  const handlePlayNext = (e) => {
    e.stopPropagation();
    addToQueueNext(track, queue);
    setQueued(true);
    setTimeout(() => setQueued(false), 1400);
  };

  return (
    <div
      onClick={handleClick}
      className={`group grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-2 py-2 rounded-md cursor-pointer ${
        isCurrent ? "text-brand bg-white/5" : "hover:bg-white/5"
      }`}
    >
      <span className="text-white/40 text-sm">
        {isCurrent && isPlaying ? "▶" : index + 1}
      </span>
      <div className="flex items-center gap-3 min-w-0">
        <img
          src={track.image || DEFAULT_ARTWORK}
          alt={track.name}
          className="h-10 w-10 rounded object-cover"
        />
        <div className="min-w-0">
          <p className="text-sm truncate">{track.name}</p>
          <p className="text-xs text-white/50 truncate">{track.artist_name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handlePlayNext}
          title="Play next"
          className={`h-7 w-7 grid place-items-center rounded-full transition-colors ${
            queued
              ? "bg-brand text-black"
              : "text-white/40 opacity-0 group-hover:opacity-100 hover:bg-white/10 hover:text-white"
          }`}
        >
          {queued ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="7 13 12 18 17 13" />
              <polyline points="7 6 12 11 17 6" />
              <line x1="12" y1="3" x2="12" y2="21" />
            </svg>
          )}
        </button>
        <span className="text-xs text-white/40">{formatDuration(track.duration)}</span>
      </div>
    </div>
  );
}
