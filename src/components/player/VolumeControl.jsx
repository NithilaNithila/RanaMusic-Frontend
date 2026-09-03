import { useState } from "react";

function VolumeIcon({ level }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" {...stroke}>
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
      {level > 0.5 && (
        <>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </>
      )}
      {level > 0 && level <= 0.5 && <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />}
      {level === 0 && (
        <>
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </>
      )}
    </svg>
  );
}

export default function VolumeControl({ volume, onChange, className = "hidden w-32 items-center gap-2 sm:flex" }) {
  const [mutedVolume, setMutedVolume] = useState(0.7);
  const level = Number(volume) || 0;

  const toggleMute = () => {
    if (level > 0) {
      setMutedVolume(level);
      onChange(0);
    } else {
      onChange(mutedVolume || 0.7);
    }
  };

  return (
    <div className={className}>
      <button
        onClick={toggleMute}
        className={`shrink-0 transition-colors ${level === 0 ? "text-black/35 dark:text-white/35" : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"}`}
        title={level === 0 ? "Unmute" : "Mute"}
        aria-label={level === 0 ? "Unmute" : "Mute"}
      >
        <VolumeIcon level={level} />
      </button>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="range-brand w-full"
        style={{ "--fill": `${level * 100}%` }}
        aria-label="Volume"
      />
    </div>
  );
}
