export const SAMPLE_GENRES = [
	{ id: 28, name: 'Action' },
	{ id: 12, name: 'Adventure' },
	{ id: 16, name: 'Animation' },
	{ id: 35, name: 'Comedy' },
	{ id: 18, name: 'Drama' },
	{ id: 878, name: 'Science Fiction' },
	{ id: 53, name: 'Thriller' },
];

const sampleMovies = [
	{
		id: 900001,
		title: 'The Shawshank Redemption',
		original_language: 'en',
		overview: 'Two imprisoned men form a lasting friendship as they search for hope and a way to rebuild their lives.',
		release_date: '1994-09-23',
		vote_average: 8.7,
		genre_ids: [18],
		poster_path: '/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg',
		backdrop_path: '/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
	},
	{
		id: 900002,
		title: 'The Dark Knight',
		original_language: 'en',
		overview: 'Batman faces his greatest test when a criminal mastermind throws Gotham into chaos.',
		release_date: '2008-07-16',
		vote_average: 8.5,
		genre_ids: [18, 28, 80, 53],
		poster_path: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
		backdrop_path: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
	},
	{
		id: 900003,
		title: 'Inception',
		original_language: 'en',
		overview: 'A skilled thief who steals secrets through dream-sharing is offered a chance to erase his past.',
		release_date: '2010-07-15',
		vote_average: 8.4,
		genre_ids: [28, 878, 12],
		poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
		backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
	},
	{
		id: 900004,
		title: 'Interstellar',
		original_language: 'en',
		overview: 'A team of explorers travels beyond this galaxy to discover whether humankind has a future among the stars.',
		release_date: '2014-11-05',
		vote_average: 8.4,
		genre_ids: [12, 18, 878],
		poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
		backdrop_path: '/pbrkL804c8yAv3zBZR4QPEafpAR.jpg',
	},
	{
		id: 900005,
		title: 'Spider-Man: Into the Spider-Verse',
		original_language: 'en',
		overview: 'Miles Morales discovers what it means to be Spider-Man when heroes from other dimensions arrive.',
		release_date: '2018-12-06',
		vote_average: 8.4,
		genre_ids: [16, 28, 12, 878],
		poster_path: '/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg',
		backdrop_path: '/7d6EY00g1c39SGZOoCJ5Py9nNth.jpg',
	},
	{
		id: 900006,
		title: 'The Matrix',
		original_language: 'en',
		overview: 'A computer programmer discovers that reality is not what it seems and joins a fight for humanity.',
		release_date: '1999-03-30',
		vote_average: 8.2,
		genre_ids: [28, 878],
		poster_path: '/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
		backdrop_path: '/icmmSD4vTTDKOq2vvdulafOGw93.jpg',
	},
	{
		id: 900007,
		title: 'Arrival',
		original_language: 'en',
		overview: 'A linguist works to communicate with visitors from space and uncovers a surprising connection.',
		release_date: '2016-11-10',
		vote_average: 7.6,
		genre_ids: [18, 878, 9648],
		poster_path: '/x2FJsf1ElAgr63Y3PNPtJrcmpoe.jpg',
		backdrop_path: '/yIZ1xendyqKvY3FGeeUYUd5X9Mm.jpg',
	},
	{
		id: 900008,
		title: 'The Grand Budapest Hotel',
		original_language: 'en',
		overview: 'A legendary hotel concierge and his protégé become caught up in a story of art, family, and a stolen painting.',
		release_date: '2014-02-26',
		vote_average: 8.0,
		genre_ids: [35, 18, 12],
		poster_path: '/eWdyYQreja6JGCzqHWXpWHDrrPo.jpg',
		backdrop_path: '/c7F9lo3wA1NqZ3n8qK9X2T2F4pu.jpg',
	},
];

// Return sample movies, optionally filtered by title and TMDB genre ID.
export function getSampleMovies({ query = '', genreId = '' } = {}) {
	const normalizedQuery = query.trim().toLowerCase();
	return sampleMovies.filter((movie) => {
		const matchesQuery = !normalizedQuery || movie.title.toLowerCase().includes(normalizedQuery);
		const matchesGenre = !genreId || movie.genre_ids.includes(Number(genreId));
		return matchesQuery && matchesGenre;
	});
}