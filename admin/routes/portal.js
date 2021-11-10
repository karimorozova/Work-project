const router = require('express').Router()
const fs = require('fs')
const jwt = require("jsonwebtoken")
const { checkClientContact } = require('../middleware')
const { getClient, getClientForPortal } = require('../clients')
const { getService } = require('../services')

const {
	getProject,
	getProjects,
	getProjectsForPortal,
	updateProjectStatusForClientPortalProject,
	getProjectsForPortalList
} = require("../projects/")

const { getProjectDeliverables } = require('../projects/files')

const {
	getClientsRequestsForPortal,
	getClientsRequestForPortal,
	newClientServiceRequest,
	createRequestFiles,
	notifyAMsRequestCreated,
	translationServiceRequest,
	removeClientRequestById
} = require('../clientRequests')

const { getAfterTaskStatusUpdate } = require('../clients')
const { getMemoqProjectsForClientPortal } = require('../services/memoqs/otherProjects')

const {
	Clients,
	Projects,
	Languages
} = require('../models')

const { secretKey } = require('../configs')
const { upload } = require('../utils/')
const { setClientsContactNewPassword, updateAccountDetails } = require('../users')


router.post('/translation-service-request', checkClientContact, upload.fields([ { name: 'refFiles' }, { name: 'sourceFiles' } ]), async (req, res) => {
	try {
		const verificationResult = jwt.verify(req.headers['token-header'], secretKey)
		let client = await getClient({ "_id": verificationResult.clientId })
		const request = await translationServiceRequest(req.body, client)
		await createRequestFiles(request, req.files)
		notifyAMsRequestCreated(request)
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send("Server Error on incoming request")
	}
})

router.post('/new-client-service-request', checkClientContact, upload.fields([ { name: 'refFiles' }, { name: 'sourceFiles' } ]), async (req, res) => {
	try {
		const verificationResult = jwt.verify(req.headers['token-header'], secretKey)
		let client = await getClient({ "_id": verificationResult.clientId })
		const request = await newClientServiceRequest(req.body, client)
		await createRequestFiles(request, req.files)
		notifyAMsRequestCreated(request)
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send("Server Error on incoming request")
	}
})

router.post('/delete-service-request', checkClientContact, async (req, res) => {
	const { requestId } = req.body
	try {
		await removeClientRequestById(requestId)
		res.send('Done')
	} catch (err) {
		console.log(err)
		res.status(500).send("Server Error on incoming request")
	}
})

router.post("/auth", async (req, res, next) => {
	if (req.body.logemail && req.body.logpassword) {
		Clients.authenticate(req.body.logemail, req.body.logpassword, async (error, data) => {
			if (error || !data) {
				let err = new Error()
				err.status = 401
				res.status(401).send("Wrong email or password.")
			} else {
				try {
					const clientToken = await jwt.sign({ clientId: data.client.id, contactEmail: data.contact.email }, secretKey, { expiresIn: "12h" })
					res.statusCode = 200
					res.send({ clientToken })
				} catch (err) {
					console.log(err)
					res.status(500).send("Server Error. Try again later.")
				}
			}
		})
	} else {
		let err = new Error()
		err.status = 400
		res.status(400).send("All fields required.")
	}
})

router.post("/account-details", checkClientContact, upload.fields([ { name: 'photo' } ]), async (req, res) => {
	const accountData = req.body
	try {
		const verificationResult = jwt.verify(accountData.token, secretKey)
		let client = await getClient({ "_id": verificationResult.clientId })
		const userIndex = client.contacts.findIndex(item => item.email === verificationResult.contactEmail)
		const photoFile = req.files['photo'] ? req.files['photo'][0] : null
		const updatedUser = await updateAccountDetails({
			user: client.contacts[userIndex]._doc, clientId: client.id, accountData, photoFile
		})
		client.contacts[userIndex] = updatedUser
		await client.save()
		const { token, ...resultData } = updatedUser
		res.send({ user: resultData })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on saving account info")
	}
})

router.get("/unique-email", async (req, res) => {
	const { email } = req.query
	try {
		const client = await Clients.findOne({ "contacts.email": email })
		if (client) {
			return res.send("exist")
		}
		res.send("")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on checking client contact's email uniqueness.")
	}
})

router.post("/reset-pass", async (req, res) => {
	const { email } = req.body
	try {
		const client = await Clients.findOne({ "contacts.email": email })
		if (!client) {
			return res.status(400).send("No such user")
		}
		await setClientsContactNewPassword(client, email)
		res.send("new password sent")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on reseting password. Try again later.")
	}
})

router.get('/all-projects', checkClientContact, async (req, res) => {
	const { token } = req.query
	const excludedStatuses = [ 'Draft' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const projects = await getProjectsForPortal({ $and: [ { status: { $nin: excludedStatuses } }, { 'customer': verificationResult.clientId } ] })

		res.send({
			projects: Buffer.from(JSON.stringify(projects)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-projects', checkClientContact, async (req, res) => {
	const { token } = req.query
	const openStatuses = [ 'Started', 'Approved', 'In progress', 'Ready for Delivery' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const projects = await getProjectsForPortalList({ $and: [ { status: { $in: openStatuses } }, { 'customer': verificationResult.clientId } ] })

		res.send({
			projects: Buffer.from(JSON.stringify(projects)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/project/:id', checkClientContact, async (req, res) => {
	const { token } = req.query
	const { id } = req.params
	const openStatuses = [ 'Draft' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const project = await getProject({ $and: [ { status: { $nin: openStatuses } }, {_id: id}  ] })

		res.send({
			project: Buffer.from(JSON.stringify(project)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-requests', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)

		const requests = await getClientsRequestsForPortal({
			'clientIdFilter': verificationResult.clientId,
			status: { $ne: 'Closed' }
		})

		res.send({
			requests: Buffer.from(JSON.stringify(requests)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/client-requests/:id', checkClientContact, async (req, res) => {
	const { token } = req.query
	const { id } = req.params
	try {
		const verificationResult = jwt.verify(token, secretKey)

		const requests = await getClientsRequestForPortal({
			_id: id,
			// 'clientIdFilter': verificationResult.clientId,
			// status: { $ne: 'Closed' },
		})
		console.log({ requests })

		res.send({
			requests: Buffer.from(JSON.stringify(requests)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-quotes', checkClientContact, async (req, res) => {
	console.log("test")
	const { token } = req.query
	const openStatuses = [ 'Quote sent', 'Requested' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const quotes = await getProjectsForPortalList({ $and: [ { status: { $in: openStatuses } }, { 'customer': verificationResult.clientId } ] })
		res.send({
			quotes: Buffer.from(JSON.stringify(quotes)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})



router.get('/client', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const client = await getClient({ '_id': verificationResult.clientId })
		res.send({
			client: Buffer.from(JSON.stringify(client)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/all-languages', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const languages = await Languages.find()
		res.send({
			languages
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/user', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const client = await getClientForPortal({ '_id': verificationResult.clientId })
		const user = client.contacts.find(item => item.email === verificationResult.contactEmail)

		res.send({
			user: Buffer.from(JSON.stringify(user)).toString('base64'),
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})


router.get('/language-combinations', checkClientContact, async (req, res) => {
	let id = +req.query.customerId
	try {
		let result = await customer.languageComb(id)
		let languages = result.data
		res.send(languages)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting language combinations')
	}
})

router.get('/request-service', checkClientContact, async (req, res) => {
	const { symbol } = req.query
	try {
		const service = await getService({ symbol })
		res.send(service)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting request service')
	}
})

router.get('/default-source', checkClientContact, async (req, res) => {
	const tokenHeader = req.headers['token-header']
	const { ratesProp } = req.query
	try {
		const verificationResult = jwt.verify(tokenHeader, secretKey)
		const client = await getClient({ "_id": verificationResult.clientId })
		const english = client[ratesProp].find(item => item.source.symbol === 'EN-GB')
		const source = english ? english.source : ""
		res.send({ source })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on setting default source language')
	}
})

router.get('/customer-info', checkClientContact, async (req, res) => {
	try {
		res.send(customer)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting customer info')
	}
})

router.get('/clientinfo', checkClientContact, async (req, res) => {
	try {
		const { token } = req.query
		const verificationResult = jwt.verify(token, secretKey)
		const client = await getClient({ "_id": verificationResult.clientId })
		const user = client.contacts.find((contact) => contact.email === verificationResult.contactEmail)
		res.send({ client, user })
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting clientinfo')
	}
})

// router.get('/projectFiles', checkClientContact, async (req, res) => {
//     res.send('ok');
// });
// router.get('/deleteZip', (req, res) => {
//     let fileName = 'project';
//     let fileId = req.query.projectId;
//     try {
//         if (req.query.taskId) {
//             fileName = 'task';
//             fileId = req.query.taskId;
//         }
//         setTimeout(() => {
//             fs.unlink(`./dist/${fileName}${fileId}.zip`, (err) => console.log(err));
//         }, 6000);
//         res.send('Deleted');
//     } catch(err) {
//         console.log(err);
//         res.status(500).send('Error on deleting file');
//     }
// });

router.post('/approve-reject', checkClientContact, async (req, res) => {
	const { quote, key } = req.body
	try {
		const updatedQuote = await updateProjectStatusForClientPortalProject(quote._id, key)
		res.send(updatedQuote)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on approving')
	}
})

router.get('/reject', checkClientContact, async (req, res) => {
	const id = req.query.quoteId
	try {
		await customer.quoteReject(id)
		res.send("rejected")
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rejecting')
	}
})


router.get('/deliverables', checkClientContact, async (req, res) => {
	console.log('route IN DEV for clients  => /deliverables')
	// const { taskId } = req.query;
	// try {
	//     const project = await getProject({"tasks.taskId": taskId});
	//     const task = project.tasks.find(item => item.taskId === taskId);
	//     const taskFiles = task.targetFiles;
	//     const link = await getDeliverablesLink({
	//         taskId, projectId: project.id, taskFiles, unit: task.service.calculationUnit
	//     });
	//     if(link) {
	//         await Projects.updateOne({"tasks.taskId": taskId}, {"tasks.$.deliverables": link});
	//     }
	//     res.send({link});
	// } catch(err) {
	//     console.log(err);
	//     res.status(500).send("Error on downloading deliverables");
	// }
})

router.post('/project-deliverables', checkClientContact, async (req, res) => {
	const { project } = req.body
	try {
		const result = await getProjectDeliverables(project)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on downloading project deliverables")
	}
})

router.post('/task-status', checkClientContact, async (req, res) => {
	const { task, status } = req.body
	try {
		const project = await getProject({ "tasks.taskId": task.taskId })
		const updatedProject = await getAfterTaskStatusUpdate({ task, project, status })
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on task status update")
	}
})


module.exports = router
