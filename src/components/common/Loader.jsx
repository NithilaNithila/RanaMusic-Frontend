export default function Loader({ size = "md", label }) {
  const sizes = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-[3px]", lg: "h-12 w-12 border-4" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10" role="status" aria-live="polite">
      <div className="relative">
        <div className={`${sizes[size]} rounded-full border-black/10 dark:border-white/10 border-t-brand animate-spin`} />
        <div className="absolute inset-0 -z-10 rounded-full bg-brand/20 blur-lg" />
      </div>
      {label && <p className="text-xs text-black/40 dark:text-white/40">{label}</p>}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
