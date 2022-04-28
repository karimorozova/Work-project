const router = require('express').Router()
const { upload, sendEmail } = require('../utils')
const { User, MemoqProject, Vendors, Projects, Languages } = require('../models')
const { downloadCompletedFiles } = require('../projects')

const {
	getMemoqAllProjects,
	createMemoqProjectWithTemplate,
	getProjectTranslationDocs,
	getProjectAnalysis,
	getProjectUsers,
	getMemoqFileId,
	documentsWithMetrics,
	deleteMemoqProject
} = require('../services/memoqs/projects')

const {
	getProjectAfterUpdate,
	getMemoqProject
} = require('../services/memoqs/otherProjects/getMemoqProject')

const {
	moveMemoqFileToProject,
	addProjectFile,
	exportMemoqFile,
	getMemoqFileChunks, downloadMemoqFile
} = require('../services/memoqs/files')

const { getMemoqTemplates } = require("../services/memoqs/resources")
const { assignProjectManagers } = require('../projects/updates')
const { storeFiles } = require("../projects/files")
const { getMemoqUsers } = require("../services/memoqs/users")

const {
	getFilteredOtherProjects,
	filterMemoqProjectsVendors,
	updateAllMemoqProjects,
	updateMemoqProjectFinance,
	updateMemoqProjectStatus,
	updateStatusesForOtherProjects,
	replaceQueryStatus
} = require('../services/memoqs/otherProjects')

const {
	manageProjectName
} = require('../projects')

const _ = require('lodash')
const fs = require("fs")
const { getLanguageByAnyLangCode } = require("../helpers/commonFunctions")
const { archiveMultipleFiles } = require("../utils/archiving")


router.get('/users', async (req, res) => {
	try {
		const result = await getMemoqUsers()
		res.json(result)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting memoQ users")
	}
})

router.get('/user', async (req, res) => {
	const { userId } = req.query
	try {
		const user = await User.findOne({ _id: userId })
		const memoqUsers = await getMemoqUsers()
		const creatorUser = memoqUsers.find(item => item.email === user.email)
		res.send({ creatorUserId: creatorUser ? creatorUser.id : "" })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting memoQ user")
	}
})

router.post('/check-user', async (req, res) => {
	const { email } = req.body
	try {
		const memoqUsers = await getMemoqUsers()
		const user = memoqUsers.find(item => item.email === email)
		if (!user) {
			return res.status(500).send(`No such user in memoQ with email - ${ email }`)
		}
		res.send("ok")
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on checking memoQ user")
	}
})

router.get('/templates', async (req, res) => {
	try {
		const unSorted = await getMemoqTemplates()
		const result = unSorted.sort((a, b) => a.name > b.name ? 1 : -1)
		res.json(result)
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on getting memoQ templates")
	}
})

router.post('/clear-pretranslate-files', async (req, res) => {
	try {
		const { path } = req.body
		if (fs.existsSync(`./dist${ path }`)) {
			await fs.unlink(`./dist${ path }`, (err) => {
				if (err) console.log(err)
			})
		}
		res.send('Done!')
	} catch (e) {
		res.status(500).send(e.message || e)
	}
})
router.post('/pretranslate-files', upload.fields([ { name: 'file' } ]), async (req, res) => {
	// Then => Refactoring ot Delete !!!
	const parser = require('xml2json')
	const allLanguages = await Languages.find()
	const { file: files } = req.files
	const { creatorUserId, template, industry, projectId, internalProjectId, nativeProjectName, projectManager, customerName } = req.body
	const memoqProjectIds = []

	try {
		for await (let file of files) {
			const tasksInfo = {
				source: allLanguages.find(i => i.symbol === 'EN-GB'),
				targets: [],
				industry: JSON.parse(industry),
				template: JSON.parse(template),
				creatorUserId,
				projectId,
				internalProjectId,
				nativeProjectName,
				projectManager,
				customerName,
				projectName: 'pretranslation-by-alpha'
			}
			const fileData = await fs.promises.readFile(file.path)
			let parseFileData = parser.toJson(fileData, { object: true, sanitize: true, trim: true })
			if (!parseFileData?.xliff) throw new Error(`Error on parsing ${ file.filename } file.`)
			const target = getLanguageByAnyLangCode(allLanguages, parseFileData.xliff.file['target-language'], 0)
			if (!target) throw new Error(`Cannot find language in system ${ parseFileData.xliff.file['target-language'] }.`)
			tasksInfo.targets.push(target)
			const memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo)
			memoqProjectIds.push(memoqProjectId)
			await addProjectFile(memoqProjectId, file.path)
			const listProjectTranslationDocuments = await getProjectTranslationDocs(memoqProjectId)
			await downloadMemoqFile({ memoqProjectId: memoqProjectId, docId: listProjectTranslationDocuments.DocumentGuid, path: `./dist/uploads/${ file.filename }` })
		}

		const archiveFiles = []
		for await (let file of files) archiveFiles.push({ path: file.path, name: file.filename })
		await archiveMultipleFiles({ outputPath: `./dist/uploads/pretranslation-${ internalProjectId }.zip`, files: archiveFiles })
		await clearUploads()
		for await (let projectGuid of memoqProjectIds) await deleteMemoqProject(projectGuid)

		res.send(`/uploads/pretranslation-${ internalProjectId }.zip`)

	} catch (e) {
		await clearUploads()
		for await (let projectGuid of memoqProjectIds) await deleteMemoqProject(projectGuid)
		res.status(500).send(e.message || e)
	}

	async function clearUploads() {
		for await (let file of files) {
			await fs.access(`./dist/uploads/${ file.filename }`, async (err) => {
				if (err) {
					console.log("The file does not exist.")
				} else {
					await fs.promises.unlink(`./dist/uploads/${ file.filename }`)
				}
			})
		}
	}
})

router.post('/memoq-project', upload.fields([ { name: 'sourceFiles' }, { name: 'refFiles' } ]), async (req, res) => {
	try {
		const { sourceFiles, refFiles } = req.files
		let tasksInfo = req.body

		tasksInfo.source = JSON.parse(tasksInfo.source)
		tasksInfo.targets = JSON.parse(tasksInfo.targets)
		tasksInfo.service = JSON.parse(tasksInfo.service)
		tasksInfo.stepsAdditions = JSON.parse(tasksInfo.stepsAdditions)
		tasksInfo.stepsAndUnits = JSON.parse(tasksInfo.stepsAndUnits)
		tasksInfo.industry = JSON.parse(tasksInfo.industry)
		tasksInfo.template = JSON.parse(tasksInfo.template)

		tasksInfo.refFiles = refFiles ? await storeFiles(refFiles, tasksInfo.projectId) : []
		tasksInfo.translateFiles = await storeFiles(sourceFiles, tasksInfo.projectId)

		tasksInfo = manageProjectName(tasksInfo)
		tasksInfo.projectName = `${ tasksInfo.internalProjectId } - ${ tasksInfo.nativeProjectName }`
		tasksInfo.memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo)
		await assignProjectManagers({ manager: tasksInfo.projectManager, memoqProjectId: tasksInfo.memoqProjectId })

		res.send({ tasksInfo })
	} catch (err) {
		console.log(err)
		res.status(500).send("Error on creating a Project in memoQ")
	}
})

router.post('/add-project-file', async (req, res) => {
	const { memoqProjectId, filePath } = req.body
	try {
		const fileGuid = await addProjectFile(memoqProjectId, filePath)
		res.send(fileGuid)
	} catch (err) {
		console.log(err, 'in /add-project-file')
		res.status(500).send(err)
	}
})

router.get('/projects', async (req, res) => {
	try {
		const result = await getMemoqAllProjects()
		res.json(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/project-users', async (req, res) => {
	const { id } = req.query
	try {
		const result = await getProjectUsers(id)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/project-docs', async (req, res) => {
	const { id } = req.query
	try {
		const listProjectTranslationDocuments = await getProjectTranslationDocs(id)
		res.send(listProjectTranslationDocuments)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post('/metrics', async (req, res) => {
	// const { projectId, tasks } = req.body
	// try {
	// 	const updatedProject = await updateProjectMetricsAndCreateSteps(projectId, tasks)
	// 	res.send(updatedProject)
	// } catch (err) {
	// 	console.log(err)
	// 	res.status(500).send("Error on getting metrics ")
	// }
})

router.get('/project-analysis', async (req, res) => {
	const { id } = req.query
	try {
		const result = await getProjectAnalysis(id)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/move-files', async (req, res) => {
	const { fileId } = req.query
	try {
		const result = await moveMemoqFileToProject(fileId)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}

})

router.post('/target-files', async (req, res) => {
	const { stepId } = req.body
	try {
		await downloadCompletedFiles(stepId)
		res.send("Files downloaded")
	} catch (err) {
		console.log(err)
		res.status(500).send(err.message)
	}
})

router.get('/download-file', async (req, res) => {
	const { projectId, docId } = req.query
	try {
		const fileId = await getMemoqFileId(projectId, docId)
		const sessionId = await exportMemoqFile(fileId)
		const result = await getMemoqFileChunks(sessionId)
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post('/other-projects', async (req, res) => {
	try {
		const projects = await getFilteredOtherProjects(req.body)
		res.send(projects)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/other-project', async (req, res) => {
	const { id } = req.query
	try {
		const project = await MemoqProject.findOne({ _id: id })
				.populate('customer')
				.populate('steps.vendor')
				.populate('projectManager')
				.populate('accountManager')
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/memoq-client-aliases', async (req, res) => {
	try {
		const names = await MemoqProject.find({}, { _id: 0, client: 1 })
		const result = [ ...new Set(names.map(i => i.client)) ].filter(name => !name.match(/^\s+$|^$/gi))
		res.send(result)
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.get('/memoq-vendor-aliases/:vendorId', async (req, res) => {
	const { vendorId } = req.params
	try {
		let users = await MemoqProject.find({}, { _id: 0, documents: 1 })
		const result = filterMemoqProjectsVendors(users)
		const allVendor = await Vendors.find()
		let existsAliases = _.flattenDeep(allVendor.filter(({ aliases }) => aliases.length).map(({ aliases }) => aliases))
		const { aliases: currAliases } = allVendor.find(({ _id }) => _id.toString() === vendorId.toString())
		currAliases.length && (existsAliases = existsAliases.filter(item => !currAliases.includes(item)))
		res.send(result.filter(item => !existsAliases.includes(item)))
	} catch (err) {
		console.log(err)
		res.status(500).send(err)
	}
})

router.post('/switch-status', async (req, res) => {
	const { id, direction } = req.body
	try {
		const updatedProject = await updateMemoqProjectStatus(id, direction)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on switching project\'s status')
	}
})

router.post('/update-memoq-finance', async (req, res) => {
	const { id } = req.body
	try {
		const neededProject = await getMemoqProject({ _id: id })
		let { documents } = neededProject
		if (!documents.every(item => item.hasOwnProperty('metrics'))) {
			documents = await documentsWithMetrics(documents, neededProject.serverProjectGuid)
		}
		neededProject.documents = documents

		const updatedProject = await updateMemoqProjectFinance(neededProject)
		res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project\'s finance')
	}
})

router.get('/update-all-memoq-finance/:from', async (req, res) => {
	const { from } = req.params
	try {
		const query = replaceQueryStatus(from)
		const projects = await MemoqProject.find(query)
		for (let { _id, documents, serverProjectGuid } of projects) {
			if (!documents.every(item => item.hasOwnProperty('metrics'))) {
				documents = await documentsWithMetrics(documents, serverProjectGuid)
				await MemoqProject.updateOne({ "_id": _id }, { documents })
			}
		}
		const updatedProjects = await updateAllMemoqProjects(from)
		res.send(updatedProjects)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating all other projects')
	}
})

router.get('/update-project-statuses-from-messages/:from', async (req, res) => {
	let { from } = req.params
	try {
		from = from === 'In-progress' ? 'In progress' : from
		await updateStatusesForOtherProjects(from)
		const updatedProjects = await getFilteredOtherProjects({ query: from })
		res.send(updatedProjects)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on parsing gmail messages')
	}

})

router.post('/client-contact', async (req, res) => {
	const { projectId, contact, oldContact: { _id: oldContact } } = req.body
	try {
		const { clientContacts } = await MemoqProject.findOne({ _id: projectId })
		if (oldContact) {
			const oldIdxContact = clientContacts.findIndex(item => item._id.toString() === oldContact.toString())
			clientContacts.splice(oldIdxContact, 1, contact)
		} else {
			clientContacts.push(contact)
		}
		const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating/creating client contact')
	}
})

router.delete('/client-contact/:projectId/:contactId', async (req, res) => {
	const { projectId, contactId } = req.params
	try {
		const { clientContacts } = await MemoqProject.findOne({ _id: projectId })
		const contactToDeleteIndex = clientContacts.findIndex(item => item._id.toString() === contactId.toString())
		clientContacts.splice(contactToDeleteIndex, 1)
		const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on deleting client contact')
	}
})

router.post('/contact-email', async (req, res) => {
	const { projectId, contactId, template } = req.body
	try {
		const { clientContacts } = await MemoqProject.findOne({ _id: projectId })
		const { email } = clientContacts.find(contact => contact._id.toString() === contactId.toString())
		const subject = 'Pangea translation services'
		await sendEmail({ to: email, subject }, template, true)
		res.send(true)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on sending message to client\'s contact')
	}
})

router.post('/set-recalculation-lock', async (req, res) => {
	const { projectId, value } = req.body
	try {
		const project = await getProjectAfterUpdate({ _id: projectId }, { lockedForRecalculation: value })
		res.send(project)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on setting recalculation lock')
	}
})

router.get('/get-project-discounts', async (req, res) => {
	const { id } = req.query
	try {
		const discounts = await MemoqProject.findOne({ "_id": id }, { discounts: 1 })
		res.send(discounts)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on getting project discounts')
	}
})

router.post('/update-project-discounts', async (req, res) => {
	const { _id, updatedArray } = req.body
	try {
		// const updatedProject = await updateProjectFinanceOnDiscountsUpdate(_id, updatedArray, MemoqProject)
		// res.send(updatedProject)
	} catch (err) {
		console.log(err)
		res.status(500).send('Error on updating project\'s discounts')
	}
})

// router.post('/update-minimum-charge', async (req, res) => {
// 	const { _id, value, toIgnore } = req.body
// 	try {
// 		const updatedProject = await getProjectAfterUpdate({ _id }, { minimumCharge: { value, toIgnore } })
// 		res.send(updatedProject)
// 	} catch (err) {
// 		console.log(err)
// 		res.status(500).send('Error on updating project\'s minimum charge!')
// 	}
// })

module.exports = router
