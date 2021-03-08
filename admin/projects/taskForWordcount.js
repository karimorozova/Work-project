const { Projects } = require('../models');
const { getProject } = require('./getProjects');

/**
 *
 * @param {Object} newTasksInfo
 * @param {Array} docs
 * @returns {Array} - returns updated project's tasks
 */
async function createTasksForWordcount(newTasksInfo, docs) {
  try {
    const project = await Projects.findOne({ _id: newTasksInfo.projectId });
    return await addTasksToProject({ newTasksInfo, project, docs });
    // await getProject({ _id: newTasksInfo.projectId });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithWordsUnit");
  }
}

/**
 *
 * @param {Object} newTasksInfo
 * @param {Object} project
 * @param {Array} docs
 * @returns {Array} - returns updated project's tasks
 */
async function addTasksToProject({ newTasksInfo, project, docs }) {
  try {
    let memoqDocs;
    for (let target of newTasksInfo.targets) {
      memoqDocs = Array.isArray(docs)
        ? docs.filter(({ TargetLangCode }) => TargetLangCode === target.memoq)
        : [docs];
    }
    return await updateProjectTasks({ newTasksInfo, project, memoqDocs });
  } catch (err) {
    console.log(err);
    console.log("Error in addTasksToProject");
  }
}

/**
 *
 * @param {Object} taskData
 * @returns {Array} returns tasks array
 */
async function updateProjectTasks(taskData) {
  const { project } = taskData;
  try {
    const tasks = getWordCountTasks(taskData);
    await Projects.updateOne(
      { _id: project._id },
      {
        $set: { isMetricsExist: false },
        $push: { tasks }
      }
    );
    return tasks;
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectTasks");
  }
}

/**
 *
 * @param {Object} taskData
 * @returns {Array} - returns tasks array
 */
function getWordCountTasks(taskData) {
  const { project, newTasksInfo, memoqDocs } = taskData;
  const {
    service,
    stepsAndUnits,
    memoqProjectId,
    stepsDates,
    source,
    targets,
    memoqFiles,
    translateFiles,
    referenceFiles
  } = newTasksInfo;
  const tasks = [];
  let tasksLength = project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    let idNumber = tasksLength < 10 ? `T0${ tasksLength }` : `T${ tasksLength }`;
    let taskId = project.projectId + ` ${ idNumber }`;
    tasks.push({
      taskId,
      service,
      stepsAndUnits: JSON.parse(stepsAndUnits),
      memoqProjectId,
      start: project.startDate,
      deadline: project.deadline,
      stepsDates,
      sourceLanguage: source.symbol,
      targetLanguage: targets[i].symbol,
      memoqSource: source.memoq,
      memoqTarget: targets[i].memoq,
      memoqDocs,
      memoqFiles: memoqFiles,
      status: "Created",
      cost: "",
      sourceFiles: translateFiles,
      refFiles: referenceFiles,
      // check: false,
      finance: {
        Wordcount: { receivables: 0, payables: 0 },
        Price: { receivables: 0, payables: 0 }
      }
    });
    tasksLength++;
  }
  return tasks;
}

module.exports = { createTasksForWordcount };
