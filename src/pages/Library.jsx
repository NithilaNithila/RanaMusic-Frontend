import { useEffect, useState } from "react";
import { getMyPlaylists } from "../api/playlistApi";
import PlaylistCard from "../components/playlist/PlaylistCard.jsx";
import CreatePlaylistModal from "../components/playlist/CreatePlaylistModal.jsx";
import Button from "../components/common/Button.jsx";
import Loader from "../components/common/Loader.jsx";

export default function Library() {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = () => {
    setLoading(true);
    getMyPlaylists()
      .then((res) => setPlaylists(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <Button onClick={() => setModalOpen(true)}>+ New Playlist</Button>
      </div>

      {loading ? (
        <Loader />
      ) : playlists.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {playlists.map((p) => (
            <PlaylistCard key={p._id} playlist={p} />
          ))}
        </div>
      ) : (
        <p className="text-white/50">No playlists yet. Create one to get started.</p>
      )}

      <CreatePlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(p) => setPlaylists((prev) => [...prev, p])}
      />
    </div>
  );
}
