import axiosClient from "./axiosClient";

// Client-side search cache (5 min TTL in sessionStorage) so re-visiting a
// search page with the same query doesn't hit the network again. The backend
// already memoizes (600s), but this skips the round-trip entirely.
const CACHE_TTL_MS = 5 * 60 * 1000;

const cacheKey = (query, params) => `search:${query}:${JSON.stringify(params || {})}`;

export const globalSearch = async (query, params = {}) => {
  const key = cacheKey(query, params);
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts < CACHE_TTL_MS) return Promise.resolve({ data });
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore corrupt cache */
  }

  const res = await axiosClient.get("/search", { params: { q: query, ...params } });
  try {
    sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: res.data }));
  } catch {
    /* ignore quota errors */
  }
  return res;
};