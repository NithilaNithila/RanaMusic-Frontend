import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { getPopularTracks, searchTracks } from "../api/trackApi";
import { getAlbums, searchAlbums } from "../api/albumApi";
import { getArtists, searchArtists } from "../api/artistApi";
import { globalSearch } from "../api/searchApi";
import { getPublicPlaylists } from "../api/playlistApi";
import { usePlayer } from "../hooks/useAudioPlayer";
import { useDebounce } from "../hooks/useDebounce";
import { LANGUAGES } from "../context/LanguageContext";
import { mergePlaylists } from "../utils/helpers";

import Section from "../components/common/Section.jsx";
import RevealItem from "../components/common/RevealItem.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import TrackCard from "../components/track/TrackCard.jsx";
import TrackList from "../components/track/TrackList.jsx";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ArtistGrid from "../components/artist/ArtistGrid.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import Loader from "../components/common/Loader.jsx";
import SkeletonRows from "../components/common/SkeletonRows.jsx";
import Input from "../components/common/Input.jsx";

const PAGE_SIZE = 12;
const MAX_FETCH_ATTEMPTS = 6;

const BackIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const SearchIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export default function LanguageDetail() {
  const { lang } = useParams();
  const meta = LANGUAGES.find((l) => l.code === lang);
  const { playTrack } = usePlayer();

  const [tracks, setTracks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [trackPage, setTrackPage] = useState(1);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [albumVisible, setAlbumVisible] = useState(PAGE_SIZE);
  const [albumPage, setAlbumPage] = useState(1);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [artists, setArtists] = useState([]);
  const [artistVisible, setArtistVisible] = useState(PAGE_SIZE);
  const [artistOffset, setArtistOffset] = useState(PAGE_SIZE);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [playlistVisible, setPlaylistVisible] = useState(PAGE_SIZE);
  const [hasMorePlaylists, setHasMorePlaylists] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const playlistSeenRef = useRef(new Set());
  const [loading, setLoading] = useState(true);

  // Search inside this language
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 400);
  const searching = Boolean(debouncedQuery.trim());
  const [searchResults, setSearchResults] = useState([]);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const searchSeenRef = useRef(new Set());
  const [albumResults, setAlbumResults] = useState([]);
  const [searchAlbumsHasMore, setSearchAlbumsHasMore] = useState(false);
  const [searchAlbumLoading, setSearchAlbumLoading] = useState(false);
  const [searchAlbumLoadingMore, setSearchAlbumLoadingMore] = useState(false);
  const albumSeenRef = useRef(new Set());
  const [artistResults, setArtistResults] = useState([]);
  const [searchArtistsHasMore, setSearchArtistsHasMore] = useState(false);
  const [searchArtistLoading, setSearchArtistLoading] = useState(false);
  const [searchArtistLoadingMore, setSearchArtistLoadingMore] = useState(false);
  const artistSearchSeenRef = useRef(new Set());
  const [playlistResults, setPlaylistResults] = useState([]);
  const [searchPlaylistsHasMore, setSearchPlaylistsHasMore] = useState(false);
  const [searchPlaylistLoading, setSearchPlaylistLoading] = useState(false);
  const [searchPlaylistLoadingMore, setSearchPlaylistLoadingMore] = useState(false);
  const playlistSearchSeenRef = useRef(new Set());

  useEffect(() => {
    setQuery("");
    setSearchResults([]);
    setAlbumResults([]);
    setArtistResults([]);
    setPlaylistResults([]);
    searchSeenRef.current = new Set();
    albumSeenRef.current = new Set();
    artistSearchSeenRef.current = new Set();
    playlistSearchSeenRef.current = new Set();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // First page of language-scoped search results whenever the query changes
  useEffect(() => {
    const trimmed = debouncedQuery.trim();
    if (!trimmed || !meta) {
      setSearchResults([]);
      setAlbumResults([]);
      setArtistResults([]);
      setPlaylistResults([]);
      setSearchHasMore(false);
      setSearchAlbumsHasMore(false);
      setSearchArtistsHasMore(false);
      setSearchPlaylistsHasMore(false);
      searchSeenRef.current = new Set();
      albumSeenRef.current = new Set();
      artistSearchSeenRef.current = new Set();
      playlistSearchSeenRef.current = new Set();
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    setSearchAlbumLoading(true);
    setSearchArtistLoading(true);
    setSearchPlaylistLoading(true);
    searchSeenRef.current = new Set();
    albumSeenRef.current = new Set();
    artistSearchSeenRef.current = new Set();
    playlistSearchSeenRef.current = new Set();
    const opts = { limit: PAGE_SIZE, lang: meta.code };
    Promise.allSettled([
      searchTracks(trimmed, opts),
      searchAlbums(trimmed, opts),
      searchArtists(trimmed, { limit: PAGE_SIZE, page: 1 }),
      Promise.all([
        globalSearch(trimmed, { type: "playlist", limit: PAGE_SIZE, offset: 0 }).then(
          (res) => res.data?.playlists || res.data || []
        ),
        getPublicPlaylists(trimmed, {
          limit: PAGE_SIZE,
          offset: 0,
          language: meta.code,
        }).catch(() => null),
      ]),
    ])
      .then(([tRes, aRes, arRes, plRes]) => {
        if (cancelled) return;
        if (tRes.status === "fulfilled") {
          const results = tRes.value.data.results || tRes.value.data || [];
          results.forEach((t) => t && t.id && searchSeenRef.current.add(String(t.id)));
          setSearchResults(results);
          setSearchHasMore(results.length >= PAGE_SIZE);
        } else {
          setSearchResults([]);
          setSearchHasMore(false);
        }
        if (aRes.status === "fulfilled") {
          const results = aRes.value.data.results || aRes.value.data || [];
          results.forEach((a) => a && a.id && albumSeenRef.current.add(String(a.id)));
          setAlbumResults(results);
          setSearchAlbumsHasMore(results.length >= PAGE_SIZE);
        } else {
          setAlbumResults([]);
          setSearchAlbumsHasMore(false);
        }
        if (arRes.status === "fulfilled") {
          const results = arRes.value.data.results || arRes.value.data || [];
          results.forEach((a) => a && a.id && artistSearchSeenRef.current.add(String(a.id)));
          setArtistResults(results);
          setSearchArtistsHasMore(results.length >= PAGE_SIZE);
        } else {
          setArtistResults([]);
          setSearchArtistsHasMore(false);
        }
        if (plRes.status === "fulfilled") {
          const [provider, pubRes] = plRes.value;
          const publicList = pubRes ? pubRes.data?.results || pubRes.data || [] : [];
          const combined = mergePlaylists(provider, publicList);
          combined.forEach((p) => {
            const k = p.id ?? p._id;
            if (k) playlistSearchSeenRef.current.add(String(k));
          });
          setPlaylistResults(combined);
          setSearchPlaylistsHasMore(combined.length >= PAGE_SIZE);
        } else {
          setPlaylistResults([]);
          setSearchPlaylistsHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSearchLoading(false);
          setSearchAlbumLoading(false);
          setSearchArtistLoading(false);
          setSearchPlaylistLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleSearchMore = async () => {
    if (searchLoadingMore || !searchHasMore || !meta || !searching) return;
    setSearchLoadingMore(true);
    try {
      const start = searchResults.length;
      let fresh = [];
      for (let attempt = 0; attempt < 4 && fresh.length < PAGE_SIZE; attempt++) {
        const offset = start + fresh.length;
        const res = await searchTracks(debouncedQuery.trim(), {
          limit: PAGE_SIZE,
          offset,
          lang: meta.code,
        });
        const results = res.data.results || res.data || [];
        if (!results.length) break;
        for (const t of results) {
          if (t && t.id && !searchSeenRef.current.has(String(t.id))) {
            searchSeenRef.current.add(String(t.id));
            fresh.push(t);
          }
        }
      }
      if (!fresh.length) {
        setSearchHasMore(false);
        return;
      }
      setSearchResults((prev) => [...prev, ...fresh]);
      setSearchHasMore(fresh.length >= PAGE_SIZE);
    } catch {
      setSearchHasMore(false);
    } finally {
      setSearchLoadingMore(false);
    }
  };

  const handleSearchAlbumsMore = async () => {
    if (searchAlbumLoadingMore || !searchAlbumsHasMore || !meta || !searching) return;
    setSearchAlbumLoadingMore(true);
    try {
      const start = albumResults.length;
      let fresh = [];
      for (let attempt = 0; attempt < 4 && fresh.length < PAGE_SIZE; attempt++) {
        const offset = start + fresh.length;
        const res = await searchAlbums(debouncedQuery.trim(), {
          limit: PAGE_SIZE,
          offset,
          lang: meta.code,
        });
        const results = res.data.results || res.data || [];
        if (!results.length) break;
        for (const a of results) {
          if (a && a.id && !albumSeenRef.current.has(String(a.id))) {
            albumSeenRef.current.add(String(a.id));
            fresh.push(a);
          }
        }
      }
      if (!fresh.length) {
        setSearchAlbumsHasMore(false);
        return;
      }
      setAlbumResults((prev) => [...prev, ...fresh]);
      setSearchAlbumsHasMore(fresh.length >= PAGE_SIZE);
    } catch {
      setSearchAlbumsHasMore(false);
    } finally {
      setSearchAlbumLoadingMore(false);
    }
  };

  const handleSearchArtistsMore = async () => {
    if (searchArtistLoadingMore || !searchArtistsHasMore || !meta || !searching) return;
    setSearchArtistLoadingMore(true);
    try {
      const start = artistResults.length;
      let fresh = [];
      let page = Math.floor(start / PAGE_SIZE) + 1;
      for (let attempt = 0; attempt < 4 && fresh.length < PAGE_SIZE; attempt++) {
        const res = await searchArtists(debouncedQuery.trim(), {
          limit: PAGE_SIZE,
          page,
        });
        const results = res.data.results || res.data || [];
        page += 1;
        if (!results.length) break;
        for (const a of results) {
          if (a && a.id && !artistSearchSeenRef.current.has(String(a.id))) {
            artistSearchSeenRef.current.add(String(a.id));
            fresh.push(a);
            if (fresh.length >= PAGE_SIZE) break;
          }
        }
      }
      if (!fresh.length) {
        setSearchArtistsHasMore(false);
        return;
      }
      setArtistResults((prev) => [...prev, ...fresh]);
      setSearchArtistsHasMore(fresh.length >= PAGE_SIZE);
    } catch {
      setSearchArtistsHasMore(false);
    } finally {
      setSearchArtistLoadingMore(false);
    }
  };

  const handleSearchPlaylistsMore = async () => {
    if (searchPlaylistLoadingMore || !searchPlaylistsHasMore || !meta || !searching) return;
    setSearchPlaylistLoadingMore(true);
    try {
      const start = playlistResults.length;
      let fresh = [];
      for (let attempt = 0; attempt < 4 && fresh.length < PAGE_SIZE; attempt++) {
        const offset = start + fresh.length;
        const [pRes, pubRes] = await Promise.all([
          globalSearch(debouncedQuery.trim(), {
            type: "playlist",
            limit: PAGE_SIZE,
            offset,
          }).then((res) => res.data?.playlists || res.data || []),
          getPublicPlaylists(debouncedQuery.trim(), {
            limit: PAGE_SIZE,
            offset,
            language: meta.code,
          }).catch(() => null),
        ]);
        const publicList = pubRes ? pubRes.data?.results || pubRes.data || [] : [];
        const combined = mergePlaylists(pRes, publicList);
        if (!combined.length) break;
        for (const p of combined) {
          const k = p.id ?? p._id;
          if (k && !playlistSearchSeenRef.current.has(String(k))) {
            playlistSearchSeenRef.current.add(String(k));
            fresh.push(p);
            if (fresh.length >= PAGE_SIZE) break;
          }
        }
      }
      if (!fresh.length) {
        setSearchPlaylistsHasMore(false);
        return;
      }
      setPlaylistResults((prev) => [...prev, ...fresh]);
      setSearchPlaylistsHasMore(fresh.length >= PAGE_SIZE);
    } catch {
      setSearchPlaylistsHasMore(false);
    } finally {
      setSearchPlaylistLoadingMore(false);
    }
  };

  useEffect(() => {
    let active = true;
    setTracks([]);
    setVisibleCount(PAGE_SIZE);
    setTrackPage(1);
    setHasMoreTracks(true);
    setAlbums([]);
    setAlbumVisible(PAGE_SIZE);
    setAlbumPage(1);
    setHasMoreAlbums(true);
    setArtists([]);
    setArtistVisible(PAGE_SIZE);
    setArtistOffset(PAGE_SIZE);
    setHasMoreArtists(true);
    setPlaylists([]);
    setPlaylistVisible(PAGE_SIZE);
    setHasMorePlaylists(true);
    playlistSeenRef.current = new Set();
    setLoading(true);

    if (!meta) {
      setLoading(false);
      return;
    }

    Promise.allSettled([
      getPopularTracks({ limit: PAGE_SIZE, lang: meta.code }),
      getAlbums({ limit: PAGE_SIZE, lang: meta.code }),
      getArtists({ limit: PAGE_SIZE, lang: meta.code }),
      globalSearch(meta.label, { type: "playlist", limit: PAGE_SIZE, offset: 0 }).then(
        (res) => res.data?.playlists || res.data || []
      ),
    ]).then(([tRes, aRes, arRes, pRes]) => {
      if (!active) return;
      if (tRes.status === "fulfilled") {
        setTracks(tRes.value.data.results || tRes.value.data || []);
      }
      if (aRes.status === "fulfilled") {
        setAlbums(aRes.value.data.results || aRes.value.data || []);
      }
      if (arRes.status === "fulfilled") {
        setArtists(arRes.value.data.results || arRes.value.data || []);
      }
      if (pRes.status === "fulfilled") {
        const list = pRes.value || [];
        list.forEach((p) => p && p.id && playlistSeenRef.current.add(String(p.id)));
        setPlaylists(list);
        setHasMorePlaylists(list.length >= PAGE_SIZE);
      } else {
        setHasMorePlaylists(false);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [lang]);

  const handleShowMore = async () => {
    if (loadingMore || !hasMoreTracks || !meta) return;
    const target = visibleCount + PAGE_SIZE;
    if (tracks.length >= target) {
      setVisibleCount(target);
      return;
    }
    setLoadingMore(true);
    try {
      let pool = [...tracks];
      let page = trackPage;
      for (let i = 0; i < MAX_FETCH_ATTEMPTS && pool.length < target; i++) {
        const res = await getPopularTracks({
          limit: PAGE_SIZE,
          page,
          lang: meta.code,
        });
        const next = res.data.results || res.data || [];
        page += 1;
        if (!next.length) break;
        const seen = new Set(pool.map((t) => t.id));
        pool = [...pool, ...next.filter((t) => t.id && !seen.has(t.id))];
      }
      setTracks(pool);
      setTrackPage(page);
      setVisibleCount(target);
      setHasMoreTracks(pool.length > tracks.length);
    } catch {
      setHasMoreTracks(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleShowMoreAlbums = async () => {
    if (loadingAlbums || !hasMoreAlbums || !meta) return;
    const target = albumVisible + PAGE_SIZE;
    if (albums.length >= target) {
      setAlbumVisible(target);
      return;
    }
    setLoadingAlbums(true);
    try {
      let pool = [...albums];
      let page = albumPage;
      for (let i = 0; i < MAX_FETCH_ATTEMPTS && pool.length < target; i++) {
        const res = await getAlbums({ limit: PAGE_SIZE, page, lang: meta.code });
        const next = res.data.results || res.data || [];
        page += 1;
        if (!next.length) break;
        const seen = new Set(pool.map((a) => a.id));
        pool = [...pool, ...next.filter((a) => a.id && !seen.has(a.id))];
      }
      setAlbums(pool);
      setAlbumPage(page);
      setAlbumVisible(target);
      setHasMoreAlbums(pool.length > albums.length);
    } catch {
      setHasMoreAlbums(false);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const handleShowMoreArtists = async () => {
    if (loadingArtists || !hasMoreArtists || !meta) return;
    setLoadingArtists(true);
    try {
      const res = await getArtists({
        limit: PAGE_SIZE,
        offset: artistOffset,
        lang: meta.code,
      });
      const next = res.data.results || res.data || [];
      const seen = new Set(artists.map((a) => a.id));
      setArtists([...artists, ...next.filter((a) => a.id && !seen.has(a.id))]);
      setArtistOffset(artistOffset + PAGE_SIZE);
      setArtistVisible(artistVisible + PAGE_SIZE);
      setHasMoreArtists(next.length >= PAGE_SIZE);
    } catch {
      setHasMoreArtists(false);
    } finally {
      setLoadingArtists(false);
    }
  };

  const handleShowMorePlaylists = async () => {
    if (loadingPlaylists || !hasMorePlaylists || !meta) return;
    setLoadingPlaylists(true);
    try {
      // Load 12 fresh (previously unseen) playlists per click. Keeps paging
      // through the providers until 12 accumulate or the source runs dry,
      // so there is no fixed cap — the list can grow indefinitely.
      const start = playlists.length;
      let fresh = [];
      for (let attempt = 0; attempt < MAX_FETCH_ATTEMPTS && fresh.length < PAGE_SIZE; attempt++) {
        const res = await globalSearch(meta.label, {
          type: "playlist",
          limit: PAGE_SIZE,
          offset: start + fresh.length,
        });
        const next = res.data?.playlists || res.data || [];
        if (!Array.isArray(next) || !next.length) break;
        for (const p of next) {
          if (p && p.id && !playlistSeenRef.current.has(String(p.id))) {
            playlistSeenRef.current.add(String(p.id));
            fresh.push(p);
            if (fresh.length >= PAGE_SIZE) break;
          }
        }
      }
      if (!fresh.length) {
        setHasMorePlaylists(false);
        return;
      }
      setPlaylists((prev) => [...prev, ...fresh]);
      setPlaylistVisible((v) => v + fresh.length);
      setHasMorePlaylists(fresh.length >= PAGE_SIZE);
    } catch {
      setHasMorePlaylists(false);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  if (!meta) {
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <span className="mb-4 inline-block text-5xl">🌐</span>
        <h1 className="font-display text-2xl font-semibold">Language not found</h1>
        <p className="mt-2 text-sm text-black/50 dark:text-white/50">
          The language code <span className="font-semibold">"{lang}"</span> isn't supported yet.
        </p>
        <Link
          to="/languages"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-brand-300"
        >
          {BackIcon}
          Browse languages
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      key={meta.code}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <header className="mb-8">
        <div className="mb-5 flex items-center gap-3">
          <Link
            to="/languages"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-black/70 shadow-sm backdrop-blur-xl transition-colors hover:bg-white hover:text-black dark:border-white/10 dark:bg-white/[0.06] dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
          >
            {BackIcon}
            All languages
          </Link>

          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-brand/15 px-3.5 py-1.5 text-xs font-semibold text-brand dark:text-brand-200">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            Trending now
          </span>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/60 px-6 py-8 shadow-xl shadow-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05] md:px-9 md:py-10">
          <span className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/20 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-brand-300/25 blur-3xl dark:bg-brand-300/15" />
          <span className="pointer-events-none absolute bottom-4 right-6 select-none text-6xl opacity-10 md:text-7xl">
            {"\u266A"}
          </span>

          <motion.h1
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 220, damping: 24 }}
            className="font-display mb-1 bg-gradient-to-r from-brand to-brand-600 bg-clip-text text-5xl font-semibold tracking-tight text-transparent dark:from-brand-200 dark:to-brand md:text-6xl"
          >
            {meta.native}
          </motion.h1>
          <p className="text-sm font-medium text-black/60 dark:text-white/60 md:text-base">
            {meta.label} music — trending songs, fresh albums, rising artists &amp; playlists
          </p>
        </div>

        <nav className="mt-5 mb-8 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LANGUAGES.map((l) => (
            <Link
              key={l.code}
              to={`/languages/${l.code}`}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
                l.code === meta.code
                  ? "bg-brand text-black shadow-md shadow-brand/25"
                  : "border border-black/10 bg-white/60 text-black/60 hover:bg-white hover:text-black dark:border-white/10 dark:bg-white/[0.05] dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
              }`}
            >
              {l.native}
            </Link>
          ))}
        </nav>

        <div className="rounded-2xl border border-black/10 bg-white/50 p-1.5 shadow-lg shadow-black/[0.04] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.05]">
          <Input
            placeholder={`Search songs, albums, artists & playlists in ${meta.label} (${meta.code})...`}
            icon={SearchIcon}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rightSlot={
              <>
                {searchLoading && searching && (
                  <span className="grid h-5 w-5 place-items-center">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/15 border-t-brand dark:border-white/20" />
                  </span>
                )}
                {query && !searchLoading && (
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
        </div>
        {searching && !searchLoading && (
          <p className="mt-2 text-xs text-black/40 dark:text-white/40">
            Searching {meta.label} songs, albums, artists &amp; playlists — results are filtered by language.
          </p>
        )}
      </header>

      {searching ? (
        <>
          <Section
            title={`Songs in ${meta.label}`}
            subtitle={`Track results for "${debouncedQuery.trim()}"`}
          >
            {searchLoading ? (
              <SkeletonRows count={6} />
            ) : searchResults.length ? (
              <>
                <TrackList tracks={searchResults} />
                {searchHasMore && (
                  <ShowMoreButton loading={searchLoadingMore} onClick={handleSearchMore} />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No songs found for "{debouncedQuery.trim()}" in {meta.label}. Try a different search.
              </p>
            )}
          </Section>

          <Section
            title={`Albums in ${meta.label}`}
            subtitle={`Album results for "${debouncedQuery.trim()}"`}
          >
            {searchAlbumLoading ? (
              <SkeletonRows count={6} />
            ) : albumResults.length ? (
              <>
                <AlbumGrid albums={albumResults} />
                {searchAlbumsHasMore && (
                  <ShowMoreButton
                    loading={searchAlbumLoadingMore}
                    onClick={handleSearchAlbumsMore}
                  />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No albums found for "{debouncedQuery.trim()}" in {meta.label}. Try a different search.
              </p>
            )}
          </Section>

          <Section
            title={`Artists in ${meta.label}`}
            subtitle={`Artist results for "${debouncedQuery.trim()}"`}
          >
            {searchArtistLoading ? (
              <SkeletonRows count={6} />
            ) : artistResults.length ? (
              <>
                <ArtistGrid artists={artistResults} />
                {searchArtistsHasMore && (
                  <ShowMoreButton
                    loading={searchArtistLoadingMore}
                    onClick={handleSearchArtistsMore}
                  />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No artists found for "{debouncedQuery.trim()}" in {meta.label}. Try a different search.
              </p>
            )}
          </Section>

          <Section
            title={`Playlists in ${meta.label}`}
            subtitle={`Playlist results for "${debouncedQuery.trim()}"`}
          >
            {searchPlaylistLoading ? (
              <SkeletonRows count={6} />
            ) : playlistResults.length ? (
              <>
                <div className="card-grid">
                  {playlistResults.map((p, i) => (
                    <PlaylistCard
                      key={`${p.source || "search"}:${p.id || p._id}`}
                      playlist={p}
                      index={i}
                    />
                  ))}
                </div>
                {searchPlaylistsHasMore && (
                  <ShowMoreButton
                    loading={searchPlaylistLoadingMore}
                    onClick={handleSearchPlaylistsMore}
                  />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No playlists found for "{debouncedQuery.trim()}" in {meta.label}. Try a different search.
              </p>
            )}
          </Section>
        </>
      ) : loading ? (
        <Loader size="lg" />
      ) : (
        <>
          <Section title="Trending Songs" subtitle={`What's hot in ${meta.label} right now`}>
            {tracks.length ? (
              <>
                <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-gradient-to-b from-brand/[0.05] to-transparent p-3 transition-colors dark:border-white/5 sm:p-4">
                  <div className="card-grid">
                    {tracks.slice(0, visibleCount).map((t, i) => (
                      <RevealItem key={t.id} delay={Math.min(i % PAGE_SIZE, 8) * 60}>
                        <TrackCard track={t} queue={tracks} index={i} />
                      </RevealItem>
                    ))}
                  </div>
                </div>
                {hasMoreTracks && (
                  <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No trending songs found for {meta.label} right now. Try again later.
              </p>
            )}
          </Section>

          <Section title="Fresh Albums" subtitle={`New ${meta.label} releases picked for you`}>
            <AlbumGrid albums={albums.slice(0, albumVisible)} />
            {albums.length > 0 && hasMoreAlbums && (
              <ShowMoreButton loading={loadingAlbums} onClick={handleShowMoreAlbums} />
            )}
          </Section>

          <Section title="Artists on the Rise" subtitle={`Discover ${meta.label} artists who are trending`}>
            <ArtistGrid artists={artists.slice(0, artistVisible)} />
            {artists.length > 0 && hasMoreArtists && (
              <ShowMoreButton loading={loadingArtists} onClick={handleShowMoreArtists} />
            )}
          </Section>

          <Section title="Playlists" subtitle={`Curated ${meta.label} playlists from across platforms`}>
            {playlists.length ? (
              <>
                <div className="card-grid">
                  {playlists.slice(0, playlistVisible).map((p, i) => (
                    <PlaylistCard
                      key={`${p.source || "search"}:${p.id}`}
                      playlist={p}
                      index={i}
                    />
                  ))}
                </div>
                {hasMorePlaylists && (
                  <ShowMoreButton
                    loading={loadingPlaylists}
                    onClick={handleShowMorePlaylists}
                  />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No {meta.label} playlists found right now. Try again later.
              </p>
            )}
          </Section>
        </>
      )}
    </motion.div>
  );
}