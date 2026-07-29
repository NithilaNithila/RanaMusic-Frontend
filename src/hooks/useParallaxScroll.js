import { useEffect, useRef, useState } from "react";

/**
 * MainLayout scrolls its <main className="overflow-y-auto">, not the
 * window — so window.scrollY doesn't describe real scroll position.
 * Walk up to find whichever ancestor is actually scrolling.
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
 * Tracks the live scrollTop (px) of whichever ancestor actually scrolls.
 * Pass a ref to any element inside that scroll container — the hook
 * walks up from it to find the real scrolling parent, so it works the
 * same whether the page is rendered inside MainLayout's <main> or,
 * during standalone preview, directly under the window.
 *
 * Updates are batched to one per animation frame so fast scrolling
 * doesn't flood React with renders.
 */
export default function useParallaxScroll(elRef) {
  const [scrollY, setScrollY] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const scrollEl = getScrollParent(elRef.current);
    const isWindow = scrollEl === window;

    const update = () => {
      setScrollY(isWindow ? window.scrollY : scrollEl.scrollTop);
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

    return () => {
      scrollEl.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [elRef]);

  return scrollY;
}
