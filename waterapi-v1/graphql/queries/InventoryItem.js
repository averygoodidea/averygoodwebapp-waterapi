'use strict'
const GraphQL = require('graphql')
const {
	GraphQLList,
	GraphQLString,
	GraphQLNonNull
} = GraphQL
console.log('E')
const InventoryItemType = require('../types/InventoryItem')
const InventoryItemResolver = require('../resolvers/InventoryItem')
module.exports = {
	index() {
		console.log('L')
		return {
			type: new GraphQLList(InventoryItemType),
			description: 'This will return all the inventory items from DynamoDB.',
			resolve(parent, args, context, info) {
				return InventoryItemResolver.index()
			}
		}
	}
}