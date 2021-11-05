import Vue from "vue"

export const incrementRequestCounter = ({ commit }) => commit('startRequest')
export const decrementRequestCounter = ({ commit }) => commit('endRequest')
export const loadingToggle = ({ commit }, payload) => commit('loadingValue', payload)
export const servicesGetting = ({ commit }, payload) => commit('servicesFill', payload)
export const setAllCustomers = ({ commit }, payload) => commit('allCustomers', payload)
// export const setVendorsForProject = ({ commit }, payload) => commit('allVendorsForProject', payload)

export const setCurrentProject = ({ commit }, payload) => commit('storeCurrentProject', payload)
export const setProjectProp = ({ commit }, payload) => commit('storeProjectProp', payload)
export const removeStepVendor = ({ commit }, payload) => commit('stepVendorDelete', payload)
export const vendorsSetting = ({ commit }, payload) => commit('allVendors', payload)


export const getServices = async ({ commit, dispatch }) => {
	commit('startRequest')
	try {
		const result = await Vue.http.get('/api/services?filter=active')
		const allServices = result.body
		allServices.sort((a, b) => {
			return a.sortIndex - b.sortIndex
		})
		dispatch('servicesGetting', allServices)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}
export const setVendorsForOption = async ({ commit, dispatch }) => {
	commit('startRequest')
	try {
		const result = await Vue.http.get('/pm-manage/vendors-for-options')
		let allVendors = result.data
		allVendors.sort((a, b) => `${ a.firstName } ${ a.surname }`.localeCompare(`${ b.firstName } ${ b.surname }`))
		commit('storeVendorsForOptions', allVendors)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const setClientsForOption = async ({ commit, dispatch }) => {
	commit('startRequest')
	try {
		const result = await Vue.http.get('/pm-manage/clients-for-options')
		const customers = result.data.sort((a, b) => a.name.localeCompare(b.name))
		commit('storeClientsForOptions', customers)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const getSteps = async ({ commit, dispatch }) => {
	commit('startRequest')
	try {
		const result = await Vue.http.get('/api/steps')
		dispatch('servicesGetting', result.body)
		return result.body
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const setProjectStatus = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { id, status, reason } = payload
		const updatedProject = await Vue.http.put("/pm-manage/project-status", { id, status, reason })
		await commit('storeCurrentProject', updatedProject.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const sendCancelProjectMessage = async ({ commit, state, dispatch }, payload) => {
	commit('startRequest')
	try {
		const { id, message, isNotify } = payload
		const updatedProject = await Vue.http.put("/pm-manage/sendCancelMessage-and-cancelProjectInMemoq", { id, message, isNotify })
		await commit('storeCurrentProject', updatedProject.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const setStepsStatus = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { status, steps } = payload
		const id = state.currentProject._id
		const updatedProject = await Vue.http.post('/pm-manage/step-status', { id, status, steps })
		await commit('storeCurrentProject', updatedProject.body)

	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}
export const setStepVendors = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { projectId, stepsVendors } = payload
		const updatedProject = await Vue.http.post('/pm-manage/vendor-assigment', { projectId, stepsVendors })
		await commit('storeCurrentProject', updatedProject.data)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const updateMatrix = async ({ commit, dispatch }, payload) => {
	commit('startRequest')
	commit('updateMatrixData', payload)
	try {
		const updatedProject = await Vue.http.post('/pm-manage/update-matrix', { ...payload })
		await commit('storeCurrentProject', updatedProject.data)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const updateReport = async ({ commit, dispatch }, payload) => {
	commit('startRequest')
	try {
		const { id, notes, isWorkingDay } = payload
		await Vue.http.post('/zoho/report', { id, notes, isWorkingDay })
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const sendClientCostQuote = async ({ commit, state, dispatch }, payload) => {
	commit('startRequest')
	try {
		const { message, arrayOfEmails } = payload
		const updatedProject = await Vue.http.post('/pm-manage/send-cost-quote', { id: state.currentProject._id, message, arrayOfEmails })
		await commit('storeCurrentProject', updatedProject.data)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const sendClientQuote = async ({ commit, state, dispatch }, payload) => {
	commit('startRequest')
	try {
		const { message, arrayOfEmails, projectId } = payload
		const updatedProject = await Vue.http.post('/pm-manage/send-quote', { id: projectId, message, arrayOfEmails })
		await commit('storeCurrentProject', updatedProject.data)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const sendProjectDetails = async ({ commit, state, dispatch }, payload) => {
	commit('startRequest')
	try {
		const { message } = payload
		await Vue.http.post('/pm-manage/project-details', { id: state.currentProject._id, message })
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const saveUser = async ({ commit, dispatch }, payload) => {
	commit('startRequest')
	try {
		await Vue.http.post('/user', payload)
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const removeUser = async ({ commit, dispatch }, payload) => {
	commit('startRequest')
	try {
		const result = await Vue.http.delete(`/user/${ payload }`, { body: { token: localStorage.getItem("token") } })
		if (result.body === "logout") {
			dispatch("logout")
		}
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const alertToggle = ({ commit }, payload) => {
	commit('alertingMessage', payload)
	setTimeout(() => {
		commit('alertingMessage', { message: "", isShow: false, type: "success" })
	}, 5000)
}

export const login = ({ commit, state }, payload) => {
	commit('startRequest')
	return new Promise(resolve => {
		const { token, group, firstName, lastName, photo } = payload
		state.userGroup = group
		state.user = { firstName, lastName, photo }
		setTimeout(() => {
			let currentDate = Date.now()
			let expiryTime = currentDate + 60000 * 120
			let object = { value: token, timestamp: expiryTime }
			localStorage.setItem("token", JSON.stringify(object))
			commit('endRequest')
			resolve()
		}, 1000)
	})
}

export const setUser = async ({ commit, state, dispatch }) => {
	commit('startRequest')
	try {
		const key = JSON.parse(localStorage.getItem("token"))
		const result = await Vue.http.get(`/user?key=${ key.value }`)
		state.user = result.data
		state.userGroup = result.data.group
	} catch (err) {
		dispatch('alertToggle', { message: err.body, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const setAllServices = async ({ commit }) => {
	let result = await Vue.http.get('/api/services')
	commit('allServices', result.data)
}
export const setAllUnits = async ({ commit }) => {
	let result = await Vue.http.get('/api/units')
	commit('allUnits', result.data)
}
export const setLanguages = async ({ commit }) => {
	let result = await Vue.http.get('/api/languages')
	commit('allLangs', result.data)
}
export const setAllUsers = async ({ commit }) => {
	const result = await Vue.http.get("/users-full")
	commit('allUsers', result.data)
}
export const setIndustries = async ({ commit }) => {
	let result = await Vue.http.get('/api/industries')
	commit('allIndustries', result.data)
}
export const setSteps = async ({ commit }) => {
	let result = await Vue.http.get('/api/steps')
	commit('allSteps', result.data)
}