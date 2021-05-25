const router = require('express').Router()

const {
	getClientsRequests,
	getClientRequestById,
	updateClientRequestProps,
  updateClientContacts,
} = require("../../clientRequests")



router.post('/all', async (req, res) => {
	const filters = { ...req.body }
	try {
		const requests = await getClientsRequests(filters)
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})

router.post('/by-id/:id', async (req, res) => {
	const { id } = req.params
	try {
		const requests = await getClientRequestById(id)
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})

router.post('/:id/update', async (req, res) => {
	const filters = { ...req.body }
	try {
		const requests = await getClientRequestById(filters)
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})

router.post('/:id/update-prop', async (req, res) => {
	const { value } = req.body
	const { id } = req.params
	try {
    const requests = await updateClientRequestProps({ id, value })
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})

// router.post('/:id/pushProp', async (req, res) => {
// 	const { value } = req.body
// 	const { id } = req.params
// 	try {
//     const requests = await pushClientRequestProps({ id, value })
// 		res.send(requests)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Something wrong with DB while getting requests!')
// 	}
// })

router.post('/:id/update-client-contact', async (req, res) => {
  const { contact, oldContact } = req.body
  const { id } = req.params
  try {
    const result = await updateClientContacts({id, contact, oldContact})
    res.send(result)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on updating/creating client contact')
  }
})


router.post('/:id/delete', async (req, res) => {
	const filters = { ...req.body }
	try {
		const requests = await getClientRequestById(filters)
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})


module.exports = router
