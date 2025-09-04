// resolvers.js
import { Movie } from "../models/Movie.js";

export const resolvers = {
	Query: {
		movies: async (_p, { filter, limit, skip }) => {
			//Här sätter vi i ordning vårt filter med variabeln q
			const q = {};
			//q.imdb = {};
			//Fyll på med filter för titleContains (regex), genre(exakt matchning), minYear(gte), maxYear(lte), minRating(gte)
			if (filter) {
				if (filter.titleContains)
					q.title = { $regex: filter.titleContains, $options: "i" };
				//if (filter.genre) q.genres = { $regex: `^${filter.genre}$`, $options: "i" };
				if (filter.genre) q.genres = filter.genre;
				if (filter.minYear) q.year = { $gte: filter.minYear };
				if (filter.maxYear) q.year = { $lte: filter.maxYear };
				if (filter.minRating) q["imdb.rating"] = { $gte: filter.minRating };
			}

			//Skip = hoppa över X antal dokument (enkel paginering)
			//Limit = begränsa antalet dokument som returneras
			let query = Movie.find(q);
			if (limit && limit > 0) query = query.limit(limit);
			if (skip && skip > 0) query = query.skip(skip);
			return query;
		},

		movie: async (_p, { id }) => {
			if (!mongoose.isValidObjectId(id)) return null;
			return Movie.findById(id);
		},

		topRatedPerYear: async (_p, { year, minVotes, limit }) => {
			/*skriv en aggregationspipeline som hämtar toppfilmer för ett år*/
			//vi behöver $match på år och minVotes (alltså minsta antal röster)
			//vi vill sortera $sort på imdb.rating
			//vi vill begränsa $limit till limit
			//vi vill projektera $project ut title, year, imdb, genres, cast, languages, directors
			//Läs mer om aggregationspipeline på https://article.arunangshudas.com/what-is-the-mongodb-aggregation-pipeline-in-mongoose-308a05c15e7e

			let pipeline = [
				{ $match: { year, "imdb.votes": { $gte: minVotes } } },
				{ $sort: { "imdb.rating": -1 } },
				{ $limit: limit },
			];
			const topMovies = Movie.aggregate(pipeline);
			return topMovies;
		},
	},

	Movie: {
		id: (doc) => String(doc._id),
		castCount: (doc) => {
			console.log(doc);
			return doc.cast.length;
		},
		imdbScoreRounded: (doc) => Math.round(doc.imdb.rating),
	},
};
