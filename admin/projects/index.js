const { metricsCalc, receivablesCalc } = require('./calculations');
const { getProject, getProjects } = require('./getProjects');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    getProject,
    getProjects
}

module.exports = projectFunctions;