import { Link } from "react-router-dom";
import heroFrame from "../../assets/frame_0001.jpg";

/**
 * Full-bleed hero for the Home page. This is a single static frame (the
 * clean, full-guitar shot) rendered as a plain <img> so it can be the LCP
 * element and be fetched at high priority — no canvas, no scroll-scrubbed
 * image sequence, no sticky scroll-jack runway.
 *
 * Removing the 300-frame scrub machine cuts hundreds of tiny JS chunks from
 * the build, eliminates rAF/canvas paint on scroll, and keeps the first
 * paint cheap on every viewport (mobile/TV included).
 */
export default function ScrollShowcase({
  eyebrow = "In the spotlight",
  heading = "Every string. Every detail.",
  subheading = "Scroll to see it come alive.",
  onShuffle,
}) {
  return (
    <div className="relative -mx-4 sm:-mx-6 -mt-5 sm:-mt-6 mb-10 h-screen overflow-hidden bg-brand-light-bg dark:bg-black">
      <img
        src={heroFrame}
        alt=""
        aria-hidden="true"
        decoding="async"
        {...{ fetchpriority: "high" }}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-10">
        <div className="mb-4 flex items-center gap-2 animate-fadeIn">
          <span className="h-4 items-end gap-[2.5px] flex">
            {[0.8, 1.05, 0.65].map((d, i) => (
              <span
                key={i}
                className="eq-bar w-[3px] rounded-full bg-brand"
                style={{ animationDuration: `${d}s`, animationDelay: `${i * 0.13}s` }}
              />
            ))}
          </span>
          <span className="text-[13px] font-medium text-white/70">{eyebrow}</span>
        </div>

        <h2
          className="font-display mb-4 max-w-2xl text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-7xl animate-fadeInUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          {heading}
        </h2>

        <p className="mb-7 max-w-md text-white/75 animate-fadeInUp" style={{ animationDelay: "0.25s", opacity: 0 }}>
          {subheading}
        </p>

        <div className="flex flex-wrap items-center gap-3 animate-fadeInUp" style={{ animationDelay: "0.4s", opacity: 0 }}>
          <button
            onClick={onShuffle}
            className="group inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-brand/20 transition-all hover:scale-105 hover:bg-brand-300"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <polygon points="7 4 21 12 7 20 7 4" />
            </svg>
            Shuffle Play
          </button>
          <Link
            to="/search"
            className="rounded-full bg-black/30 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-black/50"
          >
            Browse Music
          </Link>
        </div>
      </div>
    </div>
  );
}