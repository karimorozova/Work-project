const { beginProject, projectJobs, projectJobsPagesCount } = require("./models/xtrf/report");
const { Reports } = require("./models")


const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pangea');

mongoose.connection.collections['reports'].drop( function(err) {
    console.log('collection dropped');
});

async function runTest() {
    console.log("Begin test");
        const pagesCount = await projectJobsPagesCount();
        

        for(var pageNum = 1; pageNum <= pagesCount; pageNum++){
            const data = await projectJobs(pageNum);  
            for (var i = 0; i < data.length; i++) {
                var element = data[i];
        
                var jobId = element[7];
                var commonJobId = jobId.substring(0, jobId.length - 1);
                var jobService = element[9];
                var wordcount = element[11];
                var totalAgreed = element[17].split(' ')[0];
        
                var wordcountRelative = wordcount;
        
                if (jobService == 'proofreading') {
                    wordcountRelative *= 0.25;
                }
        
                if (jobService == 'review') {
                    wordcountRelative *= 0.5;
                }
        
                var jobs = await Reports.find({ commonJobId: commonJobId });
        
                if (jobs.length > 0) {
                    var job = jobs[0];
        
                    job.vendors.push({
                        jobId: jobId,
                        providerName: element[8],
                        jobService: jobService,
                        providerRate: element[10],
                        wordcount: wordcount,
                        wordcountRelative: wordcountRelative,
                        totalCost: element[12],
                    });
    
                var sum = 0;
                for(let i = 0; i < job.vendors.length; i++) {
                    sum = sum + +job.vendors[i].totalCost.split(' ')[0];
                }
                
                job.profit = (job.totalAgreed - sum).toFixed(2);
                job.profitPerc = ((job.profit / job.totalAgreed) * 100).toFixed(2);
    
                job.sumStep1 = job.sum;
                job.sumStep2 = 0;
    
                if (job.projectService.toLowerCase() == 'translation and editing') {
                    job.sumStep1 = ((+job.sum * 66.6)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 33.3)/100).toFixed(2); 
                }
                if (job.projectService.toLowerCase() == 'translation and proofreading') {
                    job.sumStep1 = ((+job.sum * 80)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 20)/100).toFixed(2);
                }
                if (job.projectService.toLowerCase() == 'copywriting and proofreading') {
                    job.sumStep1 = ((+job.sum * 80)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 20)/100).toFixed(2);
                }
                if (job.projectService.toLowerCase() == 'blogging') {
                    job.sumStep1 = ((+job.sum * 80)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 20)/100).toFixed(2);
                }
                if (job.projectService.toLowerCase() == 'copywriting') {
                    job.sumStep1 = ((+job.sum * 80)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 20)/100).toFixed(2);
                }
                if (job.projectService.toLowerCase() == 'copywriting: orm/seo articles') {
                    job.sumStep1 = ((+job.sum * 80)/100).toFixed(2);
                    job.sumStep2 = ((+job.sum * 20)/100).toFixed(2);
                }
                    await job.save();
                
                } else {
                    const report = new Reports({
                        projectId: element[0],
                        projectName: element[1],
                        beginDate: element[2],
                        deadline: element[3],
                        sourceLanguage: element[4],
                        targetLanguage: element[5],
                        projectService: element[6],
                        commonJobId: commonJobId,
                        vendors: [{
                            jobId: jobId,
                            providerName: element[8],
                            jobService: jobService,
                            providerRate: element[10],
                            wordcount: wordcount,
                            wordcountRelative: wordcountRelative,
                            totalCost: element[12],
                        }],
                        clientName: element[13],
                        clientRate: element[14],
                        wordcountReceivable: element[15],
                        sumStep1: 0,
                        sumStep2: 0,
                        sum: element[16],
                        totalAgreed: totalAgreed,
                        profit: 0,
                        profitPerc: 0,
                        instruction: element[18],
                        invoiced: element[19],
                    });
                    await report.save();
                }
            }   
        }
        //data.forEach(async (element) => {
      
 
    console.log("Test Ended");
}
//

const res = runTest();

