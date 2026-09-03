import { DEFAULT_ARTWORK } from "./constants";

// Some provider responses carry garbage image values (e.g. a lone space),
// which pass a `|| ""` check and render as a broken/blank <img>.
export const imageSrc = (img) => {
  const v = String(img || "").trim();
  return v ? v : DEFAULT_ARTWORK;
};

// Swap a failed provider image (403 hotlink blocks, dead URLs) to the
// offline-safe placeholder instead of showing a broken icon.
export const handleImageError = (e) => {
  const el = e.currentTarget;
  if (el && el.src !== DEFAULT_ARTWORK) el.src = DEFAULT_ARTWORK;
};