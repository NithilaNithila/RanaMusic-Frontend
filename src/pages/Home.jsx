import { lazy, Suspense, useEffect, useState } from "react";
import { getPopularTracks } from "../api/trackApi";
import { usePlayer } from "../hooks/useAudioPlayer";
import { useLanguage } from "../context/LanguageContext";

import ScrollShowcase from "../components/home/ScrollShowcase.jsx";
import ParallaxBackground from "../components/home/ParallaxBackground.jsx";
import Section from "../components/common/Section.jsx";
import RevealItem from "../components/common/RevealItem.jsx";
import ShowMoreButton from "../components/common/ShowMoreButton.jsx";
import TrackCard from "../components/track/TrackCard.jsx";
import LazyMount from "../components/common/LazyMount.jsx";
import SkeletonCardGrid from "../components/common/SkeletonCardGrid.jsx";

// The below-fold sections (and their grids/cards) are code-split: they're not
// even downloaded until LazyMount brings them near the viewport.
const AlbumsSection = lazy(() =>
  import("../components/home/HomeSections.jsx").then((m) => ({ default: m.AlbumsSection }))
);
const ArtistsSection = lazy(() =>
  import("../components/home/HomeSections.jsx").then((m) => ({ default: m.ArtistsSection }))
);
const PlaylistsSection = lazy(() =>
  import("../components/home/HomeSections.jsx").then((m) => ({ default: m.PlaylistsSection }))
);

const TRACK_PAGE_SIZE = 12;
const MAX_FETCH_ATTEMPTS = 6;

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(TRACK_PAGE_SIZE);
  const [trackPage, setTrackPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreTracks, setHasMoreTracks] = useState(true);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const { playTrack } = usePlayer();
  const { language } = useLanguage();

  // Only the "Popular Right Now" data is fetched eagerly — it's the LCP
  // content. Albums/Artists/Playlists load their own data inside LazyMount
  // when they approach the viewport (see HomeSections.jsx).
  useEffect(() => {
    let active = true;
    setTracks([]);
    setVisibleCount(TRACK_PAGE_SIZE);
    setTrackPage(1);
    setHasMoreTracks(true);
    setLoadingTracks(true);

    getPopularTracks({ limit: TRACK_PAGE_SIZE, lang: language })
      .then((res) => {
        if (!active) return;
        setTracks(res.data.results || res.data || []);
      })
      .catch(() => setHasMoreTracks(false))
      .finally(() => {
        if (active) setLoadingTracks(false);
      });
    return () => {
      active = false;
    };
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

  return (
    <div className="relative">
      <ParallaxBackground />
      <ScrollShowcase onShuffle={handleShuffle} />

      <Section title="Popular Right Now" subtitle="Tracks everyone's playing today">
        {loadingTracks ? (
          <SkeletonCardGrid count={TRACK_PAGE_SIZE} />
        ) : tracks.length ? (
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

      <LazyMount minHeight={340}>
        <Suspense fallback={null}>
          <AlbumsSection language={language} />
        </Suspense>
      </LazyMount>

      <LazyMount minHeight={340}>
        <Suspense fallback={null}>
          <ArtistsSection language={language} />
        </Suspense>
      </LazyMount>

      <LazyMount minHeight={340}>
        <Suspense fallback={null}>
          <PlaylistsSection />
        </Suspense>
      </LazyMount>
    </div>
  );
}