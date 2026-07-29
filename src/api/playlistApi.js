import axiosClient from "./axiosClient";

export const getMyPlaylists = () => axiosClient.get("/playlists");

export const getPlaylistById = (id) => axiosClient.get(`/playlists/${id}`);

export const createPlaylist = (data) => axiosClient.post("/playlists", data);

export const addTrackToPlaylist = (playlistId, track) =>
  axiosClient.post(`/playlists/${playlistId}/tracks`, {
    jamendoId: track.id,
    name: track.name,
    artistName: track.artist_name,
    albumImage: track.image,
    audioUrl: track.audio,
    duration: track.duration,
  });

export const removeTrackFromPlaylist = (playlistId, jamendoId) =>
  axiosClient.delete(`/playlists/${playlistId}/tracks/${jamendoId}`);

export const deletePlaylist = (id) => axiosClient.delete(`/playlists/${id}`);
