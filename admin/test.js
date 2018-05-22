const { beginProject, projectJobs, projectJobsPagesCount, quoteTasksInfo } = require("./models/xtrf/report");
const { Reports } = require("./models")

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pangea');

async function runTest() {
    console.log('Begin test');
    var data = await quoteTasksInfo(2487);
    console.log('End');
}


const res = runTest();

