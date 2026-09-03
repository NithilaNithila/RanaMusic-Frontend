import axiosClient from "./axiosClient";

export const getArtists = (params = {}) => axiosClient.get("/artists", { params });

export const searchArtists = (query, params = {}) =>
  axiosClient.get("/artists/search", { params: { q: query, ...params } });

export const getArtistById = (id) => axiosClient.get(`/artists/${id}`);

export const getArtistAlbums = (id, params = {}) =>
  axiosClient.get(`/artists/${id}/albums`, { params });
