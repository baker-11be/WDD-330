import { getGenres, getMovieDetails, getTrending, searchMovies, discoverMovies } from './tmdbApi.js';
import { getOmdbDetails } from './extraApi.js';
import { addToWatchlist, getWatchlist, markWatched, rateMovie, removeFromWatchlist } from './storage.js';
import { createMovieCard, imageUrl } from './movieCard.js';
import { getSampleMovies, SAMPLE_GENRES } from './sampleMovies.js';

const elements = {
	grid: document.querySelector('#movie-grid'),
	status: document.querySelector('#app-status'),
	empty: document.querySelector('#empty-state'),
	emptyTitle: document.querySelector('#empty-title'),
	emptyCopy: document.querySelector('#empty-copy'),
	count: document.querySelector('#result-count'),
	resultsTitle: document.querySelector('#results-title'),
	resultsKicker: document.querySelector('#results-kicker'),
	searchForm: document.querySelector('#search-form'),
	searchInput: document.querySelector('#search-input'),
	genre: document.querySelector('#genre-filter'),
	sort: document.querySelector('#sort-order'),
	surprise: document.querySelector('#surprise-button'),
	watchlistCount: document.querySelector('#watchlist-count'),
	spotlightImage: document.querySelector('#spotlight-image'),
	spotlightTitle: document.querySelector('#spotlight-title'),
	spotlightOverview: document.querySelector('#spotlight-overview'),
	spotlightMeta: document.querySelector('#spotlight-meta'),
	spotlightDetails: document.querySelector('#spotlight-details'),
	dialog: document.querySelector('#movie-dialog'),
	dialogBackdrop: document.querySelector('#dialog-backdrop'),
	dialogPoster: document.querySelector('#dialog-poster'),
	dialogTitle: document.querySelector('#dialog-title'),
	dialogMeta: document.querySelector('#dialog-meta'),
	dialogOverview: document.querySelector('#dialog-overview'),
	dialogExtra: document.querySelector('#extra-details'),
	dialogWatchlist: document.querySelector('#dialog-watchlist'),
	dialogWatched: document.querySelector('#dialog-watched'),
	toast: document.querySelector('#toast'),
};

const state = {
	movies: [],
	view: 'discover',
	query: '',
	requestId: 0,
	activeMovie: null,
	toastTimer: null,
	sampleMode: false,
};

const viewLabels = {
	discover: { title: 'Trending now', kicker: 'THE DAILY CUT' },
	watchlist: { title: 'Your watchlist', kicker: 'SAVED FOR LATER' },
	watched: { title: 'Your watched list', kicker: 'ALREADY SEEN' },
};

// Render the current result set and apply the selected sort order.
function renderMovies(movies = state.movies) {
	const watchlist = getWatchlist();
	const savedMovies = watchlist.filter((movie) => movie.status === 'watchlist');
	const watchedMovies = watchlist.filter((movie) => movie.status === 'watched');
	const visibleMovies = state.view === 'watchlist' ? savedMovies : state.view === 'watched' ? watchedMovies : movies;
	const sortValue = elements.sort.value;
	const sortedMovies = [...visibleMovies].sort((first, second) => {
		if (sortValue === 'rating') return (second.vote_average || 0) - (first.vote_average || 0);
		if (sortValue === 'newest') return (second.release_date || '').localeCompare(first.release_date || '');
		return 0;
	});

	elements.grid.replaceChildren(...sortedMovies.map((movie) => createMovieCard(movie, watchlist)));
	elements.watchlistCount.textContent = String(savedMovies.length);
	elements.count.textContent = `${sortedMovies.length} ${sortedMovies.length === 1 ? 'title' : 'titles'}`;
	elements.empty.hidden = sortedMovies.length > 0;
	elements.grid.hidden = sortedMovies.length === 0;
	if (sortedMovies.length === 0) {
		elements.emptyTitle.textContent = state.view === 'discover' ? 'No movies found' : 'Nothing on this list yet';
		elements.emptyCopy.textContent = state.view === 'discover' ? 'Try another title or genre.' : 'Save a movie from Discover and it will show up here.';
	}
}

// Update view navigation, headings, and available controls.
function setView(view) {
	state.view = view;
	document.querySelectorAll('[data-view]').forEach((button) => {
		const selected = button.dataset.view === view;
		button.classList.toggle('is-active', selected);
		button.setAttribute('aria-pressed', String(selected));
	});
	elements.resultsTitle.textContent = viewLabels[view].title;
	elements.resultsKicker.textContent = viewLabels[view].kicker;
	const discoveryControls = view === 'discover';
	elements.searchForm.hidden = !discoveryControls;
	elements.genre.disabled = !discoveryControls;
	elements.sort.disabled = !discoveryControls;
	elements.surprise.disabled = !discoveryControls;
	renderMovies();
}

// Fetch and display trending, searched, or genre-discovered titles.
async function loadMovies() {
	const requestId = ++state.requestId;
	const genreId = elements.genre.value;
	elements.status.hidden = false;
	elements.status.textContent = 'Finding something good...';
	elements.empty.hidden = true;
	elements.grid.hidden = true;
	try {
		let movies;
		if (state.query) {
			movies = await searchMovies(state.query);
			if (genreId) movies = movies.filter((movie) => movie.genre_ids?.includes(Number(genreId)));
		} else if (genreId) {
			movies = await discoverMovies({ genreId });
		} else {
			movies = await getTrending();
		}
		if (requestId !== state.requestId) return;
		state.movies = movies;
		state.sampleMode = false;
		elements.status.hidden = true;
		if (!state.query && !genreId && state.view === 'discover') showSpotlight(movies[0]);
		renderMovies();
	} catch (error) {
		if (requestId !== state.requestId) return;
		state.sampleMode = true;
		state.movies = getSampleMovies({ query: state.query, genreId });
		elements.status.hidden = false;
		elements.status.textContent = 'Showing English sample movies because TMDB is unavailable. Add a valid VITE_TMDB_API_KEY to src/.env.local and restart Vite for live results.';
		if (!state.query && !genreId && state.view === 'discover') showSpotlight(state.movies[0]);
		renderMovies();
	}
}

// Set the featured movie from the current trending lineup.
function showSpotlight(movie) {
	if (!movie) return;
	elements.spotlightTitle.textContent = movie.title;
	elements.spotlightOverview.textContent = movie.overview || 'A story worth discovering.';
	elements.spotlightImage.src = imageUrl(movie.backdrop_path, 'w1280');
	elements.spotlightImage.alt = `${movie.title} backdrop`;
	elements.spotlightMeta.textContent = `${movie.release_date?.slice(0, 4) || 'Release date unknown'}  /  ★ ${Number(movie.vote_average || 0).toFixed(1)}`;
	elements.spotlightDetails.hidden = false;
	elements.spotlightDetails.dataset.movieId = movie.id;
}

// Open accessible details and enrich them with OMDb data when configured.
async function openDetails(movie) {
	state.activeMovie = movie;
	elements.dialogTitle.textContent = movie.title;
	elements.dialogMeta.textContent = `${movie.release_date || 'Release date unknown'}  /  TMDB ★ ${Number(movie.vote_average || 0).toFixed(1)}`;
	elements.dialogOverview.textContent = movie.overview || 'No synopsis is available for this movie.';
	elements.dialogBackdrop.src = imageUrl(movie.backdrop_path, 'w1280');
	elements.dialogBackdrop.alt = `${movie.title} backdrop`;
	elements.dialogPoster.src = imageUrl(movie.poster_path, 'w500');
	elements.dialogPoster.alt = `${movie.title} poster`;
	elements.dialogExtra.textContent = 'Checking for cast and awards...';
	updateDialogActions(movie.id);
	elements.dialog.showModal();

	try {
		const [details, omdb] = await Promise.all([
			getMovieDetails(movie.id),
			getOmdbDetails(movie.title, movie.release_date?.slice(0, 4)),
		]);
		if (state.activeMovie?.id !== movie.id) return;
		elements.dialogOverview.textContent = details.overview || movie.overview || 'No synopsis is available for this movie.';
		elements.dialogMeta.textContent = `${details.release_date || movie.release_date || 'Release date unknown'}  /  TMDB ★ ${Number(details.vote_average ?? movie.vote_average ?? 0).toFixed(1)}`;
		if (details.backdrop_path) elements.dialogBackdrop.src = imageUrl(details.backdrop_path, 'w1280');
		if (omdb) {
			elements.dialogExtra.replaceChildren();
			const cast = document.createElement('p');
			cast.textContent = `Cast: ${omdb.Actors || 'Not listed'}`;
			const awards = document.createElement('p');
			awards.textContent = `Awards: ${omdb.Awards || 'Not listed'}`;
			const imdb = document.createElement('p');
			imdb.textContent = `IMDb: ${omdb.imdbRating || 'N/A'}`;
			elements.dialogExtra.append(cast, awards, imdb);
		} else {
			elements.dialogExtra.textContent = 'Add an OMDb API key to see cast, awards, and IMDb ratings.';
		}
	} catch {
		elements.dialogExtra.textContent = 'Extra movie details are currently unavailable.';
	}
}

// Keep the modal actions in sync with this movie's saved status.
function updateDialogActions(movieId) {
	const entry = getWatchlist().find((movie) => movie.id === movieId);
	elements.dialogWatchlist.textContent = entry?.status === 'watchlist' ? 'Remove from watchlist' : 'Add to watchlist';
	elements.dialogWatched.textContent = entry?.status === 'watched' ? 'Mark unwatched' : 'Mark watched';
}

// Display a brief confirmation after a watchlist change.
function showToast(message) {
	elements.toast.textContent = message;
	elements.toast.classList.add('is-visible');
	window.clearTimeout(state.toastTimer);
	state.toastTimer = window.setTimeout(() => elements.toast.classList.remove('is-visible'), 2200);
}

// Populate the genre filter using TMDB's current genre list.
async function loadGenres() {
	try {
		const genres = await getGenres();
		populateGenres(genres);
	} catch {
		populateGenres(SAMPLE_GENRES);
	}
}

// Populate the filter with live TMDB genres or the local sample genres.
function populateGenres(genres) {
	elements.genre.append(...genres.map((genre) => {
		const option = document.createElement('option');
		option.value = genre.id;
		option.textContent = genre.name;
		return option;
	}));
}

document.querySelectorAll('[data-view]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
elements.searchForm.addEventListener('submit', (event) => {
	event.preventDefault();
	state.query = elements.searchInput.value.trim();
	setView('discover');
	loadMovies();
});
elements.searchInput.addEventListener('input', () => {
	window.clearTimeout(state.searchTimer);
	state.searchTimer = window.setTimeout(() => {
		state.query = elements.searchInput.value.trim();
		if (state.query) setView('discover');
		loadMovies();
	}, 350);
});
elements.genre.addEventListener('change', loadMovies);
elements.sort.addEventListener('change', () => renderMovies());
elements.surprise.addEventListener('click', async () => {
	try {
		elements.status.hidden = false;
		elements.status.textContent = 'Finding a surprise...';
		let movies;
		try {
			movies = await discoverMovies({ genreId: elements.genre.value, sortBy: 'vote_average.desc', highRated: true });
		} catch {
			state.sampleMode = true;
			movies = getSampleMovies({ genreId: elements.genre.value }).filter((candidate) => candidate.vote_average >= 7);
		}
		if (!movies.length) throw new Error('No high-rated movies found for this genre. Try another one.');
		const movie = movies[Math.floor(Math.random() * movies.length)];
		elements.status.hidden = !state.sampleMode;
		if (state.sampleMode) elements.status.textContent = 'Showing English sample movies because TMDB is unavailable. Add a valid VITE_TMDB_API_KEY to src/.env.local and restart Vite for live results.';
		showSpotlight(movie);
		await openDetails(movie);
	} catch (error) {
		elements.status.hidden = false;
		elements.status.textContent = error.message;
	}
});
elements.grid.addEventListener('click', (event) => {
	const button = event.target.closest('button[data-action]');
	if (!button) return;
	const movie = state.movies.find((entry) => entry.id === Number(button.dataset.movieId)) || getWatchlist().find((entry) => entry.id === Number(button.dataset.movieId));
	if (!movie) return;
	if (button.dataset.action === 'details') openDetails(movie);
	if (button.dataset.action === 'watchlist') {
		const existing = getWatchlist().find((entry) => entry.id === movie.id);
		if (existing?.status === 'watchlist') {
			removeFromWatchlist(movie.id);
			showToast('Removed from your watchlist');
		} else {
			addToWatchlist(movie);
			showToast('Added to your watchlist');
		}
		renderMovies();
	}
	if (button.dataset.action === 'watched') {
		markWatched(movie.id);
		showToast('Moved to watched');
		renderMovies();
	}
	if (button.dataset.action === 'rate') {
		rateMovie(movie.id, Number(button.dataset.rating));
		renderMovies();
	}
});
elements.spotlightDetails.addEventListener('click', () => {
	const movie = state.movies.find((entry) => entry.id === Number(elements.spotlightDetails.dataset.movieId));
	if (movie) openDetails(movie);
});
elements.dialog.querySelector('.dialog-close').addEventListener('click', () => elements.dialog.close());
elements.dialog.addEventListener('click', (event) => {
	if (event.target === elements.dialog) elements.dialog.close();
});
elements.dialog.addEventListener('close', () => { state.activeMovie = null; });
elements.dialogWatchlist.addEventListener('click', () => {
	if (!state.activeMovie) return;
	const existing = getWatchlist().find((movie) => movie.id === state.activeMovie.id);
	if (existing?.status === 'watchlist') removeFromWatchlist(state.activeMovie.id);
	else addToWatchlist(state.activeMovie);
	updateDialogActions(state.activeMovie.id);
	renderMovies();
});
elements.dialogWatched.addEventListener('click', () => {
	if (!state.activeMovie) return;
	markWatched(state.activeMovie.id, state.activeMovie);
	updateDialogActions(state.activeMovie.id);
	renderMovies();
});

loadGenres();
loadMovies();
