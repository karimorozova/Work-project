const { Projects } = require("../models");
const { getProject, updateProject } = require("./getProjects");
const { storeFiles } = require("./files");
const { getFinanceDataForPackages } = require("../сalculations/packages");
const { getHoursStepFinanceData } = require("../сalculations/hours");
const moment = require("moment");
const fs = require("fs");

async function createProject(project) {
  let todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  let todayEnd = new Date(todayStart);
  todayEnd.setUTCHours(23, 59, 59, 0);
  try {
    const todaysProjects = await Projects.find({ "startDate": { $gte: todayStart, $lt: todayEnd } });
    const nextNumber = (todaysProjects.length < 10) ? '[0' + (todaysProjects.length + 1) + ']' : '[' + (todaysProjects.length + 1) + ']';
    project.status = project.status || "Draft";
    project.projectId = moment(new Date()).format("YYYY MM DD") + ' ' + nextNumber;
    const createdProject = await Projects.create({ ...project, startDate: new Date() });
    await createProjectFolder(createdProject.id);
    return await getProject({ "_id": createdProject.id });
  } catch (err) {
    console.log(err);
    console.log('Error in createProject');
  }
}

async function createTasks({ tasksInfo, refFiles }) {
  try {
    const stepsAndUnits = JSON.parse(tasksInfo.stepsAndUnits);
    const stepsDates = JSON.parse(tasksInfo.stepsDates);
    const project = await getProject({ "_id": tasksInfo.projectId });
    const taskRefFiles = await storeFiles(refFiles, tasksInfo.projectId);
    const allInfo = { ...tasksInfo, taskRefFiles, stepsDates, project };
    const packages = [];
    const others = [];
    for (let unit of stepsAndUnits) {
      if (unit.unit === 'Packages') {
        packages.push(unit);
      } else {
        others.push(unit);
      }
    }
    if (!!packages.length) {
      await createTasksWithPackagesUnit({ ...allInfo, stepsAndUnits: packages });
    }
    if (!!others.length) {
      await createTasksWithHoursUnit({ ...allInfo, stepsAndUnits: others });
    }
    return await getProject({ "_id": tasksInfo.projectId });
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
      newTasksInfo.referenceFiles = refFiles.length ? await storeFiles(refFiles, project.id) : [];
      return { project, newTasksInfo };
    } else {
      const taskRefFiles = await storeFiles(refFiles, project.id);
      const allInfo = { ...dataForTasks, taskRefFiles, project };
      for (let step of stepsAndUnits) {
        step.unit === 'Hours' ? await createTasksWithHoursUnit(allInfo) : await createTasksWithPackagesUnit(allInfo);
      }
    }
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
    const project = await Projects.findOne({ "_id": newTasksInfo.projectId });
    await addTasksToProject({ newTasksInfo, project, docs });
    return await getProject({ "_id": newTasksInfo.projectId });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithWordsUnit");
  }
}

async function addTasksToProject({ newTasksInfo, project, docs }) {
  try {
    let memoqDocs;
    for (let target of newTasksInfo.targets) {
      memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === target.memoq) : [docs];
    }
    await updateProjectTasks({ newTasksInfo, project, memoqDocs });
  } catch (err) {
    console.log(err);
    console.log("Error in addTasksToProject");
  }
}

async function updateProjectTasks(taskData) {
  const { newTasksInfo, project, memoqDocs } = taskData;
  try {
    const units = JSON.parse(newTasksInfo.stepsAndUnits);
    const allInfo = { ...newTasksInfo, project, taskRefFiles: memoqDocs, stepsDates: newTasksInfo.stepsDates };
    for (let { unit } of units) {
      if (newTasksInfo.stepsAndUnits.length === 2 && unit === 'Hours') {
        const tasksWithoutFinance = getTasksForHours({ ...allInfo, projectId: project.projectId });
        const steps = await getStepsForDuoStepHours({ ...allInfo, tasks: tasksWithoutFinance });
        const tasks = tasksWithoutFinance.map(item => getHoursTaskWithFinance(item, steps));
        const projectFinance = getProjectFinance(tasks, project.finance);
        await updateProject({ _id: project.id }, { finance: projectFinance, $push: { steps } });
      } else if (newTasksInfo.stepsAndUnits.length === 2 && unit === 'Packages') {
        const { service, targets, packageSize } = newTasksInfo;
        const { vendor, vendorRate, clientRate, payables, receivables } = await getFinanceDataForPackages({
          project, service, packageSize, target: targets[0]
        });
        const finance = { Wordcount: { receivables: '', payables: '' }, Price: { receivables, payables } };
        const tasks = getTasksForPackages({ ...allInfo, projectId: project.projectId, finance });
        const steps = getStepsForDuoStepPackages({ tasks, vendor, vendorRate, clientRate });
        const projectFinance = getProjectFinance(tasks, project.finance);
        await updateProject({ _id: project.id }, { finance: projectFinance, $push: { steps } });
      }
    }
    const tasks = getWordCountTasks(taskData);
    await Projects.updateOne({ "_id": project._id },
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
  const { service, stepsAndUnits, memoqProjectId,
    stepsDates, source, targets, memoqFiles, translateFiles, referenceFiles } = newTasksInfo;
  const tasks = [];
  let tasksLength = project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    let taskId = project.projectId + ` ${idNumber}`;
    tasks.push({
      taskId: taskId,
      service: {
        ...service,
        calculationUnit: stepsAndUnits
      },
      stepsAndUnits,
      memoqProjectId: memoqProjectId,
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
      refFiles: referenceFiles, check: false,
      finance: { 'Wordcount': { receivables: 0, payables: 0 }, 'Price': { receivables: 0, payables: 0 } }
    });
    tasksLength++;
  }
  return tasks;
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for hours unit services start ///

async function createTasksWithHoursUnit(allInfo) {
  const { project, stepsAndUnits } = allInfo;
  try {
    let tasksWithoutFinance = getTasksForHours({ ...allInfo, projectId: project.projectId });
    const steps = stepsAndUnits.length === 2 ?
      await getStepsForDuoStepHours({ ...allInfo, tasks: tasksWithoutFinance })
      : await getStepsForMonoStepHours({ ...allInfo, tasks: tasksWithoutFinance });
    const tasks = tasksWithoutFinance.map(item => getHoursTaskWithFinance(item, steps));
    const projectFinance = getProjectFinance(tasks, project.finance);
    return updateProject({ "_id": project.id }, { finance: projectFinance, $push: { tasks: tasks, steps: steps } });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithHoursUnit");
  }
}

function getHoursTaskWithFinance(task, steps) {
  const taskSteps = steps.filter(item => item.taskId === task.taskId || item.taskId === `${item.taskId} S01`);
  const receivables = +taskSteps.reduce((acc, cur) => {
    acc += +cur.finance.Price.receivables;
    return acc;
  }, 0).toFixed(2);
  const payables = +taskSteps.reduce((acc, cur) => {
    acc += +cur.finance.Price.payables;
    return acc;
  }, 0).toFixed(2);
  return {
    ...task,
    finance: { Price: { receivables, payables }, Wordcount: { receivables: "", payables: "" } }
  };
}

function getTasksForHours(tasksInfo) {
  const { stepsAndUnits, projectId, service, targets, source, stepsDates, taskRefFiles } = tasksInfo;
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
        ...service,
        calculationUnit: stepsAndUnits,
      },
      stepsAndUnits,
      projectId,
      start: stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      status: 'Created'
    });
    tasksLength++;
  }
  return tasks;
}

async function getStepsForDuoStepHours(stepsInfo) {
  const { tasks, stepsAndUnits } = stepsInfo;
  let counter = 1;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const stepsIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    const firstServiceStep = task.service.steps[0].step;
    const secondServiceStep = task.service.steps[1].step;
    const firstStepData = stepsAndUnits[0];
    const secondStepData = stepsAndUnits[1];
    const firstFinanceData = await getHoursStepFinanceData({
      task, serviceStep: firstServiceStep, project: stepsInfo.project,
      multiplier: firstStepData.hours * firstStepData.quantity
    });
    const secondFinanceData = await getHoursStepFinanceData({
      task, serviceStep: secondServiceStep, project: stepsInfo.project,
      multiplier: secondStepData.hours * secondStepData.quantity
    });
    steps.push(
      {
        ...tasks[i],
        stepId,
        serviceStep: firstServiceStep,
        name: firstServiceStep.title,
        start: stepsInfo.stepsDates[0].start,
        deadline: stepsInfo.stepsDates[0].deadline,
        hours: firstStepData.hours,
        quantity: firstStepData.quantity,
        vendor: firstFinanceData.vendor || null,
        vendorRate: firstFinanceData.vendorRate,
        clientRate: firstFinanceData.clientRate,
        finance: {
          Price: { receivables: firstFinanceData.receivables, payables: firstFinanceData.payables },
          Wordcount: { receivables: "", payables: "" }
        },
        progress: 0,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      },
      {
        ...tasks[i],
        stepId: stepId + '.1',
        serviceStep: secondServiceStep,
        name: secondServiceStep.title,
        start: stepsInfo.stepsDates[1].start,
        deadline: stepsInfo.stepsDates[1].deadline,
        hours: secondStepData.hours,
        quantity: secondStepData.quantity,
        vendor: secondFinanceData.vendor || null,
        vendorRate: secondFinanceData.vendorRate,
        clientRate: secondFinanceData.clientRate,
        finance: {
          Price: { receivables: secondFinanceData.receivables, payables: secondFinanceData.payables },
          Wordcount: { receivables: "", payables: "" }
        },
        progress: 0,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      }
    );
    counter++;
  }
  return steps;
}

async function getStepsForMonoStepHours(stepsInfo) {
  const { tasks } = stepsInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const serviceStep = task.service.steps[0].step;
    const stepUnit = task.stepsAndUnits[0];
    const hours = stepUnit.hours;
    const quantity = stepUnit.quantity;
    const financeData = await getHoursStepFinanceData({
      task, serviceStep, project: stepsInfo.project, multiplier: hours * quantity
    });
    steps.push({
      ...tasks[i],
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: serviceStep.title,
      hours,
      quantity,
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
      isVendorRead: false
    });
  }
  return steps;
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for packages unit services start ///

async function createTasksWithPackagesUnit(allInfo) {
  const { project, service, targets, packageSize, stepsAndUnits } = allInfo;
  try {
    const { vendor, vendorRate, clientRate, payables, receivables } = await getFinanceDataForPackages({
      project, service, packageSize, target: targets[0]
    });
    const finance = { Wordcount: { receivables: "", payables: "" }, Price: { receivables, payables } };
    const tasks = getTasksForPackages({ ...allInfo, projectId: project.projectId, finance });
    const steps = stepsAndUnits.length === 2 ?
      getStepsForDuoStepPackages({ tasks, vendor, vendorRate, clientRate })
      : getStepsForMonoStepPackages({ tasks, vendor, vendorRate, clientRate });
    const projectFinance = getProjectFinance(tasks, project.finance);
    return updateProject({ "_id": project.id }, { finance: projectFinance, $push: { tasks: task, steps: steps } });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithPackagesUnit");
  }
}

function getTasksForPackages(tasksInfo) {
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
        ...service,
        calculationUnit: stepsAndUnits,
      },
      languageForm: service.languageForm,
      projectId,
      start: stepsDates[0].start || tasksInfo.project.startDate,
      deadline: stepsDates[0].deadline || tasksInfo.project.deadline,
      finance,
      status: 'Created'
    });
    tasksLength++;
  }
  return tasks;
}

function getStepsForDuoStepPackages({ tasks, vendor, vendorRate, clientRate }) {
  let counter = 1;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const stepId = `${tasks[i].taskId} ${stepsIdCounter}`;
    steps.push(
      {
        ...tasks[i],
        stepId,
        serviceStep: tasks[i].service.steps[0].step,
        name: tasks[i].service.steps[0].step.title,
        packageSize: tasks[i].service.calculationUnit[0].packageSize,
        quantity: tasks[i].service.calculationUnit[0].quantity,
        calculationUnit: tasks[i].service.calculationUnit,
        vendor,
        progress: 0,
        clientRate,
        vendorRate,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      },
      {
        ...tasks[i],
        stepId: stepId + '.1',
        serviceStep: tasks[i].service.steps[1].step,
        name: tasks[i].service.steps[1].step.title,
        packageSize: tasks[i].service.calculationUnit[1].packageSize,
        quantity: tasks[i].service.calculationUnit[1].quantity,
        calculationUnit: tasks[i].service.calculationUnit,
        vendor,
        progress: 0,
        clientRate,
        vendorRate,
        check: false,
        vendorsClickedOffer: [],
        isVendorRead: false,
      }
    );
  }
  counter++;
  return steps;
}

function getStepsForMonoStepPackages({ tasks, vendor, vendorRate, clientRate }) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    steps.push({
      ...tasks[i],
      stepId: `${tasks[i].taskId} S01`,
      serviceStep: tasks[i].service.steps[0].step,
      name: tasks[i].service.steps[0].step.title,
      packageSize: tasks[i].service.calculationUnit[0].packageSize,
      quantity: tasks[i].service.calculationUnit[0].quantity,
      calculationUnit: tasks[i].service.calculationUnit,
      vendor,
      progress: 0,
      clientRate,
      vendorRate,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false,
    });
  }
  return steps;
}

/// Creating tasks for packages unit services end ///

function createProjectFolder(projectId) {
  return new Promise((resolve, reject) => {
    fs.mkdir(`./dist/projectFiles/${projectId}`, (err) => {
      if (err) reject(err);
      resolve('ok');
    });
  });
}

function getProjectFinance(tasks, projectFinance) {
  const currentReceivables = projectFinance.Price.receivables || 0;
  const currentPayables = projectFinance.Price.payables || 0;
  const receivables = +(tasks.reduce((acc, cur) => acc + +cur.finance.Price.receivables, 0) + +currentReceivables).toFixed(2);
  const payables = +(tasks.reduce((acc, cur) => acc + +cur.finance.Price.payables, 0) + +currentPayables).toFixed(2);
  return {
    Price: { receivables, payables },
    Wordcount: { ...projectFinance.Wordcount }
  };
}

module.exports = { createProject, createTasks, createTasksFromRequest, createTaskWithCommonUnits };
