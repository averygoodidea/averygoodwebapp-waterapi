const config = require()
const fs = require('fs')
const axios = require('../../node_modules/axios')
axios.defaults.adapter = require('../../node_modules/axios/lib/adapters/http')
const fetch = require('node-fetch')
const FileRenamer = require('./file-renamer')
const shouldLogResponse = true
jest.setTimeout(100000)
describe('WaterApi', () => {
	let config
	let authorizationHash
	let inventoryItem
	beforeAll( () => {
		config = getConfig()
		console.log('environmentUrl: ', config.environmentUrl)
	})
	describe('When a user visits the homepage', () => {
		it('should get all inventory items', async () => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json'
				}
			}
			const result = await axios.get(`${environmentUrl}/api/1/inventory/items`, headers)
			if (shouldLogResponse) {
				console.log('GET /api/1/inventory/items', result.data.length)
			}

			expect(result.status).toEqual(200)
			expect(Array.isArray(result.data)).toBe(true)
			expect(result.data[0].hasOwnProperty('id')).toBe(true)
			expect(result.data[0].hasOwnProperty('createdAt')).toBe(true)
			expect(result.data[0].hasOwnProperty('slugId')).toBe(true)
		})
	})
	describe('When an author signs in', () => {
		it('should trigger a magicLink email messsage', async () => {
			const { environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json'
				}
			}
			const params = {
				'email': config.email,
				'signInKey': `abc123`
			}
			let result = await axios.post(`${environmentUrl}/api/1/inventory/admin/magic-link`, params, headers)
			if (shouldLogResponse) {
				console.log(`POST /api/1/inventory/admin/magic-link`, result.status)
			}
			expect(result.status).toEqual(204)
			authorizationHash = result.headers['x-amzn-remapped-authorization']
			console.log(authorizationHash)
			expect(result.headers.hasOwnProperty('x-amzn-remapped-authorization')).toBe(true)
		})
		it('should verify author', async () => {
			const { environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash
				}
			}
			const submittedKey = 'abc123'
			let result = await axios.get(`${environmentUrl}/api/1/inventory/admin/hash?submittedKey=${submittedKey}`, headers)
			if (shouldLogResponse) {
				console.log(`GET /api/1/inventory/admin/hash`, result.status)
			}
			expect(result.status).toEqual(200)
			expect(result.headers['x-amzn-remapped-authorization']).not.toEqual(authorizationHash)
			authorizationHash = result.headers['x-amzn-remapped-authorization']
			console.log(authorizationHash)
		})
		it('should post an inventory item', async done => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash,
					'x-api-key': apiKey
				}
			}
    		const photosToBeUploaded = [ '71smHIiMLUL._SL1500_.jpg', '81g3QsCa2aL._SL1500_.jpg' ]
			const params = {
				'title': 'Canned Salmon',
				'summary': 'With it being extremely healthy, relatively inexpensive and easily accessible, canned salmon is the best deal in town.',
				'categories': [ 'food' ],
				'price': 45.00,
				'moreInfoUrl': 'https://www.wildplanetfoods.com/product/wild-sockeye-salmon/',
				'scriptureAddress': 'Matthew 6:2-8'
			}
			let result = await axios.get(`${environmentUrl}/api/1/admin/inventory/s3/urls?amount=${photosToBeUploaded.length}`, headers)
			if (shouldLogResponse) {
				console.log(`GET /api/1/admin/inventory/s3/urls?amount=${photosToBeUploaded.length}`, result.data)
			}
			expect(result.status).toEqual(200)
			expect(Array.isArray(result.data)).toBe(true)
			expect(result.data.length).toEqual(photosToBeUploaded.length)
			expect(result.data[0].hasOwnProperty('uploadURL')).toBe(true)
			expect(result.data[0].hasOwnProperty('photoFilename')).toBe(true)
			// update photo file names 
			const updatedPhotoFilenames = result.data.map( ({ photoFilename }) => photoFilename )
			params.images = updatedPhotoFilenames.map( key => `inventory/items/${key}`)
			const { renameFiles, resetFiles, paths } = FileRenamer
			renameFiles(photosToBeUploaded, updatedPhotoFilenames, async filenameToDataMap => {
				const filenames = Object.keys(filenameToDataMap)
				// upload images to S3
				for (let i = 0; i < filenames.length; i++) {
					const filename = filenames[i]
					const { buffer, type } = filenameToDataMap[filename]
					fetch(result.data[i].uploadURL, {
						method: 'PUT',
						headers: {
							'Content-Type': type
						},
						body: buffer
					}).catch( err => {
						console.log(err.response.data)
					})
				}
				// post inventory item with s3 photo refrences
				result = await axios.post(`${environmentUrl}/api/1/admin/inventory/item`, params, headers)
				if (shouldLogResponse) {
					console.log(`POST /api/1/admin/inventory/item`, result.status)
				}
				expect(result.status).toEqual(200)
				console.log(authorizationHash)
				expect(result.headers.hasOwnProperty('x-amzn-remapped-authorization')).toBe(true)
				expect(result.data.hasOwnProperty('id')).toBe(true)
				expect(result.data.hasOwnProperty('createdAt')).toBe(true)
				expect(result.data.hasOwnProperty('slugId')).toBe(true)
				// store a copy of this inventory item for subsequent testing
				inventoryItem = Object.assign({}, result.data, {
					images: params.images
				})
				console.log(inventoryItem)
				resetFiles( () => done() )
			})
		})
		it('should update an inventory item', async () => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash,
					'x-api-key': apiKey
				}
			}
			const params = {
				'summary': "It's so good. With it being extremely healthy, relatively inexpensive and easily accessible, canned salmon is the best deal in town.",
			}
			let result = await axios.put(`${environmentUrl}/api/1/admin/inventory/items/${inventoryItem.id}`, params, headers)
			if (shouldLogResponse) {
				console.log(`PUT /api/1/admin/inventory/items/${inventoryItem.id}`, result.data)
			}
			expect(result.status).toEqual(200)
		})
		it('should delete an inventory item', async () => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash,
					'x-api-key': apiKey
				}
			}
			// delete inventory item images off of S3
			const getDelimitedStringOfIds = (keys, delimiter) => {
				let ids = ''
				keys.forEach( (id, i) => {
					const key = id.split('inventory/items/')[1].split('.jpg')[0]
					ids += i === 0 ? key : `${delimiter}${key}`
				})
				return ids
			}
			const ids = getDelimitedStringOfIds(inventoryItem.images, ',')
			let result = await axios.delete(`${environmentUrl}/api/1/admin/inventory/s3/images?ids=${ids}`, headers)
			if (shouldLogResponse) {
				console.log(`DELETE /api/1/admin/inventory/s3/images?ids=${ids}`, result.data)
			}
			expect(result.status).toEqual(204)
			// delete inventory items
			result = await axios.delete(`${environmentUrl}/api/1/admin/inventory/items/${inventoryItem.id}`, headers)
			if (shouldLogResponse) {
				console.log(`DELETE /api/1/admin/inventory/items/${inventoryItem.id}`, result.data)
			}
			expect(result.status).toEqual(204)
		})
		it('should post the inventory item again, since the author really wants it up', async done => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash,
					'x-api-key': apiKey
				}
			}
    		const photosToBeUploaded = [ '71smHIiMLUL._SL1500_.jpg', '81g3QsCa2aL._SL1500_.jpg' ]
			const params = {
				'title': 'Canned Salmon',
				'summary': 'With it being extremely healthy, relatively inexpensive and easily accessible, canned salmon is the best deal in town.',
				'categories': [ 'food' ],
				'price': 45.00,
				'moreInfoUrl': 'https://www.wildplanetfoods.com/product/wild-sockeye-salmon/',
				'scriptureAddress': 'Matthew 6:2-8'
			}
			let result = await axios.get(`${environmentUrl}/api/1/admin/inventory/s3/urls?amount=${photosToBeUploaded.length}`, headers)
			if (shouldLogResponse) {
				console.log(`GET /api/1/admin/inventory/s3/urls?amount=${photosToBeUploaded.length}`, result.data)
			}
			expect(result.status).toEqual(200)
			expect(Array.isArray(result.data)).toBe(true)
			expect(result.data.length).toEqual(photosToBeUploaded.length)
			expect(result.data[0].hasOwnProperty('uploadURL')).toBe(true)
			expect(result.data[0].hasOwnProperty('photoFilename')).toBe(true)
			// update photo file names 
			const updatedPhotoFilenames = result.data.map( ({ photoFilename }) => photoFilename )
			params.images = updatedPhotoFilenames.map( key => `inventory/items/${key}`)
			const { renameFiles, resetFiles, paths } = FileRenamer
			renameFiles(photosToBeUploaded, updatedPhotoFilenames, async filenameToDataMap => {
				const filenames = Object.keys(filenameToDataMap)
				// upload images to S3
				for (let i = 0; i < filenames.length; i++) {
					const filename = filenames[i]
					const { buffer, type } = filenameToDataMap[filename]
					fetch(result.data[i].uploadURL, {
						method: 'PUT',
						headers: {
							'Content-Type': type
						},
						body: buffer
					}).catch( err => {
						console.log(err.response.data)
					})
				}
				// post inventory item with s3 photo refrences
				result = await axios.post(`${environmentUrl}/api/1/admin/inventory/item`, params, headers)
				if (shouldLogResponse) {
					console.log(`POST /api/1/admin/inventory/item`, result.status)
				}
				expect(result.status).toEqual(200)
				console.log(authorizationHash)
				expect(result.headers.hasOwnProperty('x-amzn-remapped-authorization')).toBe(true)
				expect(result.data.hasOwnProperty('id')).toBe(true)
				expect(result.data.hasOwnProperty('createdAt')).toBe(true)
				expect(result.data.hasOwnProperty('slugId')).toBe(true)
				// store a copy of this inventory item for subsequent testing
				inventoryItem = Object.assign({}, result.data, {
					images: params.images
				})
				console.log(inventoryItem)
				resetFiles( () => done() )
			})
		})
		it('should invalidate the cloudfront cache', async () => {
			const { apiKey, environmentUrl } = config
			const headers = {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': authorizationHash,
					'x-api-key': apiKey
				}
			}
			// delete cloudfront cache
			result = await axios.delete(`${environmentUrl}/api/1/admin/cloudfront-cache`, headers)
			if (shouldLogResponse) {
				console.log(`DELETE /api/1/admin/cloudfront-cache`, result.data)
			}
			expect(result.status).toEqual(204)
		})
	})
})

const getConfig = () => {
	const npmArgs = process.argv.filter( arg => arg.indexOf('=') !== -1)
	const config = {}
	for ( let arg of npmArgs) {
		config[arg.split('--')[1].split('=')[0]] = arg.split('=')[1]
	}
	if (!config.environment) {
		config.environment = 'dev'
	}
	let path = `${__dirname}/../../`
	switch(config.environment) {
		case 'prod':
			path += '.env.production'
			break
		case 'dev':
			path += '.env.development'
			break
	}
	require('dotenv').config({ path })
	const {
		AWS_WATERAPI_EMAIL,
		AWS_WATERAPI_KEY,
		DOMAIN_NAME
	} = process.env
	config.apiKey = AWS_WATERAPI_KEY
	config.email = AWS_WATERAPI_EMAIL
	config.environmentUrl = `https://${config.environment !== 'prod' ? config.environment + '.' : ''}${DOMAIN_NAME}`
	return config
}
