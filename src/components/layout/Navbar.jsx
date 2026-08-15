import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { APP_DOWNLOAD_URL } from "../../utils/constants";

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/library", label: "Your Library" },
];

const DownloadIcon = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
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
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
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

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
      isActive ? "bg-brand text-black" : "text-white/70 hover:text-white hover:bg-white/10"
    }`;

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 shrink-0 border-b border-white/10 bg-brand-dark/80 backdrop-blur-xl"
    >
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Logo */}
        <Link to="/" onClick={closeAll} className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-[#7cc9e8] text-black shadow-lg shadow-brand/30">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </span>
          <span className="text-lg font-bold sm:text-xl">
            <span className="bg-gradient-to-r from-brand via-white to-brand bg-clip-text text-transparent">
              RanaMusic
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Download (desktop) */}
          <a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-brand/25 transition-colors hover:bg-[#7cc9e8] sm:flex"
          >
            {DownloadIcon}
            Download App
          </a>

          {/* Search (desktop) */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <svg
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
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
              className="w-40 rounded-full bg-white/10 py-2 pl-9 pr-4 text-sm text-white placeholder-white/50 outline-none transition-all focus:ring-2 focus:ring-brand lg:w-48"
            />
          </form>

          {user ? (
            /* Profile dropdown */
            <div className="relative">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-black shadow-lg shadow-brand/25"
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
                    className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-white/10 bg-[#1f1f1f] p-2 shadow-2xl shadow-black/60"
                  >
                    <div className="border-b border-white/10 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.username || user.email}
                      </p>
                      <p className="truncate text-xs text-white/50">{user.email}</p>
                    </div>
                    <button
                      onClick={() => go("/profile")}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
              <Link to="/login" className="hidden text-sm text-white/70 transition-colors hover:text-brand sm:block">
                Login
              </Link>
              <Link
                to="/register"
                className="block rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#7cc9e8]"
              >
                Register
              </Link>
            </>
          )}

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 lg:hidden"
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
            className="overflow-hidden border-t border-white/10 lg:hidden"
          >
            <div className="space-y-4 px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <svg
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
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
                  className="w-full rounded-full bg-white/10 py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/50 outline-none focus:ring-2 focus:ring-brand"
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
                    className="flex-1 rounded-full bg-white/10 px-4 py-2.5 text-center text-sm text-white/80 transition-colors hover:bg-white/20"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeAll}
                    className="flex-1 rounded-full bg-brand px-4 py-2.5 text-center text-sm font-semibold text-black transition-colors hover:bg-[#7cc9e8]"
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
