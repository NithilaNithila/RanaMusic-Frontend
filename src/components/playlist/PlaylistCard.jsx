import { Link } from "react-router-dom";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function PlaylistCard({ playlist }) {
  return (
    <Link
      to={`/playlists/${playlist._id}`}
      className="bg-brand-surface hover:bg-white/10 rounded-lg p-3 transition-colors block"
    >
      <img
        src={playlist.coverImage || DEFAULT_ARTWORK}
        alt={playlist.name}
        className="w-full aspect-square object-cover rounded-md mb-3"
      />
      <p className="text-sm font-medium truncate">{playlist.name}</p>
      <p className="text-xs text-white/50 truncate">
        {playlist.tracks?.length || 0} tracks
      </p>
    </Link>
  );
}
