const { payablesCalc, returnVendorRate } = require('../сalculations/wordcount');
const { stepMiddleAssignNotification, stepMiddleReassignedNotification } = require('../utils');
const { assignedDefaultTranslator } = require('../services/memoqs/projects');
const { Units } = require('../models');

async function reassignVendor(project, reassignData) {
	const allUnits = await Units.find();
	try {
		const { step, vendor, isStart, isPay, reason, progress } = reassignData;
		let { steps, tasks } = project;
		const stepForUpdatedStep = steps.find(item => item.stepId === reassignData.step.stepId);
		let taskIndex = tasks.findIndex(item => item.taskId === step.taskId);

		const newStep = await getNewStep({ isStart, progress, step, vendor, project, task: tasks[taskIndex], allUnits });
		const updatedStep = updateCurrentStep({ step: stepForUpdatedStep, isStart, isPay, progress, allUnits });

		const updatedIndex = steps.findIndex(item => item.stepId === step.stepId);
		updatedStep.stepId = updatedStep.stepId + '-Canceled';

		steps.splice(updatedIndex, 1, updatedStep, newStep);

		//MM
		// await updateMemoqProjectUsers(steps);
		await assignedDefaultTranslator(tasks[taskIndex].memoqProjectId, newStep);
		tasks[taskIndex].finance.Price = getTaskFinance(steps, tasks[taskIndex].taskId);
		tasks[taskIndex].status = "In progress";
		await stepMiddleReassignedNotification(updatedStep, reason, isPay);
		await stepMiddleAssignNotification(newStep, isStart);

		return { steps, tasks };

	} catch (err) {
		console.log(err);
		console.log("Error in reassignVendor");
	}
}

function updateCurrentStep({ step, isStart, isPay, progress, allUnits }) {
	let updatedStep = step;
	const { payables, receivables } = updatedStep.finance.Price;

	if(+progress) {
		updatedStep.status = "Cancelled Halfway";
		calculateFinancePriceForOldStep('halfReceivables', 'halfPayables');
	} else {
		updatedStep.status = "Cancelled";
		calculateFinancePriceForOldStep('receivables', 'payables');
	}

	updatedStep.progress = getUpdatedStepProgress(updatedStep, progress, allUnits);

	function calculateFinancePriceForOldStep(typeClient, typeVendor) {
		switch (true) {
			case !isStart && isPay:
				updatedStep.finance.Price[typeClient] = +(receivables * progress / 100).toFixed(2);
				updatedStep.finance.Price[typeVendor] = +(payables * progress / 100).toFixed(2);
				break;
			case isStart && isPay:
				updatedStep.finance.Price[typeClient] = 0;
				updatedStep.finance.Price[typeVendor] = +(payables * progress / 100).toFixed(2);
				break;
			case !isStart && !isPay:
				updatedStep.finance.Price[typeClient] = +(receivables * progress / 100).toFixed(2);
				updatedStep.finance.Price[typeVendor] = 0;
				break;
			case isStart && !isPay:
				updatedStep.finance.Price[typeClient] = 0;
				updatedStep.finance.Price[typeVendor] = 0;
				break;
		}
	}

	return updatedStep;
}

function getUpdatedStepProgress(step, progress, allUnits) {
	const { type } = allUnits.find(item => item._id.toString() === step.serviceStep.unit.toString());
	if(type === "CAT Wordcount") {
		let updatedProgress = { ...step.progress };
		updatedProgress.wordsDone = +(progress * step.progress.totalWordCount / 100).toFixed(2);
		return updatedProgress;
	}
	return progress;
}

async function getNewStep({ step, vendor, isStart, progress, project, task, allUnits }) {
	const { _id, ...stepInfo } = { ...step };
	const stepId = step.stepId + '-R';
	let newStep = {
		...stepInfo,
		stepId,
		status: 'Created',
		vendor,
		vendorsClickedOffer: [],
		isVendorRead: false,
		progress: getNewStepProgress(step, progress, isStart, allUnits)
	};

	const stepWithPaybles = await getStepPayablesAssigment({ task, step: newStep, project, allUnits });
	if(!isStart && progress > 0) {
		return updateFinanceForNewStep(stepWithPaybles, progress);
	}
	return stepWithPaybles;
}

function getNewStepProgress(step, progress, isStart, allUnits) {
	const { type } = allUnits.find(item => item._id.toString() === step.serviceStep.unit);
	if(!isStart) {
		return getUpdatedStepProgress(step, progress, allUnits);
	}
	let newProgress = 0;
	if(type === "CAT Wordcount") {
		newProgress = { ...step.progress, wordsDone: 0 }
	}
	return newProgress;
}

async function getStepPayablesAssigment({ task, step, project, allUnits }) {
	const { type } = allUnits.find(item => item._id.toString() === step.serviceStep.unit);
	if(type === 'CAT Wordcount') {
		return await payablesCalc({ metrics: task.metrics, project, step });
	} else {
		const rate = await returnVendorRate(step, project);
		step.finance.Price.payables = +(type === 'Hours' ? step.hours : step.quantity * rate.value).toFixed(2);
		return {
			...step,
			vendorRate: rate,
		};
	}
}

function updateFinanceForNewStep(step, progress) {
	let { finance } = step;
	let { receivables, payables } = finance.Price;
	payables -= +(payables * progress / 100).toFixed(2);
	receivables -= +(receivables * progress / 100).toFixed(2);
	return {
		...step,
		finance: {
			...finance,
			Price: { receivables, payables }
		}
	}
}

function getTaskFinance(steps, taskId) {
	const taskSteps = steps.filter(item => item.taskId === taskId);
	const receivables = getSum(taskSteps, 'receivables');
	const payables = getSum(taskSteps, 'payables');
	return { receivables, payables };
}

function getSum(steps, prop) {
	return steps.reduce((acc, cur) => {
		let money = 0;
		if(prop === 'receivables') {
			money = cur.status !== 'Cancelled Halfway' ? cur.finance.Price.receivables : cur.finance.Price.halfReceivables;
		} else {
			money = cur.status !== 'Cancelled Halfway' ? cur.finance.Price.payables : cur.finance.Price.halfPayables;
		}
		return acc + money;
	}, 0)
}

module.exports = { reassignVendor }