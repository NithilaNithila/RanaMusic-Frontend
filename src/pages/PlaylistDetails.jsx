import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlaylistById, removeTrackFromPlaylist } from "../api/playlistApi";
import TrackList from "../components/track/TrackList.jsx";
import Loader from "../components/common/Loader.jsx";
import { DEFAULT_ARTWORK } from "../utils/constants";

export default function PlaylistDetails() {
  const { id } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPlaylistById(id)
      .then((res) => setPlaylist(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader size="lg" />;
  if (!playlist) return <p className="text-white/50">Playlist not found.</p>;

  return (
    <div>
      <div className="flex items-end gap-6 mb-8">
        <img
          src={playlist.coverImage || DEFAULT_ARTWORK}
          alt={playlist.name}
          className="h-40 w-40 rounded-lg object-cover shadow-lg"
        />
        <div>
          <p className="text-xs uppercase text-white/50">Playlist</p>
          <h1 className="text-3xl font-bold">{playlist.name}</h1>
          <p className="text-white/60">{playlist.tracks?.length || 0} tracks</p>
        </div>
      </div>
      <TrackList tracks={playlist.tracks || []} />
    </div>
  );
}
