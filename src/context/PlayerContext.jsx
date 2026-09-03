import { createContext, useRef, useState, useCallback, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getFavorites, addFavorite, removeFavorite } from "../api/favoriteApi";
import axiosClient from "../api/axiosClient";

// Tracks that came from Spotify carry only a 30s preview; YouTube / Amazon
// tracks usually have no audio at all. The backend can resolve a full
// playable Saavn copy from the name + artist, so search them there.
const isShortAudio = (url) => {
  if (!url) return true;
  if (url.includes("scdn.co")) return true; // Spotify preview mp3 host
  return false;
};

const resolvePlayableAudio = async (track) => {
  try {
    const res = await axiosClient.get("/tracks/resolve", {
      params: {
        name: track.name || "",
        artist: track.artist_name || "",
        source: track.source || "",
        id: track.id || "",
      },
    });
    const resolved = res.data || null;
    if (resolved && resolved.audio) {
      // Full playable Saavn copy.
      return {
        ...track,
        audio: resolved.audio,
        duration: Number(resolved.duration) || track.duration || 0,
        // The audio now comes from the Saavn record, so prefer its artwork
        // when the original had none (YT/Amazon tracks often do).
        image: track.image || resolved.image || "",
      };
    }
    if (resolved && resolved.image) {
      // Preview-only (or no-audio) track with no Saavn match: at least fix
      // the artwork so it isn't a blank box.
      return { ...track, image: resolved.image || track.image || "" };
    }
  } catch {
    /* fall through to any audio the track already has */
  }
  return track.audio ? track : null;
};

// Server favorite doc -> playable track object
const trackFromFav = (f) => ({
  id: String(f.jamendoId),
  name: f.meta?.name || "Unknown",
  image: f.meta?.image || "",
  artist_name: f.meta?.artistName || "",
  album_name: f.meta?.albumName || "",
  audio: f.meta?.audio || "",
  duration: f.meta?.duration || 0,
});

// Track object -> favorites API payload
const favFromTrack = (t) => ({
  itemType: "track",
  jamendoId: String(t.id),
  meta: {
    name: t.name || "",
    image: t.image || "",
    artistName: t.artist_name || "",
    albumName: t.album_name || "",
    audio: t.audio || "",
    duration: Number(t.duration) || 0,
  },
});

export const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"
  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedTracks")) || {};
    } catch {
      return {};
    }
  });

  const { user } = useAuth();

  // Load likes from the database when logged in; migrate any local-only
  // likes (e.g. from guest usage) up to the server silently.
  useEffect(() => {
    if (!user) return;
    let alive = true;
    getFavorites("track")
      .then((res) => {
        if (!alive) return;
        const serverMap = {};
        (res.data || []).forEach((f) => {
          serverMap[String(f.jamendoId)] = trackFromFav(f);
        });

        let locals = {};
        try {
          locals = JSON.parse(localStorage.getItem("likedTracks")) || {};
        } catch {}
        const merged = { ...serverMap };
        Object.values(locals).forEach((t) => {
          const id = String(t.id);
          if (!merged[id]) {
            // exists only locally -> push to server
            merged[id] = t;
            addFavorite(favFromTrack(t)).catch(() => {});
          } else {
            // prefer richer local copy (has audio url etc.)
            merged[id] = { ...merged[id], ...t };
          }
        });

        localStorage.setItem("likedTracks", JSON.stringify(merged));
        setLikedTracks(merged);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const pickIndex = useCallback((dir) => {
    if (!currentTrack || queue.length === 0) return -1;
    if (isShuffled) {
      const pool = queue.filter((t) => t.id !== currentTrack.id);
      if (!pool.length) return -1;
      return queue.findIndex((t) => t.id === pool[Math.floor(Math.random() * pool.length)].id);
    }
    const idx = queue.findIndex((t) => t.id === currentTrack.id);
    let next = idx + dir;
    if (next < 0) next = repeatMode === "all" ? queue.length - 1 : -1;
    if (next >= queue.length) next = repeatMode === "all" ? 0 : -1;
    return next;
  }, [currentTrack, queue, isShuffled, repeatMode]);

  const playbackReqRef = useRef(0);

  const playTrack = useCallback((track, trackQueue = [], startAt = 0) => {
    const audio = audioRef.current;

    // Stop whatever is currently playing before switching tracks. This is
    // essential for the resolve path below: if the new track has no playable
    // audio (or resolution fails), the previous track must not keep playing
    // while the UI shows a different one.
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);

    const start = (playable, at = 0) => {
      audio.src = playable.audio;
      audio.currentTime = at || 0;
      setCurrentTrack(playable);
      setDuration(0);
      setProgress(0);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    setCurrentTrack(track);
    if (trackQueue.length) setQueue(trackQueue);
    setHistory((h) => [track, ...h.filter((t) => t.id !== track.id)].slice(0, 30));

    if (track.audio && !isShortAudio(track.audio)) {
      start(track, startAt);
      return;
    }

    // No playable audio / 30s preview -> ask the backend for a full Saavn
    // copy, then start playback once it arrives (if still current).
    const reqId = ++playbackReqRef.current;
    resolvePlayableAudio(track).then((playable) => {
      if (reqId !== playbackReqRef.current) return; // a newer track was chosen
      if (!playable) return; // nothing resolvable, leave idle (audio already stopped)
      if (playable.audio) start(playable, startAt);
      else setCurrentTrack(playable); // artwork-only upgrade (no playable audio)
    });
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const pause = useCallback(() => {
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (repeatMode === "one") {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
      setProgress(0);
      return;
    }
    const idx = pickIndex(1);
    if (idx < 0) {
      setIsPlaying(false);
      return;
    }
    playTrack(queue[idx], queue);
  }, [currentTrack, queue, repeatMode, pickIndex, playTrack]);

  const playPrev = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    const idx = pickIndex(-1);
    if (idx < 0) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    playTrack(queue[idx], queue);
  }, [currentTrack, queue, pickIndex, playTrack]);

  const addToQueueNext = useCallback(
    (track, trackQueue = []) => {
      if (!currentTrack) {
        playTrack(track, trackQueue.length ? trackQueue : [track]);
        return;
      }
      const base = trackQueue.length ? trackQueue : queue;
      const idx = base.findIndex((t) => t.id === currentTrack.id);
      const next = [...base];
      if (idx >= 0) next.splice(idx + 1, 0, track);
      else next.push(track);
      setQueue(next);
    },
    [currentTrack, queue, playTrack]
  );

  const toggleShuffle = useCallback(() => setIsShuffled((s) => !s), []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  const toggleLike = useCallback(() => {
    if (!currentTrack) return;
    const id = String(currentTrack.id);
    const isCurrentlyLiked = Boolean(likedTracks[id]);

    setLikedTracks((prev) => {
      const next = { ...prev };
      if (isCurrentlyLiked) delete next[id];
      else next[id] = currentTrack;
      localStorage.setItem("likedTracks", JSON.stringify(next));
      return next;
    });

    // Persist to the database when signed in
    if (user) {
      if (isCurrentlyLiked) removeFavorite("track", id).catch(() => {});
      else addFavorite(favFromTrack(currentTrack)).catch(() => {});
    }
  }, [currentTrack, likedTracks, user]);

  const isLiked = currentTrack ? Boolean(likedTracks[String(currentTrack.id)]) : false;
  const likedList = Object.values(likedTracks);

  const seek = useCallback((time) => {
    audioRef.current.currentTime = time;
    setProgress(time);
  }, []);

  const changeVolume = useCallback((v) => {
    audioRef.current.volume = v;
    setVolume(v);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onEnded = () => playNext();

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("ended", onEnded);
    };
  }, [playNext]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        history,
        isPlaying,
        progress,
        duration,
        volume,
        isShuffled,
        repeatMode,
        isLiked,
        likedList,
        playTrack,
        togglePlay,
        pause,
        playNext,
        playPrev,
        addToQueueNext,
        seek,
        changeVolume,
        toggleShuffle,
        cycleRepeat,
        toggleLike,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
