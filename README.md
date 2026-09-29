# CineMatch

CineMatch helps you discover trending movies, search by title, filter by genre, and keep a personal watchlist. Movie discovery uses TMDB; the detail dialog can also show cast, awards, and IMDb ratings from OMDb.

## Setup

1. Install dependencies with `npm install`.
2. In PowerShell, run `Copy-Item src/.env.sample src/.env.local`.
3. Open `src/.env.local` and replace `your_tmdb_api_key` with your TMDB API key. Leave `VITE_OMDB_API_KEY` blank unless you also have an OMDb key for cast, awards, and IMDb details.
4. Start or restart the app with `npm run start` and open the Vite URL shown in the terminal. Vite reads `.env.local` when the server starts.

Vite exposes `VITE_` variables in browser code, so treat these as public client-side keys and use provider restrictions where available. The app can browse with a TMDB API key (`VITE_TMDB_API_KEY`) or TMDB read access token (`VITE_TMDB_ACCESS_TOKEN`). Keep `src/.env.local` on your machine; Git ignores it.

## Checks

- `npm run lint` runs ESLint.
- `npm test` runs the existing Node tests.
- `npm run build` creates the production build.
