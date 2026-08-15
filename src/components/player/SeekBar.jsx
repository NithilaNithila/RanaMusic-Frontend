import { useCallback, useRef, useState } from "react";
import { formatDuration } from "../../utils/formatDuration";

export default function SeekBar({ progress, duration, onSeek }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragValue, setDragValue] = useState(0);

  const pctOf = (v) => (duration ? Math.max(0, Math.min(100, (v / duration) * 100)) : 0);
  const display = dragging ? dragValue : progress;

  const computeValue = useCallback(
    (clientX) => {
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return ratio * duration;
    },
    [duration]
  );

  const handlePointerDown = (e) => {
    if (!duration) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const v = computeValue(e.clientX);
    setDragging(true);
    setDragValue(v);
  };

  const handlePointerMove = (e) => {
    if (!dragging) return;
    setDragValue(computeValue(e.clientX));
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);
    onSeek(computeValue(e.clientX));
  };

  return (
    <div className="flex w-full items-center gap-3 text-xs font-medium tabular-nums text-white/70">
      <span className="w-10 text-right">{formatDuration(display)}</span>

      <div
        ref={trackRef}
        className="group relative h-6 flex-1 touch-none cursor-pointer"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => setDragging(false)}
      >
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white transition-[height] duration-150 group-hover:h-2"
            style={{ width: `${pctOf(display)}%` }}
          />
        </div>
        <div
          className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
          style={{ left: `calc(${pctOf(display)}% - 7px)`, width: 14, height: 14 }}
        />
      </div>

      <span className="w-10">-{formatDuration(Math.max(0, duration - display))}</span>
    </div>
  );
}
