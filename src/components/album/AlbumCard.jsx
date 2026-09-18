import { memo } from "react";
import { Link } from "react-router-dom";
import { imageSrc, handleImageError } from "../../utils/imageFallback";

function AlbumCard({ album, index = 0 }) {
  const source = album?.source && ["spotify", "amazon", "ytmusic"].includes(album.source) ? album.source : null;
  const id = album?.id;
  const hasId = typeof id === "string" && id.trim() && id !== "null" && id !== "undefined";
  const className =
    "group relative block h-full overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-2.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/80 hover:shadow-xl hover:shadow-brand/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand/30 dark:hover:bg-white/10 dark:hover:shadow-black/40 tap-scale";

  const body = (
    <>
      <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-brand/20" />
      <div className="relative mb-2.5 overflow-hidden rounded-2xl shadow-md shadow-black/15 ring-1 ring-white/20 dark:ring-white/10">
        <img
          src={imageSrc(album.image)}
          onError={handleImageError}
          alt={album.name}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:rotate-[0.5deg]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        {album.song_count > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
            {album.song_count} songs
          </span>
        )}
      </div>
      <div className="px-1 pb-1">
        <p className="truncate text-[13px] font-semibold leading-tight transition-colors group-hover:text-brand">{album.name}</p>
        <p className="mt-0.5 truncate text-xs text-black/50 transition-colors dark:text-white/50">{album.artist_name}</p>
      </div>
    </>
  );

  return (
    <div className="h-full">
      {hasId ? (
        <Link to={source ? `/albums/${album.id}?source=${source}` : `/albums/${album.id}`} className={className}>{body}</Link>
      ) : (
        <div className={className} aria-disabled="true">{body}</div>
      )}
    </div>
  );
}

export default memo(AlbumCard);