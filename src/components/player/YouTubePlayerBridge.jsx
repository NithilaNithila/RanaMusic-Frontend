import { useEffect, useRef } from "react";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

// YT states: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering.
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;
const YT_STATE_ENDED = 0;

let apiPromise = null;

// Loads the official YouTube IFrame API script exactly once, resolving with
// the global YT namespace when it's ready.
function loadIframeApi() {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prev === "function") prev();
      resolve(window.YT);
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

// Dedicated IFrame API messenger (ignored by ad units on the embed).
function messageSource() {
  return (window.location.protocol === "https:" ? "https://" : "http://") + "www.youtube.com";
}

export default function YouTubePlayerBridge() {
  const {
    youtubeVideoId,
    volume,
    registerYoutube,
    unregisterYoutube,
    reportYoutube,
    playNext,
  } = useAudioPlayer();

  const containerRef = useRef(null);
  const playerRef = useRef();
  const playNextRef = useRef(playNext);
  const volumeRef = useRef(volume);

  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  useEffect(() => {
    volumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    if (!youtubeVideoId) {
      // No active embed: leave any registered handle in place so controls
      // still route to the iframe until the next track replaces it.
      return undefined;
    }
    let cancelled = false;
    playerRef.current = null;
    containerRef.current.innerHTML = "";

    const setup = async () => {
      try {
        const YT = await loadIframeApi();
        if (cancelled || !youtubeVideoId) return;

        const playerEl = document.createElement("div");
        containerRef.current.appendChild(playerEl);

        const player = new YT.Player(playerEl, {
          width: "640",
          height: "360",
          videoId: youtubeVideoId,
          host: messageSource(),
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              if (cancelled) return;
              playerRef.current = player;
              // Initial volume snapshot; runtime changes go through
              // registerYoutube().setVolume via changeVolume(...).
              player.setVolume(volumeRef.current * 100);
              registerYoutube({
                play: () => player.playVideo(),
                pause: () => player.pauseVideo(),
                seekTo: (t) => player.seekTo(t, true),
                setVolume: (v) => player.setVolume(v * 100),
              });
              player.playVideo();
              reportYoutube({ playing: true });
            },
            onStateChange: (e) => {
              if (cancelled) return;
              if (e.data === YT_STATE_PLAYING) {
                reportYoutube({ playing: true });
              } else if (e.data === YT_STATE_PAUSED) {
                reportYoutube({ playing: false });
              } else if (e.data === YT_STATE_ENDED) {
                reportYoutube({ playing: false });
                if (playNextRef.current) {
                  playNextRef.current();
                }
              }
            },
          },
        });

        // Poll the player for progress/duration so the UI timeline reflects
        // the embedded stream (the iframe API has no timeupdate event).
        const timer = window.setInterval(() => {
          if (cancelled || playerRef.current !== player) return;
          if (typeof player.getCurrentTime !== "function") return;
          const p = player.getCurrentTime();
          const d = player.getDuration();
          if (typeof p === "number" && typeof d === "number" && d > 0) {
            reportYoutube({ progress: p, duration: d });
          }
        }, 500);

        return () => {
          window.clearInterval(timer);
          if (typeof player.destroy === "function") player.destroy();
          playerRef.current = null;
        };
      } catch {
        /* IFrame API blocked/unavailable — treat the track as unavailable */
      }
    };

    const cleanup = setup();
    return () => {
      cancelled = true;
      cleanup?.then?.((fn) => {
        if (typeof fn === "function") fn();
      });
      unregisterYoutube();
    };
  }, [youtubeVideoId, registerYoutube, unregisterYoutube, reportYoutube]);

  if (!youtubeVideoId) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-[-9999px] h-[360px] w-[640px] overflow-hidden"
    />
  );
}