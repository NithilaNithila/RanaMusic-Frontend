import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { useAuth } from "../hooks/useAuth";
import { getMyPlaylists, createPlaylist, addTrackToPlaylist } from "../api/playlistApi";
import { DEFAULT_ARTWORK } from "../utils/constants";

import NowPlayingBackground from "../components/player/NowPlayingBackground.jsx";
import AlbumArt from "../components/player/AlbumArt.jsx";
import SeekBar from "../components/player/SeekBar.jsx";
import PlayerControls from "../components/player/PlayerControls.jsx";
import QueueSheet from "../components/player/QueueSheet.jsx";
import Toast from "../components/common/Toast.jsx";

const iconProps = { width: 22, height: 22, stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

const Icon = {
  Back: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  Heart: (props) => (
    <svg viewBox="0 0 24 24" width="24" height="24" fill={props.filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={props.filled ? 0 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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
  Timer: (props) => (
    <svg viewBox="0 0 24 24" {...iconProps} {...props}>
      <circle cx="12" cy="13" r="8" />
      <polyline points="12 9 12 13 14.5 14.5" />
      <line x1="9" y1="2" x2="15" y2="2" />
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
};

const SLEEP_TIMER_OPTIONS = [0, 15, 30, 45, 60];

function stagger(i) {
  return {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.25 + i * 0.07, type: "spring", stiffness: 220, damping: 22 },
  };
}

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

  const [sleepTimer, setSleepTimer] = useState(0);
  const [sleepOpen, setSleepOpen] = useState(false);
  const sleepTimeoutRef = useRef(null);
  const [toast, setToast] = useState(null);
  const [playlistOpen, setPlaylistOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const touchStartY = useRef(null);
  const [myPlaylists, setMyPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlistBusy, setPlaylistBusy] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [addedId, setAddedId] = useState(null);

  const { user } = useAuth();

  const showToast = (message) => setToast({ message });
  const closeToast = () => setToast(null);

  const setSleepTime = (min) => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    setSleepTimer(min);
    setSleepOpen(false);
    if (min > 0) {
      sleepTimeoutRef.current = setTimeout(() => pause(), min * 60 * 1000);
    }
  };

  useEffect(() => () => {
    if (sleepTimeoutRef.current) clearTimeout(sleepTimeoutRef.current);
  }, []);

  const openPlaylistPicker = async () => {
    setPlaylistOpen(true);
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
      setTimeout(() => {
        setPlaylistOpen(false);
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
      setTimeout(() => {
        setPlaylistOpen(false);
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
      showToast("Link copied to clipboard");
    } catch {
      showToast(text);
    }
  };

  const cycleSleepTimer = () => {
    setSleepOpen(true);
  };

  const handleAlbumTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleAlbumTouchEnd = (e) => {
    if (touchStartY.current == null) return;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    touchStartY.current = null;
    if (dy < -60) setQueueOpen(true);
  };

  if (!track) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14] text-white">
        <p className="text-white/50">Nothing is playing.</p>
        <button onClick={() => navigate("/")} className="ml-4 text-[#87CEEB]">
          Go to Home
        </button>
      </div>
    );
  }

  const marquee = track.name.length > 22;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col overflow-hidden text-white"
      initial={{ opacity: 0, y: 60, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      <NowPlayingBackground imageUrl={track.image} />

      <div className="relative z-10 flex h-full flex-col">
        <motion.header {...stagger(0)} className="flex shrink-0 items-center gap-3 px-5 py-3">
          <motion.button
            onClick={() => navigate(-1)}
            whileTap={{ scale: 0.88 }}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            title="Back"
          >
            <Icon.Back />
          </motion.button>

          <div className="min-w-0 flex-1 text-center">
            <p className={`text-sm font-semibold ${marquee ? "marquee-wrap" : "truncate"}`}>{track.name}</p>
            <p className="truncate text-xs text-white/50">{track.artist_name}</p>
          </div>
        </motion.header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-4">
          <div className="flex flex-1 items-center" onTouchStart={handleAlbumTouchStart} onTouchEnd={handleAlbumTouchEnd}>
            <AlbumArt track={track} isPlaying={isPlaying} onLike={toggleLike} />
          </div>

          <div className="w-full">
            <motion.div {...stagger(3)} className="mb-3 text-center">
              <h1 className={`text-xl font-bold leading-tight sm:text-2xl ${marquee ? "marquee-wrap" : "truncate"}`}>
                {track.name}
              </h1>
              <p className="mt-1 truncate text-sm text-white/60">{track.artist_name}</p>
              <p className="mt-0.5 truncate text-xs text-white/35">{track.album_name || "Single"}</p>

              <div className="mt-3 flex items-center justify-center gap-6 sm:gap-8">
                <motion.button
                  onClick={toggleLike}
                  whileTap={{ scale: 1.25 }}
                  className={`transition-colors ${isLiked ? "text-[#ff5a7a]" : "text-white/60 hover:text-white"}`}
                  title="Like"
                >
                  <Icon.Heart filled={isLiked} />
                </motion.button>
                <motion.button
                  onClick={() => setSleepOpen(true)}
                  whileTap={{ scale: 0.88 }}
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    sleepTimer > 0 ? "bg-white/15 text-[#87CEEB]" : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                  }`}
                  title={sleepTimer > 0 ? `Sleep timer: ${sleepTimer} min` : "Sleep timer"}
                >
                  <Icon.Timer />
                  {sleepTimer > 0 && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-[#87CEEB] px-1.5 text-[9px] font-bold text-black">
                      {sleepTimer}
                    </span>
                  )}
                </motion.button>
                <motion.button
                  onClick={openPlaylistPicker}
                  whileTap={{ scale: 0.88 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  title="Add to playlist"
                >
                  <Icon.Playlist />
                </motion.button>
                <motion.button
                  onClick={handleShare}
                  whileTap={{ scale: 0.88 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  title="Share"
                >
                  <Icon.Share />
                </motion.button>
              </div>
            </motion.div>

            <motion.div {...stagger(4)} className="mb-3">
              <SeekBar progress={progress} duration={duration} onSeek={seek} />
            </motion.div>

            <motion.div {...stagger(5)} className="mb-1">
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
            </motion.div>

            <motion.div {...stagger(6)} className="flex items-center justify-center px-2 pt-2">
              <motion.button
                onClick={() => setQueueOpen(true)}
                whileTap={{ scale: 0.9 }}
                className="flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                title="Swipe up to open queue"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 15 12 9 18 15" />
                </svg>
                Queue
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {playlistOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPlaylistOpen(false)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-[28px] border-t border-white/10 bg-[#141414] px-6 pb-8 pt-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-4 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/25" />
              </div>
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xl font-bold">Add to playlist</h2>
              </div>
              <p className="mb-4 truncate text-sm text-white/50">{track.name}</p>

              {!user ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <p className="text-sm text-white/60">Login to save this song to a playlist.</p>
                  <button
                    onClick={() => navigate("/login")}
                    className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
                  >
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
                      className="rounded-full bg-[#87CEEB] px-4 py-2 text-sm font-semibold text-black transition-colors disabled:opacity-40"
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
                          className={`flex w-full items-center justify-between gap-3 rounded-lg px-4 py-3 text-left transition-colors disabled:opacity-50 ${
                            added ? "bg-[#87CEEB]/15" : "hover:bg-white/10"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <img
                              src={p.coverImage || p.tracks?.[0]?.albumImage || p.tracks?.[0]?.image || DEFAULT_ARTWORK}
                              alt={p.name}
                              className="h-11 w-11 rounded-md object-cover"
                            />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-medium">{p.name}</span>
                              <span className="block text-xs text-white/40">{p.tracks?.length || 0} songs</span>
                            </span>
                          </span>
                          <span className={`text-sm font-semibold ${added ? "text-[#87CEEB]" : "text-[#87CEEB]/70"}`}>
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

      <AnimatePresence>
        {queueOpen && (
          <QueueSheet
            open={queueOpen}
            onClose={() => setQueueOpen(false)}
            queue={queue}
            currentTrack={track}
            onPlay={playTrack}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sleepOpen && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSleepOpen(false)} />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] border-t border-white/10 bg-[#141414] px-6 pb-8 pt-4"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <div className="mb-4 flex justify-center">
                <div className="h-1.5 w-12 rounded-full bg-white/25" />
              </div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Sleep timer</h2>
                {sleepTimer > 0 && (
                  <span className="rounded-full bg-[#87CEEB]/20 px-3 py-1 text-xs font-semibold text-[#87CEEB]">
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
                      className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors ${
                        active ? "bg-[#87CEEB]/15 text-[#87CEEB]" : "text-white/85 hover:bg-white/10"
                      }`}
                    >
                      <span>{min === 0 ? "Off" : `${min} minutes`}</span>
                      {active && <span className="text-[#87CEEB]">✓</span>}
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
