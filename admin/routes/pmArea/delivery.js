const router = require('express').Router()
const fs = require('fs')
const { addDR2 } = require("../../projects")
const {
  Projects
} = require('../../models')


router.post('/singleLang', async (req, res) => {
  const DR1Info  = req.body

  try {
    const DR2 =  await addDR2(DR1Info)

    res.send( DR2 )
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on cancelling tasks / cancel-tasks')
  }
})

module.exports = router
