const fs = require('fs')

const {
  Projects,
  Languages
} = require('../models')

const { dr2Instructions } = require('../enums/deliveryInstructions');

const {
  getProjectAfterUpdate,
} = require('./getProjects')


async function addDR2({projectId, taskId, dr1Manager, dr2Manager, files}) {

  const allLang =  await Languages.find({})
  const {tasks, tasksDR2 : { singleLang }} = await Projects.findOne({_id: projectId})

  const {sourceLanguage, targetLanguage} = tasks.find(({taskId: tId}) => tId === taskId)
  const sourceLang = allLang.find(({symbol}) =>  sourceLanguage === symbol)
  const targetLang = allLang.find(({symbol}) =>  targetLanguage === symbol)

  let fileInfo = []
  for(const { _id, ...fileWithoutId  } of files){
    fileInfo.push({
      ...fileWithoutId,
      isFileApproved: false,
      isChecked: false,
      taskId,
      dr1Manager,
      dr2Manager
    })
  }

  if (singleLang.length > 0) {
    const singleLangIndex = singleLang
      .findIndex( ({ sourceLanguage, targetLanguage }) => `${sourceLanguage}-${targetLanguage}` === `${sourceLang._id}-${targetLang._id}` )

    if (singleLangIndex > -1) singleLang[singleLangIndex].files = [ ...singleLang[singleLangIndex].files, ...fileInfo ]
    else pushFile(sourceLang, targetLang, fileInfo)

  } else {
    pushFile(sourceLang, targetLang, fileInfo)
  }

  return await getProjectAfterUpdate({ "_id": projectId }, { "tasksDR2.singleLang" : singleLang } )

  function pushFile(sourceLang, targetLang, fileInfo){
    singleLang.push({
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

async function addMultiLangDR2({projectId, taskIds, file}) {
  let multiLang = {
    tasks: taskIds,
    file: {
      ...file
    }
  }

  return await getProjectAfterUpdate({ "_id": projectId }, { "tasksDR2.singleLang" : multiLang } )
}

module.exports = {addDR2, addMultiLangDR2, removeDR2}
