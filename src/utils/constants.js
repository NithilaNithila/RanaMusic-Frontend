export const ROUTES = {
  HOME: "/",
  BROWSE: "/browse",
  SEARCH: "/search",
  NOW_PLAYING: "/now-playing",
  ALBUM: "/albums/:id",
  ARTIST: "/artists/:id",
  PLAYLIST: "/playlists/:id",
  LIBRARY: "/library",
  LOGIN: "/login",
  REGISTER: "/register",
};

export const DEFAULT_ARTWORK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#2b3a4d"/><stop offset="1" stop-color="#141b24"/>' +
      "</defs></linearGradient>" +
      '<rect width="320" height="320" fill="url(#g)"/>' +
      '<g fill="#ffffff" opacity="0.9">' +
      '<circle cx="128" cy="196" r="12"/>' +
      '<circle cx="208" cy="184" r="12"/>' +
      '<path d="M140 196V104l68-22v94"/>' +
      "</g></svg>"
  );

export const APP_DOWNLOAD_URL =
  "https://apkpure.net/ranamusic/com.ranamusic";
