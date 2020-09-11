const { getAfterWordcountPayablesUpdated } = require("./wordcount");
const { updateProject } = require("../projects");

async function getAfterPayablesUpdated({projectId, step, index}) {
    try {
      const queryStr = `steps.${index}`;
      let project = await updateProject({ "_id": projectId }, { $set: { [queryStr]: step } });

      if (step.hasOwnProperty('totalWords')) {
        return await getAfterWordcountPayablesUpdated({ project, step });
        // } else if(step.serviceStep.calculationUnit === 'Packages') {
        //     return await getAfterPackagesPayablesUpdated({project, step});
        // } else {
        //     return await getAfterHoursPayablesUpdated({project, step})
      }
      return project;
    } catch(err) {
        console.log(err);
        console.log('Error in getAfterPayablesUpdated');
    }
}

module.exports = { getAfterPayablesUpdated }
