import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PlayerBar from "../player/PlayerBar.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="flex flex-col h-screen bg-brand-dark text-white">
      <Navbar />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">{children}</div>
        <Footer />
      </main>

      <PlayerBar />
    </div>
  );
}
