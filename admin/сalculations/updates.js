const { Units } = require('../models');
const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { getAfterPackagesPayablesUpdated } = require("./packages");
const { getAfterHoursPayablesUpdated } = require("./hours");
const { updateProject } = require("../projects");

async function getAfterPayablesUpdated ({ projectId, step, index }) {
	try {
		const queryStr = `steps.${index}`;
		let project = await updateProject({ "_id": projectId }, { $set: { [queryStr]: step } });
		let { type } = await Units.findOne({ _id: step.serviceStep.unit });
		if (type === 'CAT Wordcount' && step.name === 'Translation') {
			return await getAfterWordcountPayablesUpdated({ project, step });
		} else {
			return await getAfterHoursPayablesUpdated({ project, step });
		}
	} catch (err) {
		console.log(err);
		console.log('Error in getAfterPayablesUpdated');
	}
}

module.exports = { getAfterPayablesUpdated };
