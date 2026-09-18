import { useEffect, useRef, useState } from "react";

// Defers mounting `children` until the element approaches the viewport, so
// below-the-fold content (and its network requests) doesn't run during page
// load. Reserves `minHeight` so the page doesn't collapse (no CLS). Falls
// back to rendering immediately when IntersectionObserver is unavailable.
export default function LazyMount({ children, minHeight = 320, rootMargin = "900px 0px" }) {
  const ref = useRef(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setShow(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShow(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}