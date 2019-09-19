const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { getAfterPackagesPayablesUpdated } = require("./packages");
const { getAfterHoursPayablesUpdated } = require("./hours");
const { updateProject } = require("../projects");

async function getAfterPayablesUpdated({projectId, step, index}) {
    try {
        const queryStr = `steps.${index}`;
        let project = await updateProject({"_id": projectId}, {$set: {[queryStr]: step}});
        if(step.serviceStep.calculationUnit === 'Words') {
            return await getAfterWordcountPayablesUpdated({project, step});
        } else if(step.serviceStep.calculationUnit === 'Packages') {
            return await getAfterPackagesPayablesUpdated({project, step});
        } else {
            return await getAfterHoursPayablesUpdated({project, step})
        }
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPayablesUpdated');
    }
}

module.exports = { getAfterPayablesUpdated }
