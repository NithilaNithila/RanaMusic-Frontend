import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { getMyPlaylists, deletePlaylist } from "../api/playlistApi";
import { sameTrack } from "../utils/helpers";
import { imageSrc, handleImageError } from "../utils/imageFallback";
import TrackImage from "../components/common/TrackImage.jsx";
import Equalizer from "../components/common/Equalizer.jsx";
import Toast from "../components/common/Toast.jsx";

// Counts up to `value` when it mounts / changes
function AnimatedNumber({ value }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v));
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.9, ease: "easeOut" });
    return () => controls.stop();
  }, [value, mv]);
  return <motion.span>{rounded}</motion.span>;
}

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, x: -14 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 320, damping: 26 } },
};

export default function Profile() {
  const { user, logout, deleteAccount } = useAuth();
  const { likedList, playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [playlists, setPlaylists] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmingPlaylistId, setConfirmingPlaylistId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let alive = true;
    getMyPlaylists()
      .then((res) => {
        if (alive) setPlaylists(res.data || []);
      })
      .catch(() => {
        if (alive) setPlaylists([]);
      });
    return () => {
      alive = false;
    };
  }, [user]);

  if (!user) return null;

  const handleDeleteAccount = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to delete account", type: "error" });
      setDeleting(false);
      setConfirmingDelete(false);
    }
  };

  const handleDeletePlaylist = async (p) => {
    try {
      await deletePlaylist(p._id);
      setPlaylists((prev) => prev.filter((x) => x._id !== p._id));
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to delete playlist", type: "error" });
    } finally {
      setConfirmingPlaylistId(null);
    }
  };

  const initial = (user.username?.[0] || user.email?.[0] || "U").toUpperCase();
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—";

  const stats = [
    {
      label: "Liked Songs",
      value: likedList.length,
      color: "text-rose",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      label: "Playlists",
      value: playlists ? playlists.length : null,
      color: "text-brand",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ),
    },
    {
      label: "Member since",
      value: null,
      text: joined,
      color: "text-black/70 dark:text-white/70",
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-xl shadow-black/5 dark:border-white/10 dark:bg-brand-surface dark:shadow-black/30"
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-brand/60 via-brand-200/45 to-brand/35 dark:from-brand/25 dark:via-brand/[0.08] dark:to-brand/15" />

        <div className="px-6 pb-6">
          <div className="-mt-11 flex items-end gap-4">
            {/* Avatar with gradient halo */}
            <motion.div
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.15 }}
              whileHover={{ rotate: 6, scale: 1.05 }}
              className="rounded-full bg-gradient-to-tr from-brand via-brand-100 to-brand-600 p-[3px] shadow-lg shadow-brand/40"
            >
              <div className="grid h-20 w-20 place-items-center rounded-full bg-white text-3xl font-extrabold text-black dark:bg-brand-surface dark:text-white">
                {initial}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
              className="min-w-0 pb-1"
            >
              <h1 className="font-display truncate text-xl font-semibold">{user.username || user.email}</h1>
              <p className="truncate text-sm text-black/50 dark:text-white/50">{user.email}</p>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260, damping: 22 }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-black/5 bg-black/[0.03] p-4 text-center transition-colors hover:border-brand/30 dark:border-white/5 dark:bg-white/5"
              >
                <span className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full bg-current/10 ${s.color}`}>
                  {s.icon}
                </span>
                <p className={`text-xl font-bold ${s.color}`}>
                  {typeof s.value === "number" ? (
                    <AnimatedNumber value={s.value} />
                  ) : (
                    s.text ?? "—"
                  )}
                </p>
                <p className="mt-0.5 text-xs text-black/50 dark:text-white/50">{s.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.35 }}
            className="mt-5 flex flex-col gap-2 sm:flex-row"
          >
            <Link
              to="/library"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-black/5 py-2.5 text-sm font-medium text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/10 active:scale-[0.98] dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              Go to Library
            </Link>
            <button
              onClick={() => logout()}
              className="flex-1 rounded-full bg-red-500/10 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-500/20 active:scale-[0.98]"
            >
              Logout
            </button>
          </motion.div>

          {/* Danger zone */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.4 }}
            className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/[0.04] p-3"
          >
            {confirmingDelete && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-2 rounded-lg bg-red-500/10 p-3 text-xs leading-relaxed text-red-400"
              >
                This permanently deletes your account, playlists, liked songs and history. This
                cannot be undone.
              </motion.p>
            )}
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className={`w-full rounded-full py-2.5 text-sm font-medium transition-colors ${
                confirmingDelete
                  ? "bg-red-600 text-white hover:bg-red-500"
                  : "text-red-400/70 hover:text-red-400"
              } disabled:opacity-50`}
            >
              {deleting ? "Deleting..." : confirmingDelete ? "Yes, delete my account" : "Delete account"}
            </button>
            {confirmingDelete && !deleting && (
              <button
                onClick={() => setConfirmingDelete(false)}
                className="mt-1 w-full rounded-full py-1.5 text-xs text-black/40 transition-colors hover:text-black/70 dark:text-white/40 dark:hover:text-white/70"
              >
                Cancel
              </button>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* Playlists */}
      {playlists && playlists.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-bold">Your Playlists</h2>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-2"
          >
            {playlists.map((p) => (
              <motion.div key={p._id} variants={itemVariants}>
                <Link
                  to={`/playlists/${p._id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 transition-colors hover:border-brand/50 dark:border-white/10 dark:bg-brand-surface dark:hover:border-white/25"
                >
                  <img
                    src={imageSrc(p.coverImage || p.tracks?.[0]?.albumImage || p.tracks?.[0]?.image)}
                    onError={handleImageError}
                    alt={p.name}
                    className="h-11 w-11 shrink-0 rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.07]"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium transition-colors group-hover:text-brand">{p.name}</span>
                    <span className="block text-xs text-black/50 dark:text-white/50">{p.tracks?.length || 0} songs</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-1">
                    {confirmingPlaylistId === p._id ? (
                      <>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeletePlaylist(p);
                          }}
                          className="rounded-md bg-red-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-400"
                        >
                          Delete
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmingPlaylistId(null);
                          }}
                          className="grid h-6 w-6 place-items-center rounded-md text-black/40 transition-colors hover:bg-black/5 hover:text-black/70 dark:text-white/40 dark:hover:bg-white/10 dark:hover:text-white/70"
                          aria-label="Cancel"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmingPlaylistId(p._id);
                        }}
                        className="grid h-7 w-7 place-items-center rounded-full text-black/30 opacity-0 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100 dark:text-white/30"
                        title="Delete playlist"
                        aria-label="Delete playlist"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </button>
                    )}
                  </span>
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0 text-black/25 transition-all duration-200 group-hover:translate-x-1 group-hover:text-brand dark:text-white/25"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Liked songs */}
      <div className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Liked Songs</h2>
          {likedList.length > 0 && (
            <span className="text-xs text-black/50 dark:text-white/50">{likedList.length} songs</span>
          )}
        </div>
        {likedList.length ? (
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-1"
          >
            {likedList.map((t) => {
              const isCurrent = sameTrack(currentTrack, t);
              return (
                <motion.button
                  key={t.id}
                  variants={itemVariants}
                  onClick={() => playTrack(t, [t])}
                  whileHover={{ x: 4 }}
                  className={`group flex items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                    isCurrent
                      ? "bg-brand/10 ring-1 ring-brand/30"
                      : "hover:bg-black/[0.03] dark:hover:bg-white/[0.06]"
                  }`}
                >
                  <TrackImage
                    track={t}
                    alt={t.name}
                    className={`h-11 w-11 shrink-0 rounded-lg object-cover transition-transform duration-300 group-hover:scale-[1.07] ${
                      isCurrent ? "ring-2 ring-brand/50" : ""
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm font-medium transition-colors ${isCurrent ? "text-brand" : "group-hover:text-brand"}`}>{t.name}</span>
                    <span className="block truncate text-xs text-black/50 dark:text-white/50">{t.artist_name}</span>
                  </span>
                  {isCurrent && isPlaying ? (
                    <Equalizer playing className="!h-3.5 shrink-0" />
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="shrink-0 text-black/25 transition-all duration-200 group-hover:scale-125 group-hover:text-brand dark:text-white/25"
                    >
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl bg-black/[0.03] p-4 text-sm text-black/40 dark:bg-white/5 dark:text-white/40"
          >
            No liked songs yet. Tap the heart on a song to save it here.
          </motion.p>
        )}
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
