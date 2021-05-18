const router = require('express').Router();
const { getClientsApi } = require('../settings')

router.get('/api-clients', async (req,res)=> {
	try {
		let clientsApi = JSON.parse(JSON.stringify(await getClientsApi()))
		res.send( clientsApi.map(({ affiliation, logo, industry, _id, __v, ...rest}) =>
      ({ ...rest, logo: 'https://admin.pangea.global' + logo ,industry: industry.map(({name}) => name)}) ))
	} catch (e) {
		res.status(500).send('Error on client delete')
	}

})


module.exports = router;
