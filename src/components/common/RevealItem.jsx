import { useReveal } from "../../hooks/useReveal";

export default function RevealItem({ children, delay = 0, className = "" }) {
  const ref = useReveal();

  return (
    <div
      ref={ref}
      className={`reveal h-full ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
