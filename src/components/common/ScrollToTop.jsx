import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { getScrollParent } from "../../utils/helpers";

/**
 * Resets the page to the top on every route change so each page opens from
 * the beginning — never mid-scroll or at the bottom. Plugged in right
 * before the router outlet inside the (scrollable) MainLayout `<main>`,
 * so it scrolls whichever overflow container React actually scrolls,
 * falling back to the window.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  const elRef = useRef(null);

  useEffect(() => {
    const scroller = elRef.current
      ? getScrollParent(elRef.current)
      : (document.scrollingElement || document.documentElement);
    scroller.scrollTo?.({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  return <span ref={elRef} className="hidden" aria-hidden="true" />;
}
