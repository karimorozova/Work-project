const router = require('express').Router()
const fs = require('fs')
const {
  User,
  Languages
} = require('../../models')
// const {changeManager} = require("../../delivery");

const {storeFiles} = require("../../projects/files");
const { rollbackDR1Template } = require("../../emailMessages/internalCommunication")

const {
  addDR2,
  addMultiLangDR2,
  removeDR2,
  removeMultiDR2,
  taskApproveReady,
  taskApproveNotify,
  taskApproveDeliver,
  taskApproveDeliverMany,
  manageDeliveryFile,
  getProject,
  getProjectAfterUpdate,
  updateProject,
  changeManagerDR2,
  changeManager,
} = require("../../projects")

const { managerNotifyMail } = require("../../utils")


const {
  Projects
} = require('../../models')

const { upload } = require('../../utils');

router.post('/rollback-review', async (req, res) => {
  const { entityId, taskId, projectId, manager } = req.body
  const project = await Projects.findOne({ "_id": projectId })
  const singleLang = project.tasksDR2.singleLang.find(({_id}) => _id.toString() === entityId.toString())
  const paths = singleLang.files.filter(item => item.taskId === taskId).map(item => item.path)

  try {
    for await (path of paths) {
      await removeTaskDR2(projectId, path, entityId)
      await rollbackManagerDR1(path)
    }

    await Projects.updateOne(
      { "_id": projectId, 'tasks.taskId': taskId},
      { "tasks.$[i].status" : "Pending Approval [DR1]" },
      { arrayFilters: [ { 'i.taskId': taskId }]}
    )

    const message = rollbackDR1Template(taskId, projectId)
    await managerNotifyMail(manager, message, 'Task delivery review assignment notification (I016)')

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on rollback-review')
  }

  async function rollbackManagerDR1(path){
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": path },
      { "tasksDR1.$[i].dr1Manager" : manager._id, "tasksDR1.$[i].files.$[j].isFileApproved": false, "tasksDR1.$[i].files.$[j].isFilePushedDR2": false },
      { arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': path } ]}
    )
  }

  async function removeTaskDR2(projectId, path, entityId){
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": path },
      { $pull: { "tasksDR2.singleLang.$[i].files": { path } }},
      { arrayFilters: [ { 'i._id': entityId }] }
    )
  }
})

router.post('/change-manager-dr2', async (req, res) => {
  const { projectId, manager, type, file, entityId } = req.body
  try {
    const project = await getProject({ '_id': projectId })
    let prevManager = await User.findOne( { "_id": file.dr2Manager } ).populate('group')
    const updatedProject = await changeManagerDR2({project, prevManager, manager, type, file, entityId })
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on changing review manager')
  }
})

router.post('/target-dr2', upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
  const fileData = { ...req.body }
  const files = req.files['targetFile']
  const { projectId, path, type, entityId, dr1Manager, user } =  fileData
  const project = await getProject({"_id": projectId})
  const allLanguages = await Languages.find()
  if(type === 'single'){
    try {
      const singleLang = project.tasksDR2.singleLang.find(({_id}) => _id.toString() === entityId)
      const { sourceLanguage, targetLanguage } = singleLang
      const newPath = await manageDeliveryFile({ fileData, file: files[0] })
      const fileName = newPath.split("/").pop()
      if (!!path) {
        const { taskId } = singleLang.files.find(item => item.path === path)
        if(taskId !== 'Loaded in DR2'){
          await Projects.updateOne(
            { "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": path  },
            { "tasksDR1.$[i].files.$[j]": {isFileApproved: true, isFilePushedDR2: true, fileName: fileName, path: newPath }},
            { arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': path } ] }
          )
          await Projects.updateOne(
            { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": path  },
            { "tasksDR2.singleLang.$[i].files.$[j]": { isFileApproved: false, pair: getLanguagesPairsSymbols(sourceLanguage, targetLanguage), fileName: fileName, path: newPath, taskId, dr1Manager, dr2Manager: user }},
            { arrayFilters: [ { 'i._id': entityId }, { 'j.path': path } ] }
          )
        }else{
          await Projects.updateOne(
            { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": path  },
            { "tasksDR2.singleLang.$[i].files.$[j]": { isFileApproved: false, pair: getLanguagesPairsSymbols(sourceLanguage, targetLanguage), fileName: fileName, path: newPath, taskId: 'Loaded in DR2',dr1Manager,dr2Manager: user }},
            { arrayFilters: [ { 'i._id': entityId }, { 'j.path': path } ] }
          )
        }
      } else {
        await Projects.updateOne(
          { "_id": projectId, 'tasksDR2.singleLang._id': entityId, },
          { $push: { 'tasksDR2.singleLang.$.files': { isFileApproved: false, pair: getLanguagesPairsSymbols(sourceLanguage, targetLanguage), fileName: fileName, path: newPath, taskId: 'Loaded in DR2',dr1Manager,dr2Manager: user }}}
        )
      }

    } catch (err) {
      console.log(err)
      res.status(500).send('Error on uploading target file dr2')
    }
  }else{
    const { file: { dr1Manager, dr2Manager }} = project.tasksDR2.multiLang.find(({_id}) => _id.toString() === entityId)
    const newPath = await manageDeliveryFile({ fileData, file: files[0] })
    const fileName = newPath.split("/").pop()
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR2.multiLang._id': entityId },
      { "tasksDR2.multiLang.$[i].file": { isFileApproved: false, dr1Manager, dr2Manager, fileName: fileName, path: newPath } },
      { arrayFilters: [ { 'i._id': entityId } ]}
    )
  }

  const updatedProject = await getProject({"_id": projectId})
  res.send(updatedProject)

  function getLanguagesPairsSymbols(source, target){
    return `${allLanguages.find(({_id}) => `${_id}` === `${source}`).symbol} >> ${allLanguages.find(({_id}) => `${_id}` === `${target}`).symbol}`
  }
})

router.post('/remove-dr2-file', async (req, res) => {
  const { type, taskId, projectId, path, entityId } = req.body
  try {
    if(type === 'single'){
      if(taskId !== 'Loaded in DR2'){
        await Projects.updateOne(
          { "_id": projectId, 'tasksDR1.files.path': path },
          { $pull: { 'tasksDR1.$[i].files': { path } }},
          { arrayFilters: [ { 'i.taskId': taskId } ] }
        )
      }
      await Projects.updateOne(
        { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": path },
        { $pull: { "tasksDR2.singleLang.$[i].files": { path } }},
        { arrayFilters: [ { 'i._id': entityId }] }
      )
      fs.unlink(`./dist${ path }`, (err) => {
        if (err) throw(err)
      })
    }
    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on removing dr file')
  }
})

router.post('/delivery-comments-dr2', async (req, res) => {
  const { projectId, entityId, type, comment } = req.body
  try{
    if(type === 'single'){
      const updatedProject = await getProjectAfterUpdate(
        {"_id": projectId, 'tasksDR2.singleLang._id': entityId,},
        { $set: {"tasksDR2.singleLang.$.comment": comment}}
      )
      res.send(updatedProject)
    }else{
      const updatedProject = await getProjectAfterUpdate(
        {"_id": projectId, 'tasksDR2.multiLang._id': entityId,},
        { $set: {"tasksDR2.multiLang.$.comment": comment}}
      )
      res.send(updatedProject)
    }
  }catch(err){
    console.log(err)
    res.status(500).send('Error on delivery-comments')
  }
})

router.post('/change-task-status', async (req, res) => {
  const { taskId, projectId } = req.body

  try {
    const tasksDR1Info = await Projects.findOne({_id: projectId, "tasksDR1.taskId": taskId},{"tasksDR1.$": 1})
    const isAllChecklist= tasksDR1Info.tasksDR1[0].instructions.every(({isChecked, isNotRelevant}) => isChecked || isNotRelevant)
    const isAllFiles = tasksDR1Info.tasksDR1[0].files.every(({isFileApproved}) => isFileApproved)

    if( isAllChecklist && isAllFiles ) {
      await changeTaskStatus(projectId, taskId, 'Pending Approval [DR1]', "Completed", new Date())
    }else{
      await changeTaskStatus(projectId, taskId, "Completed", 'Pending Approval [DR1]', null)
    }

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }

  async function changeTaskStatus(projectId,taskId, withStatus , changeStatusTo, completedAtDate) {
    await Projects.updateOne(
      {"_id": projectId, 'tasks': {$elemMatch: {'taskId': taskId, 'status': withStatus}}},
      {
        "tasks.$[i].status": changeStatusTo,
        "tasksDR1.$[i].timestamp": completedAtDate,
      },
      { arrayFilters: [ { 'i.taskId': taskId }]}
    )
  }
})

router.post('/is-file-pushed-dr2', async (req, res) => {
  const { projectId, taskId, isFilePushedDR2, paths } = req.body
  try {
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.taskId': taskId, "tasksDR1.files.path": { $in: paths } },
      { "tasksDR1.$[i].files.$[j].isFilePushedDR2": isFilePushedDR2 },
      { arrayFilters: [ { 'i.taskId': taskId }, { 'j.path': { $in: paths } } ]}
    )
    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }
})

router.post('/target', upload.fields([ { name: 'targetFile' } ]), async (req, res) => {
  const fileData = { ...req.body }
  try {
    const files = req.files['targetFile']
    const newPath = await manageDeliveryFile({ fileData, file: files[0] })
    const fileName = newPath.split("/").pop()
    if (!!fileData.path) {
      await Projects.updateOne(
        { "_id": fileData.projectId, 'tasksDR1.taskId': fileData.taskId, "tasksDR1.files.path": fileData.path  },
        { "tasksDR1.$[i].files.$[j]": {isFileApproved: false, fileName: fileName, path: newPath }},
        { arrayFilters: [ { 'i.taskId': fileData.taskId }, { 'j.path': fileData.path } ] }
      )
    } else {
      await Projects.updateOne(
        { "_id": fileData.projectId, 'tasksDR1.taskId': fileData.taskId },
        { $push: { 'tasksDR1.$.files': { isFileApproved: false, isOriginal: false, fileName: fileName, path: newPath }}}
      )
    }
    const updatedProject = await getProject({"_id": fileData.projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on uploading target file')
  }
})

router.post('/approve-files-dr2', async (req, res) => {
  const { type, entityId, projectId, isFileApproved, paths } = req.body
  try {
    if(type === 'single'){
      await Projects.updateOne(
        { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.files.path": { $in: paths } },
        { "tasksDR2.singleLang.$[i].files.$[j].isFileApproved": isFileApproved },
        { arrayFilters: [ { 'i._id': entityId }, { 'j.path': { $in: paths } } ]}
      )
    }else{
      await Projects.updateOne(
        { "_id": projectId, 'tasksDR2.multiLang._id': entityId },
        { "tasksDR2.multiLang.$[i].file.isFileApproved": isFileApproved },
        { arrayFilters: [ { 'i._id': entityId } ]}
      )
    }
    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }
})

router.post('/approve-instruction-dr2', async (req, res) => {
  const { entityId, projectId, instruction, type } = req.body
  try {
    if(type === 'single'){
      await Projects.updateOne(
        { "_id": projectId, 'tasksDR2.singleLang._id': entityId, "tasksDR2.singleLang.instructions.text": instruction.text },
        {
          "tasksDR2.singleLang.$[i].instructions.$[j].isChecked": instruction.isChecked,
          "tasksDR2.singleLang.$[i].instructions.$[j].isNotRelevant": instruction.isNotRelevant
        },
        { arrayFilters: [ { 'i._id': entityId }, { 'j.text': instruction.text } ]}
      )
    }else{
      await Projects.updateOne(
        { "_id": projectId, 'tasksDR2.multiLang._id': entityId, "tasksDR2.multiLang.instructions.text": instruction.text },
        {
          "tasksDR2.multiLang.$[i].instructions.$[j].isChecked": instruction.isChecked,
          "tasksDR2.multiLang.$[i].instructions.$[j].isNotRelevant": instruction.isNotRelevant
        },
        { arrayFilters: [ { 'i._id': entityId }, { 'j.text': instruction.text } ]}
      )
    }

    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on approve files')
  }
})

router.post('/remove-dr-file', async (req, res) => {
  const { taskId, path, projectId } = req.body
  try {
    await Projects.updateOne(
      { "_id": projectId, 'tasksDR1.files.path': path },
      { $pull: { 'tasksDR1.$[i].files': { path } }},
      { arrayFilters: [ { 'i.taskId': taskId } ] }
    )
    fs.unlink(`./dist${ path }`, (err) => {
      if (err) throw(err)
    })
    const updatedProject = await getProject({"_id": projectId})
    res.send(updatedProject)
  } catch (err) {
    console.log(err)
    res.status(500).send('Error on removing dr file')
  }
})

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
  const { projectId, type, entityId, user, contacts, comment } = req.body
  try {
    const updatedProject = await taskApproveDeliver({ projectId, type, entityId, user, contacts, comment })
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
    const prevManager = await User.findOne( { "_id": project.tasksDR1.find(item => item.taskId === taskId)[prop] } ).populate('group')
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
