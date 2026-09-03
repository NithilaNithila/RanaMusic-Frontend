import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { imageSrc, handleImageError } from "../../utils/imageFallback";

function ArtistCard({ artist, index = 0 }) {
  return (
    <motion.div whileTap={{ scale: 0.97 }} className="h-full">
      <Link
        to={`/artists/${artist.id}`}
        className="group relative block h-full overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-4 text-center shadow-lg shadow-black/[0.06] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:bg-white/80 hover:shadow-xl hover:shadow-brand/[0.12] dark:border-white/10 dark:bg-white/[0.06] dark:hover:border-brand/30 dark:hover:bg-white/[0.09] dark:hover:shadow-black/40"
      >
        {/* Soft brand glow behind avatar on hover */}
        <div className="pointer-events-none absolute -top-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full bg-brand/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100 dark:bg-brand/20" />

        <div className="relative mx-auto mb-3 w-fit">
          <img
            src={imageSrc(artist.image)}
            onError={handleImageError}
            alt={artist.name}
            loading="lazy"
            className="aspect-square w-full rounded-full object-cover shadow-md shadow-black/15 ring-2 ring-white/30 transition-all duration-500 ease-out group-hover:scale-[1.06] group-hover:ring-brand/60 dark:ring-white/15"
          />

          {/* Rotating sheen on hover */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
          </div>
        </div>

        <p className="truncate px-1 text-[13px] font-semibold leading-tight transition-colors group-hover:text-brand">
          {artist.name}
        </p>
      </Link>
    </motion.div>
  );
}

export default memo(ArtistCard);
