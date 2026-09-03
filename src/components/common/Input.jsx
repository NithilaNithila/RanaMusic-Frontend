export default function Input({ className = "", icon, rightSlot, ...props }) {
  const inputClass = `w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/[0.06] px-4 py-2.5 text-sm text-black dark:text-white placeholder-black/40 dark:placeholder-white/40 outline-none transition-all duration-200 hover:border-black/20 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/[0.08] focus:border-brand/60 focus:bg-black/5 dark:focus:bg-white/[0.08] focus:ring-2 focus:ring-brand/30`;

  if (!icon) return <input className={`${inputClass} ${className}`} {...props} />;

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
        {icon}
      </span>
      <input
        className={`${inputClass} pl-10 ${rightSlot ? "pr-20" : ""}`}
        {...props}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {rightSlot}
        </div>
      )}
    </div>
  );
}
