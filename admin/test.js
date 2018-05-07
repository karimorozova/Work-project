const { beginProject, projectJobs } = require("./models/xtrf/report");
const { Reports } = require("./models")


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pangea');

async function runTest() {
    console.log("Begin test");

   /* var rows = [];
    const pageCount = await beginProject();
    // pageCount == 1 due to debug speed 
    for (let i = 1; i <= 1; i++) {
        var pageRows = await beginProject(i);
        
        for (row in pageRows) {
            rows.push(pageRows[row]);
        }
        break;
    }
    //const customerInfo = await ( HomeApi.findCustomer("11111"));
    //console.log("customer info " + customerInfo);
    for (key in rows) {
        try {
            const val = rows[key].columns;
            const newRow = new Projects({
                id: val[0],
                idVisible : val[1],
                name : val[2],
                beginDate : val[3],
                deadline : val[4],
                languages: val[5],
                service : val[6],
                clientId : val[7]
            });
            newRow.save();
        }
        catch (err) {
            console.log(err);
        }
    }*/

    // 0 Project id
    // 1 Project name
    // 2 Project name
    const data = await projectJobs(2473);

    data.forEach(element => {
        var wordcount = element[11];
        var jobService = element[9];

        var wordcountRelative = wordcount;

        if(jobService == 'proofreading'){
            wordcountRelative *= 0.25;
        }

        if(jobService == 'review'){
            wordcountRelative *= 0.5;
        }

        const report = new Reports({
            projectId: element[0], 
            projectName: element[1],
            beginDate:element[2],
            deadline: element[3],
            sourceLanguage: element[4],
            targetLanguage: element[5],
            projectService: element[6],
            jobId : element[7],
            providerName: element[8],
            jobService: jobService,
            providerRate : element[10],
            wordcount : wordcount ,
            wordcountRelative : wordcountRelative,
            totalCost : element[12],
            clientName : element[13],
            clientRate : element[14],
            wordcountReceivable : element[15],
            sumStep1 : 0,
            sumStep2 : 0,
            sum : element[16],
            totalAgreed: element[17],
            profit:"profit",
            profitPerc: "profitPerc",
            instruction : element[18],
            invoiced : element[19],
        });
        report.save();
    });


    console.log("Test Ended");
}
//

const res = runTest();

