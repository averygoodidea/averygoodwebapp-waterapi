'use strict'
const GraphQL = require('graphql')
const {
	GraphQLObjectType,
	GraphQLSchema
} = GraphQL
console.log('C')
const InventoryItemQuery = require('./queries/InventoryItem')
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	description: 'This is the default root query provided by our application.',
	fields: {
		inventoryItems: InventoryItemQuery.index()
	}
})
module.exports = new GraphQLSchema({
	query: RootQuery
})