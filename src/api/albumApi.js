import axiosClient from "./axiosClient";

// Source-aware album endpoints. Search results are provider-tagged, so an
// album card can open the right detail route instead of defaulting to Saavn
// (which would 404 for Amazon/Spotify/YouTube Music albums).
const ALBUM_SOURCES = {
  spotify: "/spotify",
  amazon: "/amazon",
  ytmusic: "/ytmusic",
};

export const getAlbums = (params = {}) => axiosClient.get("/albums", { params });

export const searchAlbums = (query, params = {}) =>
  axiosClient.get("/albums/search", { params: { q: query, ...params } });

export const getAlbumById = (id) => axiosClient.get(`/albums/${id}`);

export const getAlbumTracks = (id) => axiosClient.get(`/albums/${id}/tracks`);

export const getCatalogAlbum = (source, id, params = {}) =>
  axiosClient.get(`${ALBUM_SOURCES[source] || ""}/albums/${id}`, { params });

export const getCatalogAlbumTracks = (source, id, params = {}) =>
  axiosClient.get(`${ALBUM_SOURCES[source] || ""}/albums/${id}/tracks`, { params });

export const isCatalogAlbumSource = (source) => Boolean(ALBUM_SOURCES[source]);
