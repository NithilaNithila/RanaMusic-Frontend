import TrackRow from "./TrackRow.jsx";

export default function TrackList({ tracks = [] }) {
  if (!tracks.length) return <p className="text-white/50 text-sm">No tracks found.</p>;

  return (
    <div className="flex flex-col">
      {tracks.map((t, i) => (
        <TrackRow key={t.id} track={t} index={i} queue={tracks} />
      ))}
    </div>
  );
}
