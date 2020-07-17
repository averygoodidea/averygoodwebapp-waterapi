'use strict';
const GraphQL = require('graphql')
const {
	GraphQLObjectType,
	GraphQLID,
	GraphQLString,
	GraphQLInt,
	GraphQLList
} = GraphQL
console.log('F')
const InventoryItemType = new GraphQLObjectType({
	name: 'InventoryItem',
	description: 'InventoryItem Type, For all item records in DynamoDB',
	fields: () => ({
		id: {
			type: GraphQLID,
			description: 'ID of the item'
		},
		createdAt: {
			type: GraphQLInt,
			description: 'when this item was created'
		},
		slugId: {
			type: GraphQLString,
			description: 'url-safe slug id of item'
		},
		title: {
			type: GraphQLString,
			description: 'name of the item'
		},
		summary: {
			type: GraphQLString,
			description: 'summary of the item'
		},
		images: {
			type: new GraphQLList(GraphQLString),
			description: 'images of the item'
		},
		categories: {
			type: new GraphQLList(GraphQLString),
			description: 'categories of the item'
		},
		price: {
			type: GraphQLInt,
			description: 'price of the item'
		},
		moreInfoUrl: {
			type: GraphQLString,
			description: 'external url to learn more about the item'
		}
	})
})
module.exports = InventoryItemType