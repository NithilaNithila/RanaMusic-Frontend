import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getMyPlaylists, deletePlaylist, getPublicPlaylists } from "../api/playlistApi";
import { globalSearch } from "../api/searchApi";
import { useDebounce } from "../hooks/useDebounce";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal.jsx";
import Section from "../components/common/Section.jsx";
import Button from "../components/common/Button.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import SkeletonCardGrid from "../components/common/SkeletonCardGrid.jsx";

import LibrarySearch from "../components/library/LibrarySearch.jsx";

const CATALOG_LIMIT = 60;
const PAGE_SIZE = 12;

const GRID = "card-grid";

const toList = (res) => {
  if (res?.data?.results) return res.data.results;
  if (res?.data) return res.data;
  return Array.isArray(res) ? res : [];
};

const idKey = (x) => {
  if (!x) return null;
  if (x.id != null) return x.id;
  if (x._id != null) return x._id;
  return null;
};

const mergePlaylists = (catalog = [], community = []) => {
  const seen = new Set();
  const out = [];
  [...catalog, ...community].forEach((p) => {
    const k = idKey(p);
    if (!k || seen.has(k)) return;
    seen.add(k);
    out.push(p);
  });
  return out;
};

const loadCommunityPlaylists = async (val, params) => {
  try {
    const res = await getPublicPlaylists(val, params);
    return Array.isArray(toList(res)) ? toList(res) : [];
  } catch {
    return [];
  }
};

const LibraryIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <path d="M8 4v16" />
    <path d="M12 4v16" />
    <path d="M16 4v16" />
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

function TrendingError({ onRetry }) {
  return (
    <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.03] px-6 py-10 text-center dark:border-white/15 dark:bg-white/[0.03]">
      <p className="font-medium">Couldn't load trending playlists</p>
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

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [trending, setTrending] = useState([]);
  const [trendingVisible, setTrendingVisible] = useState(PAGE_SIZE);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingLoadingMore, setTrendingLoadingMore] = useState(false);
  const [trendingError, setTrendingError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [ownVisible, setOwnVisible] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");

  // Global search: playlist results only (catalog + community + own)
  const [searchPlaylists, setSearchPlaylists] = useState([]);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const searchSeenRef = useRef(new Set());
  const searchPageRef = useRef(1);

  const debouncedSearch = useDebounce(query, 400);
  const searching = Boolean(debouncedSearch.trim());

  const q = query.trim().toLowerCase();

  useEffect(() => {
    setOwnVisible(PAGE_SIZE);
    setTrendingVisible(PAGE_SIZE);
  }, [q]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMyPlaylists()
      .then((res) => {
        if (active) setPlaylists(res.data || []);
      })
      .catch(() => {
        if (active) setPlaylists([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // Generic music terms used to collect a broad set of trending playlists
  // across all providers via the global search endpoint (which supports
  // `offset` pagination, unlike /playlists/catalog which is capped at 20).
  const TRENDING_TERMS = ["top", "hits", "popular", "love", "dance", "best"];

  const trendingQueryRef = useRef(0);

  const fetchTrendingPage = async (offset) => {
    const pools = await Promise.allSettled(
      TRENDING_TERMS.map((term) =>
        globalSearch(term, {
          type: "playlist",
          limit: CATALOG_LIMIT,
          offset,
        }).then((res) => res.data?.playlists || res.data || [])
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

  useEffect(() => {
    let active = true;
    setTrendingLoading(true);
    setTrendingError(false);
    // Load the first chunk (PAGE_SIZE) of trending playlists on mount.
    fetchTrendingPage(0)
      .then((list) => {
        if (active) {
          setTrending(list);
          setTrendingVisible(PAGE_SIZE);
        }
      })
      .catch(() => {
        if (active) setTrendingError(true);
      })
      .finally(() => {
        if (active) setTrendingLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey]);

  const loadMoreTrending = async () => {
    if (trendingLoading || trendingLoadingMore) return;
    const id = ++trendingQueryRef.current;
    setTrendingLoadingMore(true);
    try {
      const fresh = await fetchTrendingPage(trendingVisible);
      setTrending((prev) => {
        if (trendingQueryRef.current !== id) return prev;
        const seen = new Set(prev.map((p) => p.id ?? p._id));
        return [...prev, ...fresh.filter((p) => !seen.has(p.id) && !seen.has(p._id))];
      });
      setTrendingVisible((v) => v + PAGE_SIZE);
    } catch {
      /* keep the list unchanged on failure */
    } finally {
      setTrendingLoadingMore(false);
    }
  };

  // First page of global playlist search results whenever the query changes
  useEffect(() => {
    const trimmed = debouncedSearch.trim();
    searchSeenRef.current = new Set();
    if (!trimmed) {
      setSearchPlaylists([]);
      setSearchHasMore(false);
      searchPageRef.current = 1;
      return;
    }
    let active = true;
    setSearchLoading(true);
    searchPageRef.current = 1;
    Promise.all([
      globalSearch(trimmed, { type: "playlist", limit: PAGE_SIZE, offset: 0 }).then(
        (res) => res.data?.playlists || res.data || []
      ),
      loadCommunityPlaylists(trimmed, { limit: PAGE_SIZE, offset: 0 }),
    ])
      .then(([catalog, community]) => {
        if (!active) return;
        const combined = mergePlaylists(
          mergePlaylists(catalog, community),
          playlists.filter((p) => byName(p.name))
        );
        combined.forEach((p) => {
          const k = idKey(p);
          if (k) searchSeenRef.current.add(k);
        });
        setSearchPlaylists(combined);
        setSearchHasMore(combined.length >= PAGE_SIZE);
      })
      .catch(() => {
        if (active) setSearchPlaylists([]);
      })
      .finally(() => {
        if (active) setSearchLoading(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const loadMoreSearchPlaylists = async () => {
    if (!searching || searchLoading || searchLoadingMore) return;
    const trimmed = debouncedSearch.trim();
    const nextPage = searchPageRef.current + 1;
    setSearchLoadingMore(true);
    try {
      let fresh = [];
      for (let attempt = 0; attempt < 4 && fresh.length < PAGE_SIZE; attempt++) {
        const offset = (nextPage - 1) * PAGE_SIZE + fresh.length;
        const [catalog, community] = await Promise.all([
          globalSearch(trimmed, { type: "playlist", limit: PAGE_SIZE, offset }).then(
            (res) => res.data?.playlists || res.data || []
          ),
          loadCommunityPlaylists(trimmed, { limit: PAGE_SIZE, offset }),
        ]);
        const combined = mergePlaylists(
          mergePlaylists(catalog, community),
          playlists.filter((p) => byName(p.name))
        );
        if (!combined.length) break;
        for (const p of combined) {
          const k = idKey(p);
          if (!k || searchSeenRef.current.has(k)) continue;
          searchSeenRef.current.add(k);
          fresh.push(p);
          if (fresh.length >= PAGE_SIZE) break;
        }
      }
      if (!fresh.length) {
        setSearchHasMore(false);
        return;
      }
      setSearchPlaylists((prev) => [...prev, ...fresh]);
      setSearchHasMore(fresh.length >= PAGE_SIZE);
      searchPageRef.current = nextPage;
    } catch {
      setSearchHasMore(false);
    } finally {
      setSearchLoadingMore(false);
    }
  };

  const handleDeletePlaylist = async (p) => {
    try {
      await deletePlaylist(p._id);
      setPlaylists((prev) => prev.filter((x) => x._id !== p._id));
    } catch {
      /* keep the playlist in the list on failure */
    }
  };

  const byName = (name) => !q || (name || "").toLowerCase().includes(q);
  const filteredOwn = playlists.filter((p) => byName(p.name));
  const filteredTrending = trending.filter((p) => byName(p.name));

  const [modalInitialName, setModalInitialName] = useState("");
  const openCreate = (initialName = "") => {
    setModalInitialName(initialName || "");
    setModalOpen(true);
  };

  return (
    <div className="relative animate-fadeIn">

      {/* ===== Header ===== */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-premium-primary to-premium-secondary text-white shadow-lg shadow-premium-primary/35 ring-1 ring-white/25">
            {LibraryIcon}
          </span>
          <div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-black sm:text-5xl dark:text-white">
              Library
            </h1>
            <p className="mt-1.5 text-sm text-black/55 sm:text-base dark:text-white/55">
              {loading
                ? "Loading…"
                : `${playlists.length} playlist${playlists.length === 1 ? "" : "s"} you've collected`}
            </p>
          </div>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/40 dark:text-white/40">
          <span className="h-1.5 w-1.5 rounded-full bg-premium-primary" />
          Last updated today
        </p>
      </motion.div>

      {/* ===== Toolbar: search + new playlist ===== */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: "easeOut" }}
        className="mt-10 flex flex-row items-center justify-between gap-3"
      >
        <LibrarySearch
          value={query}
          onChange={setQuery}
          loading={searchLoading && searching}
          onClear={() => setQuery("")}
        />
        <Button
          variant="gradient"
          ripple
          size="lg"
          onClick={() => openCreate("")}
          aria-label="Create a new playlist"
          className="shrink-0 px-8"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Playlist
        </Button>
      </motion.div>

      {searching ? (
        <p className="mb-8 mt-8 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-2xl border border-black/10 bg-white/50 px-4 py-3 text-sm text-black/45 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
          Results for "
          <span className="font-semibold text-black/85 dark:text-white/85">{debouncedSearch.trim()}</span>"
          <span className="text-black/35 dark:text-white/35">
            · {searchPlaylists.length} playlist
            {searchPlaylists.length === 1 ? "" : "s"} found
          </span>
        </p>
      ) : q ? (
        <p className="mb-8 mt-8 flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-2xl border border-black/10 bg-white/50 px-4 py-3 text-sm text-black/45 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
          Results for "
          <span className="font-semibold text-black/85 dark:text-white/85">{query.trim()}</span>"
          <span className="text-black/35 dark:text-white/35">
            · {filteredOwn.length + filteredTrending.length} playlist
            {(filteredOwn.length + filteredTrending.length === 1 ? "" : "s")} found
          </span>
        </p>
      ) : null}

      {searching ? (
        <Section
          title="Playlists"
          subtitle={`Playlist results for "${debouncedSearch.trim()}"`}
        >
          {searchLoading ? (
            <SkeletonCardGrid count={12} />
          ) : searchPlaylists.length ? (
            <>
              <div className={GRID}>
                {searchPlaylists.map((p, i) => (
                  <PlaylistCard
                    key={`${p.source || "own"}:${p.id || p._id}`}
                    playlist={p}
                    index={i}
                  />
                ))}
              </div>
              {searchHasMore && (
                <ShowMoreButton
                  loading={searchLoadingMore}
                  onClick={loadMoreSearchPlaylists}
                />
              )}
            </>
          ) : (
            <div className="relative overflow-hidden rounded-[24px] border border-black/10 bg-white/50 px-6 py-14 text-center shadow-lg shadow-black/[0.05] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:shadow-black/25">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-16 left-1/2 h-40 w-64 -translate-x-1/2 rounded-full bg-premium-primary/20 blur-3xl dark:bg-premium-primary/25"
              />
              <span className="relative mx-auto mb-5 grid h-16 w-16 animate-floatY place-items-center rounded-2xl bg-gradient-to-br from-premium-primary/25 to-premium-secondary/25 text-premium-primary ring-1 ring-premium-primary/30 dark:text-white">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </span>
              <p className="text-lg font-bold text-black dark:text-white">
                No playlists found for "{debouncedSearch.trim()}"
              </p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-black/45 dark:text-white/45">
                Be the curator — start a playlist from this search term and collect the tracks you love.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="gradient" ripple onClick={() => openCreate(debouncedSearch.trim())}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create playlist for this search
                </Button>
                <Button variant="secondary" onClick={() => setQuery("")}>
                  Clear search
                </Button>
              </div>
            </div>
          )}
        </Section>
      ) : (
        <>
      <Section
        title="Trending Playlists"
        subtitle="Curated from Spotify, YouTube Music & Amazon Music"
        className="mt-12"
      >
        {trendingLoading ? (
          <SkeletonCardGrid count={8} />
        ) : trendingError ? (
          <TrendingError onRetry={() => setReloadKey((k) => k + 1)} />
        ) : filteredTrending.length ? (
          <>
            <div className={GRID}>
              {filteredTrending.slice(0, trendingVisible).map((p, i) => (
                <PlaylistCard key={`${p.source}:${p.id}`} playlist={p} index={i} />
              ))}
            </div>
            {trendingVisible < filteredTrending.length && (
              <ShowMoreButton
                loading={trendingLoadingMore}
                onClick={loadMoreTrending}
              />
            )}
          </>
        ) : (
          <p className="rounded-[20px] border border-black/10 bg-white/50 p-6 text-center text-sm text-black/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/40">
            {q ? `No trending playlists match "${query.trim()}".` : "No trending playlists available right now."}
          </p>
        )}
      </Section>

      <Section
        title="Your Playlists"
        subtitle="Hand-picked by you — tracks you want to keep close"
      >
        {loading ? (
          <SkeletonCardGrid count={8} />
        ) : filteredOwn.length ? (
          <>
            <div className={GRID}>
              {filteredOwn.slice(0, ownVisible).map((p, i) => (
                <PlaylistCard key={p._id} playlist={p} index={i} onDelete={handleDeletePlaylist} />
              ))}
            </div>
            {ownVisible < filteredOwn.length && (
              <ShowMoreButton
                loading={false}
                onClick={() => setOwnVisible((v) => v + PAGE_SIZE)}
              />
            )}
          </>
        ) : playlists.length ? (
          <p className="rounded-[20px] border border-black/10 bg-white/50 p-6 text-center text-sm text-black/40 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] dark:text-white/40">
            No playlists match "{query.trim()}".
          </p>
        ) : (
          <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.03] px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.03]">
            <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand/10 text-brand animate-floatY">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </span>
            <p className="font-medium">No playlists yet</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-black/40 dark:text-white/40">
              Create your first playlist and start collecting the tracks you love.
            </p>
            <Button onClick={() => openCreate("")} variant="outline" className="mt-5">
              Create a playlist
            </Button>
          </div>
        )}
      </Section>
        </>
      )}

      <CreatePlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(p) => setPlaylists((prev) => [...prev, p])}
        initialName={modalInitialName}
      />
    </div>
  );
}