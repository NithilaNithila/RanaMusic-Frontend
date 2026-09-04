import { memo } from "react";
import { useReveal } from "../../hooks/useReveal";

function Section({ title, subtitle, action, children, className = "" }) {
  const ref = useReveal();

  return (
    <section ref={ref} className={`reveal mb-14 ${className}`}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-2 h-7 w-1 shrink-0 rounded-full bg-gradient-to-b from-brand to-accent-500/60" />
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-black/90 dark:text-white/95 md:text-[28px]">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-black/50 dark:text-white/50">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default memo(Section);
