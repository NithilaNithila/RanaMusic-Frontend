import { useEffect, useRef, useState } from "react";
import useParallaxScroll from "../../hooks/useParallaxScroll";

// Each layer drifts at its own fraction of the scroll speed — smaller
// speed = feels farther away. Blurred color glows give depth, the note
// glyphs echo the ones already used in Hero.
const GLOWS = [
  { className: "top-[6%] left-[4%] w-72 h-72 bg-brand/25", speed: 0.1 },
  { className: "top-[34%] right-[6%] w-96 h-96 bg-sky-400/15", speed: 0.2 },
  { className: "top-[64%] left-[14%] w-80 h-80 bg-brand/15", speed: 0.14 },
  { className: "top-[88%] right-[16%] w-64 h-64 bg-sky-300/15", speed: 0.26 },
];

const NOTES = [
  { className: "top-[16%] left-[10%] text-4xl", char: "\u266A", speed: 0.3 },
  { className: "top-[48%] right-[12%] text-3xl", char: "\u266B", speed: 0.18 },
  { className: "top-[78%] left-[28%] text-2xl", char: "\u2669", speed: 0.34 },
];

/**
 * Full-height decorative layer that sits behind Home's content and
 * drifts as the page scrolls (each blob/note at its own speed), so the
 * background feels alive rather than static — distinct from
 * ScrollShowcase's pinned scrub section, which is left untouched.
 *
 * Respects prefers-reduced-motion: those users get the glows/notes
 * with no scroll-linked movement.
 */
export default function ParallaxBackground() {
  const rootRef = useRef(null);
  const scrollY = useParallaxScroll(rootRef);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  const offset = reduceMotion ? 0 : scrollY;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {GLOWS.map((layer, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl will-change-transform ${layer.className}`}
          style={{ transform: `translate3d(0, ${offset * layer.speed}px, 0)` }}
        />
      ))}
      {NOTES.map((note, i) => (
        <span
          key={i}
          className={`absolute text-white/10 select-none will-change-transform ${note.className}`}
          style={{ transform: `translate3d(0, ${offset * note.speed}px, 0)` }}
        >
          {note.char}
        </span>
      ))}
    </div>
  );
}
