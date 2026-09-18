import { useLocation } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";
import YouTubePlayerBridge from "./components/player/YouTubePlayerBridge.jsx";

export default function App() {
  const { pathname } = useLocation();
  const isFullScreen = pathname === "/now-playing";

  return (
    <>
      {isFullScreen ? (
        <AppRoutes />
      ) : (
        <MainLayout>
          <AppRoutes />
        </MainLayout>
      )}
      <YouTubePlayerBridge />
    </>
  );
}