const router = require('express').Router()
const { getClientsApi } = require('../settings')

router.get('/api-clients', async (req, res) => {
	try {
		let clientsApi = JSON.parse(JSON.stringify(await getClientsApi()))
		res.send(clientsApi.map(({ affiliation, logo, industry, _id, __v, ...rest }) =>
				({ ...rest, logo: process.env.ADMIN_URL + logo, industries: industry.map(({ name }) => name) })))
	} catch (e) {
		res.status(500).send('Error on get api client')
	}

})


module.exports = router
