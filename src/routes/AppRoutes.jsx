import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Loader from "../components/common/Loader.jsx";

const Home = lazy(() => import("../pages/Home.jsx"));
const Browse = lazy(() => import("../pages/Browse.jsx"));
const Search = lazy(() => import("../pages/Search.jsx"));
const NowPlaying = lazy(() => import("../pages/NowPlaying.jsx"));
const AlbumDetails = lazy(() => import("../pages/AlbumDetails.jsx"));
const ArtistDetails = lazy(() => import("../pages/ArtistDetails.jsx"));
const LanguageHub = lazy(() => import("../pages/LanguageHub.jsx"));
const LanguageDetail = lazy(() => import("../pages/LanguageDetail.jsx"));
const PlaylistDetails = lazy(() => import("../pages/PlaylistDetails.jsx"));
const Library = lazy(() => import("../pages/Library.jsx"));
const Profile = lazy(() => import("../pages/Profile.jsx"));
const Login = lazy(() => import("../pages/Login.jsx"));
const Register = lazy(() => import("../pages/Register.jsx"));
const NotFound = lazy(() => import("../pages/NotFound.jsx"));
const About = lazy(() => import("../pages/About.jsx"));
const Contact = lazy(() => import("../pages/Contact.jsx"));
const Privacy = lazy(() => import("../pages/Privacy.jsx"));
const DeleteAccount = lazy(() => import("../pages/DeleteAccount.jsx"));

const loader = (
  <div className="flex min-h-[50vh] items-center justify-center">
    <Loader size="lg" />
  </div>
);

function withSuspense(node) {
  return <Suspense fallback={loader}>{node}</Suspense>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={withSuspense(<Home />)} />
      <Route path="/browse" element={withSuspense(<Browse />)} />
      <Route path="/search" element={withSuspense(<Search />)} />
      <Route path="/now-playing" element={withSuspense(<NowPlaying />)} />
      <Route path="/albums/:id" element={withSuspense(<AlbumDetails />)} />
      <Route path="/artists/:id" element={withSuspense(<ArtistDetails />)} />
      <Route path="/playlists/:id" element={withSuspense(<PlaylistDetails />)} />
      <Route path="/languages" element={withSuspense(<LanguageHub />)} />
      <Route path="/languages/:lang" element={withSuspense(<LanguageDetail />)} />
      <Route
        path="/library"
        element={
          <Suspense fallback={loader}>
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route
        path="/profile"
        element={
          <Suspense fallback={loader}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Suspense>
        }
      />
      <Route path="/login" element={withSuspense(<Login />)} />
      <Route path="/register" element={withSuspense(<Register />)} />
      <Route path="/about" element={withSuspense(<About />)} />
      <Route path="/contact" element={withSuspense(<Contact />)} />
      <Route path="/privacy" element={withSuspense(<Privacy />)} />
      <Route path="/delete-account" element={withSuspense(<DeleteAccount />)} />
      <Route path="*" element={withSuspense(<NotFound />)} />
    </Routes>
  );
}