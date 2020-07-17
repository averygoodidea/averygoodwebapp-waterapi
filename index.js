'use strict'
const WaterApi = require('./waterapi-v1/')
exports.handler = function(event, context, callback) {

    const { resource, httpMethod } = event
    
    console.log('A1', event)

    if (resource === '/api/1/inventory/items') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'GET':

                WaterApi.GetItems(event, callback)

                break
        }
        
    } else if (resource === '/{proxy+}') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            default:

                WaterApi.RequestGraphQL(event, context)

                break
        }
        
    } else if (resource === '/api/1/inventory/admin/magic-link') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'POST':

                WaterApi.SendAdminMagicLink(event, callback)

                break
        }
        
    } else if (resource === '/api/1/inventory/admin/hash') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'GET':

                WaterApi.VerifyHash(event, callback)

                break
        }

    } else if (resource === '/api/1/admin/inventory/item') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'POST':

                WaterApi.CreateItem(event, callback)

                break
        }

    } else if (resource === '/api/1/admin/inventory/items/{id}') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'PUT':

                WaterApi.UpdateItem(event, callback)

                break

            case 'DELETE':

                WaterApi.DeleteItem(event, callback)

                break
        }
        
    } else if (resource === '/api/1/admin/inventory/s3/urls') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'GET':

                WaterApi.GetS3UploadUrl(event, callback)

                break
        }

    } else if (resource === '/api/1/admin/inventory/s3/images') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'DELETE':

                WaterApi.DeleteImages(event, callback)

                break
        }

    } else if (resource === '/api/1/admin/cloudfront-cache') {

        switch (httpMethod) {

            case 'OPTIONS':

                WaterApi.GetFlightPermit(callback)

                break

            case 'DELETE':

                WaterApi.DeleteCloudFrontCache(event, callback)

                break
        }

    }
}