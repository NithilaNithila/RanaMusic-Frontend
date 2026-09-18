import { createContext, useRef, useState, useCallback, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { getFavorites, addFavorite, removeFavorite } from "../api/favoriteApi";
import axiosClient from "../api/axiosClient";
import { sameTrack } from "../utils/helpers";
import { apiOrigin } from "../utils/imageFallback";

// Resolve relative audio paths to an absolute URL the <audio> element can
// fetch.  In dev the page lives on :5173 but the backend is on :5000, so a
// relative "/api/…" path would hit the Vite server (404).  In production a
// same-origin reverse-proxy keeps them aligned.
//
// The API client (axiosClient) already knows the real backend base via
// VITE_API_BASE_URL; audio must use the SAME origin. Prefer it, then fall
// back to the hardcoded dev default.

const resolveAudioUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  const origin = apiOrigin();
  return origin ? `${origin}${url}` : url;
};

// Tracks that came from Spotify carry only a 30s preview; Amazon and YouTube
// Music tracks usually have no audio at all. The backend can resolve a full
// playable Saavn copy from the name + artist, so search them there. When no
// copy exists anywhere the resolver can now hand back a YouTube `videoId`
// which this player embeds client-side (youtube.com/embed/<videoId>).
const isShortAudio = (url) => {
  if (!url) return true;
  if (url.includes("scdn.co")) return true; // Spotify preview mp3 host
  // Any other backend proxy path needs resolution (Saavn CDN URLs are
  // absolute hosts, so they never reach this branch).
  if (url.startsWith("/api/")) return true;
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
    if (resolved && resolved.videoId) {
      // No playable audio anywhere — YouTube has it, so embed client-side.
      return {
        ...track,
        videoId: resolved.videoId,
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
  source: f.meta?.source || "",
  name: f.meta?.name || "Unknown",
  image: f.meta?.image || "",
  artist_name: f.meta?.artistName || "",
  album_name: f.meta?.albumName || "",
  audio: f.meta?.audio || "",
  videoId: f.meta?.videoId || "",
  duration: f.meta?.duration || 0,
});

// Track object -> favorites API payload
const favFromTrack = (t) => ({
  itemType: "track",
  jamendoId: String(t.id),
  meta: {
    source: t.source || "",
    name: t.name || "",
    image: t.image || "",
    artistName: t.artist_name || "",
    albumName: t.album_name || "",
    audio: t.audio || "",
    videoId: t.videoId || "",
    duration: Number(t.duration) || 0,
  },
});

export const PlayerContext = createContext(null);

// High-frequency playback position lives in its OWN context so consumers that
// only read the player (queue, controls, current track, likes...) don't
// re-render ~4x/sec while audio plays. Without the split, every `timeupdate`
// (or the 500ms YT poll) changed the shared context value and re-rendered the
// whole app from Home down to each TrackCard.
export const PlaybackProgressContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(new Audio());
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [history, setHistory] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackError, setPlaybackError] = useState(null); // unplayable-track notice
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // "off" | "all" | "one"
  const [youtubeVideoId, setYoutubeVideoId] = useState(null); // active client-side YT embed
  // Live YT player handle registered by the <YouTubePlayerBridge /> when an
  // embed is active. Commands route here instead of the <audio> element.
  const ytApiRef = useRef(null);
  // Mirror of isPlaying kept current for togglePlay: YouTube embeds update it
  // via the bridge, so a useCallback([]) closure can't read stale state.
  const isPlayingRef = useRef(isPlaying);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);
  // Mirror of the current track for event handlers (audio error etc.) that
  // are registered once and therefore can't close over render-time state.
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);
  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("likedTracks")) || {};
    } catch {
      return {};
    }
  });

  // Mirror of likedTracks kept current for toggleLike: reads it instead of the
  // render-time closure (no stale-liked state on rapid clicks) and keeps side
  // effects (localStorage + API calls) OUT of the setState updater, which
  // StrictMode double-invokes in dev.
  const likedTracksRef = useRef(likedTracks);
  useEffect(() => {
    likedTracksRef.current = likedTracks;
  }, [likedTracks]);

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
        const favorites = Array.isArray(res.data) ? res.data : res.data?.favorites || res.data?.results || [];
        favorites.forEach((f) => {
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

  // Logged out: drop the (already server-merged) local likes so the next
  // account logging in on this device can't inherit — and re-push — the
  // previous account's favorites. Guest likes persist across reloads; only a
  // real login -> logout transition wipes them.
  const prevUserIdRef = useRef(null);
  useEffect(() => {
    if (prevUserIdRef.current && !user) {
      setLikedTracks({});
      localStorage.removeItem("likedTracks");
    }
    prevUserIdRef.current = user?.id || null;
  }, [user]);

  const pickIndex = useCallback((dir) => {
    if (!currentTrack || queue.length === 0) return -1;
    if (isShuffled) {
      const pool = queue.filter((t) => !sameTrack(t, currentTrack));
      if (!pool.length) return -1;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      return queue.findIndex((t) => sameTrack(t, chosen));
    }
    const idx = queue.findIndex((t) => sameTrack(t, currentTrack));
    let next = idx + dir;
    if (next < 0) next = repeatMode === "all" ? queue.length - 1 : -1;
    if (next >= queue.length) next = repeatMode === "all" ? 0 : -1;
    return next;
  }, [currentTrack, queue, isShuffled, repeatMode]);

  const playbackReqRef = useRef(0);

  const playTrack = useCallback((track, trackQueue = [], startAt = 0) => {
    const audio = audioRef.current;

    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    // Tear down any active YouTube embed immediately: a stale iframe must not
    // keep playing while the new track resolves (or fails to resolve).
    setYoutubeVideoId(null);
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);

    // Starts the HTMLAudioElement path for a playable copy.
    const start = (playable, at = 0) => {
      setYoutubeVideoId(null);
      audio.src = resolveAudioUrl(playable.audio);
      audio.currentTime = at || 0;
      setCurrentTrack(playable);
      setDuration(0);
      setProgress(0);
      setPlaybackError(null);
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    };

    // Starts the client-side YouTube embed for a track with only a videoId.
    // The <YouTubePlayerBridge /> mounts the iframe, autoplays it, and feeds
    // progress/duration/state back through the context value below.
    const startYoutube = (playable) => {
      const videoId = playable.videoId;
      // A provider id (e.g. an Amazon ASIN) is NOT a YouTube id — only kick
      // off the embed when the resolver actually handed back a real videoId.
      if (!videoId) {
        setPlaybackError(`${playable.name || "This track"} is unavailable in any source`);
        setIsPlaying(false);
        return;
      }
      setYoutubeVideoId(videoId);
      setCurrentTrack(playable);
      setDuration(0);
      setProgress(0);
      setPlaybackError(null);
      setIsPlaying(true);
    };

    setCurrentTrack(track);
    if (trackQueue.length) setQueue(trackQueue);
    setHistory((h) => [track, ...h.filter((t) => !sameTrack(t, track))].slice(0, 30));

    if (track.audio && !isShortAudio(track.audio)) {
      start(track, startAt);
      return;
    }

    // A YouTube Music track with no audio (or any row that already carries a
    // videoId) is played via the client-side embed — no resolve round-trip.
    if (track.videoId) {
      startYoutube(track);
      return;
    }

    const reqId = ++playbackReqRef.current;
    resolvePlayableAudio(track).then((playable) => {
      if (reqId !== playbackReqRef.current) return;
      if (playable && playable.audio) {
        start(playable, startAt);
        return;
      }

      // No free copy anywhere, but the resolver found it on YouTube Music →
      // embed client-side so the track still plays.
      if (playable && playable.videoId) {
        startYoutube(playable);
        return;
      }

      // No playable copy anywhere (full resolve + Saavn/YT fallbacks failed).
      // Surface the failure and auto-skip to the next track instead of
      // stranding the player on a dead track with no sound and no way out.
      // When there is nothing to skip to, KEEP the current track selected so
      // the error stays visible in the player bar (unmounting it would hide
      // the "unavailable" notice entirely).
      setYoutubeVideoId(null);
      setIsPlaying(false);
      setPlaybackError(`${track.name || "This track"} is unavailable in any source`);
      const idx = trackQueue.findIndex((t) => sameTrack(t, track));
      const next = trackQueue[idx + 1];
      if (next) {
        playTrack(next, trackQueue);
        return;
      }
    });
  }, []);

  const togglePlay = useCallback(() => {
    // YouTube embed active → control the iframe.
    if (ytApiRef.current) {
      if (isPlayingRef.current) ytApiRef.current.pause();
      else ytApiRef.current.play();
      return;
    }
    const audio = audioRef.current;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, []);

  const pause = useCallback(() => {
    if (ytApiRef.current) {
      ytApiRef.current.pause();
      setIsPlaying(false);
      return;
    }
    audioRef.current.pause();
    setIsPlaying(false);
  }, []);

  const playNext = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    if (repeatMode === "one") {
      if (ytApiRef.current) {
        ytApiRef.current.seekTo(0);
        ytApiRef.current.play();
        setIsPlaying(true);
        setProgress(0);
      } else {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
        setProgress(0);
      }
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
    if (audioRef.current.currentTime > 3 || progress > 3) {
      if (ytApiRef.current) {
        ytApiRef.current.seekTo(0);
        setProgress(0);
      } else {
        audioRef.current.currentTime = 0;
        setProgress(0);
      }
      return;
    }
    const idx = pickIndex(-1);
    if (idx < 0) {
      audioRef.current.currentTime = 0;
      setProgress(0);
      return;
    }
    playTrack(queue[idx], queue);
  }, [currentTrack, queue, pickIndex, playTrack, progress]);

  const addToQueueNext = useCallback(
    (track, trackQueue = []) => {
      if (!currentTrack) {
        playTrack(track, trackQueue.length ? trackQueue : [track]);
        return;
      }
      const base = trackQueue.length ? trackQueue : queue;
      const idx = base.findIndex((t) => sameTrack(t, currentTrack));
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
    // Read the current like-state from the ref (always up to date, even under
    // rapid clicks), then set state with a PURE value. All side effects
    // (localStorage + favorites API) run here, once per toggle — never inside
    // the state updater, which React may double-invoke.
    const prev = likedTracksRef.current;
    const isCurrentlyLiked = Boolean(prev[id]);
    const next = { ...prev };
    if (isCurrentlyLiked) delete next[id];
    else next[id] = currentTrack;

    likedTracksRef.current = next;
    setLikedTracks(next);

    localStorage.setItem("likedTracks", JSON.stringify(next));

    if (user) {
      if (isCurrentlyLiked) removeFavorite("track", id).catch(() => {});
      else addFavorite(favFromTrack(currentTrack)).catch(() => {});
    }
  }, [currentTrack, user]);

  const isLiked = currentTrack ? Boolean(likedTracks[String(currentTrack.id)]) : false;
  const likedList = useMemo(() => Object.values(likedTracks), [likedTracks]);

  const seek = useCallback((time) => {
    if (ytApiRef.current) {
      ytApiRef.current.seekTo(time);
    } else {
      audioRef.current.currentTime = time;
    }
    setProgress(time);
  }, []);

  const changeVolume = useCallback((v) => {
    setVolume(v);
    if (ytApiRef.current) {
      ytApiRef.current.setVolume(v);
    } else {
      audioRef.current.volume = v;
    }
  }, []);

  // --- YouTube iframe bridge -------------------------------------------
  // The <YouTubePlayerBridge /> registers its live YT.Player handle here and
  // reports playback state so the whole UI (progress bar, volume, play/pause)
  // behaves uniformly for embedded tracks.
  const registerYoutube = useCallback((api) => {
    ytApiRef.current = api;
  }, []);

  const unregisterYoutube = useCallback(() => {
    ytApiRef.current = null;
  }, []);

  const reportYoutube = useCallback(({ progress: p, duration: d, playing }) => {
    if (typeof p === "number") setProgress(p);
    if (typeof d === "number") setDuration(d);
    if (typeof playing === "boolean") setIsPlaying(playing);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => setProgress(audio.currentTime);
    const onLoadedMeta = () => setDuration(audio.duration);
    const onError = () => {
      setIsPlaying(false);
      // The src failed to load/decode (expired CDN link, dead stream, blocked
      // host). Surface it and auto-skip so the queue keeps moving instead of
      // hanging on a silent track. The dead-end next-branch in playTrack
      // already handles "no next" — here we just advance.
      setPlaybackError(
        `${currentTrackRef.current?.name || "This track"} failed to load audio`
      );
      playNextRef.current();
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMeta);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMeta);
      audio.removeEventListener("error", onError);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const playNextRef = useRef(playNext);
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    const audio = audioRef.current;
    const onEnded = () => playNextRef.current();
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, []);

  const value = useMemo(() => ({
    currentTrack,
    queue,
    history,
    isPlaying,
    playbackError,
    volume,
    isShuffled,
    repeatMode,
    isLiked,
    likedList,
    youtubeVideoId,
    registerYoutube,
    unregisterYoutube,
    reportYoutube,
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
  }), [
    currentTrack, queue, history, isPlaying, playbackError,
    volume, isShuffled, repeatMode, isLiked, likedList, youtubeVideoId,
    registerYoutube, unregisterYoutube, reportYoutube, playTrack, togglePlay,
    pause, playNext, playPrev, addToQueueNext, seek, changeVolume,
    toggleShuffle, cycleRepeat, toggleLike,
  ]);

  // Progress/duration change constantly while playing; keep that surface
  // isolated so only true progress consumers (PlayerBar, NowPlaying) update.
  const progressValue = useMemo(() => ({ progress, duration }), [progress, duration]);

  return (
    <PlayerContext.Provider value={value}>
      <PlaybackProgressContext.Provider value={progressValue}>
        {children}
      </PlaybackProgressContext.Provider>
    </PlayerContext.Provider>
  );
}
