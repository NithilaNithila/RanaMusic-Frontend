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
