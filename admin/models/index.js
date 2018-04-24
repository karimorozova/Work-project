const Languages = require('./languages');
const Requests = require('./requests');
const TasksReport = require('./tasks');
const User = require('./user');
const Services = require('./services');
const { Xtrf, SmartProject } = require("./xtrf");
const { ParseHTML } = require('./parser');

const Models = {
    Languages,
    Requests,
    User,
    Services,
    Xtrf,
    SmartProject,
    ParseHTML,
    TasksReport,
};

module.exports = Models;