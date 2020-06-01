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
    for (let step of stepsAndUnits) {
      step.unit === 'Hours' ? await createTasksWithHoursUnit(allInfo) : await createTasksWithPackagesUnit(allInfo);
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

async function createTasksWithWordsUnit(newTasksInfo, docs) {
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
    let tasksLength = project.tasks.length + 1;
    for (let target of newTasksInfo.targets) {
      let idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
      let taskId = project.projectId + ` ${idNumber}`;
      const memoqDocs = Array.isArray(docs) ? docs.filter(item => item.TargetLangCode === target.memoq) : [docs];
      await updateProjectTasks({ newTasksInfo, project, taskId, target, memoqDocs });
      tasksLength++;
    }
  } catch (err) {
    console.log(err);
    console.log("Error in addTasksToProject");
  }
}

async function updateProjectTasks({ newTasksInfo, project, taskId, target, memoqDocs }) {
  try {
    const units = JSON.parse(newTasksInfo.stepsAndUnits);
    const allInfo = { ...newTasksInfo, project, taskRefFiles: memoqDocs, stepsDates: newTasksInfo.stepsDates };
    for (let { unit } of units) {
      if (unit === 'Hours') {
        const tasksWithoutFinance = getTasksForHours({ ...allInfo, projectId: project.projectId });
        const steps = await getStepsForHours({ ...allInfo, tasks: tasksWithoutFinance });
        const tasks = tasksWithoutFinance.map(item => getHoursTaskWithFinance(item, steps));
        const projectFinance = getProjectFinance(tasks, project.finance);
        await updateProject({ _id: project.id }, { finance: projectFinance, $push: { steps } });
      } else if (unit === 'Packages') {
        const { service, targets, packageSize } = newTasksInfo;
        const { vendor, vendorRate, clientRate, payables, receivables } = await getFinanceDataForPackages({
          project, service, packageSize, target: targets[0]
        });
        const finance = { Wordcount: { receivables: '', payables: '' }, Price: { receivables, payables } };
        const tasks = getTasksForPackages({ ...allInfo, projectId: project.projectId, finance });
        const steps = getStepsForPackages({ tasks, vendor, vendorRate, clientRate });
        const projectFinance = getProjectFinance(tasks, project.finance);
        await updateProject({ _id: project.id }, { finance: projectFinance, $push: { steps } });
      }
    }
    await Projects.updateOne({ "_id": project._id },
      {
        $set: { isMetricsExist: false },
        $push: {
          tasks: {
            taskId: taskId, service: {
              ...newTasksInfo.service,
              calculationUnit: newTasksInfo.stepsAndUnits
            }, memoqProjectId: newTasksInfo.memoqProjectId,
            start: project.startDate, deadline: project.deadline, stepsDates: newTasksInfo.stepsDates,
            sourceLanguage: newTasksInfo.source.symbol, targetLanguage: target.symbol,
            memoqSource: newTasksInfo.source.memoq, memoqTarget: target.memoq, memoqDocs,
            memoqFiles: newTasksInfo.memoqFiles,
            status: "Created", cost: "", sourceFiles: newTasksInfo.translateFiles,
            refFiles: newTasksInfo.referenceFiles, check: false,
            finance: { 'Wordcount': { receivables: 0, payables: 0 }, 'Price': { receivables: 0, payables: 0 } }
          }
        }
      }
    );
  } catch (err) {
    console.log(err);
    console.log("Error in updateProjectTasks");
  }
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for hours unit services start ///

async function createTasksWithHoursUnit(allInfo) {
  const { project } = allInfo;
  try {
    let tasksWithoutFinance = getTasksForHours({ ...allInfo, projectId: project.projectId });
    const steps = await getStepsForHours({ ...allInfo, tasks: tasksWithoutFinance });
    const tasks = tasksWithoutFinance.map(item => getHoursTaskWithFinance(item, steps));
    const projectFinance = getProjectFinance(tasks, project.finance);
    return updateProject({ "_id": project.id }, { finance: projectFinance, $push: { tasks: tasks, steps: steps } });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithHoursUnit");
  }
}

function getHoursTaskWithFinance(task, steps) {
  const taskSteps = steps.filter(item => item.taskId === task.taskId);
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
      projectId,
      start: stepsDates[0].start,
      deadline: stepsDates[stepsDates.length - 1].deadline,
      status: 'Created'
    });
    tasksLength++;
  }
  return tasks;
}

async function getStepsForHours(stepsInfo) {
  const { tasks } = stepsInfo;
  try {
    const steps = await Promise.all(tasks.map(item => {
      return getHoursTaskSteps(item, stepsInfo);
    }));
    return steps.reduce((acc, cur) => {
      acc.push(...cur);
      return acc;
    }, []);
  } catch (err) {
    console.log(err);
    console.log("Error in getStepsForHours");
  }
}

async function getHoursTaskSteps(task, stepsInfo) {
  let steps = [];
  try {
    for (let i = 0; i < stepsInfo.stepsDates.length; i++) {
      const stepsIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
      const serviceStep = task.service.steps[i].step;
      const hours = +stepsInfo[`${serviceStep.symbol}-hours`];
      const quantity = +stepsInfo[`${serviceStep.symbol}-quantity`];
      const financeData = await getHoursStepFinanceData({
        task, serviceStep, project: stepsInfo.project, multiplier: hours * quantity
      });
      steps.push({
        ...task,
        stepId: `${task.taskId} ${stepsIdCounter}`,
        serviceStep,
        name: task.service.steps[i].step.title,
        start: stepsInfo.stepsDates[i].start,
        deadline: stepsInfo.stepsDates[i].deadline,
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
  } catch (err) {
    console.log(err);
    console.log("Error in getHoursTaskSteps");
  }
}

/// Creating tasks for wordcount unit services end ///

/// Creating tasks for packages unit services start ///

async function createTasksWithPackagesUnit(allInfo) {
  const { project, service, targets, packageSize } = allInfo;
  try {
    const { vendor, vendorRate, clientRate, payables, receivables } = await getFinanceDataForPackages({
      project, service, packageSize, target: targets[0]
    });
    const finance = { Wordcount: { receivables: "", payables: "" }, Price: { receivables, payables } };
    const tasks = getTasksForPackages({ ...allInfo, projectId: project.projectId, finance });
    const steps = getStepsForPackages({ tasks, vendor, vendorRate, clientRate });
    const projectFinance = getProjectFinance(tasks, project.finance);
    return updateProject({ "_id": project.id }, { finance: projectFinance, $push: { tasks: tasks, steps: steps } });
  } catch (err) {
    console.log(err);
    console.log("Error in createTasksWithPackagesUnit");
  }
}

function getTasksForPackages(tasksInfo) {
  const { stepsAndUnits, projectId, service, targets, packageSize, quantity, stepsDates, taskRefFiles, finance } = tasksInfo;
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < quantity; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      targetLanguage: targets[0].symbol,
      packageSize,
      refFiles: taskRefFiles,
      service: {
        ...service,
        calculationUnit: stepsAndUnits,
      },
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

function getStepsForPackages({ tasks, vendor, vendorRate, clientRate }) {
  let counter = 1;
  return tasks.reduce((acc, cur) => {
    const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    acc.push({
      ...cur,
      stepId: `${cur.taskId} ${stepsIdCounter}`,
      serviceStep: cur.service.steps[0].step,
      name: cur.service.steps[0].step.title,
      vendor,
      progress: 0,
      clientRate,
      vendorRate,
      check: false,
      vendorsClickedOffer: [],
      isVendorRead: false
    });
    return [...acc];
  }, []);
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
  const receivables = +(tasks.reduce((acc, cur) => acc + cur.finance.Price.receivables, 0) + currentReceivables).toFixed(2);
  const payables = +(tasks.reduce((acc, cur) => acc + cur.finance.Price.payables, 0) + currentPayables).toFixed(2);
  return {
    Price: { receivables, payables },
    Wordcount: { ...projectFinance.Wordcount }
  };
}

module.exports = { createProject, createTasks, createTasksFromRequest, createTasksWithWordsUnit };
