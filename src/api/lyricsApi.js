import axiosClient from "./axiosClient";

// GET /api/lyrics/:id?source=saavn|ytmusic — by upstream song id
export const getLyrics = (id, source = "saavn") =>
  axiosClient.get(`/lyrics/${id}`, { params: { source } });

// GET /api/lyrics?artist=&title=&source=saavn|lrclib|lyricsovh — by metadata
export const getLyricsByTitle = (artist, title, source = "saavn") =>
  axiosClient.get("/lyrics/", { params: { artist, title, source } });