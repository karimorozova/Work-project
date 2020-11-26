const router = require('express').Router();
const { upload, sendEmail } = require('../utils');
const { User, MemoqProject } = require('../models');
const { downloadCompletedFiles } = require('../projects');
const {
  getMemoqAllProjects,
  createMemoqProjectWithTemplate,
  getProjectTranslationDocs,
  getProjectAnalysis,
  getProjectUsers,
  getMemoqFileId
} = require('../services/memoqs/projects');
const { getProjectAfterUpdate } = require('../services/memoqs/otherProjects/getMemoqProject');
const { moveMemoqFileToProject, addProjectFile, exportMemoqFile, getMemoqFileChunks } = require('../services/memoqs/files');
const { getMemoqTemplates } = require("../services/memoqs/resources");
const { assignProjectManagers } = require('../projects/updates');
const { storeFiles } = require("../projects/files");
const { getMemoqUsers } = require("../services/memoqs/users");
const { updateProjectMetrics } = require("../projects/metrics");
const {
  getFilteredOtherProjects,
  filterMemoqProjectsVendors,
  updateAllMemoqProjects,
  updateMemoqProjectFinance,
  updateMemoqProjectStatus,
  parseMessagesAndUpdateProjects
} = require('../services/memoqs/otherProjects');
const { saveMessages } = require('../gmail');
router.get('/users', async (req, res) => {
	try {
		const result = await getMemoqUsers();
		res.json(result);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting memoQ users");
	}
});

router.get('/user', async (req, res) => {
	const { userId } = req.query;
	try {
		const user = await User.findOne({ _id: userId });
		const memoqUsers = await getMemoqUsers();
		const creatorUser = memoqUsers.find(item => item.email === user.email);
		res.send({ creatorUserId: creatorUser ? creatorUser.id : "" });
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting memoQ user");
	}
})

router.post('/check-user', async (req, res) => {
	const { email } = req.body;
	try {
		const memoqUsers = await getMemoqUsers();
		const user = memoqUsers.find(item => item.email === email);
		if(!user) {
			return res.status(500).send(`No such user in memoQ with email - ${ email }`);
		}
		res.send("ok");
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on checking memoQ user");
	}
})

router.get('/templates', async (req, res) => {
	try {
		const unSorted = await getMemoqTemplates();
		const result = unSorted.sort((a, b) => a.name > b.name ? 1 : -1);
		res.json(result);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting memoQ templates");
	}
})

router.post('/memoq-project', upload.fields([{ name: 'sourceFiles' }, { name: 'refFiles' }]), async (req, res) => {
	let tasksInfo = { ...req.body };
	try {
		if(tasksInfo.isRequest) {
			tasksInfo.memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo);
			await assignProjectManagers({
				managerIds: [tasksInfo.projectManager, tasksInfo.accountManager],
				memoqProjectId: tasksInfo.memoqProjectId
			});
			return res.send({ tasksInfo });
		}
		if(tasksInfo.source) {
			tasksInfo.source = JSON.parse(tasksInfo.source);
		}
		tasksInfo.targets = JSON.parse(tasksInfo.targets);
		tasksInfo.service = JSON.parse(tasksInfo.service);
		tasksInfo.stepsDates = tasksInfo.stepsDates ? JSON.parse(tasksInfo.stepsDates) : [];
		const { sourceFiles, refFiles } = req.files;
		tasksInfo.translateFiles = await storeFiles(sourceFiles, tasksInfo.projectId);
		tasksInfo.referenceFiles = refFiles ? await storeFiles(refFiles, tasksInfo.projectId) : [];
		tasksInfo.memoqProjectId = await createMemoqProjectWithTemplate(tasksInfo);
		await assignProjectManagers({
			manager: tasksInfo.projectManager,
			memoqProjectId: tasksInfo.memoqProjectId
		});
		res.send({ tasksInfo });
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on creating a Project in memoQ");
	}
})

router.post('/add-project-file', async (req, res) => {
	const { memoqProjectId, filePath } = req.body;
	try {
		const fileGuid = await addProjectFile(memoqProjectId, filePath);
		res.send(fileGuid);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/projects', async (req, res) => {
	try {
		const result = await getMemoqAllProjects();
		res.json(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/project-users', async (req, res) => {
	const { id } = req.query;
	try {
		const result = await getProjectUsers(id);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/project-docs', async (req, res) => {
	const { id } = req.query;
	try {
		const result = await getProjectTranslationDocs(id);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.post('/metrics', async (req, res) => {
	const { projectId, tasks } = req.body;
	try {
		const updatedProject = await updateProjectMetrics(projectId, tasks);
		res.send(updatedProject);
	} catch (err) {
		console.log(err);
		res.status(500).send("Error on getting metrics ");
	}
})

router.get('/project-analysis', async (req, res) => {
	const { id } = req.query;
	try {
		const result = await getProjectAnalysis(id);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/move-files', async (req, res) => {
	const { fileId } = req.query;
	try {
		const result = await moveMemoqFileToProject(fileId);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}

})

router.post('/target-files', async (req, res) => {
	const { stepId } = req.body;
	try {
		await downloadCompletedFiles(stepId);
		res.send("Files downloaded");
	} catch (err) {
		console.log(err);
		res.status(500).send(err.message);
	}
})

router.get('/download-file', async (req, res) => {
	const { projectId, docId } = req.query;
	try {
		const fileId = await getMemoqFileId(projectId, docId);
		const sessionId = await exportMemoqFile(fileId);
		const result = await getMemoqFileChunks(sessionId);
		res.send(result);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.post('/other-projects', async (req, res) => {
	try {
		const projects = await getFilteredOtherProjects(req.body);
		res.send(projects);
	} catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/other-project', async (req, res) => {
	const { id } = req.query;
	try {
    const project = await MemoqProject.findOne({ _id: id })
      .populate('customer')
      .populate('steps.vendor')
      .populate('projectManager')
      .populate('accountManager');
    res.send(project);
  } catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/memoq-client-aliases', async (req, res) => {
	try {
    const names = await MemoqProject.find({}, { _id: 0, client: 1 });
    const result = [...new Set(names.map(i => i.client))].filter(name => !name.match(/^\s+$|^$/gi));
    res.send(result);
  } catch (err) {
		console.log(err);
		res.status(500).send(err);
	}
})

router.get('/memoq-vendor-aliases', async (req, res) => {
  try {
    let users = await MemoqProject.find({}, { _id: 0, documents: 1 });
    const result = filterMemoqProjectsVendors(users);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
})

router.post('/switch-status', async (req, res) => {
  const { id, direction } = req.body;
  try {
    const updatedProject = await updateMemoqProjectStatus(id, direction);
    res.send(updatedProject);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on switching project\'s status');
  }
});

router.post('/update-memoq-finance', async (req, res) => {
  const { id } = req.body;
  try {
    const neededProject = await MemoqProject.findOne({ _id: id });
    const updatedProject = await updateMemoqProjectFinance(neededProject);
    res.send(updatedProject);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating project\'s finance');
  }
});

router.get('/update-all-memoq-finance/:from', async (req, res) => {
  const { from } = req.params;
  try {
    const updatedProjects = await updateAllMemoqProjects(from);
    res.send(updatedProjects);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating all other projects');
  }
});

router.get('/update-project-statuses-from-messages/:from', async (req, res) => {
  const { from } = req.params;
  try {
	await parseMessagesAndUpdateProjects(from);
    const updatedProjects = await getFilteredOtherProjects({ query: from });
    res.send(updatedProjects);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on parsing gmail messages');
  }
});

router.post('/client-contact', async (req, res) => {
  const { projectId, contact } = req.body;
  try {
    const { clientContacts } = await MemoqProject.findOne({ _id: projectId });
    const existingContact = clientContacts.findIndex(item => item._id.toString() === contact._id.toString());
    if (existingContact !== -1) {
      clientContacts.splice(existingContact, 1, contact);
    } else {
      clientContacts.push(contact);
    }
    const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts });
    res.send(project);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on updating/creating client contact');
  }
});

router.delete('/client-contact/:projectId/:contactId', async (req, res) => {
  const { projectId, contactId } = req.params;
  try {
    const { clientContacts } = await MemoqProject.findOne({ _id: projectId });
    const contactToDeleteIndex = clientContacts.findIndex(item => item._id.toString() === contactId.toString());
    clientContacts.splice(contactToDeleteIndex, 1);
    const project = await getProjectAfterUpdate({ _id: projectId }, { clientContacts });
    res.send(project);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on deleting client contact');
  }
});

router.post('/contact-email', async (req, res) => {
  const { projectId, contactId, template } = req.body;
  try {
    const { clientContacts } = await MemoqProject.findOne({ _id: projectId });
    const { email } = clientContacts.find(contact => contact._id.toString() === contactId.toString());
    const subject = 'Pangea translation services';
    await sendEmail({ to: email, subject }, template, true);
    res.send(true);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on sending message to client\'s contact');
  }
});

router.post('/set-recalculation-lock', async (req, res) => {
  const { projectId, value } = req.body;
  try {
    const project = await getProjectAfterUpdate({ _id: projectId }, { lockedForRecalculation: value });
    res.send(project);
  } catch (err) {
    console.log(err);
    res.status(500).send('Error on setting recalculation lock');
  }
});

module.exports = router;
