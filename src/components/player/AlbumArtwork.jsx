import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import TrackImage from "../common/TrackImage.jsx";

export default function AlbumArtwork({
  track,
  isPlaying,
  onLike,
  accent = "#8FA6FF",
  size = "min(60vw, 40vh, 420px)",
}) {
  const [liked, setLiked] = useState(false);
  const likeTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (likeTimer.current) clearTimeout(likeTimer.current);
    };
  }, []);

  const handleDoubleTap = () => {
    onLike?.();
    setLiked(true);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Artwork group */}
      <motion.div
        className="relative select-none"
        style={{ width: size, height: size }}
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 18, delay: 0.1 }}
      >
        {/* Vinyl disc — peeks out on the left, rotates while playing */}
        <div className="absolute inset-0" style={{ transform: "translateX(-13%)" }}>
          <div
            className="vinyl-spin absolute inset-0 rounded-full"
            style={{
              background:
                "repeating-radial-gradient(circle at 50% 50%, #161a25 0, #161a25 2px, #0a0c13 3px, #0d1019 5px)",
              backgroundSize: "auto",
              boxShadow:
                "0 34px 60px -18px rgba(0,0,0,0.85), inset 0 0 22px rgba(0,0,0,0.85), inset 0 0 4px rgba(120,130,255,0.15)",
              animationPlayState: isPlaying ? "running" : "paused",
            }}
          >
            {/* Groove shading */}
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, transparent 22%, rgba(0,0,0,0.45) 26%, transparent 30%)" }}
            />
            {/* Record label */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 rounded-full"
              style={{
                width: "26%",
                height: "26%",
                transform: "translate(-50%, -50%)",
                background: `linear-gradient(145deg, ${accent}77, rgba(30,34,58,0.95))`,
                boxShadow: "inset 0 2px 6px rgba(255,255,255,0.2), 0 0 0 2px rgba(0,0,0,0.5)",
              }}
            >
              <span
                className="absolute left-1/2 top-1/2 rounded-full bg-black/80"
                style={{ width: "14%", height: "14%", transform: "translate(-50%, -50%)" }}
              />
            </div>
          </div>
        </div>

        {/* Cover with glass frame */}
        <motion.div
          className="absolute inset-0"
          style={{ transform: "translateX(7%)" }}
          whileTap={{ scale: 0.985 }}
          onDoubleClick={handleDoubleTap}
          title={track?.name}
        >
          {/* Plain mat border around the cover */}
          <div
            className="absolute -inset-[6px] rounded-[26px] bg-white/[0.06]"
            style={{ boxShadow: "0 30px 60px -24px rgba(0,0,0,0.75)" }}
          />

          {/* Artwork tile */}
          <div className="absolute inset-0 overflow-hidden rounded-[24px]">
            <TrackImage
              track={track}
              alt={track?.name}
              className="h-full w-full object-cover"
            />
            {/* Interior vignette */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 34px rgba(0,0,0,0.22)" }}
            />
          </div>

          {/* Like burst */}
          {liked && (
            <motion.div
              className="absolute inset-0 z-30 flex items-center justify-center rounded-[24px] bg-black/35 backdrop-blur-[2px]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              onAnimationComplete={() => {
                if (likeTimer.current) clearTimeout(likeTimer.current);
                likeTimer.current = setTimeout(() => setLiked(false), 650);
              }}
            >
              <motion.span
                className="drop-shadow-[0_0_26px_rgba(255,90,122,0.95)]"
                style={{ fontSize: "clamp(2.5rem,8vw,5rem)", color: "#ff5a7a" }}
                initial={{ scale: 0.4, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 12 }}
              >
                ♥
              </motion.span>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}