import { createContext, useRef, useState, useCallback, useEffect } from "react";

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

  const playTrack = useCallback((track, trackQueue = [], startAt = 0) => {
    const audio = audioRef.current;
    if (!track.audio) return;
    audio.src = track.audio;
    audio.currentTime = startAt || 0;
    audio.play().catch(() => {});
    setCurrentTrack(track);
    setDuration(0);
    setProgress(0);
    setIsPlaying(true);
    if (trackQueue.length) setQueue(trackQueue);
    setHistory((h) => [track, ...h.filter((t) => t.id !== track.id)].slice(0, 30));
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
    setLikedTracks((prev) => {
      const next = { ...prev };
      if (next[currentTrack.id]) delete next[currentTrack.id];
      else next[currentTrack.id] = currentTrack;
      localStorage.setItem("likedTracks", JSON.stringify(next));
      return next;
    });
  }, [currentTrack]);

  const isLiked = currentTrack ? Boolean(likedTracks[currentTrack.id]) : false;
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
