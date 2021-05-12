const router = require('express').Router()
const fs = require('fs')
const User = require("../../models/user");
const {updateProject} = require("../../projects");
const {getProjectAfterUpdate} = require("../../projects");
const {changeManager} = require("../../delivery");
const {getProject} = require("../../projects");
const {storeFiles} = require("../../projects/files");

const {
  addDR2,
  addMultiLangDR2,
  removeDR2,
  removeMultiDR2,
  taskApproveReady,
  taskApproveNotify,
  taskApproveDeliver,
  taskApproveDeliverMany
} = require("../../projects")

const {
  Projects
} = require('../../models')

const { upload } = require('../../utils');

router.post('/tasks-approve-deliver-many', async (req, res) => {
  const { projectId, entitiesForDeliver, user, contacts } = req.body
  try {
    const updatedProject = await taskApproveDeliverMany({ projectId, entitiesForDeliver, user, contacts })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approving deliverable')
  }
})

router.post('/tasks-approve-notify', async (req, res) => {
  const { projectId, type, entityId, contacts } = req.body
  try {
    const updatedProject = await taskApproveNotify({ projectId, type, entityId, contacts })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approving deliverable')
  }
})

router.post('/tasks-approve-deliver', async (req, res) => {
  const { projectId, type, entityId, user, contacts } = req.body
  try {
    const updatedProject = await taskApproveDeliver({ projectId, type, entityId, user, contacts })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approving deliverable')
  }
})

router.post('/tasks-approve-ready', async (req, res) => {
  const { projectId, type, entityId } = req.body
  try {
    const updatedProject = await taskApproveReady({ projectId, type, entityId })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approving deliverable')
  }
})

router.post('/file-dr2-push', async (req, res) => {
  const {projectId, taskId, dr1Manager, dr2Manager, files} = req.body
  try {
    const DR2 =  await addDR2({projectId, taskId, dr1Manager, dr2Manager, files})
    res.send( 'DR2' )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on file-dr2-push')
  }
})

router.post('/file-dr2-pull', async (req, res) => {
  const {projectId, taskId, path, sourceLanguage, targetLanguage} = req.body
  try {
    const DR2 = await removeDR2({projectId, taskId, path, sourceLanguage, targetLanguage})
    res.send( 'DR2' )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on file-dr2-pull')
  }
})

router.post('/multi-file-dr2-push',upload.fields([ { name: 'refFiles' } ]), async (req, res) => {
  const {projectId, taskIds, dr1Manager, dr2Manager} = req.body
  const { refFiles } = req.files
  try {
    const DR2 =  await addMultiLangDR2({projectId, taskIds: JSON.parse(taskIds), dr1Manager, dr2Manager, refFiles})
    res.send( DR2 )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on multi-file-dr2-push')
  }

})

router.post('/multi-file-dr2-remove', async (req, res) => {
  const {projectId, type, dr2Id} = req.body
  try {
    const DR2 = await removeMultiDR2({projectId, type, dr2Id})
    res.send( DR2 )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on multi-file-dr2-push')
  }
})

//==========================================================================================================

router.post('/change-manager', async (req, res) => {
  const { projectId, taskId, manager, prop, isAdmin, status } = req.body
  try {
    const project = await getProject({ '_id': projectId })
    const prevManager = await User.find( { "_id": project.tasksDR1.find(item => item.taskId === taskId)[prop] } ).populate('group')
    const updatedProject = await changeManager({ taskId, manager, prevManager, prop, isAdmin, status, project })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on changing review manager')
  }
})

router.post('/approve-instruction', async (req, res) => {
  const { taskId, projectId, instruction } = req.body
  try {
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.instructions.text": instruction.text },
      {
        "tasksDR1.$[i].instructions.$[j].isChecked": instruction.isChecked,
        "tasksDR1.$[i].instructions.$[j].isNotRelevant": instruction.isNotRelevant
      },
      { arrayFilters: [ { 'i.taskId': taskId }, { 'j.text': instruction.text } ]}
    )

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }

})

router.post('/delivery-comments', async (req, res) => {
  const { projectId, taskId, comment } = req.body
  try{
    const updatedProject = await getProjectAfterUpdate(
      {"_id": projectId, "tasksDR1.taskId": taskId},
      { $set: {"tasksDR1.$.comment": comment}}
    )
    res.send(updatedProject)
  }catch(err){
    console.log(err)
    res.status(500).send('Error on delivery-comments')
  }
})

router.post('/approve-files', async (req, res) => {
  const { projectId, taskId, isFileApproved, paths } = req.body
  try {
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": { $in: paths } },
      { "tasksDR1.$[i].files.$[j].isFileApproved": isFileApproved },
      { arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': { $in: paths } } ]}
    )

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }

})

router.post('/remove-reference-files', async (req, res) => {
  try {
    const { projectId, checkedTasksId, filePath } = req.body
    let { _id, tasks } = await getProject({ '_id': projectId })

    fs.unlink(filePath, (err) => {
      if (err) throw(err)
    })

    const taskIndex = tasks.findIndex(({ taskId }) => taskId === checkedTasksId)
    tasks[taskIndex].refFiles = tasks[taskIndex].refFiles.filter(item => item !== filePath)

    const updatedProject = await updateProject({ '_id': _id }, { tasks })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on adding tasks ref files')
  }
})

router.post('/change-managers', async (req, res) => {
  try {
    const { projectId, checkedTasksId, manager } = req.body

    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.taskId': { $in: checkedTasksId}},
      { "tasksDR1.$[i].dr1Manager": manager._id },
      { arrayFilters: [ { 'i.taskId': { $in: checkedTasksId} } ]}
    )

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on adding tasks ref files')
  }
})



module.exports = router
