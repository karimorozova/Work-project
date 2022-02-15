export const getJobs = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/vendor/jobs?token=${ state.token }`)
		const decode = window.atob(result.data)
		const data = JSON.parse(decode)
		commit("SET_JOBS", data)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const setJobComplianceStatus = async function ({ commit, dispatch, state }, payload) {
	try {
		let { jobId, status, targetFile } = payload
		if (targetFile) {
			let fileData = new FormData()
			fileData.append('jobId', jobId)

			for (let file of targetFile) {
				fileData.append('targetFile', file)
			}
			await this.$axios.post('/vendor/step-target', fileData)
		}
		await this.$axios.post('/vendor/job', { jobId, status })
		await dispatch("getJobs")
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const setJobStatus = async function ({ commit, dispatch, state }, payload) {
	try {
		let { jobId, status, targetFile } = payload
		if (targetFile) {
			let fileData = new FormData()
			fileData.append('jobId', jobId)

			for (let file of targetFile) {
				fileData.append('targetFile', file)
			}
			await this.$axios.post('/vendor/step-target', fileData)
		}
		if (status === "Completed" && !targetFile) {
			await this.$axios.post('/vendor/target-files', { stepId: jobId })
		}
		await this.$axios.post('/vendor/job', { jobId, status })
		await dispatch("getJobs")
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const selectJob = ({ commit }, payload) => {
	commit("SELECT_JOB", payload)
}

export const setStepTermsAgreement = async function ({ commit, dispatch, state }, payload) {
	try {
		const { jobId, value } = payload
		await this.$axios.post('/vendor/selected-job', { jobId, value })
		await dispatch("getJobs")
		let selectedJob = state.jobs.find(item => item._id === jobId)
		commit("SELECT_JOB", selectedJob)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}