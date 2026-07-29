export default function Equalizer({ className = "" }) {
  return (
    <span className={`inline-flex items-end gap-[3px] h-4 ${className}`}>
      <span className="w-[3px] h-full bg-brand rounded-sm origin-bottom animate-eq1" />
      <span className="w-[3px] h-full bg-brand rounded-sm origin-bottom animate-eq2" />
      <span className="w-[3px] h-full bg-brand rounded-sm origin-bottom animate-eq3" />
      <span className="w-[3px] h-full bg-brand rounded-sm origin-bottom animate-eq4" />
    </span>
  );
}
