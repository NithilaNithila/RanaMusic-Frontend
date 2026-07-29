# Music Frontend (React + Vite + Tailwind)

Frontend for the full-stack music app. Talks to the Express/MongoDB backend,
which proxies Jamendo (search, tracks, albums, artists) and owns app-specific
data (auth, playlists, favorites).

## Setup

```bash
npm install
npm run dev
```

Configure `.env`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Structure

- `src/api` – axios client + one file per resource (tracks, albums, artists, playlists, auth)
- `src/context` – AuthContext (login/register/logout, token in localStorage) and
  PlayerContext (currently playing track, queue, play/pause, seek, volume)
- `src/hooks` – useAuth, usePlayer (useAudioPlayer), useDebounce
- `src/components` – common (Button/Input/Loader/Modal/Toast), layout
  (Navbar/Sidebar/Footer/MainLayout), player (PlayerBar/ProgressBar/VolumeControl/QueueList),
  track/album/artist/playlist cards, rows and grids
- `src/pages` – Home, Search, AlbumDetails, ArtistDetails, PlaylistDetails, Library,
  Login, Register, NotFound
- `src/routes` – AppRoutes + ProtectedRoute (guards /library)

## Notes

- Audio playback points directly at Jamendo's `audio` URL on each track
  (not proxied through the backend) — see `PlayerContext.playTrack`.
- Auth token is stored in `localStorage` and attached via an axios request
  interceptor in `src/api/axiosClient.js`.
- Styling uses Tailwind with a small custom `brand` color palette in
  `tailwind.config.js` (Spotify-ish dark theme). Swap freely.
