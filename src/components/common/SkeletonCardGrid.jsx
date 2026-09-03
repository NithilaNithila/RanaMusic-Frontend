// Pulsing placeholder grid that mirrors the glassy track/album/artist/
// playlist cards while content loads.
export default function SkeletonCardGrid({ count = 12 }) {
  const shade = "bg-black/[0.07] dark:bg-white/[0.08]";
  return (
    <div
      className="card-grid"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-white/40 bg-white/60 p-2.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.06]"
          style={{ animationDelay: `${(i % 6) * 60}ms` }}
        >
          <div
            className={`aspect-[3/4] w-full rounded-2xl ${shade} animate-pulse`}
          />
          <div className="space-y-2 px-1 pb-1 pt-2.5">
            <div
              className={`h-3 rounded-full ${shade} animate-pulse`}
              style={{ width: `${70 - ((i * 11) % 25)}%` }}
            />
            <div
              className={`h-2.5 rounded-full ${shade} animate-pulse`}
              style={{ width: `${35 - ((i * 7) % 15)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
