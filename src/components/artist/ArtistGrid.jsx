import ArtistCard from "./ArtistCard.jsx";
import RevealItem from "../common/RevealItem.jsx";

export default function ArtistGrid({ artists = [] }) {
  if (!artists.length)
    return (
      <p className="rounded-xl border border-black/5 dark:border-white/5 bg-black/[0.03] dark:bg-white/[0.03] p-6 text-center text-sm text-black/40 dark:text-white/40">
        No artists found.
      </p>
    );

  return (
    <div className="card-grid">
      {artists.map((a, i) => (
        <RevealItem key={a.id} delay={Math.min(i % 12, 8) * 60}>
          <ArtistCard artist={a} index={i} />
        </RevealItem>
      ))}
    </div>
  );
}
