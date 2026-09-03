import TrackRow from "./TrackRow.jsx";

export default function TrackList({ tracks = [] }) {
  if (!tracks.length)
    return (
      <p className="rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-6 text-center text-sm text-black/40 dark:text-white/40">
        No tracks found.
      </p>
    );

  return (
    <div className="flex flex-col">
      <div className="mb-1 grid grid-cols-[2rem_1fr_auto] items-center gap-3 border-b border-black/5 dark:border-white/5 px-2 pb-2 text-[11px] font-semibold uppercase tracking-widest text-black/30 dark:text-white/30">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="pr-[68px] text-right sm:pr-[76px]">Time</span>
      </div>
      {tracks.map((t, i) => (
        <TrackRow key={`${t.id}-${i}`} track={t} index={i} queue={tracks} />
      ))}
    </div>
  );
}
