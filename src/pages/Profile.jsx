import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { getMyPlaylists } from "../api/playlistApi";
import { DEFAULT_ARTWORK } from "../utils/constants";

export default function Profile() {
  const { user, logout } = useAuth();
  const { likedList, playTrack } = useAudioPlayer();
  const [playlists, setPlaylists] = useState(null);

  useEffect(() => {
    getMyPlaylists()
      .then((res) => setPlaylists(res.data || []))
      .catch(() => setPlaylists([]));
  }, []);

  if (!user) return null;

  const initial = (user.username?.[0] || user.email?.[0] || "U").toUpperCase();
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—";

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl bg-brand-surface border border-white/10 p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-bold text-black">
            {initial}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold">{user.username || user.email}</h1>
            <p className="truncate text-sm text-white/50">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-[#ff5a7a]">{likedList.length}</p>
            <p className="text-xs text-white/50">Liked Songs</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 text-center">
            <p className="text-2xl font-bold text-brand">{playlists ? playlists.length : "—"}</p>
            <p className="text-xs text-white/50">Playlists</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-white/5 p-4">
          <p className="text-xs text-white/40">Member since</p>
          <p className="mt-0.5 text-sm font-medium">{joined}</p>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/library"
            className="w-full rounded-full bg-white/10 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-white/20"
          >
            Go to Library
          </Link>
          <button
            onClick={() => logout()}
            className="w-full rounded-full bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>

      {playlists && playlists.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-bold">Your Playlists</h2>
          <div className="flex flex-col gap-2">
            {playlists.map((p) => (
              <Link
                key={p._id}
                to={`/playlists/${p._id}`}
                className="flex items-center gap-3 rounded-xl bg-brand-surface border border-white/10 p-3 transition-colors hover:border-white/25"
              >
                <img
                  src={p.coverImage || p.tracks?.[0]?.albumImage || p.tracks?.[0]?.image || DEFAULT_ARTWORK}
                  alt={p.name}
                  className="h-11 w-11 rounded-md object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{p.name}</span>
                  <span className="block text-xs text-white/50">{p.tracks?.length || 0} songs</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Liked Songs</h2>
          {likedList.length > 0 && (
            <span className="text-xs text-white/50">{likedList.length} songs</span>
          )}
        </div>
        {likedList.length ? (
          <div className="flex flex-col gap-1">
            {likedList.map((t) => (
              <button
                key={t.id}
                onClick={() => playTrack(t, [t])}
                className="flex items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-white/10"
              >
                <img
                  src={t.image || DEFAULT_ARTWORK}
                  alt={t.name}
                  className="h-11 w-11 rounded-md object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{t.name}</span>
                  <span className="block truncate text-xs text-white/50">{t.artist_name}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-white/5 p-4 text-sm text-white/40">
            No liked songs yet. Tap the heart on a song to save it here.
          </p>
        )}
      </div>
    </div>
  );
}
