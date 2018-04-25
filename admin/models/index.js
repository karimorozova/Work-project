const Languages = require('./languages');
const Requests = require('./requests');
const TasksReport = require('./tasks');
const User = require('./user');
const Services = require('./services');
const Customer = require('./customer');

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
    Customer
};

module.exports = Models;