import axiosClient from "./axiosClient";

export const getArtists = (params = {}) => axiosClient.get("/artists", { params });

export const searchArtists = (query, params = {}) =>
  axiosClient.get("/artists/search", { params: { q: query, ...params } });

export const getArtistById = (id, params = {}) => axiosClient.get(`/artists/${id}`, { params });

export const getArtistAlbums = (id, params = {}) =>
  axiosClient.get(`/artists/${id}/albums`, { params });

export const getArtistTracks = (id, params = {}) =>
  axiosClient.get(`/artists/${id}/tracks`, { params });