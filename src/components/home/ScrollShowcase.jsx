import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// Vite only bundles the file *list* at build time (no eager import), so
// the 240+ frames are emitted as static assets but never downloaded up
// front. Each frame's loader is a dynamic import, so a frame is fetched
// only when scrolling gets close to it — the initial page load stays tiny.
const frameLoaders = import.meta.glob("../../assets/frame_*.jpg", {
  import: "default",
});
const FRAME_KEYS = Object.keys(frameLoaders).sort();
const TOTAL = FRAME_KEYS.length;

const FALLBACK_FRAME = 0; // clean, full-guitar shot
const SCROLL_MULTIPLIER = 2; // wrapper = 2 viewports tall = the scrub runway
const PREFETCH_AHEAD = 5; // fetch frames this far past the scrub position
const PREFETCH_BEHIND = 1; // ...and this far behind it

/**
 * MainLayout scrolls its <main className="overflow-y-auto">, not the
 * window — so window.scrollY / window.innerHeight don't describe this
 * page's real scroll position or viewport. Walk up to find whichever
 * ancestor is actually scrolling.
 */
function getScrollParent(el) {
  let node = el?.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return window;
}

/**
 * Full-bleed, scroll-scrubbed image-sequence showcase for the Home page.
 * The wrapper is tall and its inner panel is sticky, so scrolling through
 * the wrapper "scrubs" through the guitar frames on a <canvas>. Frames
 * load lazily around the current scrub position (plus a small prefetch
 * window), so the effect costs only a few hundred KB instead of the
 * full 95MB sequence.
 *
 * Respects prefers-reduced-motion: those users get one static frame and
 * no scroll-jacking runway at all.
 */
export default function ScrollShowcase({
  eyebrow = "In the spotlight",
  heading = "Every string. Every detail.",
  subheading = "Scroll to see it come alive.",
  onShuffle,
}) {
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const canvasRef = useRef(null);
  const hintRef = useRef(null);
  const imagesRef = useRef([]);
  const requestedRef = useRef(new Set());
  const frameRef = useRef(-1);
  const rafRef = useRef(null);

  const [loadedCount, setLoadedCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const drawFrame = (index) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || !img.naturalWidth) return;

    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Same math as CSS `background-size: cover`
    const scale = Math.max(cssW / img.naturalWidth, cssH / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.drawImage(img, (cssW - drawW) / 2, (cssH - drawH) / 2, drawW, drawH);
  };

  const loadFrame = (index) => {
    if (imagesRef.current[index]) return;
    const loader = frameLoaders[FRAME_KEYS[index]];
    if (!loader) return;

    loader()
      .then((url) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          imagesRef.current[index] = img;
          setLoadedCount((c) => c + 1);
          if (index === FALLBACK_FRAME) setReady(true);
          if (index === frameRef.current) drawFrame(index);
        };
        img.onerror = () => {
          imagesRef.current[index] = null;
        };
      })
      .catch(() => {
        imagesRef.current[index] = null;
      });
  };

  // Kick off loads for the frames around `center` — never more than once
  // per index. Returns the closest *loaded* index so the canvas always has
  // something to paint while new frames stream in.
  const ensureWindow = (center) => {
    for (
      let i = Math.max(0, center - PREFETCH_BEHIND);
      i <= Math.min(TOTAL - 1, center + PREFETCH_AHEAD);
      i++
    ) {
      if (!requestedRef.current.has(i)) {
        requestedRef.current.add(i);
        loadFrame(i);
      }
    }
    for (let d = 0; d <= PREFETCH_AHEAD; d++) {
      for (const i of [center - d, center + d]) {
        if (i >= 0 && i < TOTAL && imagesRef.current[i]) return i;
      }
    }
    return -1;
  };

  useEffect(() => {
    if (TOTAL === 0 && import.meta.env.DEV) {
      console.warn("[ScrollShowcase] No frames matched '../../assets/frame_*.jpg'.");
    }
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    ensureWindow(FALLBACK_FRAME);
  }, []);

  // Keep the wrapper/panel sized to the REAL scroll viewport (main's
  // clientHeight, which shifts as Navbar/PlayerBar mount or unmount) and
  // drive which frame is drawn from scroll position. Skips the scroll-jack
  // entirely for reduced-motion users — they get one static frame.
  useEffect(() => {
    const scrollEl = getScrollParent(wrapperRef.current);
    const isWindow = scrollEl === window;

    const applySize = () => {
      const viewportH = isWindow ? window.innerHeight : scrollEl.clientHeight;
      if (panelRef.current) panelRef.current.style.height = `${viewportH}px`;
      if (wrapperRef.current) {
        wrapperRef.current.style.height = reduceMotion
          ? `${viewportH}px`
          : `${viewportH * SCROLL_MULTIPLIER}px`;
      }
      return viewportH;
    };

    if (reduceMotion) {
      applySize();
      ensureWindow(FALLBACK_FRAME);
      frameRef.current = FALLBACK_FRAME;
      drawFrame(FALLBACK_FRAME);
      const onResize = () => {
        applySize();
        drawFrame(FALLBACK_FRAME);
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    const update = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const viewportH = applySize();

      const scrollTop = isWindow ? window.scrollY : scrollEl.scrollTop;
      const wrapperRect = wrapper.getBoundingClientRect();
      const containerTop = isWindow ? 0 : scrollEl.getBoundingClientRect().top;
      const wrapperTop = scrollTop + (wrapperRect.top - containerTop);

      const scrollable = wrapper.offsetHeight - viewportH;
      const progress =
        scrollable > 0
          ? Math.min(Math.max((scrollTop - wrapperTop) / scrollable, 0), 1)
          : 0;

      const index = Math.min(TOTAL - 1, Math.round(progress * (TOTAL - 1)));
      const nearest = ensureWindow(index);
      if (nearest >= 0 && nearest !== frameRef.current) {
        frameRef.current = nearest;
        drawFrame(nearest);
      }
      if (hintRef.current) {
        hintRef.current.style.opacity = progress > 0.04 ? "0" : "1";
      }
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();
    scrollEl.addEventListener("scroll", onScroll, { passive: true });

    let ro;
    if (!isWindow && "ResizeObserver" in window) {
      ro = new ResizeObserver(update);
      ro.observe(scrollEl);
    } else {
      window.addEventListener("resize", update);
    }

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, reduceMotion]);

  const pct = Math.min(100, Math.round((loadedCount / 8) * 100));

  return (
    <div ref={wrapperRef} className="relative -mx-4 sm:-mx-6 -mt-5 sm:-mt-6 mb-10 h-screen">
      <div
        ref={panelRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-brand-light-bg dark:bg-black"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-light-bg dark:bg-brand-dark">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-black/15 border-t-brand animate-spin dark:border-white/20" />
              <p className="text-xs text-black/50 dark:text-white/50">{pct}%</p>
            </div>
          </div>
        )}

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

        {!reduceMotion && (
          <div
            ref={hintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/60 animate-floatY transition-opacity duration-300"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <span className="text-lg">&#8595;</span>
          </div>
        )}
      </div>
    </div>
  );
}
