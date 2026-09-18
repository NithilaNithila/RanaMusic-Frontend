import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PlayerBar from "../player/PlayerBar.jsx";

export default function MainLayout({ children }) {
  return (
    <div className="relative flex h-screen flex-col bg-brand-light-bg text-black dark:bg-brand-dark dark:text-white">
      {/* Ambient background glows — hidden on small screens: blur(130px)+ gradients
          are expensive to paint/composite on mobile GPUs and slow the main thread. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden md:block">
        <div className="absolute -left-24 -top-32 h-80 w-80 rounded-full bg-brand/20 blur-[130px] dark:bg-brand/10" />
        <div className="absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-brand/10 blur-[140px] dark:bg-brand/[0.06]" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-brand/10 blur-[130px] dark:bg-brand/[0.05]" />
      </div>

      <Navbar />

      <main className="relative flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-[1680px] flex-1 px-4 py-5 sm:p-6 tv:max-w-[1760px] tv:px-10">{children}</div>
        <Footer />
      </main>

      <PlayerBar />
    </div>
  );
}
