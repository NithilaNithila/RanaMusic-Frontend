/**
 * Extracts a stable key from an entity (track, playlist, album, artist).
 * Prefers `id`, falls back to `_id`, then to a name-based composite key.
 */
export const idKey = (x) => {
  if (!x) return null;
  if (x.id != null) return x.id;
  if (x._id != null) return x._id;
  return null;
};

/**
 * Stable identity key for PLAYABLE TRACKS. Provider ids (Saavn/Spotify/
 * YouTube/Amazon) are only unique within their own catalog, so the key is
 * scoped by `source` — no one provider's track can be mistaken for another's.
 */
export const trackKey = (t) => {
  if (!t) return "";
  return t.source ? `${String(t.source)}:${String(t.id)}` : String(t.id);
};

/**
 * Comparator used for queue / history matching. Falls back to raw id equality
 * for legacy tracks without a `source`.
 */
export const sameTrack = (a, b) => trackKey(a) === trackKey(b);

/**
 * Normalises an API response into a flat array.
 * Handles { data: { results: [...] } }, { data: [...] }, and bare arrays.
 */
export const toList = (res) => {
  if (res?.data?.results) return res.data.results;
  if (res?.data) return res.data;
  return Array.isArray(res) ? res : [];
};

/**
 * Combines catalog playlists (id + source) with community/public playlists
 * (_id, created by any user) into one deduplicated list.
 */
export const mergePlaylists = (catalog = [], community = []) => {
  const seen = new Set();
  const out = [];
  [...(Array.isArray(catalog) ? catalog : []), ...(Array.isArray(community) ? community : [])].forEach((p) => {
    if (!p) return;
    const key = idKey(p);
    if (!key || seen.has(String(key))) return;
    seen.add(String(key));
    out.push(p);
  });
  return out;
};

/**
 * Walks up the DOM from `el` to find whichever ancestor has a scrollable
 * overflow. Falls back to `window` when nothing is scrollable.
 */
export function getScrollParent(el) {
  let node = el?.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === "auto" || overflowY === "scroll") return node;
    node = node.parentElement;
  }
  return window;
}
