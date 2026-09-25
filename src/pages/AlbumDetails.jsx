import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  getAlbumById,
  getAlbumTracks,
  getCatalogAlbum,
  getCatalogAlbumTracks,
  isCatalogAlbumSource,
} from "../api/albumApi";
import { usePlayer } from "../hooks/useAudioPlayer";
import TrackList from "../components/track/TrackList.jsx";
import SkeletonRows from "../components/common/SkeletonRows.jsx";
import Button from "../components/common/Button.jsx";
import { imageSrc, handleImageError } from "../utils/imageFallback";

export default function AlbumDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  // Albums from search are provider-tagged (?source=spotify|amazon); the
  // default Saavn route cannot open Amazon/Spotify albums (it 404s).
  const source = isCatalogAlbumSource(searchParams.get("source")) ? searchParams.get("source") : null;
  // Broken links can carry a null id (e.g. a track built from an empty
  // album_id). Skip the API entirely instead of firing /albums/null requests.
  const normalizedId = typeof id === "string" ? id.trim() : "";
  const hasValidId =
    normalizedId !== "" &&
    normalizedId.toLowerCase() !== "null" &&
    normalizedId.toLowerCase() !== "undefined";
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = usePlayer();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAlbum(null);
    setTracks([]);
    if (!hasValidId) {
      setLoading(false);
      return () => {
        active = false;
      };
    }
    const albumRequest = source
      ? getCatalogAlbum(source, normalizedId)
      : getAlbumById(normalizedId);
    const tracksRequest = source
      ? getCatalogAlbumTracks(source, normalizedId)
      : getAlbumTracks(normalizedId);
    Promise.all([albumRequest, tracksRequest])
      .then(([albumRes, tracksRes]) => {
        if (!active) return;
        setAlbum(albumRes.data);
        setTracks(tracksRes.data?.results || tracksRes.data || []);
      })
      .catch(() => {
        // Transient failure: keep album null (renders "Album not found")
        // rather than throwing an unhandled rejection.
        if (active) setAlbum(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [normalizedId, source, hasValidId]);

  if (loading)
    return (
      <div className="animate-fadeIn" aria-hidden="true">
        <div className="relative -mx-4 mb-8 overflow-hidden px-4 pb-8 pt-10 sm:-mx-6 sm:px-6">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/[0.08] via-transparent to-transparent" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
            <div className="h-44 w-44 shrink-0 rounded-2xl bg-black/[0.07] dark:bg-white/[0.08] animate-pulse sm:h-48 sm:w-48" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-3 w-16 rounded-full bg-black/[0.07] dark:bg-white/[0.08] animate-pulse" />
              <div className="h-8 w-2/3 max-w-sm rounded-full bg-black/[0.07] dark:bg-white/[0.08] animate-pulse" />
              <div className="h-3 w-32 rounded-full bg-black/[0.07] dark:bg-white/[0.08] animate-pulse" />
              <div className="h-3 w-20 rounded-full bg-black/[0.07] dark:bg-white/[0.08] animate-pulse" />
            </div>
          </div>
        </div>
        <SkeletonRows count={7} />
      </div>
    );
  if (!album) return <p className="text-black/50 dark:text-white/50">Album not found.</p>;

  return (
    <div className="animate-fadeIn">
      <div className="relative -mx-4 mb-8 overflow-hidden px-4 pb-8 pt-10 sm:-mx-6 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/[0.14] via-transparent to-transparent" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <img
            src={imageSrc(album.image)}
            onError={handleImageError}
            alt={album.name}
            decoding="async"
            className="h-44 w-44 rounded-2xl object-cover shadow-2xl shadow-black/30 ring-1 ring-black/10 sm:h-48 sm:w-48 dark:shadow-black/60 dark:ring-white/10"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">Album</p>
            <h1 className="font-display mt-1 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
              {album.name}
            </h1>
            <p className="mt-1 text-black/60 dark:text-white/60">{album.artist_name}</p>
            <p className="mt-1 text-sm text-black/40 dark:text-white/40">{tracks.length} tracks</p>
            {tracks.length > 0 && (
              <Button
                onClick={() => playTrack(tracks[0], tracks)}
                className="mt-4"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
                Play All
              </Button>
            )}
          </div>
        </div>
      </div>
      <TrackList tracks={tracks} />
    </div>
  );
}
