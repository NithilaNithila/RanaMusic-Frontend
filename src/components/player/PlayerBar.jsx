import { useNavigate } from "react-router-dom";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import ProgressBar from "./ProgressBar.jsx";
import VolumeControl from "./VolumeControl.jsx";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function PlayerBar() {
  const navigate = useNavigate();
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlay,
    playNext,
    playPrev,
    seek,
    changeVolume,
  } = useAudioPlayer();

  if (!currentTrack) return <div className="h-20" />;

  return (
    <div className="h-20 bg-brand-surface border-t border-white/10 px-3 sm:px-6 flex items-center gap-3 sm:gap-4">
      <button
        onClick={() => navigate("/now-playing")}
        className="flex items-center gap-4 rounded-lg text-left transition-opacity hover:opacity-80"
      >
        <img
          src={currentTrack.image || DEFAULT_ARTWORK}
          alt={currentTrack.name}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-md object-cover"
        />
        <div className="max-w-[90px] sm:max-w-none sm:w-44 truncate">
          <p className="text-sm font-medium truncate">{currentTrack.name}</p>
          <p className="text-xs text-white/50 truncate">{currentTrack.artist_name}</p>
        </div>
      </button>

      <div className="flex-1 flex flex-col items-center gap-1">
        <div className="flex items-center gap-4">
          <button onClick={playPrev} className="text-white/70 hover:text-white">
            ⏮
          </button>
          <button
            onClick={togglePlay}
            className="h-8 w-8 rounded-full bg-white text-black flex items-center justify-center"
          >
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button onClick={playNext} className="text-white/70 hover:text-white">
            ⏭
          </button>
        </div>
        <ProgressBar progress={progress} duration={duration} onSeek={seek} />
      </div>

      <VolumeControl volume={volume} onChange={changeVolume} />
    </div>
  );
}
