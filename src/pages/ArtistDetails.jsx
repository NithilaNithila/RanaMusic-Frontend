import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtistById, getArtistAlbums } from "../api/artistApi";
import AlbumGrid from "../components/album/AlbumGrid.jsx";
import Loader from "../components/common/Loader.jsx";
import { DEFAULT_ARTWORK } from "../utils/constants";

export default function ArtistDetails() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getArtistById(id), getArtistAlbums(id)])
      .then(([artistRes, albumsRes]) => {
        setArtist(artistRes.data);
        setAlbums(albumsRes.data.results || albumsRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader size="lg" />;
  if (!artist) return <p className="text-white/50">Artist not found.</p>;

  return (
    <div>
      <div className="flex items-center gap-6 mb-8">
        <img
          src={artist.image || DEFAULT_ARTWORK}
          alt={artist.name}
          className="h-40 w-40 rounded-full object-cover shadow-lg"
        />
        <div>
          <p className="text-xs uppercase text-white/50">Artist</p>
          <h1 className="text-3xl font-bold">{artist.name}</h1>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-3">Albums</h2>
      <AlbumGrid albums={albums} />
    </div>
  );
}
