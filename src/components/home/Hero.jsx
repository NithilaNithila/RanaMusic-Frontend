import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Equalizer from "../common/Equalizer";

export default function Hero({ onShuffle }) {
  const { user } = useAuth();

  return (
    <div className="relative -m-6 mb-6 h-[62vh] min-h-[420px] overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-brand-surface" />

      {/* Floating decorative notes */}
      <div className="absolute top-10 right-16 text-5xl opacity-20 animate-floatY hidden md:block">
        &#9834;
      </div>
      <div
        className="absolute bottom-24 right-1/3 text-3xl opacity-20 animate-floatY hidden md:block"
        style={{ animationDelay: "1.2s" }}
      >
        &#9835;
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 pb-10">
        <div className="flex items-center gap-2 mb-3 animate-fadeIn">
          <Equalizer />
          <span className="text-xs uppercase tracking-[0.2em] text-white/70">
            Now streaming
          </span>
        </div>

        <h1
          className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 animate-fadeInUp"
          style={{ animationDelay: "0.1s", opacity: 0 }}
        >
          Feel the sound,
          <br />
          <span className="hero-gradient-text animate-gradientShift bg-300%">
            move to the moment.
          </span>
        </h1>

        <p
          className="text-white/70 max-w-md mb-6 animate-fadeInUp"
          style={{ animationDelay: "0.25s", opacity: 0 }}
        >
          {user
            ? `Welcome back, ${user.name || user.username || "friend"}. Your next favorite track is one tap away.`
            : "Millions of tracks, curated playlists, and artists you love — all in one place."}
        </p>

        <div
          className="flex flex-wrap items-center gap-3 animate-fadeInUp"
          style={{ animationDelay: "0.4s", opacity: 0 }}
        >
          <button
            onClick={onShuffle}
            className="px-6 py-3 rounded-full font-semibold text-sm bg-brand text-black hover:bg-green-400 hover:scale-105 transition-all shadow-lg shadow-brand/20"
          >
            &#9654; Shuffle Play
          </button>
          <Link
            to="/search"
            className="px-6 py-3 rounded-full font-semibold text-sm bg-white/10 text-white hover:bg-white/20 hover:scale-105 transition-all backdrop-blur-sm"
          >
            Browse Music
          </Link>
        </div>
      </div>
    </div>
  );
}
