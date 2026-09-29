const OMDB_BASE = 'https://www.omdbapi.com/';

// Fetch cast, awards, and IMDb rating from OMDb when a key is available.
export async function getOmdbDetails(title, year = '') {
  const apiKey = import.meta.env.VITE_OMDB_API_KEY;
  if (!apiKey) return null;
  const url = new URL(OMDB_BASE);
  url.searchParams.set('apikey', apiKey);
  url.searchParams.set('t', title);
  url.searchParams.set('type', 'movie');
  if (year) url.searchParams.set('y', year);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`OMDb request failed (${response.status}).`);
  const data = await response.json();
  return data.Response === 'True' ? data : null;
}