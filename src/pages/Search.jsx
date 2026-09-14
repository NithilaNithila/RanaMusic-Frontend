import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getPopularTracks } from "../api/trackApi";
import { globalSearch } from "../api/searchApi";
import { getPublicPlaylists } from "../api/playlistApi";
import { useDebounce } from "../hooks/useDebounce";
import { idKey, toList, mergePlaylists } from "../utils/helpers";
import TrackList from "../components/track/TrackList.jsx";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ArtistGrid from "../components/artist/ArtistGrid.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import Input from "../components/common/Input.jsx";
import SkeletonRows from "../components/common/SkeletonRows.jsx";

const PAGE_SIZE = 12; // Items loaded first (+ per "Show more" click)
const MAX_RESULTS = 500; // Hard ceiling per category

const CATS = ["tracks", "albums", "artists", "playlists"];

const SOURCES = [
  { key: "saavn", label: "Saavn" },
  { key: "spotify", label: "Spotify" },
  { key: "ytmusic", label: "YouTube Music" },
  { key: "amazon", label: "Amazon" },
];

const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

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

const trackKey = (t) => {
  if (!t || typeof t !== "object") return null;
  if (t.id != null) return `id:${t.id}`;
  if (!t.name) return null;
  return `n:${String(t.name).trim().toLowerCase()}|${String(t.artist_name || "")
    .trim()
    .toLowerCase()}`;
};

// Loads community playlists (public playlists created by any user), or [] on failure.
const loadCommunityPlaylists = async (query, params) => {
  try {
    const res = await getPublicPlaylists(query, params);
    return Array.isArray(toList(res)) ? toList(res) : [];
  } catch {
    return [];
  }
};

const KEY_FN = { tracks: trackKey, albums: idKey, artists: idKey, playlists: idKey };

const addUnique = (prev, next, keyFn) => {
  const seen = new Set(prev.map(keyFn));
  return [
    ...prev,
    ...next.filter((x) => {
      const k = keyFn(x);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    }),
  ];
};

const allFalse = () => ({ tracks: false, albums: false, artists: false, playlists: false });

const GRID = "card-grid";

function SectionTitle({ icon, title, count }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-brand">{icon}</span>
      <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
      <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs font-semibold tabular-nums text-black/50 dark:bg-white/10 dark:text-white/50">
        {count}
      </span>
    </div>
  );
}

function Section({ icon, title, count, onMore, loading, children }) {
  return (
    <section className="mb-12">
      <SectionTitle icon={icon} title={title} count={count} />
      {children}
      {onMore && <ShowMoreButton loading={loading} onClick={onMore} />}
    </section>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreCat, setLoadingMoreCat] = useState(null);
  const [shown, setShown] = useState(() => ({ tracks: PAGE_SIZE, albums: PAGE_SIZE, artists: PAGE_SIZE, playlists: PAGE_SIZE }));
  const [hasMore, setHasMore] = useState(() => ({ tracks: false, albums: false, artists: false, playlists: false }));
  const [recHasMore, setRecHasMore] = useState(false);
  // Per-provider track groups ({ saavn: [], spotify: [], ytmusic: [], amazon: [] })
  // served by the backend alongside the merged list. null = old backend (no
  // tracksBySource) → fall back to the single merged Tracks section.
  const [trackSources, setTrackSources] = useState(null);
  const [srcShown, setSrcShown] = useState(() => ({ saavn: PAGE_SIZE, spotify: PAGE_SIZE, ytmusic: PAGE_SIZE, amazon: PAGE_SIZE }));
  const [srcHasMore, setSrcHasMore] = useState(() => ({ saavn: false, spotify: false, ytmusic: false, amazon: false }));
  const debouncedQuery = useDebounce(query, 400);
  const searching = Boolean(debouncedQuery.trim());

  // Keep the input in sync with the ?q= URL param (deep links / in-app
  // navigation while the page is already mounted).
  useEffect(() => {
    const q = params.get("q");
    if (q != null) setQuery(q);
  }, [params.get("q")]);

  // Keep the ?q= URL param in sync with the input so the query survives
  // leaving for Now Playing and coming back (the page remounts and restores
  // the same results — and the now-playing highlight along with them).
  useEffect(() => {
    const q = query.trim();
    setParams(q ? { q: query } : {}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const pageRef = useRef(1);
  const busyRef = useRef(false);
  const queryRef = useRef(debouncedQuery);
  const sentinelRef = useRef(null);

  // First page whenever the query changes (covers both modes)
  useEffect(() => {
    let active = true;
    setLoading(true);
    setTracks([]);
    setAlbums([]);
    setArtists([]);
    setPlaylists([]);
    setTrackSources(null);
    setSrcShown({ saavn: PAGE_SIZE, spotify: PAGE_SIZE, ytmusic: PAGE_SIZE, amazon: PAGE_SIZE });
    setSrcHasMore(allFalse());
    setHasMore(allFalse());
    setShown({ tracks: PAGE_SIZE, albums: PAGE_SIZE, artists: PAGE_SIZE, playlists: PAGE_SIZE });
    setRecHasMore(false);
    pageRef.current = 1;
    queryRef.current = debouncedQuery;

    const setup = async () => {
      if (!searching) {
        // Recommended mode: first page of the popular aggregator.
        try {
          const list = toList(await getPopularTracks({ limit: PAGE_SIZE, page: 1 }));
          if (!active) return;
          setTracks(list);
          setRecHasMore(list.length >= PAGE_SIZE);
        } catch {
          if (active) setTracks([]);
        }
        if (active) setLoading(false);
        return;
      }

      // Search mode: the unified /api/search endpoint aggregates all four
      // providers (Saavn + Spotify + YouTube Music + Amazon) for tracks,
      // albums, artists and playlists in one response. Public playlists
      // created by app users are merged in so the community is discoverable.
      try {
        const [res, communityRes] = await Promise.all([
          globalSearch(debouncedQuery, { limit: PAGE_SIZE, offset: 0 }),
          loadCommunityPlaylists(debouncedQuery, { limit: PAGE_SIZE, offset: 0 }),
        ]);
        if (!active) return;
        const data = res.data?.results || res.data;
        const community = Array.isArray(communityRes) ? communityRes : [];
        const next = {
          tracks: data.tracks || [],
          albums: data.albums || [],
          artists: data.artists || [],
          playlists: mergePlaylists(data.playlists || [], community),
        };
        setTracks(next.tracks);
        setAlbums(next.albums);
        setArtists(next.artists);
        setPlaylists(next.playlists);
        setTrackSources(data.tracksBySource || null);
        setSrcHasMore({
          saavn: (data.tracksBySource?.saavn?.length || 0) >= PAGE_SIZE,
          spotify: (data.tracksBySource?.spotify?.length || 0) >= PAGE_SIZE,
          ytmusic: (data.tracksBySource?.ytmusic?.length || 0) >= PAGE_SIZE,
          amazon: (data.tracksBySource?.amazon?.length || 0) >= PAGE_SIZE,
        });
        setHasMore({
          tracks: next.tracks.length >= PAGE_SIZE,
          albums: next.albums.length >= PAGE_SIZE,
          artists: next.artists.length >= PAGE_SIZE,
          playlists: next.playlists.length >= PAGE_SIZE,
        });
      } catch {
        // Failed search request: leave the four categories empty so the page
        // renders the "Nothing found" state instead of hanging on the skeleton.
        if (active) {
          setTracks([]);
          setAlbums([]);
          setArtists([]);
          setPlaylists([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    setup();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Fetches one more PAGE_SIZE batch per category for a search query.
  const fetchSearchPage = useCallback(
    async (q, page) => {
      const offset = (page - 1) * PAGE_SIZE;
      const [res, communityRes] = await Promise.all([
        globalSearch(q, { limit: PAGE_SIZE, offset }),
        loadCommunityPlaylists(q, { limit: PAGE_SIZE, offset }),
      ]);
      const data = res.data?.results || res.data;
      const community = Array.isArray(communityRes) ? communityRes : [];
      return {
        tracks: data.tracks || [],
        albums: data.albums || [],
        artists: data.artists || [],
        playlists: mergePlaylists(data.playlists || [], community),
        trackSources: data.tracksBySource || null,
      };
    },
    []
  );

  const dataByCat = { tracks, albums, artists, playlists };
  const setByCat = {
    tracks: setTracks,
    albums: setAlbums,
    artists: setArtists,
    playlists: setPlaylists,
  };
  const sliceByCat = (cat) => dataByCat[cat].slice(0, shown[cat]);

  // Appends the next PAGE_SIZE batch to one search category when its
  // "Show more" button is clicked.
  const loadMoreCat = useCallback(
    async (cat) => {
      if (!searching || loading || loadingMoreCat) return;
      const q = debouncedQuery;
      const nextPage = pageRef.current + 1;
      if (nextPage * PAGE_SIZE > MAX_RESULTS) {
        setHasMore(allFalse());
        return;
      }
      busyRef.current = true;
      setLoadingMoreCat(cat);
      try {
        const next = await fetchSearchPage(q, nextPage);
        // Query may have changed while the fetch was in flight — never append
        // the previous query's page to the new results.
        if (q !== queryRef.current) return;
        CATS.forEach((c) => {
          setByCat[c]((prev) => addUnique(prev, next[c], KEY_FN[c]).slice(0, MAX_RESULTS));
        });
        setHasMore({
          tracks: next.tracks.length >= PAGE_SIZE,
          albums: next.albums.length >= PAGE_SIZE,
          artists: next.artists.length >= PAGE_SIZE,
          playlists: next.playlists.length >= PAGE_SIZE,
        });
        setShown((prev) => ({ ...prev, [cat]: Math.min(prev[cat] + PAGE_SIZE, MAX_RESULTS) }));
        pageRef.current = nextPage;
      } catch {
        setHasMore(allFalse());
      } finally {
        busyRef.current = false;
        setLoadingMoreCat(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searching, loading, loadingMoreCat, debouncedQuery, fetchSearchPage]
  );

  // Appends the next PAGE_SIZE batch to a single provider's track group when
  // its "Show more" button is clicked (e.g. "Tracks · Spotify → more Spotify
  // tracks"). Uses the same page cursor as the category sections.
  const loadMoreSource = useCallback(
    async (src) => {
      if (!searching || loading || loadingMoreCat || busyRef.current) return;
      const q = debouncedQuery;
      const nextPage = pageRef.current + 1;
      if (nextPage * PAGE_SIZE > MAX_RESULTS) {
        setSrcHasMore((prev) => ({ ...prev, [src]: false }));
        return;
      }
      busyRef.current = true;
      setLoadingMoreCat(src);
      try {
        const next = await fetchSearchPage(q, nextPage);
        if (q !== queryRef.current) return;
        if (next.trackSources) {
          setTrackSources((prev) => {
            const cur = (prev && prev[src]) || [];
            const more = next.trackSources[src] || [];
            return { ...prev, [src]: addUnique(cur, more, trackKey).slice(0, MAX_RESULTS) };
          });
        }
        setSrcHasMore((prev) => ({
          ...prev,
          [src]: (next.trackSources && next.trackSources[src] || []).length >= PAGE_SIZE,
        }));
        setSrcShown((prev) => ({ ...prev, [src]: Math.min(prev[src] + PAGE_SIZE, MAX_RESULTS) }));
        pageRef.current = nextPage;
      } catch {
        setSrcHasMore((prev) => ({ ...prev, [src]: false }));
      } finally {
        busyRef.current = false;
        setLoadingMoreCat(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searching, loading, loadingMoreCat, debouncedQuery, fetchSearchPage]
  );
  const loadMoreRecommended = useCallback(async () => {
    if (searching || loading || loadingMoreCat || busyRef.current) return;
    const q = queryRef.current; // recommended mode has no query, but the check
    // above would have returned had a query appeared
    const nextPage = pageRef.current + 1;
    if (nextPage * PAGE_SIZE > MAX_RESULTS) {
      setRecHasMore(false);
      return;
    }
    busyRef.current = true;
    setLoadingMoreCat("tracks");
    try {
      const list = toList(await getPopularTracks({ limit: PAGE_SIZE, page: nextPage }));
      // A new search may have started mid-flight — dropping stale results
      // prevents the recommended page bleeding into the search results.
      if (q !== queryRef.current) return;
      setTracks((prev) => addUnique(prev, list, trackKey).slice(0, MAX_RESULTS));
      setRecHasMore(list.length >= PAGE_SIZE);
      pageRef.current = nextPage;
    } catch {
      setRecHasMore(false);
    } finally {
      busyRef.current = false;
      setLoadingMoreCat(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searching, loading, loadingMoreCat]);

  // Fire loadMoreRecommended when the page-bottom sentinel scrolls into view.
  useEffect(() => {
    if (loading || searching || !recHasMore) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMoreRecommended();
      },
      { rootMargin: "300px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, searching, recHasMore, loadMoreRecommended]);

  const items = searching
    ? tracks.length + albums.length + artists.length + playlists.length
    : tracks.length;

  const sentinel = (
    <div ref={sentinelRef} className="flex items-center justify-center py-8">
      {loadingMoreCat && (
        <span className="grid h-5 w-5 place-items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-brand dark:border-white/20" />
        </span>
      )}
      {!recHasMore && tracks.length >= MAX_RESULTS && (
        <p className="text-xs text-black/30 dark:text-white/30">
          You've reached the end — all {MAX_RESULTS} loaded.
        </p>
      )}
    </div>
  );

  return (
    <div>
      <Input
        autoFocus
        placeholder="Search tracks, albums, artists & playlists..."
        icon={SearchIcon}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="mb-8 max-w-xl py-3"
        rightSlot={
          <>
            {loading && searching && (
              <span className="grid h-5 w-5 place-items-center">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-brand dark:border-white/20" />
              </span>
            )}
            {query && !loading && (
              <button
                onClick={() => setQuery("")}
                aria-label="Clear search"
                title="Clear"
                className="grid h-6 w-6 place-items-center rounded-full text-black/40 transition-colors hover:bg-black/10 hover:text-black dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </>
        }
      />

      {!searching && (
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-semibold">Recommended for You</h2>
          {tracks.length > 0 && (
            <p className="text-sm text-black/40 dark:text-white/40">
              {tracks.length}
              {tracks.length >= MAX_RESULTS ? ` songs (max ${MAX_RESULTS})` : " songs"}
            </p>
          )}
        </div>
      )}
      {searching && (
        <p className="mb-4 text-sm text-black/40 dark:text-white/40">
          Results for "
          <span className="text-black/70 dark:text-white/70">{debouncedQuery}</span>"
          <span className="ml-2 text-black/30 dark:text-white/30">
            · {items} items
          </span>
        </p>
      )}

      {loading ? (
        <SkeletonRows count={8} />
      ) : !searching ? (
        tracks.length ? (
          <>
            <TrackList tracks={tracks} />
            {sentinel}
          </>
        ) : (
          <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
            No recommendations right now. Check back soon.
          </p>
        )
      ) : items ? (
        <>
          {trackSources ? (
            // New backend: tracks grouped by provider, one section per API.
            SOURCES.map(({ key, label }) => {
              const list = trackSources[key] || [];
              if (!list.length) return null;
              // When a provider is down the backend fills its group with Saavn
              // rows tagged `fallbackOf`. Surface that instead of silently
              // presenting Saavn songs as e.g. "YouTube Music".
              const fallback = key !== "saavn" && list.some((t) => t && t.fallbackOf === key);
              return (
                <Section
                  key={key}
                  icon={TrackIcon}
                  title={`Tracks · ${label}`}
                  count={list.length}
                  onMore={srcHasMore[key] ? () => loadMoreSource(key) : null}
                  loading={loadingMoreCat === key}
                >
                  {fallback && (
                    <p className="mb-3 rounded-lg border border-black/5 bg-black/[0.03] px-3 py-2 text-xs text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                      {label} is unavailable right now — showing Saavn matches instead.
                    </p>
                  )}
                  <TrackList tracks={list.slice(0, srcShown[key])} />
                </Section>
              );
            })
          ) : (
            tracks.length > 0 && (
              <Section
                icon={TrackIcon}
                title="Tracks"
                count={tracks.length}
                onMore={hasMore.tracks ? () => loadMoreCat("tracks") : null}
                loading={loadingMoreCat === "tracks"}
              >
                <TrackList tracks={sliceByCat("tracks")} />
              </Section>
            )
          )}
          {albums.length > 0 && (
            <Section
              icon={AlbumIcon}
              title="Albums"
              count={albums.length}
              onMore={hasMore.albums ? () => loadMoreCat("albums") : null}
              loading={loadingMoreCat === "albums"}
            >
              <AlbumGrid albums={sliceByCat("albums")} />
            </Section>
          )}
          {artists.length > 0 && (
            <Section
              icon={ArtistIcon}
              title="Artists"
              count={artists.length}
              onMore={hasMore.artists ? () => loadMoreCat("artists") : null}
              loading={loadingMoreCat === "artists"}
            >
              <ArtistGrid artists={sliceByCat("artists")} />
            </Section>
          )}
          {playlists.length > 0 && (
            <Section
              icon={PlaylistIcon}
              title="Playlists"
              count={playlists.length}
              onMore={hasMore.playlists ? () => loadMoreCat("playlists") : null}
              loading={loadingMoreCat === "playlists"}
            >
              <div className={GRID}>
                {sliceByCat("playlists").map((p, i) => (
                  <PlaylistCard key={`${p.source || "own"}:${p.id || p._id}`} playlist={p} index={i} />
                ))}
              </div>
            </Section>
          )}
        </>
      ) : (
        <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
          Nothing found for "{debouncedQuery}". Try a different search.
        </p>
      )}
    </div>
  );
}