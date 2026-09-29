import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

import { addToWatchlist, getWatchlist, markWatched, rateMovie, removeFromWatchlist } from '../src/js/storage.js';
import { getSampleMovies, SAMPLE_GENRES } from '../src/js/sampleMovies.js';

const storedValues = new Map();
global.localStorage = {
  getItem(key) {
    return storedValues.get(key) ?? null;
  },
  setItem(key, value) {
    storedValues.set(key, value);
  },
};

const movie = { id: 42, title: 'A Test Story', vote_average: 8.2 };

describe('CineMatch watchlist storage', () => {
  beforeEach(() => storedValues.clear());

  it('adds a movie and moves it to watched directly', () => {
    markWatched(movie.id, movie);

    assert.equal(getWatchlist()[0].status, 'watched');
  });

  it('toggles watched state and stores a personal rating', () => {
    addToWatchlist(movie);
    markWatched(movie.id);
    rateMovie(movie.id, 5);

    assert.equal(getWatchlist()[0].status, 'watched');
    assert.equal(getWatchlist()[0].personalRating, 5);
  });

  it('removes a movie from local storage', () => {
    addToWatchlist(movie);
    removeFromWatchlist(movie.id);

    assert.deepEqual(getWatchlist(), []);
  });
});

describe('CineMatch sample discovery', () => {
  const samples = getSampleMovies();

  it('provides English-language movies and matching sample genres', () => {
    assert.ok(samples.length >= 6);
    assert.ok(samples.every((sample) => sample.original_language === 'en'));
    assert.ok(SAMPLE_GENRES.some((genre) => genre.name === 'Science Fiction'));
  });

  it('filters sample movies by title and genre', () => {
    assert.equal(getSampleMovies({ query: 'inception' })[0].title, 'Inception');
    assert.ok(getSampleMovies({ genreId: '878' }).every((sample) => sample.genre_ids.includes(878)));
    assert.deepEqual(getSampleMovies({ query: 'not in this catalog' }), []);
  });
});