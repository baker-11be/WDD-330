import { IMAGE_BASE } from './tmdbApi.js';

// Build a safe, accessible movie card using DOM APIs and text content.
export function createMovieCard(movie, watchlist = []) {
  const saved = watchlist.find((entry) => entry.id === movie.id);
  const card = document.createElement('article');
  card.className = 'movie-card';
  card.setAttribute('aria-label', movie.title);

  const posterButton = document.createElement('button');
  posterButton.className = 'poster-button';
  posterButton.type = 'button';
  posterButton.dataset.action = 'details';
  posterButton.dataset.movieId = movie.id;
  posterButton.setAttribute('aria-label', `View details for ${movie.title}`);

  const poster = document.createElement('img');
  poster.className = 'movie-poster';
  poster.src = imageUrl(movie.poster_path);
  poster.alt = `${movie.title} poster`;
  poster.loading = 'lazy';
  poster.addEventListener('error', () => {
    poster.removeAttribute('src');
    poster.classList.add('poster-missing');
    poster.alt = `Poster unavailable for ${movie.title}`;
  }, { once: true });
  posterButton.append(poster);

  const score = document.createElement('span');
  score.className = 'poster-score';
  score.textContent = `★ ${Number(movie.vote_average || 0).toFixed(1)}`;
  posterButton.append(score);

  const cardCopy = document.createElement('div');
  cardCopy.className = 'movie-card-copy';
  const title = document.createElement('h3');
  title.textContent = movie.title;
  const year = document.createElement('p');
  year.className = 'movie-year';
  year.textContent = movie.release_date?.slice(0, 4) || 'Release date unknown';
  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const saveButton = createActionButton(saved?.status === 'watchlist' ? 'In watchlist' : '+ Watchlist', 'watchlist', movie.id);
  saveButton.classList.toggle('is-saved', saved?.status === 'watchlist');
  actions.append(saveButton);

  if (saved?.status === 'watched') {
    const rated = document.createElement('div');
    rated.className = 'star-rating';
    rated.setAttribute('role', 'group');
    rated.setAttribute('aria-label', `Your rating for ${movie.title}`);
    for (let rating = 1; rating <= 5; rating += 1) {
      const star = createActionButton(rating <= (saved.personalRating || 0) ? '★' : '☆', 'rate', movie.id);
      star.dataset.rating = rating;
      star.setAttribute('aria-label', `Rate ${rating} out of 5 stars`);
      star.classList.add('star-button');
      rated.append(star);
    }
    actions.append(rated);
  } else if (saved) {
    actions.append(createActionButton('Mark watched', 'watched', movie.id));
  }

  cardCopy.append(title, year, actions);
  card.append(posterButton, cardCopy);
  return card;
}

// Return a sized TMDB image URL or an empty string for a missing image.
export function imageUrl(path, size = 'w500') {
  return path ? `${IMAGE_BASE}/${size}${path}` : '';
}

// Create a consistently attributed movie action button.
function createActionButton(label, action, movieId) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card-action';
  button.textContent = label;
  button.dataset.action = action;
  button.dataset.movieId = movieId;
  return button;
}