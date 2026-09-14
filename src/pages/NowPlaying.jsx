import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useAuth } from "../hooks/useAuth";
import { getMyPlaylists, createPlaylist, addTrackToPlaylist } from "../api/playlistApi";
import { imageSrc, handleImageError } from "../utils/imageFallback";
import { extractPalette } from "../utils/colorExtract";

import NowPlayingBackground from "../components/player/NowPlayingBackground.jsx";
import AlbumArtwork from "../components/player/AlbumArtwork.jsx";
import SongInformation from "../components/player/SongInformation.jsx";
import ProgressBar from "../components/player/ProgressBar.jsx";
import PlayerControls from "../components/player/PlayerControls.jsx";
import QueueSheet from "../components/player/QueueSheet.jsx";
import LyricsSheet from "../components/player/LyricsSheet.jsx";
import Toast from "../components/common/Toast.jsx";

const iconProps = {
  width: 20,
  height: 20,
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
};

const Icon = {
  Back: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Menu: (props) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" {...props}>
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" width="17" height="17" fill={props.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Lyric: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M12 3c-4.5 0-8 2.8-8 6.3 0 1.9 1 3.6 2.7 4.7-.2 1.5-1 2.9-2.2 4 0 0 2.9-.2 4.6-1.6 1 .3 2 .4 3 .4 4.5 0 8-2.8 8-6.3S16.5 3 12 3z" />
    </svg>
  ),
  Queue: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M8 6h13M8 12h13M8 18h9" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Playlist: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <path d="M8 6h13M8 12h13M8 18h9" />
      <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  Share: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Close: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const SLEEP_TIMER_OPTIONS = [0, 15, 30, 45, 60];
const QUALITY_OPTIONS = ["LOSSLESS", "HD", "High", "Standard"];

function step(i, delay = 0.25) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: delay + i * 0.06, type: "spring", stiffness: 220, damping: 24 },
  };
}

const HEADER_BTN =
  "grid h-10 w-10 place-items-center rounded-full text-white/70 transition-all duration-300 hover:bg-white/[0.08] hover:text-white";

export default function NowPlaying() {
  const navigate = useNavigate();
  const player = useAudioPlayer();
  const {
    currentTrack: track,
    isPlaying,
    progress,
    duration,
    isShuffled,
    repeatMode,
    isLiked,
    togglePlay,
    pause,
    playNext,
    playPrev,
    seek,
    toggleShuffle,
    cycleRepeat,
    toggleLike,
  } = player;

  const { queue, playTrack } = player;

  const [accent, setAccent] = useState("#7C5CFF");
  const [quality, setQuality] = useState("LOSSLESS");
  const [sleepTimer, setSleepTimer] = useState(0);
  const [sleepOpen, setSleepOpen] = useState(false);
  const sleepTimeoutRef = useRef(null);
  const playlistTimerRef = useRef(null);
  const progressRef = useRef(progress);
  const durationRef = useRef(duration);
  useEffect(() => {
    progressRef.current = progress;
    durationRef.current = duration;
  }, [progress, duration]);
  const [toast, setToast] = useState(null);
  const [dialog, setDialog] = useState({ kind: null });
  const touchStartY = useRef(null);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlistBusy, setPlaylistBusy] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [addedId, setAddedId] = useState(null);

  const { user } = useAuth();

  const src = imageSrc(track?.image);
  useEffect(() => {
    if (!src) return;
    let alive = true;
    extractPalette(src).then((p) => {
      if (alive && p?.accent) setAccent(p.accent);
    });
    return () => {
      alive = false;
    };
  }, [src]);

  const buffered = useMemo(
    () => Math.min(duration, progress + Math.min(duration * 0.18, 24)),
    [progress, duration]
  );

  const showToast = (message) => setToast({ message });
  const closeToast = useCallback(() => setToast(null), []);
  const openDialog = (kind) => setDialog({ kind });
  const closeDialog = () => setDialog({ kind: null });

  const pickQuality = (q) => {
    setQuality(q);
    closeDialog();
    showToast(`${q} quality enabled`);
  };

  const setSleepTime = (min) => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    setSleepTimer(min);
    closeDialog();
    if (min > 0) {
      sleepTimeoutRef.current = setTimeout(() => pause(), min * 60 * 1000);
    }
  };

  useEffect(
    () => () => {
      if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
      if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      // Don't steal Space from an element the user is actually focusing (a
      // button press should activate it, not pause/play the music).
      if (e.target && e.target.closest && e.target.closest("button")) return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") seek(Math.min(durationRef.current, progressRef.current + 5));
      else if (e.key === "ArrowLeft") seek(Math.max(0, progressRef.current - 5));
      else if (e.key === "l" || e.key === "L") toggleLike();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay, seek, toggleLike]);

  const openPlaylistPicker = async () => {
    openDialog("playlist");
    setPlaylistError("");
    if (!user) return;
    setPlaylistsLoading(true);
    try {
      const { data } = await getMyPlaylists();
      setMyPlaylists(data || []);
    } catch {
      setPlaylistError("Could not load playlists");
    } finally {
      setPlaylistsLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlist) => {
    if (!track) return;
    setPlaylistBusy(true);
    setPlaylistError("");
    try {
      await addTrackToPlaylist(playlist._id, track);
      setAddedId(playlist._id);
      if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current);
      playlistTimerRef.current = setTimeout(() => {
        closeDialog();
        setAddedId(null);
      }, 700);
    } catch {
      setPlaylistError("Could not add to playlist");
    } finally {
      setPlaylistBusy(false);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!track || !newPlaylistName.trim()) return;
    setPlaylistBusy(true);
    setPlaylistError("");
    try {
      const { data } = await createPlaylist({ name: newPlaylistName.trim() });
      await addTrackToPlaylist(data._id, track);
      setNewPlaylistName("");
      setAddedId(data._id);
      if (playlistTimerRef.current) clearTimeout(playlistTimerRef.current);
      playlistTimerRef.current = setTimeout(() => {
        closeDialog();
        setAddedId(null);
      }, 700);
    } catch {
      setPlaylistError("Could not create playlist");
    } finally {
      setPlaylistBusy(false);
    }
  };

  const handleShare = async () => {
    const text = `${track?.name} — ${track?.artist_name}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Share link copied to clipboard");
    } catch {
      showToast(text);
    }
  };

  const handleAlbumTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleAlbumTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy < -60) openDialog("queue");
  };

  const menuItems = [
    {
      key: "quality",
      label: `Audio quality — ${quality}`,
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" {...iconProps}>
          <path d="M1 8h5l3.5-4.5 3 9L16 5l3 3h4" />
          <path d="M3 12h3l2.5-3 3 9 3.5-10 3.5 4h3" />
        </svg>
      ),
      onClick: () => {
        closeDialog();
        openDialog("quality");
      },
    },
    {
      key: "playlist",
      label: "Add to playlist",
      icon: <Icon.Playlist width={18} height={18} />,
      onClick: () => {
        closeDialog();
        openPlaylistPicker();
      },
    },
    {
      key: "favorite",
      label: isLiked ? "Remove from favorites" : "Add to favorites",
      icon: <Icon.Heart filled={isLiked} width={18} height={18} />,
      onClick: () => {
        closeDialog();
        toggleLike();
      },
    },
    {
      key: "share",
      label: "Share this track",
      icon: <Icon.Share width={18} height={18} />,
      onClick: () => {
        closeDialog();
        handleShare();
      },
    },
    {
      key: "sleep",
      label: sleepTimer > 0 ? `Sleep timer — ${sleepTimer} min` : "Sleep timer",
      icon: (
        <svg viewBox="0 0 24 24" width="18" height="18" {...iconProps}>
          <path d="M12 3a9 9 0 1 0 9 9c0-4.6-3.5-8.4-8-8.9l.2.4a9 9 0 0 1-3.4.5" />
        </svg>
      ),
      onClick: () => {
        closeDialog();
        openDialog("sleep");
      },
    },
  ];

  if (!track) {
    return (
      <div className="flex h-screen items-center justify-center bg-ink-950 text-white">
        <p className="text-white/50">Nothing is playing.</p>
        <button onClick={() => navigate("/")} className="ml-4 text-brand">
          Go to Home
        </button>
      </div>
    );
  }

  const artDesktop = "min(44vh, 38vw, 500px, calc(100vh - 565px))";
  const artMobile = "min(58vw, 30vh, 290px)";

  return (
    <motion.div
      className="font-premium fixed inset-0 z-50 flex flex-col overflow-hidden bg-ink-950 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label="Now playing screen"
    >
      <NowPlayingBackground imageUrl={src} />

      {/* ————— Flat header ————— */}
      <motion.header {...step(0, 0.1)} className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-6">
        <button onClick={() => navigate(-1)} className={HEADER_BTN} aria-label="Go back" title="Back">
          <Icon.Back width={21} height={21} />
        </button>

        <button onClick={() => openDialog("menu")} className={HEADER_BTN} aria-label="Options menu" title="Options">
          <Icon.Menu />
        </button>
      </motion.header>

      {/* ————— Center stage ————— */}
      <div className="relative z-10 mx-auto flex h-full min-h-0 w-full max-w-[1560px] flex-col lg:px-8 lg:pt-20">
        <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 overflow-y-auto px-6 pb-24 pt-16 lg:gap-6 lg:overflow-hidden lg:px-8 lg:pb-8 lg:pt-0">
          {/* Artwork (swipe up anywhere on it for the queue) */}
          <div
            className="flex shrink-0 justify-center"
            onTouchStart={handleAlbumTouchStart}
            onTouchEnd={handleAlbumTouchEnd}
          >
            <AlbumArtwork
              track={track}
              isPlaying={isPlaying}
              onLike={toggleLike}
              accent={accent}
              size={artDesktop}
            />
          </div>

          {/* Song details — animates on track change */}
          <SongInformation track={track} quality={quality} />

          {/* Progress */}
          <div className="w-full lg:max-w-[560px]">
            <ProgressBar progress={progress} duration={duration} onSeek={seek} buffered={buffered} />
          </div>

          {/* Controls */}
          <div className="w-full">
            <PlayerControls
              isPlaying={isPlaying}
              isShuffled={isShuffled}
              repeatMode={repeatMode}
              onShuffle={toggleShuffle}
              onPrev={playPrev}
              onTogglePlay={togglePlay}
              onNext={playNext}
              onRepeat={cycleRepeat}
            />
          </div>

          {/* Mobile action row */}
          <div className="flex items-center justify-center gap-2 lg:hidden">
            <button
              onClick={toggleLike}
              aria-pressed={isLiked}
              aria-label="Add to favorites"
              className={`flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium transition-colors hover:bg-white/[0.12] ${
                isLiked ? "text-rose" : "text-white/70"
              }`}
            >
              <Icon.Heart filled={isLiked} width={16} height={16} />
              Favorites
            </button>
            <button
              onClick={() => openDialog("lyrics")}
              aria-label="Lyrics"
              className="flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.12]"
            >
              <Icon.Lyric width={16} height={16} />
              Lyrics
            </button>
            <button
              onClick={() => openDialog("queue")}
              aria-label="Up next"
              className="flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.12]"
            >
              <Icon.Queue width={16} height={16} />
              Up next
            </button>
          </div>
        </main>
      </div>

      {/* ————— Queue sheet ————— */}
      <AnimatePresence>
        {dialog.kind === "queue" && (
          <QueueSheet open onClose={closeDialog} queue={queue} currentTrack={track} onPlay={playTrack} />
        )}
      </AnimatePresence>

      {/* ————— Lyrics sheet ————— */}
      <AnimatePresence>
        {dialog.kind === "lyrics" && (
          <LyricsSheet open onClose={closeDialog} track={track} progress={progress} duration={duration} />
        )}
      </AnimatePresence>

      {/* ————— Three-dot menu ————— */}
      <AnimatePresence>
        {dialog.kind === "menu" && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-white/10 bg-ink-900/95 px-6 pb-8 pt-4 text-white backdrop-blur-2xl sm:bottom-6 sm:left-auto sm:right-6 sm:max-h-[80vh] sm:overflow-y-auto sm:rounded-[20px] sm:border sm:border-white/10 sm:px-3 sm:py-2"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Options"
            >
              <div className="mb-4 flex justify-center sm:hidden">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>
              <div className="flex flex-col gap-1">
                {menuItems.map((o) => (
                  <button
                    key={o.key}
                    onClick={o.onClick}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium text-white/85 transition-colors hover:bg-white/[0.07]"
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.07] text-white/80">{o.icon}</span>
                    {o.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ————— Audio quality ————— */}
      <AnimatePresence>
        {dialog.kind === "quality" && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-white/10 bg-ink-900/95 px-6 pb-8 pt-4 text-white backdrop-blur-2xl sm:rounded-t-[32px]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Audio quality"
            >
              <div className="mb-5 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Audio quality</h2>
                <button onClick={closeDialog} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/[0.07]" aria-label="Close">
                  <Icon.Close width={16} height={16} />
                </button>
              </div>
              <p className="mb-4 text-sm text-white/50">Higher quality uses more data and battery.</p>
              <div className="flex flex-col">
                {QUALITY_OPTIONS.map((q) => {
                  const active = q === quality;
                  return (
                    <button
                      key={q}
                      onClick={() => pickQuality(q)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/40"
                          : "text-white/85 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>{q}</span>
                      {active && <span className="text-accent-300">✓</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ————— Add to playlist ————— */}
      <AnimatePresence>
        {dialog.kind === "playlist" && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[72vh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-ink-900/95 px-6 pb-8 pt-4 text-white backdrop-blur-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Add to playlist"
            >
              <div className="mb-4 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Add to playlist</h2>
                <button onClick={closeDialog} className="grid h-9 w-9 place-items-center rounded-full text-white/70 hover:bg-white/[0.07]" aria-label="Close">
                  <Icon.Close width={16} height={16} />
                </button>
              </div>
              <p className="mb-4 truncate text-sm text-white/50">{track.name}</p>

              {!user ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-white/60">Login to save this song to a playlist.</p>
                  <button onClick={() => navigate("/login")} className="rounded-full bg-gradient-to-r from-accent-200 to-accent-600 px-6 py-2 text-sm font-semibold text-black transition-transform hover:scale-105">
                    Login
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleCreateAndAdd} className="mb-4 flex items-center gap-2">
                    <input
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="New playlist name…"
                      className="h-10 min-w-0 flex-1 rounded-full bg-white/10 px-4 text-sm text-white placeholder-white/40 outline-none focus:bg-white/15"
                    />
                    <button
                      type="submit"
                      disabled={playlistBusy || !newPlaylistName.trim()}
                      className="rounded-full bg-gradient-to-r from-accent-200 to-accent-600 px-4 py-2 text-sm font-semibold text-black transition-colors disabled:opacity-40"
                    >
                      Create
                    </button>
                  </form>

                  {playlistError && (
                    <p className="mb-3 rounded-lg bg-red-500/10 px-4 py-2 text-xs text-red-400">{playlistError}</p>
                  )}

                  {playlistsLoading ? (
                    <p className="py-6 text-center text-sm text-white/40">Loading playlists…</p>
                  ) : myPlaylists.length ? (
                    myPlaylists.map((p) => {
                      const added = addedId === p._id;
                      return (
                        <button
                          key={p._id}
                          onClick={() => handleAddToPlaylist(p)}
                          disabled={playlistBusy}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                            added ? "bg-accent-500/15" : "hover:bg-white/[0.06]"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <img
                              src={imageSrc(p.coverImage || p.tracks?.[0]?.albumImage || p.tracks?.[0]?.image)}
                              onError={handleImageError}
                              alt={p.name}
                              className="h-11 w-11 rounded-xl object-cover ring-1 ring-white/10"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium text-white">{p.name}</span>
                              <span className="block text-xs text-white/40">{p.tracks?.length || 0} songs</span>
                            </span>
                          </span>
                          <span className={`text-sm font-semibold ${added ? "text-accent-300" : "text-accent-300/70"}`}>
                            {added ? "✓" : "+"}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <p className="py-4 text-center text-sm text-white/40">No playlists yet. Create one above.</p>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ————— Sleep timer ————— */}
      <AnimatePresence>
        {dialog.kind === "sleep" && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDialog}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-white/10 bg-ink-900/95 px-6 pb-8 pt-4 text-white backdrop-blur-2xl"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="Sleep timer"
            >
              <div className="mb-5 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/20" />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-extrabold">Sleep timer</h2>
                {sleepTimer > 0 && (
                  <span className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-300 ring-1 ring-accent-500/40">
                    {sleepTimer} min
                  </span>
                )}
              </div>
              <p className="mb-4 text-sm text-white/50">Music stops playing after the selected time.</p>
              <div className="flex flex-col">
                {SLEEP_TIMER_OPTIONS.map((min) => {
                  const active = min === sleepTimer;
                  return (
                    <button
                      key={min}
                      onClick={() => setSleepTime(min)}
                      className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors ${
                        active
                          ? "bg-accent-500/15 text-accent-300 ring-1 ring-accent-500/40"
                          : "text-white/85 hover:bg-white/[0.06]"
                      }`}
                    >
                      <span>{min === 0 ? "Off" : `${min} minutes`}</span>
                      {active && <span className="text-accent-300">✓</span>}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast message={toast?.message} onClose={closeToast} />
    </motion.div>
  );
}