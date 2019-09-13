const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { getAfterPackagesPayablesUpdated } = require("./packages");
const { updateProject } = require("../projects");

async function getAfterPayablesUpdated({projectId, step, index}) {
    try {
        const queryStr = `steps.${index}`;
        let project = await updateProject({"_id": projectId}, {$set: {[queryStr]: step}});
        if(step.serviceStep.calculationUnit === 'Words') {
            return await getAfterWordcountPayablesUpdated({project, step});
        }
        if(step.serviceStep.calculationUnit === 'Packages') {
            return await getAfterPackagesPayablesUpdated({project, step});
        }
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPayablesUpdated');
    }
}

module.exports = { getAfterPayablesUpdated }
