const { Projects } = require('../models');
const { getProject } = require('./getProjects');
const { createTasksWithPackagesUnit } = require('./taskForPackages');
const { createTasksAndStepsForCustomUnits } = require('./taskForCommon');
const { getFittingVendor } = require('../сalculations/vendor');
const { getStepFinanceData } = require('../сalculations/finance');
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

async function getTasksForCustomUnits (tasksInfo) {
  const {
    stepsAndUnits,
    projectId,
    service,
    targets,
    source,
    stepsDates,
    taskRefFiles,
  } = tasksInfo;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      targetLanguage: targets[i].symbol,
      sourceLanguage: source.symbol,
      languageForm: service.languageForm,
      refFiles: taskRefFiles,
      service,
      stepsAndUnits,
      projectId,
      start: stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      finance: {
        Wordcount: { receivables: '', payables: '' },
        Price: { receivables: '', payables: '' }
      },
      status: 'Created'
    });
    tasksLength++;
  }
  return tasks;
}

async function getStepsForDuoUnits (allInfo) {
  const { tasks, stepsAndUnits, stepsDates, industry, customer } = allInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks.length > 1 ? tasks[i] : tasks[0];
    const firstStepIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
    const secondStepIdCounter = i + 2 < 10 ? `S0${i + 2}` : `S${i + 2}`;
    const firstStepId = `${task.taskId} ${firstStepIdCounter}`;
    const secondStepId = `${task.taskId} ${secondStepIdCounter}`;
    const firstServiceStep = stepsAndUnits[0];
    const secondServiceStep = stepsAndUnits[1];
    const firstStep = await createStepForTask(firstServiceStep, task, firstStepId);
    const secondStep = await createStepForTask(secondServiceStep, task, secondStepId);
    steps.push(firstStep, secondStep);
  }
  return steps;

  async function createStepForTask (serviceStep, task, stepId) {
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { title, step } = serviceStep;
    const stepName = title;
    const { sourceLanguage, targetLanguage } = task;
    const key = serviceStep.hasOwnProperty('quantity') ? 'quantity' : 'hours';
    const quantity = serviceStep[key];
    const vendorId = await getFittingVendor({ sourceLanguage, targetLanguage, step, industry });
    const { finance, clientRate, vendorRate, vendor } = await getStepFinanceData({
      customer, industry, serviceStep, task, vendorId, quantity
    });
    return {
      ...task,
      stepId,
      serviceStep,
      name: stepName,
      start: stepsDates[0].start,
      deadline: stepsDates[0].deadline,
      [key]: quantity,
      size: serviceStep.size || 1,
      vendor: ObjectId(vendor),
      vendorRate,
      clientRate,
      finance,
      progress: 0,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false,
    };
  }
}


module.exports = {
  createProject,
  createTasks,
  createTasksFromRequest,
  getTasksForCustomUnits,
  getStepsForDuoUnits
};
