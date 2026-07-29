import { formatDuration } from "../../utils/formatDuration";

export default function ProgressBar({ progress, duration, onSeek }) {
  const pct = duration ? (progress / duration) * 100 : 0;

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    onSeek(ratio * duration);
  };

  return (
    <div className="flex items-center gap-2 text-xs text-white/60 w-full">
      <span>{formatDuration(progress)}</span>
      <div
        className="flex-1 h-1 bg-white/20 rounded-full cursor-pointer"
        onClick={handleClick}
      >
        <div className="h-1 bg-brand rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span>{formatDuration(duration)}</span>
    </div>
  );
}
