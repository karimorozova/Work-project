const { Step, Units } = require('../models');
const ObjectId = require('mongodb').ObjectID;
const fs = require("fs");

const gatherServiceStepInfo = async (serviceStep) => {
  const { _id: stepId } = await Step.findOne({ title: serviceStep.step });
  const { _id: unitId } = await Units.findOne({ type: serviceStep.unit });
  serviceStep.step = ObjectId(stepId);
  serviceStep.unit = ObjectId(unitId);
  return serviceStep;
};

function getProjectFinance (tasks, projectFinance) {
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


function getFinanceForCustomUnits (task, steps) {
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

function getModifiedFiles (files) {
  if (files && files.length) {
    return files.map(item => {
      item.path = `./dist${item.path}`;
      item.filename = item.fileName;
      return item;
    });
  }
  return [];
}

function createProjectFolder (projectId) {
  return new Promise((resolve, reject) => {
    fs.mkdir(`./dist/projectFiles/${projectId}`, err => {
      if (err) reject(err);
      resolve("ok");
    });
  });
}

module.exports = {
  gatherServiceStepInfo,
  getProjectFinance,
  getFinanceForCustomUnits,
  getModifiedFiles,
  createProjectFolder
};
