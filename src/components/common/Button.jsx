import { useState } from "react";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  ripple = false,
  className = "",
  ...props
}) {
  const base =
    "group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-light-bg dark:focus-visible:ring-offset-brand-dark";

  const sizes = {
    sm: "px-3.5 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base",
  };

  const variants = {
    primary:
      "bg-gradient-to-r from-brand to-brand-200 text-black shadow-lg shadow-brand/30 hover:from-brand-300 hover:to-brand-200 hover:shadow-brand/50 hover:-translate-y-0.5",
    secondary:
      "bg-black/5 dark:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 backdrop-blur-sm hover:bg-black/10 dark:hover:bg-white/15 hover:border-black/20 dark:hover:border-white/20",
    outline:
      "bg-transparent text-brand border border-brand/50 hover:bg-brand/10 hover:border-brand",
    ghost: "bg-transparent text-black/80 dark:text-white/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white",
    danger:
      "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 hover:text-red-300",
    trend:
      "bg-gradient-to-r from-brand via-brand-200 to-brand text-black shadow-lg shadow-brand/40 ring-1 ring-white/40 hover:shadow-xl hover:shadow-brand/60 hover:brightness-110",
    gradient:
      "bg-gradient-to-r from-premium-primary to-premium-secondary text-white shadow-lg shadow-premium-primary/30 ring-1 ring-white/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-premium-secondary/30 hover:brightness-110",
  };

  const [ripples, setRipples] = useState([]);

  const spawnRipple = (e) => {
    if (!ripple) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const id = `${Date.now()}-${Math.random()}`;
    setRipples((r) => [
      ...r,
      { id, x: e.clientX - rect.left - size / 2, y: e.clientY - rect.top - size / 2, size },
    ]);
  };

  return (
    <button
      onPointerDown={spawnRipple}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {ripple &&
        ripples.map((r) => (
          <span
            key={r.id}
            onAnimationEnd={() => setRipples((prev) => prev.filter((x) => x.id !== r.id))}
            className="pointer-events-none absolute animate-ripple rounded-full bg-white/50"
            style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
          />
        ))}
      {variant === "trend" && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
        />
      )}
      {children}
    </button>
  );
}
