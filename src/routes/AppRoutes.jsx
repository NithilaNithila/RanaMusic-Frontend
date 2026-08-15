import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home.jsx";
import Search from "../pages/Search.jsx";
import NowPlaying from "../pages/NowPlaying.jsx";
import AlbumDetails from "../pages/AlbumDetails.jsx";
import ArtistDetails from "../pages/ArtistDetails.jsx";
import PlaylistDetails from "../pages/PlaylistDetails.jsx";
import Library from "../pages/Library.jsx";
import Profile from "../pages/Profile.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import NotFound from "../pages/NotFound.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/now-playing" element={<NowPlaying />} />
      <Route path="/albums/:id" element={<AlbumDetails />} />
      <Route path="/artists/:id" element={<ArtistDetails />} />
      <Route path="/playlists/:id" element={<PlaylistDetails />} />
      <Route
        path="/library"
        element={
          <ProtectedRoute>
            <Library />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}