import axiosClient from "./axiosClient";

export const login = (credentials) => axiosClient.post("/auth/login", credentials);

export const register = (data) => axiosClient.post("/auth/register", data);

export const getProfile = () => axiosClient.get("/auth/me");

export const deleteAccount = () => axiosClient.delete("/auth/me");
