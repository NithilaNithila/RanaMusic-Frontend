import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext.jsx";

export function useAudioPlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("useAudioPlayer must be used within PlayerProvider");
  return ctx;
}
