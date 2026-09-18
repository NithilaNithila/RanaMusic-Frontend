import { memo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { imageSrc, handleImageError } from "../../utils/imageFallback";
import { formatDuration } from "../../utils/formatDuration";
import { LANGUAGES } from "../../context/LanguageContext";

const GlobeIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const LockIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default memo(function PlaylistCard({ playlist, index = 0, source = null, onDelete = null }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const id = playlist.id || playlist._id;
  const tracks = playlist.tracks || playlist.songs || [];
  const trackWithArt = tracks.find((t) => t.albumImage || t.image || t.thumbnail);
  const firstImg = Array.isArray(playlist.images) ? playlist.images[0] : null;
  const cover = imageSrc(
    playlist.coverImage ||
      playlist.image ||
      firstImg?.url ||
      firstImg ||
      playlist.thumbnail ||
      trackWithArt?.albumImage ||
      trackWithArt?.image ||
      trackWithArt?.thumbnail ||
      tracks[0]?.image ||
      tracks[0]?.thumbnail
  );
  // Catalog playlists carry their provider as `source`; an explicit prop
  // takes precedence. Own (MongoDB) playlists have neither.
  const provider = source || playlist.source || null;
  const lang = LANGUAGES.find((l) => l.code === playlist.language);
  const canDelete = !provider && typeof onDelete === "function";
  // A broken row can reach the UI without a real id. Never generate
  // /playlists/null links for it.
  const hasId = typeof id === "string" && id.trim() && id !== "null" && id !== "undefined";

  const totalSeconds = tracks.reduce((sum, t) => sum + (Number(t.duration) || 0), 0);

  const stopNavigate = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const className =
    "group relative block h-full overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-2.5 shadow-lg shadow-black/[0.06] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.03] hover:border-premium-primary/50 hover:bg-white/80 hover:shadow-xl hover:shadow-premium-primary/20 dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-premium-secondary/50 dark:hover:bg-white/[0.09] dark:hover:shadow-black/50";

  const body = (
    <>
      {/* Gradient ring on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-transparent transition duration-300 group-hover:ring-premium-primary/50 dark:group-hover:ring-premium-secondary/60"
      />
      {/* Soft brand glow behind artwork on hover */}
      <div className="pointer-events-none absolute -top-8 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-brand/20" />

      <div className="relative mb-2.5 overflow-hidden rounded-2xl shadow-md shadow-black/15 ring-1 ring-white/20 dark:ring-white/10">
        <img
          src={cover}
          onError={handleImageError}
          alt={playlist.name}
          loading="lazy"
          decoding="async"
          className="aspect-[3/4] w-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.08] group-hover:rotate-[0.5deg]"
        />

        {/* Scrim deepens on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Sheen sweep */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

        {/* Delete controls (own playlists only) */}
        {canDelete && (
          <span className="absolute right-2 top-2 flex items-center gap-1">
            {confirmingDelete ? (
              <>
                <button
                  onClick={(e) => {
                    stopNavigate(e);
                    onDelete(playlist);
                  }}
                  className="rounded-md bg-red-500 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-white shadow-md transition-colors hover:bg-red-400"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    stopNavigate(e);
                    setConfirmingDelete(false);
                  }}
                  className="grid h-6 w-6 place-items-center rounded-md bg-black/60 text-white shadow-md transition-colors hover:bg-black/80"
                  aria-label="Cancel"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            ) : (
              <button
                onClick={(e) => {
                  stopNavigate(e);
                  setConfirmingDelete(true);
                }}
                className="grid h-6 w-6 place-items-center rounded-md bg-black/55 text-white opacity-0 backdrop-blur-sm transition-all duration-200 hover:bg-red-500 group-hover:opacity-100"
                title="Delete playlist"
                aria-label="Delete playlist"
              >
                {TrashIcon}
              </button>
            )}
          </span>
        )}

        {/* Visibility badge (own playlists only) */}
        {!provider && typeof playlist.isPublic === "boolean" && (
          <span
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-white backdrop-blur-sm"
            title={playlist.isPublic ? "Public playlist" : "Private playlist"}
          >
            <span className={playlist.isPublic ? "text-brand" : "text-white"}>
              {playlist.isPublic ? GlobeIcon : LockIcon}
            </span>
            <span className="text-[9px] font-semibold uppercase tracking-wide">
              {playlist.isPublic ? "Public" : "Private"}
            </span>
          </span>
        )}

        {/* Track count + total duration */}
        {tracks.length > 0 && (
          <span className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
            {tracks.length}
            <span className="text-white/50">·</span>
            {formatDuration(totalSeconds)}
          </span>
        )}
      </div>

      <div className="px-1 pb-1">
        <p className="truncate text-[13px] font-semibold leading-tight transition-colors group-hover:text-brand">
          {playlist.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-black/50 transition-colors dark:text-white/50">
          {tracks.length > 0 && (
            <span className="shrink-0 font-medium">{tracks.length} songs</span>
          )}
          {tracks.length > 0 && lang && (
            <span className="shrink-0 text-black/25 dark:text-white/25">·</span>
          )}
          {lang && (
            <span className="flex min-w-0 items-center gap-1">
              <span>{lang.flag}</span>
              <span className="truncate">{lang.label}</span>
            </span>
          )}
        </p>
      </div>
    </>
  );

  return (
    <motion.div whileTap={{ scale: 0.97 }} className="h-full">
      {hasId ? (
        <Link
          to={provider ? `/playlists/${id}?source=${provider}` : `/playlists/${id}`}
          className={className}
        >
          {body}
        </Link>
      ) : (
        <div className={className} aria-disabled="true">
          {body}
        </div>
      )}
    </motion.div>
  );
})