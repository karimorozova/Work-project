const { Units, Vendors } = require('../models');
const { getVendor } = require('../vendors/getVendors')
const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { getAfterHoursPayablesUpdated } = require("./commonUnits");
const { updateProject } = require("../projects");

async function getAfterPayablesUpdated ({ projectId, step, index }) {
	try {
		delete step.check
		step.vendor = await getVendor({ "_id": step.vendor._id })
		const queryStr = `steps.${index}`;
		let project = await updateProject({ "_id": projectId }, { $set: { [queryStr]: step } });
		let { type } = await Units.findOne({ _id: step.serviceStep.unit });
		if (type === 'CAT Wordcount') {
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
