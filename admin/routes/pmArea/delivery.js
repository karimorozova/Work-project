const router = require('express').Router()
const fs = require('fs')
const {storeFiles} = require("../../projects/files");
const {
  addDR2,
  addMultiLangDR2,
  removeDR2
} = require("../../projects")
const {
  Projects
} = require('../../models')


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

router.post('/multi-file-dr2-push', async (req, res) => {
  const {projectId, taskIds, dr1Manager, dr2Manager} = req.body
  const { reqFile } = req.files

  try {
    const file = await storeFiles(reqFile, projectId)
    const DR2 =  await addMultiLangDR2({projectId, taskIds, dr1Manager, dr2Manager, file})
    res.send( 'DR2' )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on multi-file-dr2-push')
  }
})

module.exports = router
