// Decorative layer that sits behind Home's content: soft blurred color
// glows plus note glyphs. Rendered once, statically, with no scroll-linked
// transforms — the scroll animation was dropped to keep the main thread
// idle on every viewport (mobile/TV included).
const GLOWS = [
  { className: "top-[6%] left-[4%] w-72 h-72 bg-brand/25" },
  { className: "top-[34%] right-[6%] w-96 h-96 bg-brand-400/15" },
  { className: "top-[64%] left-[14%] w-80 h-80 bg-accent-300/10" },
  { className: "top-[88%] right-[16%] w-64 h-64 bg-brand-300/15" },
];

const NOTES = [
  { className: "top-[16%] left-[10%] text-4xl", char: "\u266A" },
  { className: "top-[48%] right-[12%] text-3xl", char: "\u266B" },
  { className: "top-[78%] left-[28%] text-2xl", char: "\u2669" },
];

export default function ParallaxBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {GLOWS.map((layer, i) => (
        <div
          key={i}
          className={`absolute rounded-full blur-3xl ${layer.className}`}
        />
      ))}
      {NOTES.map((note, i) => (
        <span
          key={i}
          className={`absolute text-black/5 select-none dark:text-white/10 ${note.className}`}
        >
          {note.char}
        </span>
      ))}
    </div>
  );
}