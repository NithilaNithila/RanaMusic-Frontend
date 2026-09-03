import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { extractPalette } from "../../utils/colorExtract";
import { DEFAULT_ARTWORK } from "../../utils/constants";

function Orb({ color, size, top, left, delay = 0, duration = 20, blur = 70 }) {
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute rounded-full"
      style={{
        width: size,
        height: size,
        top,
        left,
        filter: `blur(${blur}px)`,
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
      }}
      animate={{ opacity: [0.42, 0.85, 0.42], scale: [1, 1.14, 1], x: [0, 30, 0], y: [0, -20, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

const MOTES = [
  { top: "20%", left: "14%", s: 3, d: 13 },
  { top: "30%", left: "80%", s: 2, d: 16 },
  { top: "52%", left: "90%", s: 3.5, d: 18 },
  { top: "68%", left: "18%", s: 2.5, d: 14 },
  { top: "82%", left: "64%", s: 3, d: 17 },
  { top: "12%", left: "58%", s: 2, d: 15 },
];

export default function NowPlayingBackground({ imageUrl }) {
  const src = imageUrl || DEFAULT_ARTWORK;
  const [palette, setPalette] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    extractPalette(src)
      .then((p) => {
        if (!alive.current) return;
        setPalette(p);
        setLoadedId(src);
      })
      .catch(() => {
        /* keep the default navy/violet backdrop when palette extraction fails */
      });
    return () => {
      alive.current = false;
    };
  }, [src]);

  const tint = (c) => (c ? `${c}33` : "transparent");
  const accent = palette?.accent || "#8FA6FF";

  return (
    <div className="absolute inset-0 overflow-hidden bg-ink-950">
      {/* Dynamic blurred colors from the artwork */}
      <AnimatePresence>
        {loadedId && (
          <motion.div
            key={`bloom-${loadedId}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${src})`,
                filter: "blur(36px) saturate(165%) brightness(0.55)",
                transform: "scale(1.5)",
              }}
            />

            {/* Navy / violet wash for cinematics */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, " +
                  `${tint(palette?.accent)}, ` +
                  "rgba(30, 20, 82, 0.5) 24%, " +
                  "rgba(10, 12, 44, 0.52) 52%, " +
                  "rgba(58, 20, 70, 0.36) 76%, " +
                  "rgba(4,4,7,0.98) 100%)",
              }}
            />

            {/* Ambient purple / electric blue / pink lighting */}
            <Orb color="rgba(96,90,255,0.5)" size="56vw" top="-18%" left="-14%" duration={22} />
            <Orb color="rgba(60,130,255,0.46)" size="48vw" top="16%" left="60%" delay={5} duration={26} blur={80} />
            <Orb color="rgba(255,90,165,0.32)" size="42vw" top="58%" left="-10%" delay={9} duration={24} blur={84} />
            <Orb color="rgba(46,40,120,0.55)" size="52vw" top="64%" left="46%" delay={3} duration={28} blur={72} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Depth gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-black/80" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/35" />

      {/* Vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: "radial-gradient(125% 92% at 50% 44%, transparent 54%, rgba(0,0,0,0.58) 100%)" }}
      />

      {/* Accent bloom behind the artwork */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(50% 40% at 50% 38%, ${accent}26 0%, transparent 70%)` }}
      />

      {/* Subtle animated particles */}
      {MOTES.map((p, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="premium-bokeh pointer-events-none absolute rounded-full"
          style={{
            top: p.top,
            left: p.left,
            width: p.s * 5,
            height: p.s * 5,
            filter: `blur(${p.s * 2.4}px)`,
            background: "radial-gradient(circle, rgba(225,232,255,0.45), transparent 70%)",
            animation: `premium-bokeh ${p.d}s ease-in-out ${i * 0.9}s infinite`,
          }}
        />
      ))}

      {/* Cinematic film grain */}
      <div className="cinematic-grain" aria-hidden="true" />
    </div>
  );
}