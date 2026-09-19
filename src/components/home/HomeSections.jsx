import { useEffect, useRef, useState } from "react";
import { getAlbums } from "../../api/albumApi";
import { getArtists } from "../../api/artistApi";
import { globalSearch } from "../../api/searchApi";
import Section from "../common/Section.jsx";
import RevealItem from "../common/RevealItem.jsx";
import ShowMoreButton from "../common/ShowMoreButton.jsx";
import AlbumGrid from "../album/AlbumGrid.jsx";
import ArtistGrid from "../artist/ArtistGrid.jsx";
import PlaylistCard from "../playlist/PlaylistCard.jsx";
import SkeletonCardGrid from "../common/SkeletonCardGrid.jsx";

const PAGE_SIZE = 12;
const MAX_FETCH_ATTEMPTS = 6;
const CATALOG_PLAYLIST_LIMIT = 60;
const CATALOG_PAGE_SIZE = 12;

const TRENDING_TERMS = ["top", "hits", "popular", "love", "dance", "best"];

// Each section is self-contained: it only mounts (and its effects only run)
// once LazyMount decides it's near the viewport. Fetching happens with the
// section, so the Home page's first paint is gated on a single request.

const Empty = ({ children }) => (
  <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
    {children}
  </p>
);

export function AlbumsSection({ language }) {
  const [albums, setAlbums] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let active = true;
    setAlbums([]);
    setVisible(PAGE_SIZE);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    getAlbums({ limit: PAGE_SIZE, lang: language })
      .then((res) => {
        if (!active) return;
        setAlbums(res.data.results || res.data || []);
      })
      .catch(() => setHasMore(false))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);

  const handleShowMore = async () => {
    if (loadingMore || !hasMore) return;
    const target = visible + PAGE_SIZE;
    if (albums.length >= target) {
      setVisible(target);
      return;
    }
    setLoadingMore(true);
    try {
      let pool = [...albums];
      let nextPage = page;
      for (let i = 0; i < MAX_FETCH_ATTEMPTS && pool.length < target; i++) {
        const res = await getAlbums({ limit: PAGE_SIZE, page: nextPage, lang: language });
        const next = res.data.results || res.data || [];
        nextPage += 1;
        if (!next.length) break;
        const seen = new Set(pool.map((a) => a.id));
        pool = [...pool, ...next.filter((a) => a.id && !seen.has(a.id))];
      }
      setAlbums(pool);
      setPage(nextPage);
      setVisible(target);
      setHasMore(pool.length > albums.length);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Section title="Fresh Albums" subtitle="New releases picked for you">
      {loading ? (
        <SkeletonCardGrid count={8} />
      ) : albums.length ? (
        <>
          <AlbumGrid albums={albums.slice(0, visible)} />
          {hasMore && <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />}
        </>
      ) : (
        <Empty>No albums found.</Empty>
      )}
    </Section>
  );
}

export function ArtistsSection({ language }) {
  const [artists, setArtists] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    let active = true;
    setArtists([]);
    setVisible(PAGE_SIZE);
    setOffset(PAGE_SIZE);
    setHasMore(true);
    setLoading(true);
    getArtists({ limit: PAGE_SIZE, lang: language })
      .then((res) => {
        if (!active) return;
        setArtists(res.data.results || res.data || []);
      })
      .catch(() => setHasMore(false))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [language]);

  const handleShowMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await getArtists({ limit: PAGE_SIZE, offset, lang: language });
      const next = res.data.results || res.data || [];
      const seen = new Set(artists.map((a) => a.id));
      setArtists([...artists, ...next.filter((a) => a.id && !seen.has(a.id))]);
      setOffset(offset + PAGE_SIZE);
      setVisible(visible + PAGE_SIZE);
      setHasMore(next.length >= PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Section title="Artists on the Rise" subtitle="Discover who's trending">
      {loading ? (
        <SkeletonCardGrid count={8} />
      ) : artists.length ? (
        <>
          <ArtistGrid artists={artists.slice(0, visible)} />
          {hasMore && <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />}
        </>
      ) : (
        <Empty>No artists found.</Empty>
      )}
    </Section>
  );
}

const fetchTrendingPage = async (offset) => {
  const pools = await Promise.allSettled(
    TRENDING_TERMS.map((term) =>
      globalSearch(term, { type: "playlist", limit: CATALOG_PLAYLIST_LIMIT, offset }).then(
        (res) => res.data?.playlists || res.data || []
      )
    )
  );
  const collected = [];
  const seen = new Set();
  pools.forEach((result) => {
    if (result.status !== "fulfilled") return;
    (result.value || []).forEach((p) => {
      const k = p.id != null ? p.id : p._id != null ? p._id : null;
      if (!k || seen.has(k)) return;
      seen.add(k);
      collected.push(p);
    });
  });
  return collected;
};

export function PlaylistsSection() {
  const [playlists, setPlaylists] = useState([]);
  const [visible, setVisible] = useState(CATALOG_PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const queryRef = useRef(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchTrendingPage(0)
      .then((merged) => {
        if (active) {
          setPlaylists(merged);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleShowMore = async () => {
    if (loadingMore) return;
    const id = ++queryRef.current;
    setLoadingMore(true);
    try {
      const fresh = await fetchTrendingPage(visible);
      setPlaylists((prev) => {
        if (queryRef.current !== id) return prev;
        const seen = new Set(prev.map((p) => p.id ?? p._id));
        return [...prev, ...fresh.filter((p) => !seen.has(p.id) && !seen.has(p._id))];
      });
      setVisible((c) => c + CATALOG_PAGE_SIZE);
    } catch {
      /* keep list unchanged on failure */
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <Section title="Playlists" subtitle="Curated from Spotify, YouTube Music & Amazon Music">
      {loading ? (
        <SkeletonCardGrid count={8} />
      ) : playlists.length ? (
        <>
          <div className="card-grid">
            {playlists.slice(0, visible).map((p, i) => (
              <RevealItem key={`${p.source}:${p.id}`} delay={Math.min(i % 6, 6) * 60}>
                <PlaylistCard playlist={p} index={i} />
              </RevealItem>
            ))}
          </div>
          {visible < playlists.length && (
            <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />
          )}
        </>
      ) : (
        <Empty>No playlists available right now.</Empty>
      )}
    </Section>
  );
}