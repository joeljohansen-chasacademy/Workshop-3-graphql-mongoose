export const typeDefs = /* GraphQL */ `
	# Översätt Sale.js modellen till GraphQL-schema. Int, Float, String, Boolean, ID är inbyggda typer
	# Date i saleDate får vara String i GraphQL

	type Item {
		name: String
		tags: [String]
		price: Float
		quantity: Int
	}

	type Customer {
		gender: String
		age: Int
		email: String
		satisfaction: Int
	}

	enum Currency {
		USD
		SEK
	}

	type Sale {
		id: ID!
		saleDate: String
		items: [Item!]!
		storeLocation: String
		customer: Customer
		couponUsed: Boolean
		purchaseMethod: String
		totalAmount(unit: Currency): Float!
	}

	type Query {
		# Hämta alla sales, valfritt filter & limit
		sales(storeLocation: String, limit: Int): [Sale!]!
		sale(id: ID!): Sale
		# Total summa för alla sales på en storeLocation
		totalAmountPerLocation(storeLocation: String!): Float!
	}
`;
