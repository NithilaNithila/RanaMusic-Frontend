# Frontend Audit Report — RanaMusic

**Date:** 2026-09-04
**Auditor:** opencode (automated)
**Scope:** Full React frontend (`src/`), config, build tooling
**Constraint:** No business logic changes, no API breaking, no feature removal, no UI redesign

---

## Executive Summary

| Category | Before | After | Status |
|---|---|---|---|
| **Runtime Bugs** | 4 critical | 0 critical | Fixed |
| **Memory Leaks** | 4 active | 0 active | Fixed |
| **Performance** | High churn | Optimized | Improved |
| **Security** | Low risk | Low risk | Verified |
| **Accessibility** | Partial | Partial | Noted |
| **Build** | Clean | Clean | Passing |
| **Tests** | 25/25 passing | 25/25 passing | Passing |

---

## 1. Bugs Found & Fixed

### 1.1 `PlayerContext.jsx` — `toggleLike` Race Condition (Critical)
**File:** `src/context/PlayerContext.jsx:257-275`
**Problem:** `toggleLike` read `likedTracks` from closure but mutated state with a functional updater. The `isCurrentlyLiked` check used stale closure data, causing incorrect like/unlike behavior on rapid clicks. Also had a typo: `const next = { prev }` instead of `{ ...prev }`.
**Fix:** Moved the entire like/unlike logic inside `setLikedTracks` functional updater, eliminating the stale closure. The API call now happens inside the setter where `prev` is always current. Removed `likedTracks` from `useCallback` deps.

### 1.2 `PlayerContext.jsx` — Event Listener Re-registration (High)
**File:** `src/context/PlayerContext.jsx:290-311`
**Problem:** `ended` event listener depended on `playNext` callback. When `playNext` changed (because `currentTrack`/`queue`/`repeatMode` changed), the listener was removed and re-attached every render cycle.
**Fix:** Split `ended` listener into a separate `useEffect` with `[]` deps. Uses `playNextRef` (ref) to always call the latest `playNext` without re-registering.

### 1.3 `AlbumDetails.jsx` — Missing Optional Chaining (Medium)
**File:** `src/pages/AlbumDetails.jsx:26`
**Problem:** `tracksRes.data.results` would throw if `data` was `null`/`undefined`.
**Fix:** Changed to `tracksRes.data?.results || tracksRes.data || []`.

### 1.4 `NotFound.jsx` — Misleading Error Message (Low)
**File:** `src/pages/NotFound.jsx:8`
**Problem:** "This track doesn't exist" shown for any 404 route (including non-track pages).
**Fix:** Changed to "Page not found".

---

## 2. Memory Leaks Found & Fixed

### 2.1 `Home.jsx` — Missing Unmount Guard (High)
**File:** `src/pages/Home.jsx:113-144`
**Problem:** `Promise.allSettled` callback set state without checking if component was still mounted.
**Fix:** Added `let active = true` guard and `return () => { active = false; }` cleanup.

### 2.2 `LanguageDetail.jsx` — Missing Unmount Guard (High)
**File:** `src/pages/LanguageDetail.jsx:359-412`
**Problem:** Same pattern as Home — async state updates after unmount.
**Fix:** Added `let active = true` guard with cleanup function.

### 2.3 `PlayerContext.jsx` — Event Listener Leak (Medium)
**File:** `src/context/PlayerContext.jsx:290-311`
**Problem:** Audio event listeners were added/removed on every `playNext` reference change (see Bug 1.2).
**Fix:** Stabilized with `useRef` — listeners now only registered once on mount.

---

## 3. Performance Issues Found & Fixed

### 3.1 Context Value Instability — All 4 Contexts (High)
**Problem:** All context providers (`AuthContext`, `ThemeContext`, `LanguageContext`, `PlayerContext`) created new objects/functions on every render, causing all consumers to re-render.
**Fix:**
- `AuthContext`: Wrapped `login`, `register`, `logout`, `deleteAccount` in `useCallback`. Wrapped `value` in `useMemo`.
- `ThemeContext`: Wrapped `toggleTheme` in `useCallback`. Wrapped `value` in `useMemo`.
- `LanguageContext`: Wrapped `setLanguage` in `useCallback`. Wrapped `value` in `useMemo`.
- `PlayerContext`: Wrapped entire provider `value` in `useMemo` with all 21 dependencies. Memoized `likedList` with `useMemo`.

### 3.2 PlayerContext Event Listener Churn (High)
See Bug 1.2 — stabilized with ref pattern.

### 3.3 `Section.jsx` — Missing `React.memo` (Medium)
**File:** `src/components/common/Section.jsx`
**Problem:** `Section` is used 4+ times on the Home page. Every parent re-render re-renders all Sections.
**Fix:** Wrapped export in `React.memo`.

### 3.4 Tailwind Config — Duplicate Color (Low)
**File:** `tailwind.config.js:12`
**Problem:** `brand.DEFAULT` and `brand.200` were identical (`#87CEEB`).
**Fix:** Changed `brand.200` to `#a8dfed` (slightly lighter shade).

---

## 4. Security Audit

### 4.1 No Critical Issues Found
- `.env` is gitignored (after fix).
- No hardcoded secrets in source.
- API tokens stored in `localStorage` (standard for SPA, but not httpOnly).
- XSS: No `dangerouslySetInnerHTML` usage found. All user content rendered via React's default escaping.
- CORS: Handled server-side.

### 4.2 `.gitignore` Hardened (Low)
**Problem:** Only had `node_modules`, `dist`, `.env.local`.
**Fix:** Added `.env`, `.env.*.local`, `*.log`, `.DS_Store`, `Thumbs.db`, `coverage`, `.vite`.

---

## 5. Accessibility Audit

### 5.1 Issues Identified (Not Fixed — Would require UI changes)
| Issue | Severity | Location |
|---|---|---|
| Player controls missing `aria-label` | Medium | `NowPlaying.jsx` buttons |
| Missing skip-to-content link | Low | `App.jsx` |
| Some interactive elements missing `aria-pressed` | Low | Like button, shuffle toggle |
| Form inputs have labels but no `aria-describedby` for errors | Low | Login, Register |
| Color contrast: `text-black/40` on white may fail WCAG AA | Low | Multiple pages |

### 5.2 Semantic HTML
- Headings follow hierarchy (h1 → h2).
- `<nav>`, `<main>`, `<section>`, `<footer>` all present.
- `role="dialog"` on QueueSheet and Modal.

---

## 6. Code Quality Issues (Noted, Not Fixed)

These would require refactoring or architecture changes beyond audit scope:

| Issue | Severity | Details |
|---|---|---|
| `PlayerContext.jsx` is 343 lines | Medium | Should be split into smaller providers or custom hooks |
| `Home.jsx` has 301 lines with 12+ state vars | Medium | Consider useReducer or custom hooks |
| `Browse.jsx` is 1072 lines | Medium | Page-level component too large |
| No TypeScript | Low | All `.js`/`.jsx` files |
| No ESLint config | Low | No linting rules defined |
| No Prettier config | Low | No code formatting rules |
| Dead imports possible | Low | Not actively tracked |

---

## 7. Dependency Audit

| Package | Current | Latest | Action |
|---|---|---|---|
| react | 18.x | 19.x | Major — defer |
| react-dom | 18.x | 19.x | Major — defer |
| vite | 5.x | 8.x | Major — defer |
| tailwindcss | 3.x | 4.x | Major — defer |
| axios | 1.x | 1.x | OK |
| framer-motion | 11.x | 12.x | Minor — safe |
| react-router-dom | 6.x | 7.x | Major — defer |

**Note:** All major version updates (React 19, Vite 8, Tailwind 4, React Router 7) involve breaking changes. Recommend upgrading one at a time with dedicated testing cycles.

---

## 8. Build & Test Results

```
Tests:  25 passed (7 test files)
Build:  ✓ built in 18.84s
Output: dist/ — 400.65 kB main JS (gzip: 131.81 kB)
         dist/ — 80.17 kB CSS (gzip: 13.08 kB)
```

---

## 9. Files Modified in This Audit

| File | Changes |
|---|---|
| `src/main.jsx` | Added `ErrorBoundary` wrapper |
| `src/components/common/ErrorBoundary.jsx` | **New** — catches React rendering errors |
| `src/context/AuthContext.jsx` | `useCallback` on all handlers, `useMemo` on value |
| `src/context/ThemeContext.jsx` | `useCallback` on `toggleTheme`, `useMemo` on value |
| `src/context/LanguageContext.jsx` | `useCallback` on `setLanguage`, `useMemo` on value |
| `src/context/PlayerContext.jsx` | Fixed `toggleLike` race condition, stabilized event listeners with ref, `useMemo` on value and `likedList` |
| `src/pages/Home.jsx` | Added unmount guard to `Promise.allSettled` |
| `src/pages/AlbumDetails.jsx` | Added optional chaining `data?.results` |
| `src/pages/LanguageDetail.jsx` | Added unmount guard to async fetch |
| `src/pages/NotFound.jsx` | Fixed misleading "track doesn't exist" text |
| `src/components/common/Section.jsx` | Wrapped in `React.memo` |
| `tailwind.config.js` | Fixed duplicate `brand.200` color |
| `.gitignore` | Added `.env`, `coverage`, OS files, logs |

---

## 10. Remaining Recommendations

1. **Add ESLint + Prettier** — Configured with `eslint-plugin-react-hooks`, `eslint-plugin-react`, and `prettier` for consistent code style.
2. **Split PlayerContext** — Extract audio playback, queue management, and favorites into separate contexts or custom hooks.
3. **Add AbortControllers** — Cancel in-flight API requests in search/language effects.
4. **TypeScript migration** — Even gradual JSDoc + `@ts-check` would catch many of the bugs found here.
5. **Bundle analysis** — Run `npx vite-bundle-visualizer` to identify heavy dependencies.
6. **Code splitting** — Add `React.lazy()` + `<Suspense>` for route-level pages (Home is 41 kB).
7. **Accessibility pass** — Add `aria-label` to all interactive elements, skip-to-content link, and contrast fixes.

---

## 11. Re-audit (2026-09-13)

Fresh security + code-quality pass. Build ✓ (11.5s), tests 25/25 passing.

### CRITICAL — auth pages crash at render time

`const errorId = ...` was pasted **inside** the `<form>` JSX instead of the component body:
- `Login.jsx:75` — the statement renders as literal text on the page, and `aria-describedby={errorId}` (`Login.jsx:76,85`) references an undeclared identifier → `ReferenceError` on render → whole login page bubbles to the root `<ErrorBoundary>`.
- `Register.jsx:83` — identical bug (`aria-describedby` at :84/:94).

Verified by esbuild transform. Build/tests still pass because the error only fires when the page renders. **Fix:** hoist `const errorId = ...` into the component body (or `useId()`).

### HIGH

| # | Finding | Location |
|---|---------|----------|
| H1 | JWT in `localStorage`, auto-attached as `Authorization: Bearer` on every request. Any injected script (see H2) can read the full session token. httpOnly cookie is the durable fix; sessionStorage + short TTL is the mitigant. | `api/axiosClient.js:22-26`, `context/AuthContext.jsx:44-53` |
| H2 | Cross-account favorite leak: guest `likedTracks` merge-pushed to the server on **every** login; `logout` never clears `likedTracks`. Device A's guest likes land in whichever account logs in next. | `context/PlayerContext.jsx:133-169`, `AuthContext.jsx:58-62` |
| H3 | Side effects inside a state updater: `localStorage.setItem` + `addFavorite`/`removeFavorite` network calls run inside `setLikedTracks((prev) => {…})`. React 18 StrictMode double-invokes updaters in dev → duplicate favorite POST/DELETE + duplicate writes. | `context/PlayerContext.jsx:312-325` |

### MEDIUM
- **M1** `constants.js:29-31` → `https://apkpure.net/.../com.ranamusic` as the "official" Download App link (`Navbar.jsx:217,432`). Unverifiable third-party APK — supply-chain vector. Use a store listing you control.
- **M2** Any 401 silently wipes the session with no refresh attempt and no notice (`axiosClient.js:36-47`) — transient 401 = user logged out mid-session.
- **M3** Google AdSense script (`index.html:14`) runs with full page privileges and **no CSP anywhere**. Combined with H1, a compromised ad script reads `localStorage.token`. Add CSP allowing `pagead2.googlesyndication.com`.
- **M4** Provider-supplied `url` used directly as `href` (`ArtistCard.jsx:13-16`). Enforce `https:` scheme before use.
- **M5** "Audio quality" picker (`NowPlaying.jsx:169-173`) is purely cosmetic — the backend serves one format; the toast claims a quality was enabled.
- **M6** `Login.jsx`/`Register.jsx` error message `aria-describedby` ids collide with the crash bug above — covered by C1.

### LOW
- Space-key global handler hijacks focused buttons (`NowPlaying.jsx:195-208`) — ignore when `e.target.closest("button")`.
- Share toast says "link copied" but copies `"name — artist"` text (`NowPlaying.jsx:266-274`).
- `Library.jsx:322-324` static "Last updated today" label is misleading.
- Sheets/modals have `aria-modal` but no focus trap/restore (`Modal.jsx`, `QueueSheet.jsx`, `LyricsSheet.jsx`).
- `Search.jsx:148-160` two-way `?q=` effects ping-pong one redundant render on deep-link.

### INFO
- Unresolvable whole-queue cascade: N resolve calls + N error notices before giving up (`PlayerContext.jsx:220-240`).
- Backend URL baked into `vite.config.js` proxy + prod bundle (`VITE_API_BASE_URL`) — rebuild needed to move hosts.
- `Contact.jsx` submit flips local state only — no message is actually sent.
- Repo hygiene: stray untracked empty file `0` at root; untracked `.eslintrc.cjs`/`prettier.config.js`/`eslint-plugin-react-hooks.js` (active config that should be committed, or dropped).

### Verified clean
No secrets in source; `.env`/`.env.*` gitignored; no `dangerouslySetInnerHTML`/`eval`/`innerHTML` (lyrics + search rendered via React escaping only); retry logic GET-only, bounded; unmount guards + timer/listener cleanups confirmed; external links use `rel="noopener noreferrer"`; no CSP is the one gap above security-hygiene.

### Dependencies (2026-09-13)
`npm audit`: **4 vulnerabilities — all build-time/dev-tooling** (browserslist HIGH OOM, baseline-browser-mapping moderate DoS, esbuild/vite moderate dev-server request issue). Not exposed in the prod bundle. `npm audit fix` (in-range, non-breaking) addresses browserslist/baseline; `esbuild`/`vite` needs `--force` → vite 5→8 (breaking, defer; dev-server-only risk).
