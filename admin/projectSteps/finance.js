const { getProject } = require("../projects");

function getStepsWithFinanceUpdated(step, project) {
    let { steps } = project;
    const stepIndex = steps.findIndex(item => item.id === step._id);
    steps[stepIndex] = step;
    return steps;
}

module.exports = { getStepsWithFinanceUpdated }