const router = require('express').Router()
const fs = require('fs')
const {storeFiles} = require("../../projects/files");

const {
  addDR2,
  addMultiLangDR2,
  removeDR2,
  removeMultiDR2,
  taskApproveReady,
  taskApproveNotify,
  taskApproveDeliver,
} = require("../../projects")

const {
  Projects
} = require('../../models')

const { upload } = require('../../utils');

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

module.exports = router
