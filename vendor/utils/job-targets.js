export const generateJobTargets = async function(context, job) {
    for(let xtmJob of job.xtmJobIds) {
        await context.$axios.post('/xtm/generate-file', {projectId: job.xtmProjectId, jobId: xtmJob.jobId});
    }
}