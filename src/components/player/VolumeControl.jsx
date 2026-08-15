export default function VolumeControl({ volume, onChange }) {
  return (
    <div className="hidden sm:flex items-center gap-2 w-28">
      <span className="text-white/60 text-sm">🔊</span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-brand"
      />
    </div>
  );
}
