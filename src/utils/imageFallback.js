import { DEFAULT_ARTWORK } from "./constants";

// The backend rewrites Amazon artwork to a same-origin proxy path
// (/api/images/image-proxy?url=...). Those relative paths resolve against the
// page origin, which works in dev (Vite proxies /api) but breaks when the
// frontend is a static host with no /api reverse proxy. Mirror the origin
// logic used for audio so relative /api image URLs always point at the real
// API host.
export const apiOrigin = () => {
  const base = String(import.meta.env.VITE_API_BASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
  if (base) {
    const m = base.match(/^(https?:\/\/[^/]+)/);
    if (m) return m[1];
  }
  const host = globalThis.location?.hostname;
  if (host && !/^(localhost|127\.0\.0\.1)$/.test(host)) return ""; // same-origin proxy
  const port = import.meta.env.VITE_API_PORT || "5000";
  return `http://${host || "localhost"}:${port}`;
};

// Resolve a relative /api/ image path to the API origin; leaves absolute URLs
// untouched so Saavn CDN (and redirect) images keep working everywhere.
export const toAbsoluteImage = (img) => {
  if (typeof img !== "string") return "";
  const v = img.trim();
  if (!v || /^<(?:!doctype|html)\b/i.test(v)) return "";
  if (/^https?:\/\//.test(v)) return v;
  if (v.startsWith("/api/")) {
    const origin = apiOrigin();
    return origin ? `${origin}${v}` : v;
  }
  return v;
};

// Some provider responses carry garbage image values (e.g. a lone space),
// which pass a `|| ""` check and render as a broken/blank <img>.
export const imageSrc = (img) => {
  const v = toAbsoluteImage(img);
  return v ? v : DEFAULT_ARTWORK;
};

// Swap a failed provider image (403 hotlink blocks, dead URLs) to the
// offline-safe placeholder instead of showing a broken icon.
export const handleImageError = (e) => {
  const el = e.currentTarget;
  if (el && el.src !== DEFAULT_ARTWORK) el.src = DEFAULT_ARTWORK;
};