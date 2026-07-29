import { useEffect, useState } from "react";
import { getPopularTracks } from "../api/trackApi";
import { getAlbums } from "../api/albumApi";
import { getArtists } from "../api/artistApi";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

import Hero from "../components/home/Hero.jsx";
import ScrollShowcase from "../components/home/ScrollShowcase.jsx";
import ParallaxBackground from "../components/home/ParallaxBackground.jsx";
import Section from "../components/common/Section.jsx";
import RevealItem from "../components/common/RevealItem.jsx";
import TrackCard from "../components/track/TrackCard.jsx";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import ArtistGrid from "../components/artist/ArtistGrid.jsx";
import Loader from "../components/common/Loader.jsx";

export default function Home() {
  const [tracks, setTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack } = useAudioPlayer();

  useEffect(() => {
    Promise.allSettled([
      getPopularTracks({ limit: 12 }),
      getAlbums({ limit: 12 }),
      getArtists({ limit: 12 }),
    ]).then(([tRes, aRes, arRes]) => {
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
  }, []);

  const handleShuffle = () => {
    if (!tracks.length) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="relative">
      <ParallaxBackground />
      <Hero onShuffle={handleShuffle} />
      <ScrollShowcase />

      {loading ? (
        <Loader size="lg" />
      ) : (
        <>
          <Section title="Popular Right Now" subtitle="Tracks everyone's playing today">
            {tracks.length ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {tracks.map((t, i) => (
                  <RevealItem key={t.id} delay={Math.min(i, 8) * 60}>
                    <TrackCard track={t} queue={tracks} />
                  </RevealItem>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-sm">No tracks found.</p>
            )}
          </Section>

          <Section title="Fresh Albums" subtitle="New releases picked for you">
            <AlbumGrid albums={albums} />
          </Section>

          <Section title="Artists on the Rise" subtitle="Discover who's trending">
            <ArtistGrid artists={artists} />
          </Section>
        </>
      )}
    </div>
  );
}
