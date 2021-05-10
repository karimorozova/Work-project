const fs = require('fs')
const {
  getProject
} = require("./getProjects");

const {
  moveProjectFile
} = require("../utils/movingFile");

const {
  notifyClientDeliverablesReady,
  sendClientDeliveries,
  sendClientManyDeliveries
} = require("./emails")

const {
  Projects,
  Languages
} = require('../models')

const { dr2Instructions } = require('../enums/deliveryInstructions');

const {
  getProjectAfterUpdate,
} = require('./getProjects')

const taskApproveDeliverMany= async ({ projectId, entitiesForDeliver, user, contacts }) => {
  return await sendClientManyDeliveries({ projectId, entitiesForDeliver, user, contacts })
}

const taskApproveDeliver= async ({ projectId, type, entityId, user, contacts }) => {
  return await sendClientDeliveries({ projectId, type, entityId, user, contacts })
}

const taskApproveNotify = async ({ projectId, type, entityId, contacts }) => {
  const project = await getProject({ '_id': projectId })
  await notifyClientDeliverablesReady({ project, contacts });
  return await taskApproveReady({ projectId, type, entityId })
}

const taskApproveReady = async ({ projectId, type, entityId }) =>{
  const qProject = { "_id": projectId }
  if(type === 'single'){
    await Projects.updateOne(
      { ...qProject, "tasksDR2.singleLang._id": entityId },
      { "tasksDR2.singleLang.$[i].status": 'Ready for Delivery' },
      { arrayFilters: [{ 'i._id': entityId }] }
    )
  }else{
    await Projects.updateOne(
      { ...qProject, "tasksDR2.multiLang._id": entityId },
      { "tasksDR2.multiLang.$[i].status": 'Ready for Delivery' },
      { arrayFilters: [{ 'i._id': entityId }] }
    )
  }
  return await getProject(qProject)
}

async function addDR2({projectId, taskId, dr1Manager, dr2Manager, files}) {
  const allLang =  await Languages.find({})
  const {tasks, tasksDR2 : { singleLang }} = await Projects.findOne({_id: projectId})

  const {sourceLanguage, targetLanguage} = tasks.find(({taskId: tId}) => tId === taskId)
  const sourceLang = allLang.find(({symbol}) =>  sourceLanguage === symbol)
  const targetLang = allLang.find(({symbol}) =>  targetLanguage === symbol)

  let fileInfo = []
  for(const { _id, isFilePushedDR2, isChecked, ...fileWithoutId  } of files){
    fileInfo.push({
      ...fileWithoutId,
      isFileApproved: false,
      taskId,
      dr1Manager,
      dr2Manager
    })
  }

  if (singleLang.length > 0) {
    const singleLangIndex = singleLang
      .findIndex( ({ sourceLanguage, targetLanguage }) => `${sourceLanguage}-${targetLanguage}` === `${sourceLang._id}-${targetLang._id}` )

    const { status } = singleLang[singleLangIndex]

    if (singleLangIndex > -1 && status !== 'Delivered') singleLang[singleLangIndex].files = [ ...singleLang[singleLangIndex].files, ...fileInfo ]
    else pushFile(sourceLang, targetLang, fileInfo)

  } else {
    pushFile(sourceLang, targetLang, fileInfo)
  }

  return await getProjectAfterUpdate({ "_id": projectId }, { "tasksDR2.singleLang" : singleLang } )

  function pushFile(sourceLang, targetLang, fileInfo){
    singleLang.push({
      status: 'Pending Approval [DR2]',
      sourceLanguage: sourceLang._id,
      targetLanguage: targetLang._id,
      files: fileInfo,
      instructions: dr2Instructions
    })
  }
}

const removeDR2 = async ({projectId, taskId, path, sourceLanguage: source, targetLanguage: target}) => {
  const allLang = await Languages.find()
  const { tasksDR2 : { singleLang } } = await Projects.findOne({_id: projectId})
  const idx = singleLang
    .findIndex( ({ sourceLanguage, targetLanguage }) => `${sourceLanguage}-${targetLanguage}` === `${langId(source)}-${langId(target)}`)

  const { files: notFilteredFiles } = singleLang[idx]
  singleLang[idx].files = notFilteredFiles
    .filter(file => file.path !== path && file.taskId !== taskId)

  if(!singleLang[idx].files.length) singleLang.splice(idx, 1)

  return await getProjectAfterUpdate({ "_id": projectId }, { "tasksDR2.singleLang" : singleLang } )

  function langId(langSymbol){
    return allLang.find(({symbol}) => langSymbol === symbol)._id
  }
}

async function addMultiLangDR2({projectId, taskIds, refFiles}) {
  const {projectManager, accountManager, tasksDR2} = await Projects.findOne({_id: projectId})

  const file = (await storeFile(refFiles[0], projectId))[0]

  let multiLang = {
    tasks: taskIds,
    instructions: dr2Instructions,
    status: 'Pending Approval [DR2]',
    file: {
      fileName: file.split('/').pop(),
      path: file,
      isFileApproved: false,
      dr1Manager: projectManager,
      dr2Manager: accountManager,
    }
  }

  return await getProjectAfterUpdate({ "_id": projectId }, { "tasksDR2.multiLang" : [...tasksDR2.multiLang, multiLang ] })

  async function storeFile(file, projectId) {
    try {
      const additionFileInfo = `${Math.floor(Math.random()*1000000)}`;
      let storedFiles = [];
      if (file) {
        const newPath = `/projectFiles/${projectId}/${additionFileInfo}-${file.filename.replace(/['"]/g, '_').replace(/\s+/, '_')}`;
        await moveProjectFile(file, `./dist${newPath}`);
        storedFiles.push(newPath);
      }
      return storedFiles;
    } catch(err) {
      console.log(err);
      console.log("Error in storeFiles")
    }
  }
}

async function removeMultiDR2({projectId, type, dr2Id}) {
  const qProject = { "_id": projectId }
  const {tasksDR2 : { multiLang, singleLang }} = await Projects.findOne(qProject)

  if(type === 'multi'){
    const newMultiLang = multiLang.filter(({_id}) => `${ _id }` !== `${ dr2Id }`)
    const removedMultiLang = multiLang.filter(({_id}) => `${ _id }` === `${ dr2Id }`)[0]
    await fs.unlink(`./dist/${removedMultiLang.file.path}` , (err) => { if(err) console.log(err)});

    return await getProjectAfterUpdate(qProject, { "tasksDR2.multiLang" : newMultiLang })
  }else{
    const newSingleLang = singleLang.filter(({_id}) => `${ _id }` !== `${ dr2Id }`)
    return await getProjectAfterUpdate(qProject, { "tasksDR2.singleLang" : newSingleLang })

  }
}

module.exports = {
  taskApproveNotify,
  taskApproveDeliver,
  taskApproveReady,
  addDR2,
  addMultiLangDR2,
  removeDR2,
  removeMultiDR2,
  taskApproveDeliverMany
}
