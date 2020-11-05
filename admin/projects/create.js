const { Projects } = require('../models');
const { getProject } = require('./getProjects');
const { createTasksWithPackagesUnit } = require('./taskForPackages');
const { createTasksAndStepsForCustomUnits } = require('./taskForCommon');
// const { getFittingVendor } = require('../сalculations/vendor');
// const { getStepFinanceData } = require('../сalculations/finance');
const { storeFiles } = require('./files');
const { getModifiedFiles, createProjectFolder, gatherServiceStepInfo } = require('./helpers');

const moment = require('moment');

async function createProject (project) {
  let todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  let todayEnd = new Date(todayStart);
  todayEnd.setUTCHours(23, 59, 59, 0);
  try {
    const todaysProjects = await Projects.find({
      startDate: { $gte: todayStart, $lt: todayEnd }
    });
    const nextNumber =
      todaysProjects.length < 10
        ? "[0" + (todaysProjects.length + 1) + "]"
        : "[" + (todaysProjects.length + 1) + "]";
    project.status = project.status || "Draft";
    project.projectId =
      "Png " + moment(new Date()).format("YYYY MM DD") + " " + nextNumber;
    const createdProject = await Projects.create({
      ...project,
      startDate: new Date()
    });
    await createProjectFolder(createdProject.id);
    return await getProject({ _id: createdProject.id });
  } catch (err) {
    console.log(err);
    console.log("Error in createProject");
  }
}

async function createTasks ({ tasksInfo, refFiles }) {
  try {
    const stepsAndUnits = JSON.parse(tasksInfo.stepsAndUnits);
    const stepsDates = JSON.parse(tasksInfo.stepsDates);
    const project = await getProject({ _id: tasksInfo.projectId });
    const taskRefFiles = await storeFiles(refFiles, tasksInfo.projectId);
    const allInfo = {
      ...tasksInfo,
      taskRefFiles,
      stepsAndUnits,
      stepsDates,
      project
    };
    if (stepsAndUnits.length === 2) {
      const onlyPackages = stepsAndUnits.every(
        ({ unit }) => unit === "Packages"
      );
      if (!onlyPackages) {
        await createTasksAndStepsForCustomUnits(allInfo);
      } else {
        await createTasksWithPackagesUnit(allInfo);
      }
    } else {
      const [{ unit }] = stepsAndUnits;
      if (unit !== "Packages") {
        await createTasksAndStepsForCustomUnits(allInfo);
      } else {
        await createTasksWithPackagesUnit(allInfo);
      }
    }
    return await getProject({ _id: tasksInfo.projectId });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasks");
  }
}

async function createTasksFromRequest ({ project, dataForTasks, isWords }) {
  const stepsAndUnits = JSON.parse(dataForTasks.stepsAndUnits);
  let newTasksInfo = { ...dataForTasks };
  const sourceFiles = getModifiedFiles(project.sourceFiles);
  const refFiles = getModifiedFiles(project.refFiles);
  try {
    if (isWords) {
      newTasksInfo.translateFiles = await storeFiles(sourceFiles, project.id);
      newTasksInfo.referenceFiles = refFiles.length
        ? await storeFiles(refFiles, project.id)
        : [];
      return { project, newTasksInfo };
    } else {
      const taskRefFiles = await storeFiles(refFiles, project.id);
      const allInfo = { ...dataForTasks, taskRefFiles, project, stepsAndUnits };
      if (stepsAndUnits.length === 2) {
        const isOnlyPackages =
          stepsAndUnits[0].unit === "Packages" &&
          stepsAndUnits[1].unit === "Packages";
        if (!isOnlyPackages) {
          await createTasksAndStepsForCustomUnits(allInfo);
        } else {
          await createTasksWithPackagesUnit(allInfo);
        }
      } else {
        const isPackage = stepsAndUnits[0].unit === "Packages";
        if (!isPackage) {
          await createTasksAndStepsForCustomUnits(allInfo);
        } else {
          await createTasksWithPackagesUnit(allInfo);
        }
      }
    }
    return await getProject({ _id: project.projectId });
  } catch (err) {
    console.log(err);
    console.log('Error in createTasksFromRequest');
  }
}


module.exports = {
  createProject,
  createTasks,
  createTasksFromRequest
};
