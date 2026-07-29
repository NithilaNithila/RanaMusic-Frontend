import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { formatDuration } from "../../utils/formatDuration";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function TrackRow({ track, index, queue = [] }) {
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue.length ? queue : [track]);
  };

  return (
    <div
      onClick={handleClick}
      className={`grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-2 py-2 rounded-md cursor-pointer ${
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
      <span className="text-xs text-white/40">{formatDuration(track.duration)}</span>
    </div>
  );
}
