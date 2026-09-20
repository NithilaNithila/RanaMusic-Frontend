import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getPopularTracks } from "../api/trackApi";
import { getAlbums } from "../api/albumApi";
import { getArtists } from "../api/artistApi";
import { fetchAllCatalogPlaylists } from "../api/catalogApi";
import { globalSearch } from "../api/searchApi";
import { getPublicPlaylists } from "../api/playlistApi";
import { useLanguage } from "../context/LanguageContext";
import { useDebounce } from "../hooks/useDebounce";
import { mergePlaylists, toList } from "../utils/helpers";
import Input from "../components/common/Input.jsx";
import TrackCard from "../components/track/TrackCard.jsx";
import RevealItem from "../components/common/RevealItem.jsx";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ArtistGrid from "../components/artist/ArtistGrid.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";

const PAGE_SIZE = 12;
const CACHE_TTL_MS = 5 * 60 * 1000;

function cacheKey(query, params) {
  return `search:${query}:${JSON.stringify(params || {})}`;
}

function readSearchCache(query, params = {}) {
  try {
    const key = cacheKey(query, params);
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL_MS) return data;
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore corrupt cache */
  }
  return null;
}

// Loads public playlists created by any user, or [] on failure.
const loadCommunityPlaylists = async (query = "", params = {}) => {
  try {
    const res = await getPublicPlaylists(query, params);
    return res.data?.results || res.data || [];
  } catch {
    return [];
  }
};

const TrackIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="16" r="3" />
  </svg>
);

const AlbumIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const ArtistIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlaylistIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="13" y2="18" />
  </svg>
);

const AllIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const RetryIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const TABS = [
  { key: "all", label: "All", icon: AllIcon },
  { key: "tracks", label: "Track", icon: TrackIcon },
  { key: "albums", label: "Album", icon: AlbumIcon },
  { key: "artists", label: "Artist", icon: ArtistIcon },
  { key: "playlists", label: "Playlist", icon: PlaylistIcon },
];

function BrowseSkeleton({ count = PAGE_SIZE }) {
  return (
    <div className="card-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-black/5 bg-black/[0.03] p-3 dark:border-white/5 dark:bg-white/[0.04]"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="aspect-square rounded-xl bg-black/[0.08] dark:bg-white/[0.1]" />
          <div className="mt-3 h-3 w-4/5 rounded-full bg-black/[0.08] dark:bg-white/[0.1]" />
          <div className="mt-2 h-2.5 w-1/2 rounded-full bg-black/[0.06] dark:bg-white/[0.08]" />
        </div>
      ))}
    </div>
  );
}

function ResultBar({ count, noun, query }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <p className="text-sm text-black/50 dark:text-white/50">
        {count} {noun}
        {query && (
          <>
            {" "}
            · results for{" "}
            <span className="font-medium text-black dark:text-white">"{query}"</span>
          </>
        )}
      </p>
    </div>
  );
}

function EmptyResults({ query, noun }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.03] px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand animate-floatY">
        {SearchIcon}
      </span>
      <p className="font-medium">
        {query ? `No ${noun} match "${query}"` : `No ${noun} found`}
      </p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-black/40 dark:text-white/40">
        {query
          ? "Try a different search."
          : "Try searching the catalog."}
      </p>
    </div>
  );
}

function LoadError({ onRetry }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.03] px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <p className="font-medium">Couldn't load results</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-black/40 dark:text-white/40">
        The music API didn't respond. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-200 px-5 py-2 text-sm font-semibold text-black shadow-md shadow-brand/30 transition-transform hover:scale-[1.03] active:scale-95"
      >
        {RetryIcon}
        Retry
      </button>
    </div>
  );
}

function useBrowseList({ query, language, fetchPage, cacheKey }) {
  const [items, setItems] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const requestId = useRef(0);
  const moreBusy = useRef(false);

  // Synchronous cache read for the current query + cacheKey
  const cachedData = useMemo(() => {
    if (!query || !cacheKey) return null;
    try {
      const key = `search:${query}:${JSON.stringify({ ...{ limit: PAGE_SIZE, offset: 0, type: cacheKey } })}`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts >= CACHE_TTL_MS) {
          sessionStorage.removeItem(key);
          return null;
        }
        const base = Array.isArray(data) ? data : data?.results || data;
        return Array.isArray(base) ? base : base?.[`${cacheKey}s`] || [];
      }
    } catch {
      /* ignore corrupt cache */
    }
    return null;
  }, [query, cacheKey]);

  const load = useCallback(
    async ({ reset = true, page = 1, active }) => {
      const id = ++requestId.current;
      if (reset) {
        if (!cachedData) {
          setLoading(true);
          setError(false);
        }
      } else {
        setLoadingMore(true);
      }
      try {
        const res = await fetchPage({ page, lang: language });
        if (id !== requestId.current || (active && !active())) return false;
        const next = res.data?.results || res.data || [];
        if (reset) {
          if (cachedData) {
            // Merge fresh data with cached (deduplicate)
            const seen = new Set(cachedData.map((it) => it.id));
            const merged = [...cachedData, ...next.filter((it) => it.id && !seen.has(it.id))];
            setItems(merged.slice(0, PAGE_SIZE * 10)); // allow growth
            setVisible(PAGE_SIZE);
            setHasMore(merged.length >= PAGE_SIZE);
          } else {
            setItems(next);
            setVisible(PAGE_SIZE);
            setHasMore(next.length >= PAGE_SIZE);
          }
        } else {
          setItems((prev) => {
            const seen = new Set(prev.map((it) => it.id));
            return [...prev, ...next.filter((it) => it.id && !seen.has(it.id))];
          });
          setHasMore(next.length >= PAGE_SIZE);
        }
        return true;
      } catch {
        if (id !== requestId.current || (active && !active())) return false;
        if (reset && !cachedData) setError(true);
        else setHasMore(false);
        return true;
      } finally {
        if (id === requestId.current) {
          if (reset) setLoading(false);
          else setLoadingMore(false);
        }
        if (!reset) moreBusy.current = false;
      }
    },
    [fetchPage, language, cachedData]
  );

  // Hydrate from cache on mount
  useEffect(() => {
    if (cachedData) {
      setItems(cachedData.slice(0, PAGE_SIZE * 10));
      setVisible(PAGE_SIZE);
      setHasMore(cachedData.length >= PAGE_SIZE);
      setLoading(false);
    }
  }, [cachedData]);

  useEffect(() => {
    let active = true;
    // If we already have cached data, don't show skeleton
    if (!cachedData) {
      load({ reset: true, active: () => active });
    }
    return () => {
      active = false;
    };
  }, [load, cachedData]);

  const retry = useCallback(() => load({ reset: true }), [load]);

  const loadMore = async () => {
    if (moreBusy.current || !hasMore) return;
    const target = visible + PAGE_SIZE;
    if (items.length >= target) {
      setVisible(target);
      return;
    }
    moreBusy.current = true;
    const applied = await load({
      reset: false,
      page: Math.floor(items.length / PAGE_SIZE) + 1,
      active: () => true,
    });
    if (applied) setVisible((v) => v + PAGE_SIZE);
  };

  return { items, loading, error, visible, hasMore, loadingMore, retry, loadMore };
}

function TracksTab({ query }) {
  const { language } = useLanguage();
  const fetchPage = useCallback(
    ({ page, lang }) =>
      query
        ? globalSearch(query, {
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            type: "track",
          }).then((res) => {
            const data = res.data?.results || res.data;
            return { data: { results: data.tracks || [] } };
          })
        : getPopularTracks({ limit: PAGE_SIZE, page, lang }),
    [query, language]
  );
  const { items, loading, error, visible, hasMore, loadingMore, retry, loadMore } =
    useBrowseList({ query, language, fetchPage, cacheKey: "track" });

  if (loading) return <BrowseSkeleton />;
  if (error) return <LoadError onRetry={retry} />;

  return (
    <>
      {items.length ? (
        <>
          <ResultBar count={items.length} noun="tracks" query={query} />
          <div className="card-grid">
            {items.slice(0, visible).map((t, i) => (
              <RevealItem key={t.id} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                <TrackCard track={t} queue={items} index={i} />
              </RevealItem>
            ))}
          </div>
          {hasMore && <ShowMoreButton loading={loadingMore} onClick={loadMore} />}
        </>
      ) : (
        <EmptyResults query={query} noun="tracks" />
      )}
    </>
  );
}

function AlbumsTab({ query }) {
  const { language } = useLanguage();
  const fetchPage = useCallback(
    ({ page, lang }) =>
      query
        ? globalSearch(query, {
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            type: "album",
          }).then((res) => {
            const data = res.data?.results || res.data;
            return { data: { results: data.albums || [] } };
          })
        : getAlbums({ limit: PAGE_SIZE, page, lang }),
    [query, language]
  );
  const { items, loading, error, visible, hasMore, loadingMore, retry, loadMore } =
    useBrowseList({ query, language, fetchPage, cacheKey: "album" });

  if (loading) return <BrowseSkeleton />;
  if (error) return <LoadError onRetry={retry} />;

  return (
    <>
      {items.length ? (
        <>
          <ResultBar count={items.length} noun="albums" query={query} />
          <AlbumGrid albums={items.slice(0, visible)} />
          {hasMore && <ShowMoreButton loading={loadingMore} onClick={loadMore} />}
        </>
      ) : (
        <EmptyResults query={query} noun="albums" />
      )}
    </>
  );
}

function ArtistsTab({ query }) {
  const { language } = useLanguage();
  const fetchPage = useCallback(
    ({ page, lang }) =>
      query
        ? globalSearch(query, {
            limit: PAGE_SIZE,
            offset: (page - 1) * PAGE_SIZE,
            type: "artist",
          }).then((res) => {
            const data = res.data?.results || res.data;
            return { data: { results: data.artists || [] } };
          })
        : getArtists({ limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE, lang }),
    [query, language]
  );
  const { items, loading, error, visible, hasMore, loadingMore, retry, loadMore } =
    useBrowseList({ query, language, fetchPage, cacheKey: "artist" });

  if (loading) return <BrowseSkeleton />;
  if (error) return <LoadError onRetry={retry} />;

  return (
    <>
      {items.length ? (
        <>
          <ResultBar count={items.length} noun="artists" query={query} />
          <ArtistGrid artists={items.slice(0, visible)} />
          {hasMore && <ShowMoreButton loading={loadingMore} onClick={loadMore} />}
        </>
      ) : (
        <EmptyResults query={query} noun="artists" />
      )}
    </>
  );
}

function NoMatches({ query }) {
  return (
    <p className="rounded-xl border border-black/5 bg-black/[0.03] px-5 py-4 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
      No matches for "{query}"
    </p>
  );
}

function AllGroup({ icon, title, count, children }) {
  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-brand">{icon}</span>
        <h3 className="text-base font-bold tracking-tight">{title}</h3>
        <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-black/50 dark:bg-white/10 dark:text-white/50">
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function AllTab({ query }) {
  const { language } = useLanguage();
  const [catalog, setCatalog] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState(false);
  const [catalogKey, setCatalogKey] = useState(0);

  const [groups, setGroups] = useState({ tracks: [], albums: [], artists: [] });
  const [playlists, setPlaylists] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let active = true;
    setCatalogLoading(true);
    setCatalogError(false);
    fetchAllCatalogPlaylists({ limit: 60 })
      .then((list) => {
        if (active) {
          setCatalog(list || []);
          setVisible(PAGE_SIZE);
        }
      })
      .catch(() => {
        if (active) setCatalogError(true);
      })
      .finally(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, [catalogKey]);

  useEffect(() => {
    if (!query) return;
    let active = true;
    setSearching(true);
    // Unified search aggregates all four providers (Saavn + Spotify +
    // YouTube Music + Amazon) for every category in one request. Public
    // playlists created by app users are merged in for discoverability.
    Promise.all([
      globalSearch(query, { limit: PAGE_SIZE, offset: 0 }),
      loadCommunityPlaylists(query, { limit: PAGE_SIZE, offset: 0 }),
    ])
      .then(([res, community]) => {
        if (!active) return;
        const data = res.data?.results || res.data;
        setGroups({
          tracks: data.tracks || [],
          albums: data.albums || [],
          artists: data.artists || [],
        });
        setPlaylists(mergePlaylists(data.playlists || [], community));
        setSearching(false);
      })
      .catch(() => {
        if (active) setSearching(false);
      });
    return () => {
      active = false;
    };
  }, [query, language]);

  if (!query) {
    if (catalogLoading) return <BrowseSkeleton />;
    if (catalogError)
      return <LoadError onRetry={() => setCatalogKey((k) => k + 1)} />;
    return (
      <>
        <p className="mb-6 rounded-2xl border border-black/5 bg-black/[0.03] px-5 py-4 text-sm text-black/50 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/50">
          Start typing above to search tracks, albums, artists & playlists together —
          or browse today's trending playlists.
        </p>
        <div className="card-grid">
          {catalog.slice(0, visible).map((p, i) => (
            <RevealItem key={`${p.source}:${p.id}`} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
              <PlaylistCard playlist={p} index={i} />
            </RevealItem>
          ))}
        </div>
        {visible < catalog.length && (
          <ShowMoreButton
            loading={false}
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
          />
        )}
      </>
    );
  }

  if (searching) return <BrowseSkeleton />;

  // Playlists arrive pre-filtered from the unified search API.
  const total =
    groups.tracks.length + groups.albums.length + groups.artists.length + playlists.length;

  if (!total) return <EmptyResults query={query} noun="results" />;

  const breakdown = [
    { icon: TrackIcon, label: "Track", count: groups.tracks.length },
    { icon: AlbumIcon, label: "Album", count: groups.albums.length },
    { icon: ArtistIcon, label: "Artist", count: groups.artists.length },
    { icon: PlaylistIcon, label: "Playlist", count: playlists.length },
  ];

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-black/50 dark:text-white/50">
          {total} results
          {query && (
            <>
              {" "}
              · for{" "}
              <span className="font-medium text-black dark:text-white">"{query}"</span>
            </>
          )}
        </p>
      </div>
      <div className="mb-8 flex flex-wrap gap-2">
        {breakdown.map((b) => (
          <span
            key={b.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              b.count > 0
                ? "border-brand/30 bg-brand/10 text-black dark:text-white"
                : "border-black/10 text-black/40 dark:border-white/10 dark:text-white/40"
            }`}
          >
            <span className="text-brand">{b.icon}</span>
            {b.label}
            <span className="tabular-nums">{b.count}</span>
          </span>
        ))}
      </div>
      <AllGroup icon={TrackIcon} title="Tracks" count={groups.tracks.length}>
        {groups.tracks.length ? (
          <div className="card-grid">
            {groups.tracks.map((t, i) => (
              <RevealItem key={t.id} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                <TrackCard track={t} queue={groups.tracks} index={i} />
              </RevealItem>
            ))}
          </div>
        ) : (
          <NoMatches query={query} />
        )}
      </AllGroup>
      <AllGroup icon={AlbumIcon} title="Albums" count={groups.albums.length}>
        {groups.albums.length ? (
          <AlbumGrid albums={groups.albums} />
        ) : (
          <NoMatches query={query} />
        )}
      </AllGroup>
      <AllGroup icon={ArtistIcon} title="Artists" count={groups.artists.length}>
        {groups.artists.length ? (
          <ArtistGrid artists={groups.artists} />
        ) : (
          <NoMatches query={query} />
        )}
      </AllGroup>
      <AllGroup icon={PlaylistIcon} title="Playlists" count={playlists.length}>
        {playlists.length ? (
          <div className="card-grid">
            {playlists.map((p, i) => (
              <RevealItem key={`${p.source || "own"}:${p.id || p._id}`} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                <PlaylistCard playlist={p} index={i} />
              </RevealItem>
            ))}
          </div>
        ) : (
          <NoMatches query={query} />
        )}
      </AllGroup>
    </>
  );
}

function PlaylistsTab({ query }) {
  const [playlists, setPlaylists] = useState([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Synchronous cache read for playlists
  const cachedPlaylists = useMemo(() => {
    if (!query) return null;
    try {
      const key = `search:${query}:${JSON.stringify({ limit: 60, offset: 0, type: "playlist" })}`;
      const raw = sessionStorage.getItem(key);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts >= CACHE_TTL_MS) {
          sessionStorage.removeItem(key);
          return null;
        }
        const base = Array.isArray(data) ? data : data?.results || data;
        return Array.isArray(base) ? base : base?.playlists || [];
      }
    } catch {
      /* ignore corrupt cache */
    }
    return null;
  }, [query]);

  useEffect(() => {
    let active = true;
    // Hydrate from cache instantly
    if (cachedPlaylists) {
      setPlaylists(cachedPlaylists);
      setVisible(PAGE_SIZE);
      setLoading(false);
    }
    setLoading(!cachedPlaylists);
    setError(false);
    const request = query
      ? // Unified search returns provider playlists; public playlists created
        // by app users are merged in so the community is discoverable.
        Promise.all([
          globalSearch(query, { limit: 60, offset: 0, type: "playlist" }).then(
            (res) => {
              const data = res.data?.results || res.data;
              return data.playlists || [];
            }
          ),
          loadCommunityPlaylists(query, { limit: 60, offset: 0 }),
        ]).then(([catalog, community]) => mergePlaylists(catalog, community))
      : fetchAllCatalogPlaylists({ limit: 60 });
    request
      .then((list) => {
        if (active) {
          if (cachedPlaylists) {
            const seen = new Set(cachedPlaylists.map((p) => p.id));
            const merged = [...cachedPlaylists, ...list.filter((p) => p.id && !seen.has(p.id))];
            setPlaylists(merged);
          } else {
            setPlaylists(list);
          }
          setVisible(PAGE_SIZE);
        }
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, reloadKey, cachedPlaylists]);

  const filtered = query
    ? playlists.filter((p) =>
        (p.name || "").toLowerCase().includes(query.toLowerCase())
      )
    : playlists;

  if (loading) return <BrowseSkeleton />;
  if (error) return <LoadError onRetry={() => setReloadKey((k) => k + 1)} />;

  return (
    <>
      {filtered.length ? (
        <>
          <ResultBar count={filtered.length} noun="playlists" query={query} />
          <div className="card-grid">
            {filtered.slice(0, visible).map((p, i) => (
              <RevealItem key={`${p.source || "own"}:${p.id || p._id}`} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                <PlaylistCard playlist={p} index={i} />
              </RevealItem>
            ))}
          </div>
          {visible < filtered.length && (
            <ShowMoreButton loading={false} onClick={() => setVisible((v) => v + PAGE_SIZE)} />
          )}
        </>
      ) : (
        <EmptyResults query={query} noun="playlists" />
      )}
    </>
  );
}

export default function Browse() {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get("q") || "");
  const query = useDebounce(searchInput, 400);
  // The main search bar always searches everything (All), matching the
  // navbar search; the tab links just switch the focused view.
  const activeTab = TABS.some((t) => t.key === params.get("tab"))
    ? params.get("tab")
    : "all";
  const [visited, setVisited] = useState(() => new Set([activeTab]));
  const qParam = params.get("q");

  useEffect(() => {
    setVisited((prev) => new Set(prev).add(activeTab));
  }, [activeTab]);

  // Adopt queries coming in from the navbar search (> /browse?tab=all&q=...)
  // so both search bars share the same query.
  useEffect(() => {
    if (qParam) setSearchInput(qParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qParam]);

  // Keep the URL in sync with the All tab's query so it stays shareable.
  useEffect(() => {
    if (activeTab === "all") {
      setParams(query ? { tab: "all", q: query } : { tab: "all" }, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const select = (key) => {
    setParams({ tab: key, ...(qParam ? { q: qParam } : {}) }, { replace: true });
  };

  const clearSearch = () => setSearchInput("");

  const active = TABS.find((t) => t.key === activeTab);

  return (
    <div className="animate-fadeIn">
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-br from-brand/15 via-transparent to-brand-200/10 p-6 sm:p-8 dark:border-white/5 dark:from-brand/10 dark:via-transparent dark:to-brand-200/5">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 h-48 w-48 rounded-full bg-brand-200/20 blur-3xl" />
        <div className="relative z-10">
          <h1 className="font-display animate-fadeInUp text-2xl font-semibold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-brand to-brand-200 bg-clip-text text-transparent">
              Browse
            </span>{" "}
            the music catalog
          </h1>
          <p className="mt-1.5 max-w-md text-sm text-black/50 dark:text-white/50">
            Search tracks, albums, artists & playlists — everything in one place.
          </p>
        </div>
      </section>

      <Input
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
        placeholder={
          active.key === "all"
            ? "Search tracks, albums, artists & playlists…"
            : `Search ${active.label.toLowerCase()}s…`
        }
        icon={SearchIcon}
        aria-label="Search the catalog"
        className="mb-8 w-full py-3"
        rightSlot={
          searchInput ? (
            <button
              onClick={clearSearch}
              aria-label="Clear search"
              title="Clear"
              className="grid h-6 w-6 place-items-center rounded-full text-black/40 transition-colors hover:bg-black/10 hover:text-black dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : undefined
        }
      />

      <div className="mb-8 flex w-full flex-wrap items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] p-1.5 dark:border-white/10 dark:bg-white/[0.04]">
        {TABS.map((t) => {
          const isActive = t.key === activeTab;
          return (
            <button
              key={t.key}
              onClick={() => select(t.key)}
              aria-pressed={isActive}
              className={`relative flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200 sm:px-5 ${
                isActive
                  ? "text-black"
                  : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="browse-tab-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand-200 shadow-md shadow-brand/30"
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {t.icon}
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panels stay mounted once visited so data survives tab switches */}
      <div className={activeTab === "all" ? "" : "hidden"}>
        {visited.has("all") && <AllTab query={query} />}
      </div>
      <div className={activeTab === "tracks" ? "" : "hidden"}>
        {visited.has("tracks") && <TracksTab query={query} />}
      </div>
      <div className={activeTab === "albums" ? "" : "hidden"}>
        {visited.has("albums") && <AlbumsTab query={query} />}
      </div>
      <div className={activeTab === "artists" ? "" : "hidden"}>
        {visited.has("artists") && <ArtistsTab query={query} />}
      </div>
      <div className={activeTab === "playlists" ? "" : "hidden"}>
        {visited.has("playlists") && <PlaylistsTab query={query} />}
      </div>
    </div>
  );
}