import { Sale } from "../models/Sale.js";
import mongoose from "mongoose";

export const resolvers = {
	Query: {
		// sales(storeLocation, limit)
		sales: async (_p, { storeLocation, limit }) => {
			const filter = {};
			if (storeLocation) filter.storeLocation = storeLocation;
			let query = Sale.find(filter);
			if (limit && limit > 0) query = query.limit(limit);
			return query;
		},

		// sale(id)
		sale: async (_p, { id }) => {
			//Kolla att det är ett valid mongoose object id
			if (!mongoose.isValidObjectID(id)) return null;
			return Sale.findById(id);
		},

		// totalAmountPerLocation(storeLocation)
		// Aggregation: summerar price*quantity för alla items på alla sales i en location
		totalAmountPerLocation: async (_p, { storeLocation }) => {
			const row = await Sale.aggregate([
				//I denna aggregate behöver vi:
				//$match på storeLocation (https://www.mongodb.com/docs/manual/reference/operator/aggregation/match/)
				{ $match: { storeLocation } },
				{ $unwind: "$items" },
				{
					$group: {
						_id: null,
						totalAmountPerLocation: {
							$sum: {
								$multiply: [{ $toDouble: "$items.price" }, "$items.quantity"],
							},
						},
					},
				},
				//$unwind på items (https://www.mongodb.com/docs/manual/reference/operator/aggregation/unwind/)
				//$group på total (https://www.mongodb.com/docs/manual/reference/operator/aggregation/group/)
				//$sum på total (https://www.mongodb.com/docs/manual/reference/operator/aggregation/sum/)
				//$$multiply för att räkna ut totalen (https://www.mongodb.com/docs/manual/reference/operator/aggregation/multiply/)
			]);

			console.log(row);
			return row[0].totalAmountPerLocation ?? 0;
		},
	},

	// Fält-resolvers
	Sale: {
		id: (doc) => doc.id, // Mongoose virtual (_id -> id)

		// Hur ska vi räkna ut totalAmount per enskild sale?
		totalAmount: (doc, { unit }) => {
			console.log(doc);
			console.log(unit);
			const totalSum = doc.items.reduce(
				(sum, item) => sum + item.price * item.quantity,
				0
			);
			if (unit === "USD") {
				return totalSum;
			} else if (unit === "SEK") {
				return totalSum * 10;
			}
			return totalSum;
		},
	},
};
