import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { getArtistById, getArtistAlbums, getArtistTracks } from "../api/artistApi";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import TrackList from "../components/track/TrackList.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import Loader from "../components/common/Loader.jsx";
import Button from "../components/common/Button.jsx";
import Section from "../components/common/Section.jsx";
import { imageSrc, handleImageError } from "../utils/imageFallback";

const ALBUM_BATCH_SIZE = 12;
const SOURCES = ["saavn", "spotify", "amazon"];

export default function ArtistDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  // Search rows carry a provider tag (?source=spotify|amazon); the Saavn route
  // cannot resolve those ids, so the source routes to the right endpoint.
  const source = SOURCES.includes(searchParams.get("source")) ? searchParams.get("source") : null;
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setArtist(null);
    setAlbums([]);
    setTracks([]);
    setHasMore(true);

    const load = async () => {
      const params = source ? { source } : {};
      const requests = [getArtistById(id, params)];
      // Amazon has no albums endpoint; the page surfaces popular tracks instead.
      if (source === "amazon") {
        requests.push(getArtistTracks(id, { ...params, limit: ALBUM_BATCH_SIZE }));
      } else {
        requests.push(getArtistAlbums(id, { ...params, limit: ALBUM_BATCH_SIZE }));
      }

      try {
        const [artistRes, contentRes] = await Promise.all(requests);
        if (cancelled) return;
        setArtist(artistRes.data);
        const list = contentRes.data?.results || contentRes.data || [];
        if (source === "amazon") {
          setTracks(list);
        } else {
          setAlbums(list);
          setHasMore(list.length >= ALBUM_BATCH_SIZE);
        }
      } catch (err) {
        if (!cancelled) {
          setArtist(null);
          setError(err?.response?.status || "network");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, source, reloadKey]);

  const handleShowMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const params = source ? { source } : {};
      const res = await getArtistAlbums(id, { ...params, limit: ALBUM_BATCH_SIZE, offset: albums.length });
      const next = res.data?.results || res.data || [];
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
  if (!artist && error && error !== 404)
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-black/5 bg-black/[0.03] p-8 text-center dark:border-white/10 dark:bg-white/[0.03]">
        <p className="text-sm text-black/50 dark:text-white/50">Couldn't load the artist right now.</p>
        <Button onClick={() => setReloadKey((k) => k + 1)}>Retry</Button>
      </div>
    );
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
            decoding="async"
            className="h-40 w-40 rounded-full object-cover shadow-2xl shadow-black/30 ring-4 ring-brand/25 sm:h-48 sm:w-48 dark:shadow-black/60"
          />
          <span className="absolute inset-0 -z-10 scale-110 rounded-full bg-brand/20 blur-2xl" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-brand">Artist</p>
        <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{artist.name}</h1>
        <p className="mt-1 text-sm text-black/40 dark:text-white/40">
          {source === "amazon" ? `${tracks.length} popular tracks` : `${albums.length} albums`}
        </p>
      </div>

      {source === "amazon" ? (
        tracks.length > 0 && (
          <Section title="Popular Tracks" subtitle={`Top tracks by ${artist.name}`}>
            <TrackList tracks={tracks} />
          </Section>
        )
      ) : (
        <Section title="Albums" subtitle={`Everything by ${artist.name}`}>
          <AlbumGrid albums={albums} />
          {albums.length > 0 && hasMore && (
            <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />
          )}
        </Section>
      )}
    </div>
  );
}