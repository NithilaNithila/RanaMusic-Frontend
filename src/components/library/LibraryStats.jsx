import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function CountUp({ value, duration = 900 }) {
  const [n, setN] = useState(0);
  const prevValue = useRef(-1);

  useEffect(() => {
    if (value === prevValue.current) return;
    prevValue.current = value;
    let raf;
    const start = performance.now();
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{n.toLocaleString()}</span>;
}

export default function LibraryStats({ stats = [] }) {
  if (!stats.length) return null;

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid grid-cols-2 gap-4 lg:grid-cols-4"
    >
      {stats.map((s) => (
        <motion.div
          key={s.key}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
          }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-[20px] border border-black/10 bg-white/60 p-5 shadow-lg shadow-black/[0.05] backdrop-blur-xl transition-colors duration-300 hover:border-black/20 dark:border-white/10 dark:bg-white/[0.05] dark:shadow-black/20 dark:hover:border-white/20"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
            style={{ backgroundColor: s.accent || "#4F9CF9" }}
          />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-black/45 dark:text-white/45">
                {s.label}
              </p>
              <p className="mt-1.5 text-3xl font-extrabold tracking-tight text-black dark:text-white">
                <CountUp value={s.value} />
              </p>
            </div>
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white shadow-md ring-1 ring-white/25"
              style={{
                backgroundImage: `linear-gradient(135deg, ${s.accent || "#4F9CF9"}, ${s.secondary || s.accent || "#7C3AED"})`,
              }}
            >
              {s.icon}
            </span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}