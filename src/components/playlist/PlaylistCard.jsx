import { useState } from "react";
import { Link } from "react-router-dom";

function SafeImage({ src, alt = "", className }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} />;
}

function FallbackCover({ icon = true }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#2a3a4d] to-[#141a22]">
      {icon && (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )}
    </div>
  );
}

function PlaylistCover({ playlist }) {
  const covers = (playlist.tracks || []).slice(0, 4).map((t) => t.albumImage || t.image).filter(Boolean);

  const grid =
    covers.length === 1 ? "grid-cols-1" : "grid-cols-2";

  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-[#141a22] shadow-lg">
      {/* Book spine */}
      <div
        className="absolute inset-y-0 left-0 z-10 w-[7px]"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.10) 55%, rgba(0,0,0,0.5))" }}
      />

      <div className={`absolute inset-0 grid ${grid}`}>
        {covers.map((src, i) => (
          <SafeImage
            key={i}
            src={src}
            className={`h-full w-full object-cover ${i > 0 ? "border-l border-black/30" : ""}`}
          />
        ))}
        {!covers.length && <FallbackCover />}
      </div>

      {covers.length > 0 && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      )}

      {/* Spine label */}
      <div
        className="absolute inset-y-0 left-[7px] z-20 hidden w-[26px] flex-col items-center justify-center sm:flex"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.25))" }}
      >
        <p className="text-[7px] font-bold uppercase tracking-widest text-white/60 [writing-mode:vertical-rl]">
          {playlist.name}
        </p>
      </div>
    </div>
  );
}

export default function PlaylistCard({ playlist }) {
  return (
    <Link
      to={`/playlists/${playlist._id}`}
      className="group bg-brand-surface hover:bg-white/10 rounded-xl p-3 transition-colors block"
    >
      <div className="mb-3 transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[-1.5deg]">
        <PlaylistCover playlist={playlist} />
      </div>
      <p className="text-sm font-medium truncate">{playlist.name}</p>
      <p className="text-xs text-white/50 truncate">
        {playlist.tracks?.length || 0} tracks
      </p>
    </Link>
  );
}
