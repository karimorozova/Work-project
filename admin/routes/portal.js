const router = require('express').Router()
const fs = require('fs')
const jwt = require("jsonwebtoken")
const { checkClientContact } = require('../middleware')
const { getClient, getClientForPortal, getClientServicesGroups, deleteClientServiceGroups, createClientServicesGroup, editClientServicesGroup } = require('../clients')
const { getService } = require('../services')

const {
	getProject,
	getProjects,
	getProjectsForPortalAll,
	getProjectsForPortalList,
	getProjectForClientPortal
} = require("../projects/")

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

const {
	Clients,
	Projects,
	Languages,
	Industries
} = require('../models')

const { secretKey } = require('../configs')
const { upload } = require('../utils/')
const {
	setClientsContactNewPassword,
	updateAccountDetails
} = require('../users')
const { ObjectId } = require("mongoose/lib/types")
const { getAllReportsFromDb, getAllPaidReceivablesFromDbWithProject } = require("../invoicingReceivables")

router.post('/translation-service-request', checkClientContact, upload.fields([ { name: 'refFiles' }, { name: 'sourceFiles' } ]), async (req, res) => {
	try {
		const verificationResult = jwt.verify(req.headers['token-header'], secretKey)
		let client = await getClient({ "_id": verificationResult.clientId })
		const request = await translationServiceRequest(req.body, client)
		await createRequestFiles(request, req.files)
		// notifyAMsRequestCreated(request)
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
		res.send({ id: request._id })
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

router.post('/all-projects', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		// const verificationResult = jwt.verify(token, secretKey)
		const projects = await getProjectsForPortalAll({ filters: req.body })
		res.send(projects)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-projects', checkClientContact, async (req, res) => {
	const { token } = req.query
	const openStatuses = [ 'Approved', 'In progress' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const projects = await getProjectsForPortalList({ $and: [ { status: { $in: openStatuses }, isTest: false }, { 'customer': verificationResult.clientId } ] })
		res.send(projects)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/project/:id', checkClientContact, async (req, res) => {
	const { customer } = req.query
	const { id } = req.params
	try {
		const project = await getProjectForClientPortal({ "_id": id, customer })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-requests', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const requests = await getClientsRequestsForPortal({ 'clientIdFilter': verificationResult.clientId, status: { $ne: 'Closed' } })
		res.send(requests)
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
			_id: id
		})
		res.send({ requests })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/open-quotes', checkClientContact, async (req, res) => {
	const { token } = req.query
	const openStatuses = [ 'Quote sent', 'Cost Quote' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const quotes = await getProjectsForPortalList({ $and: [ { status: { $in: openStatuses }, isTest: false }, { 'customer': verificationResult.clientId } ] })
		res.send(quotes)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/extra-quotes', checkClientContact, async (req, res) => {
	const { token } = req.query
	const activeStatuses = [ 'Approved', 'In progress' ]
	try {
		const verificationResult = jwt.verify(token, secretKey)
		// const quotes = await getProjectsForPortalList({ $and: [ { status: { $in: activeStatuses }, isTest: false }, { 'customer': verificationResult.clientId } ] })
		const quotes = await getProjectsForPortalList({
			$and: [ {
				"tasks.status": 'Quote sent',
				status: { $in: activeStatuses },
				isTest: false
			}, { 'customer': verificationResult.clientId } ]
		})
		res.send(quotes)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})


router.get('/client', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const client = await getClientForPortal({ '_id': ObjectId(verificationResult.clientId) })
		// for await (let key of [ 'rates' ]) delete client[key]
		res.send({ client })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/all-languages', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		// const verificationResult = jwt.verify(token, secretKey)
		const languages = await Languages.find()
		res.send({
			languages
		})
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Projects.")
	}
})

router.get('/all-industries', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		// const verificationResult = jwt.verify(token, secretKey)
		const industries = await Industries.find()
		res.send(industries)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting Industries.")
	}
})

router.get('/user', checkClientContact, async (req, res) => {
	const { token } = req.query
	try {
		const verificationResult = jwt.verify(token, secretKey)
		const client = await Clients.findOne({ '_id': verificationResult.clientId }).lean()
		const user = client.contacts.find(item => item.email === verificationResult.contactEmail)
		const { password, ...restUser } = user
		res.send({ user: restUser })
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

router.get('/service-templates/:clientId', checkClientContact, async (req, res) => {
	const { clientId } = req.params
	try {
		const { servicesGroups = [] } = await getClientServicesGroups(clientId)
		res.send(servicesGroups)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on task status update")
	}
})

router.get('/service-templates/:clientId', checkClientContact, async (req, res) => {
	const { clientId } = req.params
	try {
		const { servicesGroups = [] } = await getClientServicesGroups(clientId)
		res.send(servicesGroups)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on task status update")
	}
})

router.post('/service-template/delete/:clientId/:id', checkClientContact, async (req, res) => {
	const { id, clientId } = req.params
	try {
		await deleteClientServiceGroups(clientId, id)
		const { servicesGroups = [] } = await getClientServicesGroups(clientId)
		console.log(servicesGroups)
		res.send(servicesGroups)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on saving Client services')
	}
})

router.post('/service-template/:clientId', checkClientContact, async (req, res) => {
	const { clientId } = req.params
	const { groupName, industry, service, source, target } = req.body

	try {
		await createClientServicesGroup({ clientId, groupName, industry, service, source, target })
		const { servicesGroups = [] } = await getClientServicesGroups(clientId)
		res.send(servicesGroups)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on saving Client services')
	}
})

router.post('/service-template/:clientId/:id', checkClientContact, async (req, res) => {
	const { clientId, id } = req.params
	const { groupName, industry, service, source, target } = req.body

	try {
		await editClientServicesGroup(clientId, id, { groupName, industry, service, source, target })
		const { servicesGroups = [] } = await getClientServicesGroups(clientId)
		res.send(servicesGroups)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on saving Client services')
	}
})

router.get('/invoices', checkClientContact,async (req, res) => {
	// const { clientId } = req.params
	//
	// let client = await getClient({ "_id": verificationResult.clientId })
	// const verificationResult = jwt.verify(req.headers['token-header'], secretKey)
	const  token  = req.headers['token-header']
	const verificationResult = jwt.verify(token, secretKey)
	try {
		const projectFields = {
			"reportId": 1,
			"clientBillingInfo": 1,
			"client": 1,
			"status": 1,
			"total": 1,
		}

		const reportsList = await getAllReportsFromDb(0, 10000, {"client": ObjectId(verificationResult.clientId.toString()), status: {$ne: "Created"}}, projectFields)
		res.json(reportsList)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rollback-review')
	}
})

router.get('/invoices-paid', checkClientContact,async (req, res) => {
	// const { clientId } = req.params
	//
	// let client = await getClient({ "_id": verificationResult.clientId })
	// const verificationResult = jwt.verify(req.headers['token-header'], secretKey)
	const  token  = req.headers['token-header']
	const verificationResult = jwt.verify(token, secretKey)
	try {
		const projectFields = {
			"reportId": 1,
			"clientBillingInfo": 1,
			"client": 1,
			"status": 1,
			"total": 1,
		}

		const reportsList = await getAllPaidReceivablesFromDbWithProject(0, 10000, {"client": ObjectId(verificationResult.clientId.toString()), status: {$ne: "Created"}}, projectFields)
		res.json(reportsList)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rollback-review')
	}
})

router.get('/invoice/:invoiceId', checkClientContact,async (req, res) => {
	const { invoiceId } = req.params

	const  token  = req.headers['token-header']
	const verificationResult = jwt.verify(token, secretKey)
	try {
		const projectFields = {
			"reportId": 1,
			"clientBillingInfo": 1,
			"client": 1,
			"status": 1,
			"total": 1,
			"stepsAndProjects": 1,
			"stepsWithProject.projectName": 1,
			"stepsWithProject.projectId": 1,
			"stepsWithProject.stepId": 1,
			"stepsWithProject.type": 1,
			"stepsWithProject.stepAndUnit": 1,
			"stepsWithProject.title": 1,
			"stepsWithProject.sourceLanguage": 1,
			"stepsWithProject.targetLanguage": 1,
			"stepsWithProject.deadline": 1,
			"stepsWithProject.projectCurrency": 1,
			"stepsWithProject.finance.Price": 1,
			"stepsWithProject.projectNativeId": 1,
			"invoice": 1,
			"paymentInformation": 1,
		}

		const reportList = await getAllReportsFromDb(0, 10000, {"client": ObjectId(verificationResult.clientId.toString()), _id: ObjectId(invoiceId)}, projectFields)
		res.json(reportList)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rollback-review')
	}
})
router.get('/invoice-paid/:invoiceId', checkClientContact,async (req, res) => {
	const { invoiceId } = req.params

	const  token  = req.headers['token-header']
	const verificationResult = jwt.verify(token, secretKey)
	try {
		const projectFields = {
			"reportId": 1,
			"clientBillingInfo": 1,
			"client": 1,
			"status": 1,
			"total": 1,
			"stepsAndProjects": 1,
			"stepsWithProject.projectName": 1,
			"stepsWithProject.projectId": 1,
			"stepsWithProject.stepId": 1,
			"stepsWithProject.type": 1,
			"stepsWithProject.stepAndUnit": 1,
			"stepsWithProject.title": 1,
			"stepsWithProject.sourceLanguage": 1,
			"stepsWithProject.targetLanguage": 1,
			"stepsWithProject.deadline": 1,
			"stepsWithProject.projectCurrency": 1,
			"stepsWithProject.finance.Price": 1,
			"stepsWithProject.projectNativeId": 1,
			"invoice": 1,
			"paymentInformation": 1,
		}

		const reportList = await getAllPaidReceivablesFromDbWithProject(0, 10000, {"client": ObjectId(verificationResult.clientId.toString()), _id: ObjectId(invoiceId)}, projectFields)
		res.json(reportList)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on rollback-review')
	}
})


module.exports = router
