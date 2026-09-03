// Animated "now playing" equalizer bars. Static (paused look) unless `playing`.
export default function Equalizer({ playing = true, className = "" }) {
  const speeds = [0.8, 1.05, 0.65, 0.9];
  return (
    <span
      aria-hidden="true"
      className={`flex h-4 items-end gap-[2.5px] ${className}`}
    >
      {speeds.map((d, i) => (
        <span
          key={i}
          className={`w-[3px] rounded-full bg-brand ${
            playing ? "eq-bar" : "opacity-50"
          }`}
          style={{
            height: playing ? "100%" : `${[90, 45, 70, 35][i]}%`,
            animationDuration: `${d}s`,
            animationDelay: `${i * 0.13}s`,
          }}
        />
      ))}
    </span>
  );
}
