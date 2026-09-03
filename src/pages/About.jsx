export default function About() {
  return (
    <div className="mx-auto max-w-2xl animate-fadeIn">
      <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-brand-surface p-6 shadow-xl shadow-black/10 dark:shadow-black/30 sm:p-8">
        <h1 className="font-display mb-4 text-3xl font-semibold tracking-tight">About RanaMusic</h1>
        <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">
          RanaMusic is your personal music streaming platform designed to bring you
          closer to the music you love. Discover trending tracks, explore albums,
          follow your favorite artists, and create custom playlists — all in one place.
        </p>
        <p className="text-black/70 dark:text-white/70 leading-relaxed mb-4">
          Built with passion for music lovers, RanaMusic offers a seamless listening
          experience with a clean, modern interface. Whether you're into pop, rock,
          hip-hop, or classical, there's something for everyone.
        </p>

        <div className="mt-6 rounded-xl bg-black/[0.03] dark:bg-white/5 p-4">
          <h2 className="text-lg font-semibold mb-2">Our Mission</h2>
          <p className="text-black/60 dark:text-white/60 text-sm leading-relaxed">
            To make music discovery effortless and enjoyable. We believe music has the
            power to connect people, and our goal is to remove every barrier between
            you and the songs that move you.
          </p>
        </div>

        <div className="mt-4 rounded-xl bg-black/[0.03] dark:bg-white/5 p-4">
          <h2 className="text-lg font-semibold mb-2">Features</h2>
          <ul className="text-black/60 dark:text-white/60 text-sm space-y-1">
            <li>• Stream millions of tracks on demand</li>
            <li>• Create and share playlists</li>
            <li>• Discover new artists and albums</li>
            <li>• Like and save your favorite songs</li>
            <li>• Personalized recommendations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
