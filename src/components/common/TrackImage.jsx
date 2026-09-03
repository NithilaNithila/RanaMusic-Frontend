import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { DEFAULT_ARTWORK } from "../../utils/constants";
import { imageSrc, handleImageError } from "../../utils/imageFallback";

// Provider playlists (notably Spotify) often ship tracks with no artwork or
// garbage values (whitespace). Hydrate the cover from the Saavn match (same
// name+artist the audio uses). Cached so each song resolves once.
const imageCache = new Map();

const hydrate = (track) => {
  const key = `${String(track?.name || "").toLowerCase()}|${String(track?.artist_name || "").toLowerCase()}`;
  if (imageCache.has(key)) return imageCache.get(key);
  const p = axiosClient
    .get("/tracks/resolve", {
      params: {
        name: track?.name || "",
        artist: track?.artist_name || "",
        source: track?.source || "",
        id: track?.id || "",
      },
    })
    .then((res) => (res.data && res.data.image ? res.data.image : ""))
    .catch(() => "");
  imageCache.set(key, p);
  return p;
};

export default function TrackImage({ track, alt = "", className, index }) {
  const [src, setSrc] = useState(() => imageSrc(track?.image));
  const hydratedRef = useRef(false);

  useEffect(() => {
    let alive = true;
    const base = imageSrc(track?.image);
    setSrc(base);
    hydratedRef.current = false;

    // Skip hydration only when a real image string exists (a whitespace or
    // blank value falls back to the placeholder and should be hydrated).
    const needsHydration =
      base === DEFAULT_ARTWORK || !String(track?.image || "").trim();
    if (needsHydration && (track?.name || track?.artist_name)) {
      hydrate(track).then((img) => {
        if (alive && img) {
          hydratedRef.current = true;
          setSrc(img);
        }
      });
    }
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id, track?.image, track?.name, track?.artist_name]);

  const handleError = (e) => {
    // Dead URL / hotlink 403: try the Saavn cover once before falling back.
    if (!hydratedRef.current && (track?.name || track?.artist_name)) {
      hydratedRef.current = true;
      hydrate(track).then((img) => {
        if (img) setSrc(img);
      });
    }
    handleImageError(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      loading={index != null ? "lazy" : undefined}
      className={className}
      onError={handleError}
    />
  );
}