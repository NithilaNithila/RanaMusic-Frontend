import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function TrackCard({ track, queue = [] }) {
  const navigate = useNavigate();
  const { playTrack, currentTrack, isPlaying, togglePlay } = useAudioPlayer();
  const isCurrent = currentTrack?.id === track.id;

  const handleClick = () => {
    if (isCurrent) togglePlay();
    else playTrack(track, queue.length ? queue : [track]);
    navigate("/now-playing");
  };

  return (
    <div
      onClick={handleClick}
      className="group bg-brand-surface hover:bg-white/10 rounded-lg p-3 cursor-pointer transition-colors"
    >
      <div className="relative">
        <img
          src={track.image || DEFAULT_ARTWORK}
          alt={track.name}
          className="w-full aspect-square object-cover rounded-md mb-3"
        />
        <div className="absolute bottom-1 right-1 h-9 w-9 rounded-full bg-brand text-black flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          {isCurrent && isPlaying ? "⏸" : "▶"}
        </div>
      </div>
      <p className="text-sm font-medium truncate">{track.name}</p>
      <p className="text-xs text-white/50 truncate">{track.artist_name}</p>
    </div>
  );
}
