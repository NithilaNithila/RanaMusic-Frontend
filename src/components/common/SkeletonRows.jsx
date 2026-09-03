// Pulsing placeholder rows shown while a search/recommendation page loads.
export default function SkeletonRows({ count = 8 }) {
  const shade = "bg-black/[0.06] dark:bg-white/[0.07]";
  return (
    <div className="space-y-1" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl px-2 py-2">
          <div
            className={`h-10 w-10 shrink-0 rounded-lg ${shade} animate-pulse`}
            style={{ animationDelay: `${i * 80}ms` }}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div
              className={`h-3 rounded-full ${shade} animate-pulse`}
              style={{ width: `${55 - ((i * 13) % 25)}%`, animationDelay: `${i * 80 + 40}ms` }}
            />
            <div
              className={`h-2.5 rounded-full ${shade} animate-pulse`}
              style={{ width: `${30 - ((i * 7) % 15)}%`, animationDelay: `${i * 80 + 80}ms` }}
            />
          </div>
          <div
            className={`h-2.5 w-9 shrink-0 rounded-full ${shade} animate-pulse`}
            style={{ animationDelay: `${i * 80 + 120}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
