import { useEffect, useMemo, useState } from "react";
import { getLyrics, getLyricsByTitle } from "../../api/lyricsApi";

const SOURCE_LABEL = { saavn: "JioSaavn", lrclib: "LRCLIB", lyricsovh: "Lyrics.ovh", ytmusic: "YouTube Music" };

// Attempts in order. Free metadata sources (fast, reliable) come first;
// saavn matches by id, then falls back to finding the song by title/artist
// (tracks here are Jamendo-sourced, so the id-based lookup usually misses).
const attempts = [
  {
    source: "lrclib",
    run: async (id, artist, title) => {
      try {
        const { data } = await getLyricsByTitle(artist, title, "lrclib");
        return data?.lyrics || null;
      } catch {
        return null;
      }
    },
  },
  {
    source: "lyricsovh",
    run: async (id, artist, title) => {
      try {
        const { data } = await getLyricsByTitle(artist, title, "lyricsovh");
        return data?.lyrics || null;
      } catch {
        return null;
      }
    },
  },
  {
    source: "saavn",
    run: async (id, artist, title) => {
      try {
        const { data } = await getLyrics(id, "saavn");
        if (data?.lyrics) return data.lyrics;
      } catch {}
      try {
        const { data } = await getLyricsByTitle(artist, title, "saavn");
        return data?.lyrics || null;
      } catch {
        return null;
      }
    },
  },
  {
    source: "ytmusic",
    run: async (id) => {
      try {
        const { data } = await getLyrics(id, "ytmusic");
        return data?.lyrics || null;
      } catch {
        return null;
      }
    },
  },
];

function ShimmerLine({ i, active }) {
  const widths = [92, 100, 88, 96, 90, 84, 98, 72, 100];
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2 shimmer-line ${active ? "bg-white/10" : ""}`}>
      <span
        className={`h-[10px] rounded-full ${
          active ? "bg-gradient-to-r from-premium-primary to-brand shadow-[0_0_12px_rgba(79,156,249,0.6)]" : "bg-white/25"
        }`}
        style={{ width: `${widths[i % widths.length]}%` }}
      />
    </div>
  );
}

function SourceSwitcher({ active, onPick }) {
  return (
    <div className="glass-chip flex items-center gap-1 rounded-full p-1">
      {attempts.map(({ source }) => (
        <button
          key={source}
          onClick={() => onPick(source)}
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-colors ${
            active === source ? "bg-white/12 text-white" : "text-white/55 hover:text-white/85"
          }`}
        >
          {SOURCE_LABEL[source].replace(" Music", "")}
        </button>
      ))}
    </div>
  );
}

export default function LyricsSheet({ open, onClose, track, progress, duration }) {
  const [lyrics, setLyrics] = useState(null);
  const [source, setSource] = useState("saavn");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Single-provider fetch (manual source pick / retry).
  const load = async (src) => {
    if (!track) return;
    setLoading(true);
    setError(null);
    const entry = attempts.find((a) => a.source === src);
    const text = entry ? await entry.run(track.id, track.artist_name, track.name) : null;
    setLoading(false);
    if (text) {
      setLyrics(text);
      setSource(src);
    } else {
      setLyrics(null);
      setError(true);
    }
  };

  // Fetch on open and whenever the track changes: walk the provider chain.
  useEffect(() => {
    if (!open || !track?.id) return;
    let alive = true;
    setLyrics(null);
    setError(null);
    setLoading(true);

    (async () => {
      for (const attempt of attempts) {
        const text = await attempt.run(track.id, track.artist_name, track.name);
        if (!alive) return;
        if (text) {
          setLyrics(text);
          setSource(attempt.source);
          return;
        }
      }
      if (alive) setError(true);
    })().finally(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [open, track?.id]);

  const lines = useMemo(() => {
    if (!lyrics) return [];
    if (Array.isArray(lyrics)) {
      return lyrics
        .map((l) => (typeof l === "string" ? l : l?.text || l?.line || l?.value || ""))
        .filter(Boolean);
    }
    return String(lyrics).split(/\r?\n/);
  }, [lyrics]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm backdrop-enter" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col rounded-t-[32px] border-t border-white/10 bg-ink-900/92 px-6 pb-8 pt-4 backdrop-blur-2xl sheet-enter"
        role="dialog"
        aria-modal="true"
        aria-label="Lyrics"
      >
        <div className="mb-5 flex justify-center">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-white">Lyrics</h2>
            <p className="mt-0.5 truncate text-sm text-white/50">
              {track?.name} — {track?.artist_name}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SourceSwitcher
              active={source}
              onPick={(s) => {
                setSource(s);
                setLyrics(null);
                load(s).catch(() => {});
              }}
            />
            <button
              onClick={onClose}
              className="glass-chip grid h-10 w-10 place-items-center rounded-full text-white/70 hover:text-white tap-scale"
              aria-label="Close lyrics"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className="-mx-2 flex-1 overflow-y-auto px-2 pb-2" style={{ minHeight: 240 }}>
          {loading ? (
            <>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                <span className="inline-block h-px flex-1 bg-white/10" />
                Loading lyrics
                <span className="inline-block h-px flex-1 bg-white/10" />
              </p>
              {Array.from({ length: 11 }, (_, i) => (
                <ShimmerLine key={i} i={i} active={i === 2} />
              ))}
            </>
          ) : error ? (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-4 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-white/[0.06] text-white/40 pulse-ring">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3c-4.5 0-8 2.8-8 6.3 0 1.9 1 3.6 2.7 4.7-.2 1.5-1 2.9-2.2 4 0 0 2.9-.2 4.6-1.6 1 .3 2 .4 3 .4 4.5 0 8-2.8 8-6.3S16.5 3 12 3z" />
                  <path d="M9 13c1 1 1 1 1.5 1h3M9 17h6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">No lyrics found for this track</p>
                <p className="mt-1 text-xs text-white/40">Try the other source, or check back later.</p>
              </div>
              <button
                onClick={() => load(source).catch(() => {})}
                className="rounded-full bg-gradient-to-r from-accent-200 to-accent-600 px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                Retry
              </button>
            </div>
          ) : lines.length ? (
            <>
              <p className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/35">
                <span className="inline-block h-px flex-1 bg-white/10" />
                {SOURCE_LABEL[source] || source}
                <span className="inline-block h-px flex-1 bg-white/10" />
              </p>
              <div className="font-premium text-[15px] leading-relaxed text-white/85">
                {lines.map((line, i) =>
                  line.trim() === "" ? (
                    <p key={i} className="h-4" aria-hidden="true" />
                  ) : (
                    <p key={i} className="py-1 lyric-line-enter" style={{ animationDelay: `${Math.min(i * 10, 400)}ms` }}>
                      {line}
                    </p>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[240px] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm font-semibold text-white/80">No lyrics to show</p>
              <p className="text-xs text-white/40">Lyrics may not be available for this track.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}