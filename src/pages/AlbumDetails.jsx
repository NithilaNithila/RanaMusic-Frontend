import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbumById, getAlbumTracks } from "../api/albumApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import TrackList from "../components/track/TrackList.jsx";
import Loader from "../components/common/Loader.jsx";
import Button from "../components/common/Button.jsx";
import { imageSrc, handleImageError } from "../utils/imageFallback";

export default function AlbumDetails() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setAlbum(null);
    setTracks([]);
    Promise.all([getAlbumById(id), getAlbumTracks(id)])
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
  }, [id]);

  if (loading) return <Loader size="lg" />;
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
