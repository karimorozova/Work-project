const { Projects, Languages, Step, Units } = require("../models");
const { getProject, updateProject } = require("./getProjects");
const { storeFiles } = require("./files");
const { getFinanceDataForPackages } = require("../сalculations/packages");
const { getHoursStepFinanceData } = require("../сalculations/hours");
const { updateProjectMetrics } = require("../projects/metrics");
const { getFittingVendor, checkIsSameVendor } = require('../сalculations/vendor');
const moment = require("moment");
const fs = require("fs");
const ObjectId = require('mongodb').ObjectID;

async function createProject(project) {
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
      moment(new Date()).format("YYYY MM DD") + " " + nextNumber;
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

async function createTasks({ tasksInfo, refFiles }) {
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

/// Creating tasks using info from client request start ///

async function createTasksFromRequest({ project, dataForTasks, isWords }) {
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
    console.log("Error in createTasksFromRequest");
  }
}

function getModifiedFiles(files) {
  if (files && files.length) {
    return files.map(item => {
      item.path = `./dist${item.path}`;
      item.filename = item.fileName;
      return item;
    });
  }
  return [];
}

/// Creating tasks using info from client request end ///

/// Creating tasks for wordcount unit services start ///

async function createTaskWithCommonUnits(newTasksInfo, docs) {
  try {
    const project = await Projects.findOne({ _id: newTasksInfo.projectId });
    await addTasksToProject({ newTasksInfo, project, docs });
    return await getProject({ _id: newTasksInfo.projectId });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithWordsUnit");
  }
}

async function addTasksToProject({ newTasksInfo, project, docs }) {
  try {
    let memoqDocs;
    for (let target of newTasksInfo.targets) {
      memoqDocs = Array.isArray(docs)
        ? docs.filter(({ TargetLangCode }) => TargetLangCode === target.memoq)
        : [docs];
    }
    await updateProjectTasks({ newTasksInfo, project, memoqDocs });
  } catch (err) {
    console.log(err);
    console.log("Error in addTasksToProject");
  }
}

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
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectTasks");
  }
}

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
    let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    let taskId = project.projectId + ` ${idNumber}`;
    let { steps } = service;
    for (let { step } of steps) {
      step.calculationUnit = step.calculationUnit.map(({ steps, ...rest }) => rest);
    }
    tasks.push({
      taskId: taskId,
      service: {
        ...service
      },
      stepsAndUnits,
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
      check: false,
      finance: {
        Wordcount: { receivables: 0, payables: 0 },
        Price: { receivables: 0, payables: 0 }
      }
    });
    tasksLength++;
  }
  return tasks;
}

/// Creating tasks for wordcount unit services end ///
// DONE
async function createTasksAndStepsForCustomUnits(allInfo) {
  const {
    project,
    stepsAndUnits,
  } = allInfo;
  try {
    let steps = [];
    const finance = {
      Wordcount: { receivables: "", payables: "" },
      Price: { receivables: "", payables: "" }
    };
    let tasksWithoutFinance = await getTasksForCustomUnits({
      ...allInfo,
      projectId: project.projectId,
      finance
    });
    if (stepsAndUnits.length === 2) {
      const includesPackage = stepsAndUnits[0].unit === 'Packages' || stepsAndUnits[1].unit === 'Packages';
      if (includesPackage) {
        steps = await getStepsForDuoUnits({ ...allInfo, tasks: tasksWithoutFinance }, 'quantity');
      } else {
        steps = await getStepsForDuoUnits({ ...allInfo, tasks: tasksWithoutFinance }, 'hours');
      }
    } else {
      steps = await getStepsForMonoUnits({ ...allInfo, tasks: tasksWithoutFinance });
    }
    const tasks = tasksWithoutFinance.map(item =>
      getFinanceForCustomUnits(item, steps)
    );
    const projectFinance = getProjectFinance(tasks, project.finance);
    steps = checkIsSameVendor(steps);
    return updateProject(
      { _id: project.id },
      { finance: projectFinance, $push: { tasks: tasks, steps: steps } }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithHoursUnit");
  }
}

//DONE
function getFinanceForCustomUnits(task, steps) {
  const taskSteps = steps.filter(
    item => item.taskId === task.taskId || item.taskId === `${item.taskId} S01`
  );
  const receivables = +taskSteps
    .reduce((acc, cur) => {
      acc += +cur.finance.Price.receivables;
      return acc;
    }, 0)
    .toFixed(2);
  const payables = +taskSteps
    .reduce((acc, cur) => {
      acc += +cur.finance.Price.payables;
      return acc;
    }, 0)
    .toFixed(2);
  return {
    ...task,
    finance: {
      Price: { receivables, payables },
      Wordcount: { receivables: "", payables: "" }
    }
  };
}

//DONE
async function getTasksForCustomUnits(tasksInfo) {
  const {
    stepsAndUnits,
    projectId,
    service,
    targets,
    source,
    stepsDates,
    taskRefFiles,
    finance
  } = tasksInfo;
  const { steps, ...rest } = service;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      targetLanguage: targets[i].symbol,
      sourceLanguage: source.symbol,
      refFiles: taskRefFiles,
      service: {
        ...rest
      },
      stepsAndUnits:
        stepsAndUnits.length === 1 ? stepsAndUnits[0] : stepsAndUnits,
      projectId,
      start: stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      finance,
      status: "Created"
    });
    tasksLength++;
  }
  return tasks;
}

//HALF DONE
async function getStepsForMonoUnits(stepsInfo, common = false) {
  let { tasks, stepsDates, industry } = stepsInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage, ...rest } = task;
    const isObject = typeof stepsAndUnits === "object";
    const isArray = Array.isArray(stepsAndUnits);
    if (!isArray && !isObject) stepsAndUnits = JSON.parse(stepsAndUnits);
    let serviceStep = isArray
      ? stepsAndUnits.find(item => item.hours)
      : stepsAndUnits;
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step } = serviceStep;
    // calculation unit's length is always - 1;
    // const financeData = await getHoursStepFinanceData({
    //   task: tasks[i], serviceStep, project: stepsInfo.project, multiplier: hours * size || 1
    // });
    // TEMPORARY HARDCODE:
    const financeData = {
      receivables: 0,
      payables: 0,
      vendor: await getFittingVendor({ sourceLanguage, targetLanguage, step, industry }),
      vendorRate: 0,
      clientRate: 0
    };
    steps.push({
      ...task,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: stepName,
      vendor: financeData.vendor || null,
      vendorRate: financeData.vendorRate,
      clientRate: financeData.clientRate,
      hours: serviceStep.hours,
      size: serviceStep.size || 1,
      finance: {
        Price: {
          receivables: financeData.receivables,
          payables: financeData.payables
        },
        Wordcount: { receivables: "", payables: "" }
      },
      progress: 0,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
  }
  return steps;
}

async function getStepsForDuoUnits(stepsInfo, key) {
  const { tasks, stepsAndUnits, stepsDates, industry } = stepsInfo;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks.length === 2 ? tasks[i] : tasks[0];
    const stepsIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    let serviceStep = stepsAndUnits[i];
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { sourceLanguage, targetLanguage } = task;
    const { step } = serviceStep;
    // const firstFinanceData = await getHoursStepFinanceData({
    //   //   task, serviceStep: firstServiceStep, project: stepsInfo.project,
    //   //   multiplier: firstStepData.hours * firstStepData.quantity
    //   // });
    //   // const secondFinanceData = await getHoursStepFinanceData({
    //   //   task, serviceStep: secondServiceStep, project: stepsInfo.project,
    //   //   multiplier: secondStepData.hours * secondStepData.quantity
    //   // });
    // TEMPORARY HARDCODE:
    const financeData = {
      receivables: 0,
      payables: 0,
      vendor: await getFittingVendor({ sourceLanguage, targetLanguage, step, industry }),
      vendorRate: 0,
      clientRate: 0,
    };
    steps.push(
      {
        ...task,
        stepId,
        serviceStep,
        name: stepName,
        start: stepsDates[0].start,
        deadline: stepsDates[0].deadline,
        [Object.keys(serviceStep).includes(key) ? key : 'hours']: key === 'quantity' && !!serviceStep.quantity
          ? serviceStep.quantity : serviceStep.hours,
        size: serviceStep.size || 1,
        vendor: financeData.vendor || null,
        vendorRate: financeData.vendorRate,
        clientRate: financeData.clientRate,
        finance: {
          Price: { receivables: financeData.receivables, payables: financeData.payables },
          Wordcount: { receivables: "", payables: "" }
        },
        progress: 0,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      })
  }
  return steps;
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for packages unit services start ///

async function createTasksWithPackagesUnit(allInfo) {
  const { project, service, targets, packageSize, stepsAndUnits, stepsDates, industry } = allInfo;
  try {
    const {
      vendorRate,
      clientRate,
      payables,
      receivables
    } = await getFinanceDataForPackages({ project, service, packageSize, target: targets[0] });
    const finance = { Wordcount: { receivables: "", payables: "" }, Price: { receivables, payables } };
    const tasks = await getTasksForPackages({ ...allInfo, projectId: project.projectId, finance });
    let steps = stepsAndUnits.length === 2 ? await getStepsForDuoStepPackages({
        tasks,
        vendorRate,
        clientRate,
        stepsDates,
        stepsAndUnits,
        industry
      })
      : await getStepsForMonoStepPackages({
        tasks,
        vendorRate,
        clientRate,
        stepsDates,
        industry
      });
    const projectFinance = getProjectFinance(tasks, project.finance);
    steps = checkIsSameVendor(steps);
    return updateProject(
      { _id: project.id },
      { finance: projectFinance, $push: { tasks: tasks, steps: steps } }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithPackagesUnit");
  }
}

async function getTasksForPackages(tasksInfo, common = false) {
  const { stepsAndUnits, projectId, service, targets, source, stepsDates, taskRefFiles, finance } = tasksInfo;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      sourceLanguage: source.symbol,
      targetLanguage: targets[i].symbol,
      refFiles: taskRefFiles,
      service: {
        ...service
      },
      stepsAndUnits:
        stepsAndUnits.length === 1 ? stepsAndUnits[0] : stepsAndUnits,
      languageForm: service.languageForm,
      projectId,
      start: common ? stepsDates[0].start : stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      finance,
      status: "Created"
    });
    tasksLength++;
  }
  return tasks;
}

async function getStepsForDuoStepPackages({ tasks, vendorRate, clientRate, stepsDates, stepsAndUnits, industry }) {
  let counter = 1;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks.length === 2 ? tasks[i] : tasks[0];
    const { stepsAndUnits, sourceLanguage, targetLanguage, ...rest } = task;
    let serviceStep = stepsAndUnits[i];
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step } = serviceStep;
    const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    steps.push({
      ...rest,
      stepId,
      serviceStep,
      name: stepName,
      size: stepsAndUnits[i].size,
      quantity: stepsAndUnits[i].quantity,
      start: stepsDates[i].start,
      deadline: stepsDates[i].deadline,
      vendor: await getFittingVendor({ sourceLanguage, targetLanguage, step, industry }),
      progress: 0,
      clientRate,
      vendorRate,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
    counter++;
  }
  return steps;
}

async function getStepsForMonoStepPackages({ tasks, vendorRate, clientRate, stepsDates, industry }, common = false) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    let { stepsAndUnits, sourceLanguage, targetLanguage, ...rest } = task;
    const isObject = typeof stepsAndUnits === "object";
    const isArray = Array.isArray(stepsAndUnits);
    if (!isArray && !isObject) stepsAndUnits = JSON.parse(stepsAndUnits);
    let serviceStep = isArray
      ? stepsAndUnits.find(item => item.unit === "Packages")
      : stepsAndUnits;
    const stepName = serviceStep.step;
    serviceStep = await gatherServiceStepInfo(serviceStep);
    const { step, size, quantity } = serviceStep;
    steps.push({
      ...task,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: stepName,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      size,
      quantity,
      vendor: await getFittingVendor({ sourceLanguage, targetLanguage, step, industry }),
      progress: 0,
      clientRate,
      vendorRate,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
  }
  return steps;
}

/// Creating tasks for packages unit services end ///

function createProjectFolder(projectId) {
  return new Promise((resolve, reject) => {
    fs.mkdir(`./dist/projectFiles/${projectId}`, err => {
      if (err) reject(err);
      resolve("ok");
    });
  });
}

function getProjectFinance(tasks, projectFinance) {
  const currentReceivables = projectFinance.Price.receivables || 0;
  const currentPayables = projectFinance.Price.payables || 0;
  const receivables = +(
    tasks.reduce((acc, cur) => acc + +cur.finance.Price.receivables, 0) +
    +currentReceivables
  ).toFixed(2);
  const payables = +(
    tasks.reduce((acc, cur) => acc + +cur.finance.Price.payables, 0) +
    +currentPayables
  ).toFixed(2);
  return {
    Price: { receivables, payables },
    Wordcount: { ...projectFinance.Wordcount }
  };
}

const gatherServiceStepInfo = async (serviceStep) => {
  const { _id: stepId } = await Step.findOne({ title: serviceStep.step });
  const { _id: unitId } = await Units.findOne({ type: serviceStep.unit });
  serviceStep.step = ObjectId(stepId);
  serviceStep.unit = ObjectId(unitId);
  return serviceStep;
}

module.exports = {
  createProject,
  createTasks,
  createTasksFromRequest,
  createTaskWithCommonUnits,
};
