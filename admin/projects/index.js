const { metricsCalc, receivablesCalc, payablesCalc } = require('./calculations');
const { getProject, getProjects } = require('./getProjects');

const projectFunctions = {
    metricsCalc,
    receivablesCalc,
    payablesCalc,
    getProject,
    getProjects
}

module.exports = projectFunctions;