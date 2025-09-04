import { Recipe } from "../models/Recipe.js";
import mongoose from "mongoose";

export const resolvers = {
	Query: {
		recipes: async (_p, { title, diet, maxTimeMin, limit }) => {
			const lim = typeof limit === "number" ? limit : 20;

			if (typeof maxTimeMin === "number") {
				const match = {};
				if (title) match.title = { $regex: title, $options: "i" };
				if (diet) match.diet = diet;

				//Vi kan tyvärr inte nå totalTimeMin härifrån, det räknas ut efter att vi har hämtat dokumenten.
				const pipeline = [
					{ $match: match },
					{
						$match: {
							$expr: {
								$lte: [{ $add: ["$prepTimeMin", "$cookTimeMin"] }, maxTimeMin],
							},
						},
					},
					{ $sort: { createdAt: -1 } },
					{ $limit: limit },
				];

				const docs = await Recipe.aggregate(pipeline).exec();
				return docs;
			}

			const filter = {};
			if (title) filter.title = { $regex: title, $options: "i" };
			if (diet) filter.diet = diet;

			return Recipe.find(filter).sort({ createdAt: -1 }).limit(lim).exec();
		},

		recipe: async (_p, { id }) => {
			if (!mongoose.Types.ObjectId.isValid(id)) return null;
			return Recipe.findById(id).exec();
		},
	},

	Mutation: {
		createRecipe: async (_p, { input }) => {
			const doc = new Recipe({ ...input, createdAt: new Date() });
			await doc.save();
			return doc;
		},

		updateRecipe: async (_p, { id, input }) => {
			if (!mongoose.Types.ObjectId.isValid(id)) return null;
			return Recipe.findByIdAndUpdate(id, input, { new: true }).exec();
		},

		deleteRecipe: async (_p, { id }) => {
			if (!mongoose.Types.ObjectId.isValid(id)) return false;
			const res = await Recipe.findByIdAndDelete(id).exec();
			return !!res;
		},

		addIngredient: async (_p, { recipeId, ingredient }) => {
			if (!mongoose.Types.ObjectId.isValid(recipeId)) return null;
			return Recipe.findByIdAndUpdate(
				recipeId,
				{ $push: { ingredients: ingredient } },
				{ new: true }
			).exec();
		},

		updateIngredient: async (_p, { recipeId, index, ingredient }) => {
			if (!mongoose.Types.ObjectId.isValid(recipeId)) return null;
			const doc = await Recipe.findById(recipeId).exec();
			if (!doc) return null;
			if (
				!Array.isArray(doc.ingredients) ||
				index < 0 ||
				index >= doc.ingredients.length
			) {
				return null;
			}
			doc.ingredients[index] = ingredient;
			await doc.save();
			return doc;
		},

		removeIngredient: async (_p, { recipeId, index }) => {
			if (!mongoose.Types.ObjectId.isValid(recipeId)) return null;
			const doc = await Recipe.findById(recipeId).exec();
			if (!doc) return null;
			if (
				!Array.isArray(doc.ingredients) ||
				index < 0 ||
				index >= doc.ingredients.length
			) {
				return null;
			}
			doc.ingredients.splice(index, 1);
			await doc.save();
			return doc;
		},
	},

	Recipe: {
		id: (doc) => doc.id,
		totalTimeMin: (doc) =>
			Number(doc.prepTimeMin || 0) + Number(doc.cookTimeMin || 0),
	},
};
