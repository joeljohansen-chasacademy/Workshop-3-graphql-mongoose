export const typeDefs = /* GraphQL */ `
	# Keep it simple: tider som Int (minuter), datum som String (ISO) om ni vill.
	enum Diet {
		VEGAN
		VEGETARIAN
		GLUTEN_FREE
		NONE
	}

	type Ingredient {
		name: String!
		amount: Float!
		unit: String!
	}

	type Recipe {
		id: ID!
		title: String!
		description: String
		diet: Diet
		ingredients: [Ingredient!]!
		prepTimeMin: Int!
		cookTimeMin: Int!
		totalTimeMin: Int! # beräknat fält: prep + cook
		createdAt: String!
	}

	type Query {
		# Lista recept. Filtrera valfritt, limitera mängd.
		recipes(
			title: String
			diet: Diet
			maxTimeMin: Int
			limit: Int = 20
		): [Recipe!]!
		recipe(id: ID!): Recipe
	}

	input IngredientInput {
		name: String!
		amount: Float!
		unit: String!
	}

	input CreateRecipeInput {
		title: String!
		description: String
		diet: Diet = NONE
		ingredients: [IngredientInput!]!
		prepTimeMin: Int!
		cookTimeMin: Int!
	}

	input UpdateRecipeInput {
		title: String
		description: String
		diet: Diet
		prepTimeMin: Int
		cookTimeMin: Int
		# Obs: ingredients uppdateras via separata mutationer nedan
	}

	type Mutation {
		createRecipe(input: CreateRecipeInput!): Recipe!
		updateRecipe(id: ID!, input: UpdateRecipeInput!): Recipe!
		deleteRecipe(id: ID!): Boolean!

		addIngredient(recipeId: ID!, ingredient: IngredientInput!): Recipe!
		updateIngredient(
			recipeId: ID!
			index: Int!
			ingredient: IngredientInput!
		): Recipe!
		removeIngredient(recipeId: ID!, index: Int!): Recipe!
	}
`;
