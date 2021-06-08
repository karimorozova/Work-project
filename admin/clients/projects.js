const { notifyDeliverablesDownloaded } = require('../projects/emails');
const { updateProject } = require('../projects/getProjects');
const { updateWithApprovedTasks } = require('../projects/updates');
const { Clients } = require('../models');


/**
 *
 * @param {Object} task
 * @param {Object} project
 * @param {String} status
 * @returns {Object} - returns an updated project
 */
async function getAfterTaskStatusUpdate({ task, project, status }) {
  let updatedProject = {};
  try {
    // if (status === 'Delivered') {
    //   updatedProject = await setTasksDeliveryStatus({ taskId: task.taskId, project, status });
    //   await notifyDeliverablesDownloaded(task.taskId, project, {firstName: 'Client Manager'});
    // }
    if (status === 'Approved') {
      updatedProject = await getWithApprovedTasks({ taskIds: [task.taskId], project, status });
    }
    if (status === 'Rejected') {
      updatedProject = await getWithRejectedTasks({ taskIds: [task.taskId], project });
    }
    return updatedProject;
  } catch (err) {
    console.log(err);
    console.log("Error in getAfterTaskStatusUpdate");
  }
}

/**
 *
 * @param {Array} taskIds
 * @param {Object} project
 * @returns nothing - just updates project
 */
async function getWithApprovedTasks({ taskIds, project }) {
  try {
    const { tasks, steps } = updateWithApprovedTasks({ taskIds, project });
    return await updateProject({ "_id": project.id }, { tasks, steps });
  } catch (err) {
    console.log(err);
    console.log("Error in getWithApprovedTasks");
  }
}

/**
 *
 * @param {Array} taskIds
 * @param {Object} project
 * @returns nothing - just updates project
 */
async function getWithRejectedTasks({ taskIds, project }) {
  const tasks = project.tasks.map(task => {
    if (taskIds.indexOf(task.taskId) !== -1) {
      task.status = 'Rejected';
    }
    return task;
  });
  try {
    return await updateProject({ "_id": project.id }, { tasks });
  } catch (err) {
    console.log(err);
    console.log("Error in getWithRejectedTasks");
  }
}

/**
 *
 * @param {ObjectId} clientId
 * @param {Date} newDate
 * @returns nothing - just updates needed client
 */
const updateClientProjectDate = async (clientId, newDate) => {
  const { otherInfo } = await Clients.findOne({ _id: clientId });
  let { firstProjectDate } = otherInfo;
  if (firstProjectDate) {
    otherInfo.lastProjectDate = newDate;
  } else {
    otherInfo.firstProjectDate = newDate;
  }
  await Clients.updateOne({ _id: clientId }, { otherInfo });
};

module.exports = { getAfterTaskStatusUpdate, updateClientProjectDate };
