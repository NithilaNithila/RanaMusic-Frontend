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

const spring = { type: "spring", stiffness: 420, damping: 34 };

function NavPill({ to, label }) {
  return (
    <NavLink to={to} end={to === "/"} className="relative block">
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-active"
              className="absolute inset-0 rounded-full bg-brand shadow-lg shadow-brand/40"
              transition={spring}
            />
          )}
          <motion.span
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`relative z-10 block px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              isActive ? "text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {label}
          </motion.span>
        </>
      )}
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = q.trim();
    if (query) navigate(`/search?q=${encodeURIComponent(query)}`);
    setMenuOpen(false);
  };

  const initial = (user?.username?.[0] || user?.email?.[0] || "U").toUpperCase();

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="shrink-0 sticky top-0 z-40 border-b border-white/10 bg-brand-dark/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3 px-4 sm:px-6 h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group" onClick={() => setMenuOpen(false)}>
          <motion.span
            whileHover={{ rotate: -8, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
            className="grid place-items-center w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-[#7cc9e8] text-black shadow-lg shadow-brand/30"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </motion.span>
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xl font-bold bg-gradient-to-r from-brand via-white to-brand bg-clip-text text-transparent hidden sm:block"
          >
            RanaMusic
          </motion.span>
        </Link>

        {/* Nav with sliding active pill */}
        <nav className="flex items-center gap-1 sm:gap-2 mx-auto">
          {links.map((l) => (
            <NavPill key={l.to} to={l.to} label={l.label} />
          ))}
        </nav>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Download app */}
          <motion.a
            href={APP_DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="hidden sm:flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-brand/25 hover:bg-[#7cc9e8] transition-colors"
            title="Download RanaMusic app"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download App
          </motion.a>

          {/* Search (desktop) */}
          <motion.form
            onSubmit={handleSearch}
            whileFocus={{ scale: 1.03 }}
            className="hidden lg:block relative"
          >
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
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
              className="w-40 lg:w-48 bg-white/10 text-white placeholder-white/50 rounded-full py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand transition-all"
            />
          </motion.form>

          {user ? (
            /* Profile dropdown */
            <div className="relative" ref={profileRef}>
              <motion.button
                onClick={() => setProfileOpen((v) => !v)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="grid place-items-center w-9 h-9 rounded-full bg-brand text-black font-bold text-sm shadow-lg shadow-brand/25"
                title={user.username || user.email}
              >
                {initial}
              </motion.button>
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 26 }}
                    className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#1f1f1f] border border-white/10 shadow-2xl shadow-black/60 p-2 origin-top-right"
                  >
                    <div className="px-3 py-2.5 border-b border-white/10">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.username || user.email}
                      </p>
                      <p className="text-xs text-white/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate("/profile");
                      }}
                      className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate("/");
                      }}
                      className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
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
              <Link to="/login" className="hidden sm:block text-sm text-white/70 hover:text-brand transition-colors">
                Login
              </Link>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="block text-sm font-semibold text-black bg-brand rounded-full px-4 py-2 hover:bg-[#7cc9e8] transition-colors"
                >
                  Register
                </Link>
              </motion.div>
            </>
          )}

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="lg:hidden grid place-items-center w-9 h-9 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="relative w-4 h-3.5">
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
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="lg:hidden overflow-hidden border-t border-white/10 px-4 sm:px-6"
          >
            <form onSubmit={handleSearch} className="relative pt-4">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
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
                className="w-full bg-white/10 text-white placeholder-white/50 rounded-full py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-brand"
              />
            </form>

            <nav className="flex flex-col gap-1.5 py-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.to}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 24 }}
                >
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive ? "bg-brand text-black" : "text-white/70 hover:text-white hover:bg-white/10"
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}

              <motion.a
                href={APP_DOWNLOAD_URL}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * links.length, type: "spring", stiffness: 300, damping: 24 }}
                className="mt-1 flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-black"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download App
              </motion.a>
            </nav>

            {!user && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 pb-5"
              >
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm text-white/80 bg-white/10 rounded-full px-4 py-2.5 hover:bg-white/20 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-black bg-brand rounded-full px-4 py-2.5 hover:bg-[#7cc9e8] transition-colors"
                >
                  Register
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
