import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getPlaylistById, deletePlaylist } from "../api/playlistApi";
import { getCatalogPlaylist, getCatalogPlaylistTracks } from "../api/catalogApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import TrackList from "../components/track/TrackList.jsx";
import Loader from "../components/common/Loader.jsx";
import Button from "../components/common/Button.jsx";
import { imageSrc, handleImageError } from "../utils/imageFallback";

const PROVIDERS = ["spotify", "ytmusic", "amazon"];

export default function PlaylistDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = PROVIDERS.includes(searchParams.get("source")) ? searchParams.get("source") : null;
  const isCatalog = Boolean(source);
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { playTrack } = useAudioPlayer();
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    let active = true;

    const load = async () => {
      try {
        if (isCatalog) {
          const res = await getCatalogPlaylist(source, id);
          let data = res.data;
          if (!data.songs?.length) {
            const tracksRes = await getCatalogPlaylistTracks(source, id);
            data = { ...data, songs: tracksRes.data || [] };
          }
          if (active) setPlaylist(data);
        } else {
          const res = await getPlaylistById(id);
          if (active) setPlaylist(res.data);
        }
      } catch {
        if (active) setPlaylist(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [id, source, isCatalog]);

  if (loading) return <Loader size="lg" />;
  if (!playlist) return <p className="text-black/50 dark:text-white/50">Playlist not found.</p>;

  const tracks = playlist.songs || playlist.tracks || [];
  const cover = imageSrc(
    playlist.coverImage ||
      playlist.image ||
      tracks.find((t) => t.albumImage || t.image)?.albumImage ||
      tracks[0]?.image
  );
  const count = tracks.length || playlist.track_count || 0;

  const handleDelete = async () => {
    try {
      await deletePlaylist(id);
      navigate("/library", { replace: true });
    } catch {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="relative -mx-4 mb-8 overflow-hidden px-4 pb-8 pt-10 sm:-mx-6 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/[0.14] via-transparent to-transparent" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-end sm:text-left">
          <img
            src={cover}
            onError={handleImageError}
            alt={playlist.name}
            className="h-44 w-44 rounded-2xl object-cover shadow-2xl shadow-black/30 ring-1 ring-black/10 sm:h-48 sm:w-48 dark:shadow-black/60 dark:ring-white/10"
          />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              {isCatalog ? { spotify: "Spotify", ytmusic: "YouTube Music", amazon: "Amazon Music" }[source] : "Playlist"}
            </p>
            <h1 className="font-display mt-1 break-words text-3xl font-semibold tracking-tight sm:text-4xl">
              {playlist.name}
            </h1>
            <p className="mt-1 text-sm text-black/40 dark:text-white/40">{count} tracks</p>
            {tracks.length > 0 && (
              <Button onClick={() => playTrack(tracks[0], tracks)} className="mt-4">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
                Play All
              </Button>
            )}
            {!isCatalog && (
              <div className="mt-3 flex items-center gap-2">
                {confirmingDelete && (
                  <p className="text-xs text-red-400">Delete “{playlist.name}” permanently?</p>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirmingDelete) handleDelete();
                    else setConfirmingDelete(true);
                  }}
                >
                  {confirmingDelete ? "Confirm delete" : "Delete playlist"}
                </Button>
                {confirmingDelete && (
                  <button
                    onClick={() => setConfirmingDelete(false)}
                    className="text-xs font-medium text-black/40 transition-colors hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {tracks.length > 0 && <TrackList tracks={tracks} />}
    </div>
  );
}