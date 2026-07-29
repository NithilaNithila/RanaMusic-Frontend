import { Link } from "react-router-dom";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function ArtistCard({ artist }) {
  return (
    <Link
      to={`/artists/${artist.id}`}
      className="bg-brand-surface hover:bg-white/10 rounded-lg p-3 transition-colors block text-center"
    >
      <img
        src={artist.image || DEFAULT_ARTWORK}
        alt={artist.name}
        className="w-full aspect-square object-cover rounded-full mb-3"
      />
      <p className="text-sm font-medium truncate">{artist.name}</p>
    </Link>
  );
}
