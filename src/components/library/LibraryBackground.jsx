export default function LibraryBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-28 -top-28 h-96 w-96 rounded-full bg-accent-800/20 blur-[130px] dark:bg-accent-800/60 dark:blur-[160px]" />
      <div className="absolute -right-28 top-0 h-80 w-80 rounded-full bg-premium-secondary/15 blur-[130px] dark:bg-premium-secondary/40 dark:blur-[150px]" />
      <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-premium-primary/15 blur-[120px] dark:bg-premium-primary/30" />
      <div className="absolute -bottom-32 left-1/4 h-96 w-96 rounded-full bg-ink-900/15 blur-[150px] dark:bg-ink-950/60 dark:blur-[170px]" />
      <div className="absolute -bottom-40 right-1/4 h-80 w-80 rounded-full bg-premium-secondary/10 blur-[140px] dark:bg-premium-primary/20 dark:blur-[160px]" />
    </div>
  );
}