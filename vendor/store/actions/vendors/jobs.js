import { generateJobTargets } from "../../../utils/job-targets";

export const getJobs = async function({ commit, dispatch, state}) {
    try {
        const result = await this.$axios.get(`/vendor/jobs?token=${state.token}`);
        commit("SET_JOBS", result.data);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}

export const setJobStatus = async function({commit, dispatch, state}, payload) {
    try {
        let { jobId, status, targetFile } = payload;
        if(targetFile) {
            let fileData = new FormData();
            fileData.append('jobId', jobId);
            fileData.append('targetFile', targetFile);
            await this.$axios.post('/xtm/step-target', fileData);
        }
        if(status === "Completed" && !targetFile) {
            await generateJobTargets(this, state.selectedJob);
        }
        await this.$axios.post('/vendor/job', { jobId, status });
        await dispatch("getJobs");
    } catch(err) {
        console.log(err);
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"});
    }
}

export const selectJob = ({ commit }, payload) => {
    commit("SELECT_JOB", payload);
}

export const setStepTermsAgreement = async function ({commit, dispatch, state}, payload) {
    try {
        const {jobId, value} = payload;
        await this.$axios.post('/vendor/selected-job', { jobId, value });
        await dispatch("getJobs");
        let selectedJob = state.jobs.find(item => item._id === jobId);
        commit("SELECT_JOB", selectedJob);
    } catch(err) {
        dispatch("alertToggle", {message: err.response.data, isShow: true, type: "error"})
    }
}