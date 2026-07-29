import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Input from "../common/Input.jsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/library", label: "Your Library" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="shrink-0 grid grid-cols-3 items-center gap-y-2 px-6 py-3 bg-brand-surface/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
      {/* Left: logo */}
      <Link to="/" className="text-xl font-bold text-brand justify-self-start">
        MusicApp
      </Link>

      {/* Center: primary nav */}
      <nav className="hidden md:flex items-center gap-1 justify-self-center bg-white/5 rounded-full p-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive ? "bg-brand text-black" : "text-white/70 hover:text-white"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>

      {/* Right: search + auth */}
      <div className="flex items-center gap-3 justify-self-end">
        <form onSubmit={handleSearch} className="hidden lg:block w-48">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="w-full"
          />
        </form>

        {user ? (
          <button onClick={logout} className="text-sm text-white/70 hover:text-white">
            Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="text-sm hover:text-brand">
              Login
            </Link>
            <Link to="/register" className="text-sm hover:text-brand">
              Register
            </Link>
          </>
        )}
      </div>

      {/* Mobile nav */}
      <nav className="col-span-3 flex md:hidden items-center justify-center gap-1 mt-2 bg-white/5 rounded-full p-1 -mb-2">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive ? "bg-brand text-black" : "text-white/70 hover:text-white"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}