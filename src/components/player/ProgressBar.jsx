import { useCallback, useMemo, useRef, useState } from "react";
import { formatDuration } from "../../utils/formatDuration";

export default function ProgressBar({ progress, duration, onSeek, buffered = 0 }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);
  const [scrub, setScrub] = useState(null); // { value, x } while hovering/dragging

  const pctOf = (v) => (duration ? Math.max(0, Math.min(100, (v / duration) * 100)) : 0);
  const display = dragging ? dragValue : progress;
  const bufferedMs = Math.min(buffered, duration || 0);

  const computeScrub = useCallback(
    (clientX) => {
      if (!trackRef.current) return null;
      const rect = trackRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return { value: x * duration, x: x * rect.width };
    },
    [duration]
  );

  const handlePointerDown = (e) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
    const s = computeScrub(e.clientX);
    setDragValue(s.value);
    setScrub(s);
  };

  const handlePointerMove = (e) => {
    const s = computeScrub(e.clientX);
    if (!s) return;
    if (dragging) {
      setDragValue(s.value);
      setScrub(s);
    } else if (e.pointerType === "mouse") {
      setScrub(s);
    }
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    setScrub(null);
    const s = computeScrub(e.clientX);
    if (s) onSeek(s.value);
  };

  const handleLeave = () => {
    if (!dragging) setScrub(null);
  };

  const shimmerSegments = useMemo(
    () => [
      { left: "6%", w: "15%" },
      { left: "36%", w: "20%" },
      { left: "70%", w: "17%" },
    ],
    []
  );

  const chipValue = scrub?.value ?? display;
  const chipX = scrub?.x ?? pctOf(display);

  return (
    <div className="flex w-full items-center gap-3 text-xs font-medium tabular-nums tracking-wide text-white/60">
      <span className="w-11 text-right text-white/70 tabular-nums">{formatDuration(display)}</span>

      <div
        ref={trackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(display)}
        tabIndex={0}
        className="group relative h-8 flex-1 touch-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          setDragging(false);
          setScrub(null);
        }}
        onPointerLeave={handleLeave}
        onKeyDown={(e) => {
          if (!duration) return;
          if (e.key === "ArrowRight") onSeek(Math.min(duration, progress + 5));
          if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 5));
        }}
      >
        {/* Track */}
        <div
          className="absolute top-1/2 h-1 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/10 transition-all duration-200 group-hover:h-[6px]"
          style={dragging ? { height: "6px" } : undefined}
        >
          {/* Buffered */}
          <span className="absolute inset-y-0 rounded-full bg-white/[0.12]" style={{ width: `${pctOf(bufferedMs)}%` }} />
          {shimmerSegments.map((s, i) => (
            <span key={i} className="absolute inset-y-0 rounded-full bg-white/[0.07]" style={{ left: s.left, width: s.w }} />
          ))}
        </div>

        {/* Gradient progress (smooth when not dragging) */}
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full transition-all duration-200 group-hover:h-[6px]"
          style={dragging ? { height: "6px" } : undefined}
        >
          <div
            className={`h-full rounded-full ${dragging ? "" : "transition-[width] duration-150 ease-linear"}`}
            style={{
              width: `${pctOf(display)}%`,
              background: "linear-gradient(to right, #7C5CFF 0%, #6D5FF1 30%, #4F9CF9 62%, #87CEEB 85%, #BDE3FF 100%)",
              boxShadow: "0 0 10px rgba(124,92,255,0.6), 0 0 26px rgba(79,156,249,0.35)",
            }}
          />
        </div>

        {/* Hover / drag scrub chip */}
        {chipValue > 0 && (scrub || dragging) && (
          <span
            className="pointer-events-none absolute -top-7 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] font-semibold tabular-nums text-white ring-1 ring-white/15 backdrop-blur-sm"
            style={{ left: `${chipX + 2}px` }}
          >
            {formatDuration(chipValue)}
          </span>
        )}

        {/* Draggable thumb */}
        <div
          className="absolute top-1/2 flex -translate-y-1/2 items-center justify-center transition-opacity duration-150"
          style={{ left: `calc(${pctOf(display)}% - 11px)` }}
        >
          <span
            className={`rounded-full transition-all duration-150 ${
              dragging ? "h-[22px] w-[22px]" : "h-[14px] w-[14px] opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
            }`}
            style={{
              background: "radial-gradient(circle at 32% 28%, #ffffff, #dbe8ff 60%, #a2aff5)",
              boxShadow:
                "0 0 0 3px rgba(255,255,255,0.22), 0 4px 14px rgba(0,0,0,0.5), 0 0 18px rgba(140,150,255,0.85)",
            }}
          />
        </div>
      </div>

      <span className="w-11 text-white/45">{formatDuration(duration)}</span>
    </div>
  );
}