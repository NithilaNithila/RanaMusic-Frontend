export default function SongInformation({ track, quality }) {
  return (
    <div
      key={track?.id || track?.name}
      className="w-full max-w-[640px] text-center track-change-enter"
    >
      <h1 className="font-display text-balance break-words text-[clamp(26px,3.2vw,42px)] font-semibold leading-tight tracking-tight text-white">
        {track?.name}
      </h1>
      <p className="mt-1.5 text-[clamp(14px,1.4vw,18px)] font-medium text-white/50">
        {track?.artist_name}
      </p>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
        {track?.album_name || "Single"}
        <span className="mx-2 text-white/20" aria-hidden="true">
          •
        </span>
        {quality}
      </p>
    </div>
  );
}