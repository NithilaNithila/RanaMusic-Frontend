import axiosClient from "./axiosClient";

export const getArtists = (params = {}) => axiosClient.get("/artists", { params });

export const getArtistById = (id) => axiosClient.get(`/artists/${id}`);

export const getArtistAlbums = (id) => axiosClient.get(`/artists/${id}/albums`);
