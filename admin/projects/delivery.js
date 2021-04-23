const fs = require('fs')

const {
  Projects,
  Languages
} = require('../models')


async function addDR2({projectId, dr1Info}) {
  const {taskId, dr1Manager, dr2Manager, files} = dr1Info
  const allLang =  await Languages.find({})
  const project = await Projects.findOne({_id: projectId})

  const task = project.tasks.find(({taskId}) => taskId === dr1Info.taskId)
  const sourceLang = allLang.find(({symbol}) =>  task.sourceLanguage === symbol)
  const targetLang = allLang.find(({symbol}) =>  task.targetLanguage === symbol)
  let fileInfo = []

  for(const file of files){
    const {_id, ...fileWithoutId} = file
    fileInfo.push({
      ...fileWithoutId,
      taskId,
      dr1Manager,
      dr2Manager,
    })
  }


  if (project.tasksDR2.singleLang.length > 0) {
    const singleLangIndex =
      project
        .tasksDR2
        .singleLang
        .findIndex(({ sourceLanguage, targetLanguage }) =>
          sourceLanguage.toString() === sourceLang._id.toString()
          && targetLanguage.toString() === targetLang._id.toString()
        )

    if (singleLangIndex > -1) {
      project.tasksDR2.singleLang[singleLangIndex].files = [...project.tasksDR2.singleLang[singleLangIndex].files,...fileInfo]
    }else {
      project.tasksDR2.singleLang.push({
        sourceLanguage: sourceLang._id,
        targetLanguage: targetLang._id,
        files: fileInfo
      })
    }
  } else {
    project.tasksDR2.singleLang.push({
      sourceLanguage: sourceLang._id,
      targetLanguage: targetLang._id,
      files: fileInfo
    })
  }

   await project.save()
  return project.tasksDR2
}

module.exports = {addDR2}
