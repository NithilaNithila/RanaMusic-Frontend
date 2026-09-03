import axiosClient from "./axiosClient";

export const getAlbums = (params = {}) => axiosClient.get("/albums", { params });

export const searchAlbums = (query, params = {}) =>
  axiosClient.get("/albums/search", { params: { q: query, ...params } });

export const getAlbumById = (id) => axiosClient.get(`/albums/${id}`);

export const getAlbumTracks = (id) => axiosClient.get(`/albums/${id}/tracks`);
