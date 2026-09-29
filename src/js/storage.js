const STORAGE_KEY = 'cinematch.watchlist.v1';

// Read saved movies safely, recovering from invalid or unavailable storage.
export function getWatchlist() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Persist a watchlist entry while preserving its watched state and rating.
function saveEntry(movie, status = 'watchlist') {
  const movies = getWatchlist();
  const existing = movies.find((entry) => entry.id === movie.id);
  const updatedEntry = { ...existing, ...movie, status, personalRating: existing?.personalRating || 0 };
  const updated = existing ? movies.map((item) => item.id === movie.id ? updatedEntry : item) : [...movies, updatedEntry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Add a movie to the personal watchlist.
export function addToWatchlist(movie) {
  saveEntry(movie);
}

// Remove a movie from both saved lists.
export function removeFromWatchlist(movieId) {
  const updated = getWatchlist().filter((movie) => movie.id !== movieId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// Toggle a movie between unwatched and watched states.
export function markWatched(movieId, movieToSave) {
  const savedMovie = getWatchlist().find((entry) => entry.id === movieId);
  if (!savedMovie) {
    if (movieToSave) saveEntry(movieToSave, 'watched');
    return;
  }
  saveEntry(savedMovie, savedMovie.status === 'watched' ? 'watchlist' : 'watched');
}

// Save a personal one-to-five-star rating for a watched movie.
export function rateMovie(movieId, rating) {
  const movies = getWatchlist().map((movie) => movie.id === movieId ? { ...movie, personalRating: rating } : movie);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}