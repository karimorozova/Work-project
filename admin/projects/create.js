const { Projects, Clients, Pricelist, Languages, Step, Units, CurrencyRatio } = require("../models");
const { getProject, updateProject } = require("./getProjects");
const { storeFiles } = require("./files");
const { getFinanceDataForPackages } = require("../сalculations/packages");
const { getHoursStepFinanceData } = require("../сalculations/hours");
const { updateProjectMetrics } = require("../projects/metrics");
const { multiplyPrices } = require('../multipliers');
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
    // project = await getProjectFinanceData(project);
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

const getProjectFinanceData = async (project) => {
  const { customer, steps, industry } = project;
  const client = await Clients.findOne({ _id: customer });
  const currencyRatio = await CurrencyRatio.findOne();
  const { rates, defaultPricelist, currency } = client;
  const pricelist = await Pricelist.findOne({ _id: defaultPricelist });
  for (let { serviceStep, finance, sourceLanguage, targetLanguage, ...rest } of steps) {
    const { step, unit, size } = serviceStep;
    const dataForComparison = {
      sourceLanguage,
      targetLanguage,
      step,
      unit,
      size,
      industry,
      currency
    }
    let row = getPriceFromClientRates(rates.pricelistTable, dataForComparison);
    if (!row) {
      row = getPriceFromPricelist(pricelist, dataForComparison, currencyRatio);
    }
    finance.rate = row;
    if (rest.memoqProjectId) {
      // finance['Quantity(relative)'] = request for matrix
      finance['Quantity(total)'] = rest.totalWords;
    }
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
    const sourceLanguage = await Languages.findOne({ symbol: source.symbol });
    const targetLanguage = await Languages.findOne({ symbol: targets[i].symbol });
    const taskId = projectId + ` ${idNumber}`;
    tasks.push({
      taskId,
      targetLanguage,
      sourceLanguage,
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
  let { tasks, stepsDates } = stepsInfo;
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    let { stepsAndUnits, ...rest } = tasks[i];
    const isObject = typeof stepsAndUnits === "object";
    const isArray = Array.isArray(stepsAndUnits);
    if (!isArray && !isObject) stepsAndUnits = JSON.parse(stepsAndUnits);
    let serviceStep = isArray
      ? stepsAndUnits.find(item => item.hours)
      : stepsAndUnits;
    serviceStep = gatherServiceStepInfo(serviceStep);
    // calculation unit's length is always - 1;
    const hours = serviceStep.hours;
    const size = serviceStep.size || null;
    // const financeData = await getHoursStepFinanceData({
    //   task, serviceStep, project: stepsInfo.project, multiplier: hours * size || 1
    // });
    // TEMPORARY HARDCODE:
    const financeData = {
      receivables: 0,
      payables: 0,
      vendor: null,
      vendorRate: 0,
      clientRate: 0
    };
    steps.push({
      ...rest,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: serviceStep.step,
      vendor: financeData.vendor || null,
      vendorRate: financeData.vendorRate,
      clientRate: financeData.clientRate,
      hours,
      size,
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
  const { tasks, stepsAndUnits, stepsDates } = stepsInfo;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks[i];
    const stepsIdCounter = i + 1 < 10 ? `S0${i + 1}` : `S${i + 1}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    let serviceStep = stepsAndUnits[i];
    serviceStep = gatherServiceStepInfo(serviceStep);
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
      vendor: null,
      vendorRate: 0,
      clientRate: 0,
    };
    steps.push(
      {
        ...task,
        stepId,
        serviceStep,
        name: serviceStep.step,
        start: stepsDates[0].start,
        deadline: stepsDates[0].deadline,
        [Object.keys(serviceStep).includes(key) ? key : 'hours']: key === 'quantity' && !!serviceStep.quantity
          ? serviceStep.quantity : serviceStep.hours,
        size: serviceStep.size || null,
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
  const {
    project,
    service,
    targets,
    packageSize,
    stepsAndUnits,
    stepsDates
  } = allInfo;
  try {
    const {
      vendor,
      vendorRate,
      clientRate,
      payables,
      receivables
    } = await getFinanceDataForPackages({
      project,
      service,
      packageSize,
      target: targets[0]
    });
    const finance = {
      Wordcount: { receivables: "", payables: "" },
      Price: { receivables, payables }
    };
    const tasks = await getTasksForPackages({
      ...allInfo,
      projectId: project.projectId,
      finance
    });
    const steps =
      stepsAndUnits.length === 2
        ? getStepsForDuoStepPackages({
          tasks,
          vendor,
          vendorRate,
          clientRate,
          stepsDates,
          stepsAndUnits
        })
        : getStepsForMonoStepPackages({
          tasks,
          vendor,
          vendorRate,
          clientRate,
          stepsDates
        });
    const projectFinance = getProjectFinance(tasks, project.finance);
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
  let tasks = [];
  let tasksLength = tasksInfo.project.tasks.length + 1;
  for (let i = 0; i < targets.length; i++) {
    const idNumber = tasksLength < 10 ? `T0${tasksLength}` : `T${tasksLength}`;
    const taskId = projectId + ` ${idNumber}`;
    const sourceLanguage = await Languages.findOne({ symbol: source.symbol });
    const targetLanguage = await Languages.findOne({ symbol: targets[i].symbol });
    tasks.push({
      taskId,
      sourceLanguage,
      targetLanguage,
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

function getStepsForDuoStepPackages({ tasks, vendor, vendorRate, clientRate, stepsDates, stepsAndUnits }) {
  let counter = 1;
  const steps = [];
  for (let i = 0; i < stepsAndUnits.length; i++) {
    const task = tasks.length === 2 ? tasks[i] : tasks[0];
    const { stepsAndUnits, ...rest } = task;
    let serviceStep = stepsAndUnits[i];
    serviceStep = gatherServiceStepInfo(serviceStep);
    const stepsIdCounter = counter < 10 ? `S0${counter}` : `S${counter}`;
    const stepId = `${task.taskId} ${stepsIdCounter}`;
    steps.push({
      ...rest,
      stepId,
      serviceStep,
      name: stepsAndUnits[i].step,
      size: stepsAndUnits[i].size,
      quantity: stepsAndUnits[i].quantity,
      start: stepsDates[i].start,
      deadline: stepsDates[i].deadline,
      vendor,
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

function getStepsForMonoStepPackages(
  { tasks, vendor, vendorRate, clientRate, stepsDates },
  common = false
) {
  const steps = [];
  for (let i = 0; i < tasks.length; i++) {
    let { stepsAndUnits, ...rest } = tasks[i];
    const isObject = typeof stepsAndUnits === "object";
    const isArray = Array.isArray(stepsAndUnits);
    if (!isArray && !isObject) stepsAndUnits = JSON.parse(stepsAndUnits);
    let serviceStep = isArray
      ? stepsAndUnits.find(item => item.unit === "Packages")
      : stepsAndUnits;
    serviceStep = gatherServiceStepInfo(serviceStep);
    const size = serviceStep.size;
    const quantity = serviceStep.quantity;
    steps.push({
      ...rest,
      stepId: `${tasks[i].taskId} S01`,
      serviceStep,
      name: serviceStep.step,
      start: common ? stepsDates[1].start : stepsDates[0].start,
      deadline: common ? stepsDates[1].deadline : stepsDates[0].deadline,
      size,
      quantity,
      vendor,
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

const gatherServiceStepInfo = async (serviceStep) => ({
  step: await Step.findOne({ title: serviceStep.title }),
  unit: await Units.findOne({ type: serviceStep.unit }),
  ...serviceStep
})

const getPriceFromClientRates = (pricelistTable, data) => {
  const { sourceLanguage, targetLanguage, step, unit, size } = data;
  return pricelistTable.find(row => (
    row.sourceLanguage.toString() === sourceLanguage.toString() &&
    row.targetLanguage.toString() === targetLanguage.toString() &&
    row.step.toString() === step.toString() &&
    row.unit.toString() === unit.toString() &&
    row.size.toString === size.toString()
  ));
}

const getPriceFromPricelist = (pricelist, data, currencyRatio) => {
  const { basicPricesTable, stepMultipliersTable, industryMultipliersTable } = pricelist;
  const { sourceLanguage, targetLanguage, step, unit, size, industry, currency } = data;
  let row = basicPricesTable.find(langPair => (
    `${langPair.sourceLanguage} ${langPair.targetLanguage}` === `${sourceLanguage} ${targetLanguage}`
  ));
  if (!row) row = {
    euroBasicPrice: 1,
    usdBasicPrice: currencyRatio.USD,
    gbpBasicPrice: currencyRatio.GBP
  };
  const { multiplier: stepMultiplier } = stepMultipliersTable.find(item => (
    `${item.step} ${item.unit} ${item.size}` === `${step} ${unit} ${size}`
  ));
  const { multiplier: industryMultiplier } = industryMultipliersTable.find(item => (
    item.industry.toString() === industry.toString()
  ));
  const basicPrice = getCorrectBasicPrice(row, currency);
  return multiplyPrices(basicPrice, stepMultiplier, industryMultiplier);
}

const getCorrectBasicPrice = (basicPriceRow, currency) => {
  if (currency === 'USD') return basicPriceRow.usdBasicPrice;
  else if (currency === 'EUR') return basicPriceRow.euroBasicPrice;
  else return basicPriceRow.gbpBasicPrice;
}

module.exports = {
  createProject,
  createTasks,
  createTasksFromRequest,
  createTaskWithCommonUnits
};
