export const downloadJobTargets = async function(context, job) {
    for(let xtmJob of job.xtmJobIds) {
        const fileId = await context.$axios.post('/xtm/generate-file', {projectId: job.xtmProjectId, jobId: xtmJob.jobId});
        await context.$axios.post('/xtm/target-file', 
            {step: job, id: job.project_Id, projectId: job.xtmProjectId, file: {...fileId.data[0], fileName: xtmJob.fileName}});
    }
}