import { useContext } from "react";
import {
  PlayerContext,
  PlaybackProgressContext,
} from "../context/PlayerContext.jsx";

// Light reader: subscribes ONLY to the stable player state (current track,
// queue, isPlaying, likes, controls...). Does NOT re-render on every
// progress/timeupdate tick. Use this from pages & cards that just need to
// play/pause/queue.
export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer must be used within PlayerProvider");
  return ctx;
}

// Progress-only reader: { progress, duration }. Changes ~4x/sec while audio
// plays, so keep this to components that actually draw a timeline.
export function usePlaybackProgress() {
  const ctx = useContext(PlaybackProgressContext);
  if (!ctx) {
    throw new Error("usePlaybackProgress must be used within PlayerProvider");
  }
  return ctx;
}

// Full API (player + progress). Re-renders every timeunit tick — use only
// where the whole player surface is needed (PlayerBar, NowPlaying).
export function useAudioPlayer() {
  const player = usePlayer();
  const progress = usePlaybackProgress();
  return { ...player, ...progress };
}