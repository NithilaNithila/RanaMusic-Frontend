import { useEffect, useRef, useState } from "react";

// Vite bundles every matching file at build time. Frame numbers are
// zero-padded (001, 002 ...), so a plain alphabetical sort already gives
// the correct playback order — no parsing needed.
const frameModules = import.meta.glob("../../assets/frame_*.jpg", {
  eager: true,
  import: "default",
});
const FRAMES = Object.keys(frameModules)
  .sort()
  .map((key) => frameModules[key]);

const FALLBACK_FRAME = 0; // clean, full-guitar shot
const SCROLL_MULTIPLIER = 4; // wrapper = 4 viewports tall = the scrub runway

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
 * the wrapper "scrubs" through the 196 guitar frames on a <canvas> — the
 * same technique behind Apple's product pages.
 *
 * Respects prefers-reduced-motion: those users get one static frame and
 * no scroll-jacking runway at all.
 */
export default function ScrollShowcase({
  eyebrow = "In the spotlight",
  heading = "Every string. Every detail.",
  subheading = "Scroll to see it come alive.",
}) {
  const wrapperRef = useRef(null);
  const panelRef = useRef(null);
  const canvasRef = useRef(null);
  const hintRef = useRef(null);
  const imagesRef = useRef([]);
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

  // Preload every frame up front so scrubbing never flashes a blank canvas.
  useEffect(() => {
    let cancelled = false;

    if (FRAMES.length === 0 && import.meta.env.DEV) {
      console.warn(
        "[ScrollShowcase] No frames matched '../../assets/ezgif-frame-*.jpg' — check the glob path."
      );
    }

    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);

    const images = FRAMES.map((src) => {
      const img = new Image();
      img.src = src;
      return img;
    });
    imagesRef.current = images;

    if (images.length === 0) return;

    let count = 0;
    const onDone = () => {
      count += 1;
      if (cancelled) return;
      setLoadedCount(count);
      if (count === images.length) setReady(true);
    };
    images.forEach((img) => {
      if (img.complete) onDone();
      else {
        img.addEventListener("load", onDone, { once: true });
        img.addEventListener("error", onDone, { once: true });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the wrapper/panel sized to the REAL scroll viewport (main's
  // clientHeight, which shifts as Navbar/PlayerBar mount or unmount) and
  // drive which frame is drawn from scroll position. Skips the scroll-jack
  // entirely for reduced-motion users — they get one static frame.
  useEffect(() => {
    if (!ready) return;
    const scrollEl = getScrollParent(wrapperRef.current);
    const isWindow = scrollEl === window;
    const total = FRAMES.length;

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

      const index = Math.min(total - 1, Math.round(progress * (total - 1)));
      if (index !== frameRef.current) {
        frameRef.current = index;
        drawFrame(index);
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

  const pct = FRAMES.length ? Math.round((loadedCount / FRAMES.length) * 100) : 100;

  return (
    <div ref={wrapperRef} className="relative -mx-6 h-screen">
      <div
        ref={panelRef}
        className="sticky top-0 w-full h-screen overflow-hidden bg-black"
      >
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/85 via-transparent to-brand-dark/50" />

        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-brand-dark">
            <div className="text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-white/20 border-t-brand animate-spin" />
              <p className="text-xs text-white/50">{pct}%</p>
            </div>
          </div>
        )}

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-10">
          <span className="text-xs uppercase tracking-[0.2em] text-brand mb-3">
            {eyebrow}
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold max-w-xl leading-tight">
            {heading}
          </h2>
          <p className="text-white/60 mt-3 max-w-sm">{subheading}</p>
        </div>

        {!reduceMotion && (
          <div
            ref={hintRef}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-floatY transition-opacity duration-300"
          >
            <span className="text-[10px] uppercase tracking-[0.2em]">Scroll</span>
            <span className="text-lg">&#8595;</span>
          </div>
        )}
      </div>
    </div>
  );
}
