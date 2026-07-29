import { formatDuration } from "../../utils/formatDuration";

export default function QueueList({ queue, currentTrack, onSelect }) {
  if (!queue?.length) return <p className="text-white/50 text-sm">Queue is empty.</p>;

  return (
    <ul className="divide-y divide-white/10">
      {queue.map((t) => (
        <li
          key={t.id}
          onClick={() => onSelect(t)}
          className={`flex items-center justify-between px-2 py-2 cursor-pointer rounded-md ${
            currentTrack?.id === t.id ? "bg-white/10 text-brand" : "hover:bg-white/5"
          }`}
        >
          <span className="truncate text-sm">{t.name}</span>
          <span className="text-xs text-white/40">{formatDuration(t.duration)}</span>
        </li>
      ))}
    </ul>
  );
}
