import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbumById, getAlbumTracks } from "../api/albumApi";
import TrackList from "../components/track/TrackList.jsx";
import Loader from "../components/common/Loader.jsx";
import { DEFAULT_ARTWORK } from "../utils/constants";

export default function AlbumDetails() {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAlbumById(id), getAlbumTracks(id)])
      .then(([albumRes, tracksRes]) => {
        setAlbum(albumRes.data);
        setTracks(tracksRes.data.results || tracksRes.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader size="lg" />;
  if (!album) return <p className="text-white/50">Album not found.</p>;

  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        <img
          src={album.image || DEFAULT_ARTWORK}
          alt={album.name}
          className="h-40 w-40 rounded-lg object-cover shadow-lg"
        />
        <div>
          <p className="text-xs uppercase text-white/50">Album</p>
          <h1 className="text-3xl font-bold">{album.name}</h1>
          <p className="text-white/60">{album.artist_name}</p>
        </div>
      </div>
      <TrackList tracks={tracks} />
    </div>
  );
}
