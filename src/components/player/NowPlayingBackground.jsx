import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { extractPalette } from "../../utils/colorExtract";
import { DEFAULT_ARTWORK } from "../../utils/constants";

export default function NowPlayingBackground({ imageUrl }) {
  const src = imageUrl || DEFAULT_ARTWORK;
  const [palette, setPalette] = useState(null);
  const [loadedId, setLoadedId] = useState(null);

  useEffect(() => {
    let alive = true;
    extractPalette(src).then((p) => {
      if (!alive) return;
      setPalette(p);
      setLoadedId(src);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  const layers = [
    {
      key: `img-${loadedId}`,
      backgroundImage: `url(${src})`,
      filter: "blur(40px) saturate(140%)",
      transform: "scale(1.35)",
    },
    {
      key: `grad-${loadedId}`,
      backgroundImage: palette
        ? `linear-gradient(180deg, ${palette.top} 0%, rgba(10,12,16,0.4) 45%, ${palette.bottom} 100%)`
        : "linear-gradient(180deg, rgba(20,24,34,0.9) 0%, rgba(10,12,16,0.4) 45%, #0b0e14 100%)",
    },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0b0e14]">
      <AnimatePresence>
        {loadedId && (
          <motion.div
            key={`layer-${loadedId}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            {layers.map((l) => (
              <div key={l.key} className="absolute inset-0" style={l} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/70" />
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(120% 90% at 50% 10%, transparent 55%, rgba(0,0,0,0.45) 100%)" }} />
    </div>
  );
}
