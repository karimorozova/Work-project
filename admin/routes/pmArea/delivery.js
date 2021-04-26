const router = require('express').Router()
const fs = require('fs')
const { addDR2 } = require("../../projects")
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
    res.status(500).send('Error on cancelling tasks / cancel-tasks')
  }
})

module.exports = router
