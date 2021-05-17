const router = require('express').Router();
const { getClientsApi } = require('../settings')

router.get('/api-clients', async (req,res)=> {
	try {
		const clientsApi = await getClientsApi()
		res.send(clientsApi)
	} catch (e) {
		res.status(500).send('Error on client delete')
	}

})


module.exports = router;