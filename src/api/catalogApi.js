import axiosClient from "./axiosClient";

const SOURCES = {
  saavn: "/saavn",
  spotify: "/spotify",
  ytmusic: "/ytmusic",
  amazon: "/amazon",
};

export const searchCatalog = (source, params = {}) =>
  axiosClient.get(`${SOURCES[source]}/search`, { params });

export const getCatalogPlaylist = (source, id, params = {}) =>
  axiosClient.get(`${SOURCES[source]}/playlists/${id}`, { params });

export const getCatalogPlaylistTracks = (source, id, params = {}) =>
  axiosClient.get(`${SOURCES[source]}/playlists/${id}/tracks`, { params });

export const fetchAllCatalogPlaylists = (params = {}) =>
  axiosClient
    .get("/playlists/catalog", { params })
    .then((res) => {
      const d = res.data;
      if (Array.isArray(d)) return d;
      if (Array.isArray(d?.playlists)) return d.playlists;
      if (Array.isArray(d?.results)) return d.results;
      return [];
    });