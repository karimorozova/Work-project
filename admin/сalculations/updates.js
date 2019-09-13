const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { getAfterPackagesPayablesUpdated } = require("./packages");
const { updateProject } = require("../projects");
const { getProjectAfterFinanceUpdated } = require("../projects/porjectFinance");

async function getAfterPayablesUpdated({projectId, step, index}) {
    try {
        const queryStr = `steps.${index}`;
        let project = await updateProject({"_id": projectId}, {$set: {[queryStr]: step}});
        if(step.serviceStep.calculationUnit === 'Words') {
            return await getAfterWordcountPayablesUpdated({project, step});
        }
        if(step.serviceStep.calculationUnit === 'Packages') {
            const {updatedTasks,updatedSteps} = await getAfterPackagesPayablesUpdated({project, step});
            return await getProjectAfterFinanceUpdated({project, tasks: updatedTasks, steps: updatedSteps});
        }
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPayablesUpdated');
    }
}

module.exports = { getAfterPayablesUpdated }
