import axiosClient from "./axiosClient";

export const searchTracks = (query, params = {}) =>
  axiosClient.get("/tracks/search", { params: { q: query, ...params } });

export const getTrackById = (id) => axiosClient.get(`/tracks/${id}`);

export const getPopularTracks = (params = {}) =>
  axiosClient.get("/tracks/popular", { params });
