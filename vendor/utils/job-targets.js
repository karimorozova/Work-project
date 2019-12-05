export const generateJobTargets = async function(context, job) {
    for(let xtmJob of job.xtmJobIds) {
        const fileId = await context.$axios.post('/xtm/generate-file', {projectId: job.xtmProjectId, jobId: xtmJob.jobId});
        let result = "";
        do {
            result = await context.$axios.post('/xtm/target-file', 
                {step: job, id: job.project_Id, file: {...fileId.data[0], fileName: xtmJob.fileName, projectId: job.xtmProjectId}});
        }
        while (result.data.status && result.data.status === "FINISHED")
    }
}