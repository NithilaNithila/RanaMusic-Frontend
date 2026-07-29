import AlbumCard from "./AlbumCard.jsx";

export default function AlbumGrid({ albums = [] }) {
  if (!albums.length) return <p className="text-white/50 text-sm">No albums found.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {albums.map((a) => (
        <AlbumCard key={a.id} album={a} />
      ))}
    </div>
  );
}
