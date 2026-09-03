import axiosClient from "./axiosClient";

export const getFavorites = (itemType = "track") =>
  axiosClient.get("/favorites", { params: { itemType } });

export const addFavorite = (payload) => axiosClient.post("/favorites", payload);

export const removeFavorite = (itemType, jamendoId) =>
  axiosClient.delete(`/favorites/${itemType}/${jamendoId}`);
