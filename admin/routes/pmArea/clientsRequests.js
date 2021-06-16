const router = require('express').Router()
const fs = require('fs')
const {
	getClientsRequests,
	getClientRequestById,
	updateClientRequestProps,
	updateClientContacts,
	uploadRequestFiles,
	checkRequestedFiles,
	manageClientContacts,
	removeContactClientRequest,
	sendMailToClient
} = require("../../clientRequests")

const { pmAssignInRequest } = require('../../emailMessages/internalCommunication')
const { managerNotifyMail } = require('../../utils/mailTemplate')

const { upload } = require('../../utils')

const { ClientRequest } = require('../../models')

router.post('/manage-client-contact', async (req, res) => {
	const { contact, action, projectId } = req.body
	try {
		const updatedProject = await manageClientContacts({ contact, action, projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on target-dr2')
	}
})

router.post('/check-form-file', async (req, res) => {
	const { projectId, path, check, type } = req.body
	try {
		const updatedProject = await checkRequestedFiles({ projectId, path, check, type })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on target-dr2')
	}
})

router.post('/add-form-file', upload.fields([ { name: 'sourceFiles' }, { name: 'refFiles' } ]), async (req, res) => {
	const formData = { ...req.body }
	const files = req.files
	try {
		const updatedProject = await uploadRequestFiles(formData, files)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on target-dr2')
	}
})

router.post('/remove-form-file', async (req, res) => {
	const { type, projectId, path } = req.body
	try {
		if (type === 'Source') await ClientRequest.updateOne({ "_id": projectId, 'requestForm.sourceFiles.path': path }, { $pull: { 'requestForm.sourceFiles': { path } } })
		if (type === 'Reference') await ClientRequest.updateOne({ "_id": projectId, 'requestForm.refFiles.path': path }, { $pull: { 'requestForm.refFiles': { path } } })

		fs.unlink(`./dist${ path }`, (err) => {
			if (err) throw(err)
		})
		const updatedProject = await getClientRequestById({ "_id": projectId })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on removing file')
	}
})

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
		if (value.status !== undefined) {
			const message = pmAssignInRequest(requests)
			await managerNotifyMail({ email: requests.projectManager.email }, message, `Client Request - ${ requests.requestForm.service.title }, has been assign to you (ID I0011.1)`)
		}
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
		const result = await updateClientContacts({ id, contact, oldContact })
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


router.post('/:id/delete-contact/', async (req, res) => {
	const { contactId } = { ...req.body }
	const { id } = { ...req.params }
	try {
		await removeContactClientRequest({ projectId: id, contactId })
		const requests = await getClientRequestById(id)
		res.send(requests)
	} catch (err) {
		console.log(err)
		res.status(500).send('Something wrong with DB while getting requests!')
	}
})

router.post('/contact-email', async (req, res) => {
	const { id, contactId, template } = req.body
	try {
		await sendMailToClient({ id, contactId, template })
		res.send(true)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending message to client\'s contact')
	}
})


module.exports = router
