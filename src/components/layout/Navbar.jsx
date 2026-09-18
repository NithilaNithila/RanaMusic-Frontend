import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { usePlayer } from "../../hooks/useAudioPlayer";
import Equalizer from "../common/Equalizer.jsx";
import { APP_DOWNLOAD_URL } from "../../utils/constants";

const links = [
  { to: "/", label: "Home" },
  { to: "/browse", label: "Browse" },
  { to: "/search", label: "Search" },
  { to: "/library", label: "Library" },
  { to: "/languages", label: "Languages" },
];

const DownloadIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SunIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);

const MoonIcon = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const ProfileIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isPlaying } = usePlayer();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef(null);

  // Close mobile menu on route change, outside click, or Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/browse?tab=all&q=${encodeURIComponent(query)}`);
    closeAll();
  };

  const go = (to) => {
    closeAll();
    navigate(to);
  };

  const handleLogout = () => {
    closeAll();
    logout();
    navigate("/");
  };

  const initial = (user?.username?.[0] || user?.email?.[0] || "U").toUpperCase();

  // Desktop: sliding brand pill (motion layoutId) sits behind the active link
  const desktopNavLinkClass = ({ isActive }) =>
    `relative rounded-full px-4 py-2 text-sm font-medium outline-none transition-colors duration-200 ${
      isActive
        ? "text-black"
        : "text-black/60 hover:bg-black/5 hover:text-black dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  // Mobile menu links
  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-brand/15 text-brand dark:bg-brand/[0.14]"
        : "text-black/70 hover:bg-black/10 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white"
    }`;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 shrink-0 border-b border-black/10 bg-brand-light-bg/80 backdrop-blur-xl dark:border-white/10 dark:bg-brand-dark/80"
    >
      <div className="relative flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" onClick={closeAll} className="group flex shrink-0 items-center gap-2.5">
          <motion.span
            whileHover={{ rotate: -10, scale: 1.12 }}
            whileTap={{ scale: 0.9 }}
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-300 text-black shadow-lg shadow-brand/30 transition-shadow duration-300 group-hover:shadow-brand/50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </motion.span>
          <motion.span
            className="flex items-center gap-2 text-lg font-bold sm:text-xl"
          >
            <span className="font-display animate-gradientShift bg-300% bg-gradient-to-r from-brand via-brand-600 to-brand bg-clip-text text-transparent dark:via-white">
              RanaMusic
            </span>
            {isPlaying && <Equalizer playing className="!h-3.5" />}
          </motion.span>
        </Link>

        {/* Desktop nav — perfectly centered regardless of side widths */}
        <nav className="absolute left-1/2 top-1/2 hidden translate-x-[calc(-90%+20px)] -translate-y-1/2 items-center gap-3 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={desktopNavLinkClass}>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-pill"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-brand to-brand-200 shadow-md shadow-brand/30"
                    />
                  )}
                  <span className="relative z-10">{l.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {/* Theme toggle (dark / light) — desktop only; lives in the mobile menu on small screens */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-black/5 text-black/70 transition-colors hover:bg-black/10 hover:text-black dark:bg-white/10 dark:text-white dark:hover:bg-white/20"
          >
            <AnimatePresence mode="wait" initial={false}>
              {theme === "dark" ? (
                <motion.span
                  key="sun"
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                >
                  {SunIcon}
                </motion.span>
              ) : (
                <motion.span
                  key="moon"
                  initial={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.25 }}
                >
                  {MoonIcon}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          {/* Download (desktop) */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-gradient-to-r from-brand to-brand-200 px-3.5 py-2 text-sm font-semibold text-black shadow-md shadow-brand/25 transition-all duration-200 hover:shadow-brand/40 lg:flex"
          >
            {DownloadIcon}
            Download App
          </a>

          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
              width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-40 rounded-full border border-black/10 bg-black/5 py-2 pl-9 pr-4 text-sm text-black placeholder-black/50 outline-none transition-all duration-300 focus:w-56 focus:border-brand/50 focus:bg-black/[0.08] focus:ring-2 focus:ring-brand/30 lg:w-44 lg:focus:w-60 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-white/50 dark:focus:bg-white/[0.14]"
            />
          </form>

          {user ? (
            /* Profile dropdown — desktop only; lives in the mobile menu on small screens */
            <div className="relative hidden lg:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-black shadow-lg shadow-brand/25 ring-2 ring-white/70 transition-transform duration-200 hover:scale-105 active:scale-95 dark:ring-brand-surface"
                title={user.username || user.email}
              >
                {initial}
              </button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-black/10 bg-white p-2 shadow-2xl shadow-black/20 dark:border-white/10 dark:bg-brand-surface dark:shadow-black/60"
                  >
                    <div className="border-b border-black/10 px-3 py-2.5 dark:border-white/10">
                      <p className="truncate text-sm font-semibold text-black dark:text-white">
                        {user.username || user.email}
                      </p>
                      <p className="truncate text-xs text-black/50 dark:text-white/50">{user.email}</p>
                    </div>
                    <button
                      onClick={() => go("/profile")}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-black/80 transition-colors hover:bg-black/10 hover:text-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-black/80 transition-colors hover:bg-black/10 hover:text-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <path d="m16 17 5-5-5-5" />
                        <path d="M21 12H9" />
                      </svg>
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm text-black/70 transition-colors hover:text-brand lg:block dark:text-white/70">
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-brand-300 lg:block"
              >
                Register
              </Link>
            </>
          )}

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full bg-black/5 text-black transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <div className="relative h-3.5 w-4">
              <motion.span
                animate={menuOpen ? { rotate: 45, y: 4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-0 h-0.5 w-4 rounded-full bg-current"
              />
              <motion.span
                animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-1.5 h-0.5 w-4 rounded-full bg-current"
              />
              <motion.span
                animate={menuOpen ? { rotate: -45, y: -4.5 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.25 }}
                className="absolute left-0 top-3 h-0.5 w-4 rounded-full bg-current"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-black/10 lg:hidden dark:border-white/10"
          >
            <div className="space-y-4 px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40"
                  width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search tracks, artists..."
                  className="w-full rounded-full border border-black/10 bg-black/5 py-2.5 pl-9 pr-4 text-sm text-black placeholder-black/50 outline-none transition-all focus:border-brand/50 focus:ring-2 focus:ring-brand/30 dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder-white/50"
                />
              </form>

              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === "/"}
                    onClick={closeAll}
                    className={navLinkClass}
                  >
                    {l.label}
                  </NavLink>
                ))}
              </nav>

              {/* Account (mobile / tablet) */}
              {user && (
                <div className="rounded-2xl border border-black/10 p-2 dark:border-white/10">
                  <div className="flex items-center gap-3 border-b border-black/10 px-3 pb-3 pt-2 dark:border-white/10">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-sm font-bold text-black shadow-lg shadow-brand/25 ring-2 ring-white/70 dark:ring-brand-surface">
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-black dark:text-white">
                        {user.username || user.email}
                      </p>
                      <p className="truncate text-xs text-black/50 dark:text-white/50">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => go("/profile")}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-black/80 transition-colors hover:bg-black/10 hover:text-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {ProfileIcon}
                    View Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-black/80 transition-colors hover:bg-black/10 hover:text-black dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
                  >
                    {LogoutIcon}
                    Logout
                  </button>
                </div>
              )}

              {/* Theme switch (mobile / tablet) */}
              <button
                onClick={toggleTheme}
                className="flex w-full items-center justify-between rounded-xl bg-black/5 px-4 py-2.5 text-sm font-medium text-black/80 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
              >
                <span className="flex items-center gap-2.5">
                  {theme === "dark" ? SunIcon : MoonIcon}
                  {theme === "dark" ? "Light mode" : "Dark mode"}
                </span>
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors duration-300 ${
                    theme === "dark" ? "bg-brand" : "bg-black/20"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-300 ${
                      theme === "dark" ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </span>
              </button>

              <a
                href={APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-black"
              >
                {DownloadIcon}
                Download App
              </a>

              {!user && (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={closeAll}
                    className="flex-1 rounded-full bg-black/5 px-4 py-2.5 text-center text-sm text-black/80 transition-colors hover:bg-black/10 dark:bg-white/10 dark:text-white/80 dark:hover:bg-white/20"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAll}
                    className="flex-1 rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-brand-300"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
