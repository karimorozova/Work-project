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
    const data = await projectJobs(3044);

    data.forEach(element => {
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
            jobService: element[9],
            providerRate : element[10],
            wordcount : element[11],
            wordcountRelative : element[12],
            totalCost : element[13],
            clientName : element[14],
            clientRate : element[15],
            wordcountReceivable : element[11],
            sum : element[16],
            totalAgreed: "unknown",
            instruction : element[17],
            invoiced : element[18],
        });
        report.save();
    });


    console.log("Test Ended");
}
//

const res = runTest();

