import ArtistCard from "./ArtistCard.jsx";

export default function ArtistGrid({ artists = [] }) {
  if (!artists.length) return <p className="text-white/50 text-sm">No artists found.</p>;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {artists.map((a) => (
        <ArtistCard key={a.id} artist={a} />
      ))}
    </div>
  );
}
