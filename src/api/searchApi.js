import axiosClient from "./axiosClient";

export const globalSearch = (query, params = {}) =>
  axiosClient.get("/search", { params: { q: query, ...params } });