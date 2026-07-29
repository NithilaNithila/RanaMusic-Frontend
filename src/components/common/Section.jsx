import { useReveal } from "../../hooks/useReveal";

export default function Section({ title, subtitle, action, children }) {
  const ref = useReveal();

  return (
    <section ref={ref} className="reveal mb-12">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-white/50 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
