import { useLocation } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import AppRoutes from "./routes/AppRoutes.jsx";

export default function App() {
  const { pathname } = useLocation();
  const isFullScreen = pathname === "/now-playing";

  if (isFullScreen) return <AppRoutes />;

  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
  );
}