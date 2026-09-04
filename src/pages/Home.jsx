import { useEffect, useRef, useState } from "react";
import { getPopularTracks } from "../api/trackApi";
import { getAlbums } from "../api/albumApi";
import { getArtists } from "../api/artistApi";
import { globalSearch } from "../api/searchApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useLanguage } from "../context/LanguageContext";

import ScrollShowcase from "../components/home/ScrollShowcase.jsx";
import ParallaxBackground from "../components/home/ParallaxBackground.jsx";
import Section from "../components/common/Section.jsx";
import RevealItem from "../components/common/RevealItem.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import TrackCard from "../components/track/TrackCard.jsx";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ArtistGrid from "../components/artist/ArtistGrid.jsx";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import Loader from "../components/common/Loader.jsx";

const TRACK_PAGE_SIZE = 12;
const MAX_FETCH_ATTEMPTS = 6;
const CATALOG_PLAYLIST_LIMIT = 60;
const CATALOG_PAGE_SIZE = 12;

const TRENDING_TERMS = ["top", "hits", "popular", "love", "dance", "best"];

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(TRACK_PAGE_SIZE);
  const [trackPage, setTrackPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [albums, setAlbums] = useState([]);
  const [albumVisible, setAlbumVisible] = useState(TRACK_PAGE_SIZE);
  const [albumPage, setAlbumPage] = useState(1);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [hasMoreAlbums, setHasMoreAlbums] = useState(true);
  const [artists, setArtists] = useState([]);
  const [artistVisible, setArtistVisible] = useState(TRACK_PAGE_SIZE);
  const [artistOffset, setArtistOffset] = useState(TRACK_PAGE_SIZE);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [hasMoreArtists, setHasMoreArtists] = useState(true);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudioPlayer();
  const { language } = useLanguage();
  const [catalogPlaylists, setCatalogPlaylists] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogVisible, setCatalogVisible] = useState(CATALOG_PAGE_SIZE);
  const [catalogLoadingMore, setCatalogLoadingMore] = useState(false);
  const trendingQueryRef = useRef(0);

  const fetchTrendingPage = async (offset) => {
    const pools = await Promise.allSettled(
      TRENDING_TERMS.map((term) =>
        globalSearch(term, {
          type: "playlist",
          limit: CATALOG_PLAYLIST_LIMIT,
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
    setCatalogLoading(true);
    fetchTrendingPage(0)
      .then((merged) => {
        if (active) {
          setCatalogPlaylists(merged);
          setCatalogLoading(false);
        }
      })
      .catch(() => {
        if (active) setCatalogLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleShowMorePlaylists = async () => {
    if (catalogLoading || catalogLoadingMore) return;
    const id = ++trendingQueryRef.current;
    setCatalogLoadingMore(true);
    try {
      const fresh = await fetchTrendingPage(catalogVisible);
      setCatalogPlaylists((prev) => {
        if (trendingQueryRef.current !== id) return prev;
        const seen = new Set(prev.map((p) => p.id ?? p._id));
        return [...prev, ...fresh.filter((p) => !seen.has(p.id) && !seen.has(p._id))];
      });
      setCatalogVisible((c) => c + CATALOG_PAGE_SIZE);
    } catch {
      /* keep list unchanged on failure */
    } finally {
      setCatalogLoadingMore(false);
    }
  };

  useEffect(() => {
    let active = true;
    setTracks([]);
    setVisibleCount(TRACK_PAGE_SIZE);
    setTrackPage(1);
    setHasMoreTracks(true);
    setAlbums([]);
    setAlbumVisible(TRACK_PAGE_SIZE);
    setAlbumPage(1);
    setHasMoreAlbums(true);
    setArtists([]);
    setArtistVisible(TRACK_PAGE_SIZE);
    setArtistOffset(TRACK_PAGE_SIZE);
    setHasMoreArtists(true);
    setLoading(true);

    Promise.allSettled([
      getPopularTracks({ limit: TRACK_PAGE_SIZE, lang: language }),
      getAlbums({ limit: TRACK_PAGE_SIZE, lang: language }),
      getArtists({ limit: TRACK_PAGE_SIZE, lang: language }),
    ]).then(([tRes, aRes, arRes]) => {
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
      setLoading(false);
    });
    return () => { active = false; };
  }, [language]);

  const handleShuffle = () => {
    if (!tracks.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  const handleShowMore = async () => {
    if (loadingMore || !hasMoreTracks) return;
    const target = visibleCount + TRACK_PAGE_SIZE;
    if (tracks.length >= target) {
      setVisibleCount(target);
      return;
    }
    setLoadingMore(true);
    try {
      let pool = [...tracks];
      let page = trackPage;
      for (let i = 0; i < MAX_FETCH_ATTEMPTS && pool.length < target; i++) {
        const res = await getPopularTracks({ limit: TRACK_PAGE_SIZE, page, lang: language });
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
    if (loadingAlbums || !hasMoreAlbums) return;
    const target = albumVisible + TRACK_PAGE_SIZE;
    if (albums.length >= target) {
      setAlbumVisible(target);
      return;
    }
    setLoadingAlbums(true);
    try {
      let pool = [...albums];
      let page = albumPage;
      for (let i = 0; i < MAX_FETCH_ATTEMPTS && pool.length < target; i++) {
        const res = await getAlbums({ limit: TRACK_PAGE_SIZE, page, lang: language });
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
    if (loadingArtists || !hasMoreArtists) return;
    setLoadingArtists(true);
    try {
      const res = await getArtists({ limit: TRACK_PAGE_SIZE, offset: artistOffset, lang: language });
      const next = res.data.results || res.data || [];
      const seen = new Set(artists.map((a) => a.id));
      setArtists([...artists, ...next.filter((a) => a.id && !seen.has(a.id))]);
      setArtistOffset(artistOffset + TRACK_PAGE_SIZE);
      setArtistVisible(artistVisible + TRACK_PAGE_SIZE);
      setHasMoreArtists(next.length >= TRACK_PAGE_SIZE);
    } catch {
      setHasMoreArtists(false);
    } finally {
      setLoadingArtists(false);
    }
  };

  return (
    <div className="relative">
      <ParallaxBackground />
      <ScrollShowcase onShuffle={handleShuffle} />

      {loading ? (
        <Loader size="lg" />
      ) : (
        <>
          <Section title="Popular Right Now" subtitle="Tracks everyone's playing today">
            {tracks.length ? (
              <>
                <div className="card-grid">
                  {tracks.slice(0, visibleCount).map((t, i) => (
                    <RevealItem key={t.id} delay={Math.min(i % TRACK_PAGE_SIZE, 8) * 60}>
                      <TrackCard track={t} queue={tracks} index={i} />
                    </RevealItem>
                  ))}
                </div>
                {hasMoreTracks && <ShowMoreButton loading={loadingMore} onClick={handleShowMore} />}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No tracks found.
              </p>
            )}
          </Section>

          <Section title="Fresh Albums" subtitle="New releases picked for you">
            <AlbumGrid albums={albums.slice(0, albumVisible)} />
            {albums.length > 0 && hasMoreAlbums && (
              <ShowMoreButton loading={loadingAlbums} onClick={handleShowMoreAlbums} />
            )}
          </Section>

          <Section title="Artists on the Rise" subtitle="Discover who's trending">
            <ArtistGrid artists={artists.slice(0, artistVisible)} />
            {artists.length > 0 && hasMoreArtists && (
              <ShowMoreButton loading={loadingArtists} onClick={handleShowMoreArtists} />
            )}
          </Section>

          <Section title="Playlists" subtitle="Curated from Spotify, YouTube Music & Amazon Music">
            {catalogLoading ? (
              <Loader size="sm" />
            ) : catalogPlaylists.length ? (
              <>
                <div className="card-grid">
                  {catalogPlaylists.slice(0, catalogVisible).map((p, i) => (
                    <RevealItem key={`${p.source}:${p.id}`} delay={Math.min(i % 6, 6) * 60}>
                      <PlaylistCard playlist={p} index={i} />
                    </RevealItem>
                  ))}
                </div>
                {catalogVisible < catalogPlaylists.length && (
                  <ShowMoreButton
                    loading={catalogLoadingMore}
                    onClick={handleShowMorePlaylists}
                  />
                )}
              </>
            ) : (
              <p className="rounded-xl border border-black/5 bg-black/[0.03] p-6 text-center text-sm text-black/40 dark:border-white/5 dark:bg-white/[0.03] dark:text-white/40">
                No playlists available right now.
              </p>
            )}
          </Section>
        </>
      )}
    </div>
  );
}
