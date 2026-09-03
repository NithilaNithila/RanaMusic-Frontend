import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtistById, getArtistAlbums } from "../api/artistApi";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import Loader from "../components/common/Loader.jsx";
import Section from "../components/common/Section.jsx";
import { imageSrc, handleImageError } from "../utils/imageFallback";

const ALBUM_BATCH_SIZE = 12;

export default function ArtistDetails() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setHasMore(true);
    Promise.all([getArtistById(id), getArtistAlbums(id, { limit: ALBUM_BATCH_SIZE })])
      .then(([artistRes, albumsRes]) => {
        if (cancelled) return;
        setArtist(artistRes.data);
        const list = albumsRes.data.results || albumsRes.data || [];
        setAlbums(list);
        setHasMore(list.length >= ALBUM_BATCH_SIZE);
      })
      .catch(() => {
        if (!cancelled) {
          setAlbums([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleShowMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getArtistAlbums(id, { limit: ALBUM_BATCH_SIZE, offset: albums.length });
      const next = res.data.results || res.data || [];
      const fresh = next.filter((a) => a.id && !albums.some((p) => p.id === a.id));
      setAlbums((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        return [...prev, ...next.filter((a) => a.id && !seen.has(a.id))];
      });
      setHasMore(fresh.length >= ALBUM_BATCH_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) return <Loader size="lg" />;
  if (!artist) return <p className="text-black/50 dark:text-white/50">Artist not found.</p>;

  return (
    <div className="animate-fadeIn">
      <div className="relative -mx-4 mb-10 overflow-hidden px-4 pb-8 pt-10 text-center sm:-mx-6 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand/[0.14] via-transparent to-transparent" />
        <div className="relative mx-auto w-fit">
          <img
            src={imageSrc(artist.image)}
            onError={handleImageError}
            alt={artist.name}
            className="h-40 w-40 rounded-full object-cover shadow-2xl shadow-black/30 ring-4 ring-brand/25 sm:h-48 sm:w-48 dark:shadow-black/60"
          />
          <span className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand/20 blur-2xl" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Artist</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{artist.name}</h1>
        <p className="mt-1 text-sm text-black/40 dark:text-white/40">{albums.length} albums</p>
      </div>

      <Section title="Albums" subtitle={`Everything by ${artist.name}`}>
        <AlbumGrid albums={albums} />
        {albums.length > 0 && hasMore && (
          <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />
        )}
      </Section>
    </div>
  );
}