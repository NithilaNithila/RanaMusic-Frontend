import { useEffect, useRef, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { DEFAULT_ARTWORK } from "../../utils/constants";
import { imageSrc, handleImageError } from "../../utils/imageFallback";

// Provider playlists (notably Spotify) often ship tracks with no artwork or
// garbage values (whitespace). Hydrate the cover from the Saavn match (same
// name+artist the audio uses). Cached so each song resolves once.
const imageCache = new Map();
const IMAGE_CACHE_MAX = 300;

function cacheSet(key, value) {
  if (imageCache.size >= IMAGE_CACHE_MAX) {
    const first = imageCache.keys().next().value;
    imageCache.delete(first);
  }
  imageCache.set(key, value);
}

// A card grid can render ~a dozen artwork-less rows at once; firing all their
// /tracks/resolve round-trips simultaneously hammers the backend and delays
// first paint. Cap in-flight resolves and run first-time ones through a queue.
const RESOLVE_CONCURRENCY = 4;
let resolveInFlight = 0;
const resolveQueue = [];

function pump() {
  while (resolveInFlight < RESOLVE_CONCURRENCY && resolveQueue.length > 0) {
    const run = resolveQueue.shift();
    resolveInFlight += 1;
    run().finally(() => {
      resolveInFlight -= 1;
      pump();
    });
  }
}

const queuedResolve = (track) =>
  new Promise((resolve, reject) => {
    resolveQueue.push(() => resolveImage(track).then(resolve, reject));
    pump();
  });

// Routes the hydrated artwork + any YouTube id through imageSrc so relative
// /api/ proxy paths are rewritten to the real API origin (same fix as the
// base image). Resolves to { image, videoId } — the videoId powers the
// YouTube thumbnail fallback below for tracks whose audio only exists on YT.
const resolveImage = async (track) => {
  const res = await axiosClient
    .get("/tracks/resolve", {
      params: {
        name: track?.name || "",
        artist: track?.artist_name || "",
        source: track?.source || "",
        id: track?.id || "",
      },
    })
    .catch(() => null);
  const d = res && res.data ? res.data : null;
  return {
    image: d && d.image ? imageSrc(d.image) : "",
    videoId: d && d.videoId ? d.videoId : "",
  };
};

const hydrate = (track) => {
  const key = `${String(track?.name || "").toLowerCase()}|${String(track?.artist_name || "").toLowerCase()}`;
  if (imageCache.has(key)) return imageCache.get(key);
  const p = queuedResolve(track);
  cacheSet(key, p);
  return p;
};

// When the resolver returns no image but the track has a YouTube videoId,
// construct a thumbnail URL so the card still shows artwork instead of the
// generic placeholder.
const ytThumb = (videoId) =>
  videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "";

export default function TrackImage({ track, alt = "", className, index }) {
  const [src, setSrc] = useState(() => imageSrc(track?.image));
  const hydratedRef = useRef(false);
  const aliveRef = useRef(true);
  const trackIdRef = useRef(track?.id);

  useEffect(() => {
    aliveRef.current = true;
    trackIdRef.current = track?.id;
    const base = imageSrc(track?.image);
    setSrc(base);
    hydratedRef.current = false;

    const needsHydration =
      (base === DEFAULT_ARTWORK || !String(track?.image || "").trim());
    if (needsHydration && (track?.name || track?.artist_name)) {
      const id = track?.id;
      hydrate(track).then((res) => {
        if (aliveRef.current && trackIdRef.current === id) {
          const resolved = res.image || ytThumb(res.videoId || track?.videoId);
          hydratedRef.current = true;
          if (resolved) setSrc(resolved);
        }
      });
    }
    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.id, track?.image, track?.name, track?.artist_name]);

  const handleError = (e) => {
    if (!hydratedRef.current && (track?.name || track?.artist_name)) {
      hydratedRef.current = true;
      const id = track?.id;
      hydrate(track).then((res) => {
        if (aliveRef.current && trackIdRef.current === id) {
          const resolved = res.image || ytThumb(res.videoId || track?.videoId);
          if (resolved) setSrc(resolved);
          else setSrc(DEFAULT_ARTWORK);
        } else {
          setSrc(DEFAULT_ARTWORK);
        }
      });
    }
    handleImageError(e);
  };

  return (
    <img
      src={src}
      alt={alt}
      loading={index != null ? "lazy" : undefined}
      decoding="async"
      className={className}
      onError={handleError}
      srcset={src ? `${src} 2x` : undefined}
      sizes="(max-width: 600px) 90vw, (max-width: 1024px) 70vw, 500px"
    />
  );
}