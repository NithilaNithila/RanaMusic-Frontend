import { Link } from "react-router-dom";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function AlbumCard({ album }) {
  return (
    <Link
      to={`/albums/${album.id}`}
      className="bg-brand-surface hover:bg-white/10 rounded-lg p-3 transition-colors block"
    >
      <img
        src={album.image || DEFAULT_ARTWORK}
        alt={album.name}
        className="w-full aspect-square object-cover rounded-md mb-3"
      />
      <p className="text-sm font-medium truncate">{album.name}</p>
      <p className="text-xs text-white/50 truncate">{album.artist_name}</p>
    </Link>
  );
}
