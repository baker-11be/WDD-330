const API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const apiKey = import.meta.env.VITE_TMDB_API_KEY?.trim();
const accessToken = import.meta.env.VITE_TMDB_ACCESS_TOKEN?.trim();

function isPlaceholder(value) {
  return !value || /your[_ -].*(key|token)|placeholder/i.test(value);
}

// Send an authenticated request to TMDB and return its JSON payload.
async function request(path, params = {}) {
  const hasApiKey = !isPlaceholder(apiKey);
  const hasAccessToken = !isPlaceholder(accessToken);
  if (!hasApiKey && !hasAccessToken) {
    throw new Error('Add VITE_TMDB_API_KEY to src/.env.local, then restart the dev server.');
  }
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') url.searchParams.set(key, value);
  });
  if (hasApiKey) url.searchParams.set('api_key', apiKey);
  const response = await fetch(url, {
    headers: hasAccessToken ? { Authorization: `Bearer ${accessToken}`, accept: 'application/json' } : { accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`TMDB request failed (${response.status}). Check your API credentials.`);
  return response.json();
}

// Get today's trending movies for the discovery home screen.
export async function getTrending() {
  const data = await request('/trending/movie/day', { language: 'en-US' });
  return data.results || [];
}

// Search TMDB by movie title.
export async function searchMovies(query) {
  const data = await request('/search/movie', { query, include_adult: false, language: 'en-US', page: 1 });
  return data.results || [];
}

// Discover movies by genre, rating, and sort order.
export async function discoverMovies({ genreId = '', sortBy = 'popularity.desc', highRated = false } = {}) {
  const data = await request('/discover/movie', {
    include_adult: false,
    include_video: false,
    language: 'en-US',
    page: 1,
    sort_by: sortBy,
    with_genres: genreId,
    'vote_average.gte': highRated ? 7 : undefined,
    'vote_count.gte': highRated ? 300 : undefined,
  });
  return data.results || [];
}

// Load TMDB's current movie genre names.
export async function getGenres() {
  const data = await request('/genre/movie/list', { language: 'en-US' });
  return data.genres || [];
}

// Load the complete TMDB record for a selected movie.
export async function getMovieDetails(movieId) {
  return request(`/movie/${movieId}`, { language: 'en-US' });
}

export { IMAGE_BASE };