import { useEffect, useRef } from "react";

/**
 * Bidirectional scroll-reveal.
 * Adds the "in-view" class while the element is in the viewport and removes
 * it again once the element scrolls back out — so scrolling down plays the
 * reveal animation and scrolling back up reverses it (see .reveal in index.css).
 */
export function useReveal(options = { threshold: 0.15 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      entry.target.classList.toggle("in-view", entry.isIntersecting);
    }, options);

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
