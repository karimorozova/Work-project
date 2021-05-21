const router = require('express').Router()

const { getClientsRequests, getClientRequestById, updateClientRequestProps  } = require("../../projects")

router.post('/all', async (req, res) => {
	const filters = {...req.body};
	try {
		const requests = await getClientsRequests(filters);
		res.send(requests);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong with DB while getting requests!');
	}
});

router.post('/by-id/:id', async (req, res) => {
	const { id } = req.params
	console.log( id )
	try {
		const requests = await getClientRequestById( id);
		res.send(requests);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong with DB while getting requests!');
	}
});

router.post('/:id/update', async (req, res) => {
	const filters = {...req.body};
	try {
		const requests = await getClientRequestById(filters);
		res.send(requests);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong with DB while getting requests!');
	}
});

router.post('/:id/updateProp', async (req, res) => {
	const {prop, value} = req.body;
	const {id} = req.params;
	try {
		const requests = await updateClientRequestProps({ id, prop, value });
		res.send(requests);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong with DB while getting requests!');
	}
});


router.post('/:id/delete', async (req, res) => {
	const filters = {...req.body};
	try {
		const requests = await getClientRequestById(filters);
		res.send(requests);
	} catch(err) {
		console.log(err);
		res.status(500).send('Something wrong with DB while getting requests!');
	}
});


module.exports = router