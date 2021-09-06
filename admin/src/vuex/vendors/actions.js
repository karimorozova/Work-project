import Vue from "vue"

import io from 'socket.io-client'

const socket = io(window.location.origin)

export const setFilteredVendors = ({ commit }, payload) => commit('SET_FILTERED_VENDORS', payload)
export const updateVendorProp = ({ commit }, payload) => {
	socket.emit('changeVendorProp', { id: payload.id, key: payload.key, value: payload.value })
	commit('setVendorProp', { prop: payload.key, value: payload.value })
}
export const updateWithOutSocketVendorProp = ({ commit }, payload) => {
	commit('setVendorProp', payload)
}
export const updateIndustry = ({ commit }, payload) => commit('updateVendorIndustry', payload)
export const storeVendor = ({ commit, state }, payload) => {
	const index = state.filteredVendors.findIndex(item => item._id === payload._id)
	state.filteredVendors.splice(index, 1, payload)
}
export const SET_CURRENT_VENDOR_EDUCATION = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_EDUCATION', payload)
export const SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE', payload)
export const SET_CURRENT_VENDOR_QUALIFICATIONS = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_QUALIFICATIONS', payload)
export const SET_CURRENT_VENDOR_DOCUMENTS = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_DOCUMENTS', payload)
export const SET_CURRENT_VENDOR_ASSESSMENT = ({ commit }, payload) => commit('SET_CURRENT_VENDOR_ASSESSMENT', payload)


export const storeCurrentVendor = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		let vendor = payload
		if (vendor.pendingCompetencies.length) {
			const result = await Vue.http.post('/vendorsapi/vendor-pendingCompetencies-add-benchmark', { pendingCompetencies: vendor.pendingCompetencies })
			vendor.pendingCompetencies = result.data
		}
		commit('setCurrentVendor', vendor)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const saveVendorRates = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const vendorId = state.currentVendor._id
		const result = await Vue.http.post('/vendorsapi/rates', { vendorId, ...payload })
		dispatch('storeCurrentVendor', result.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const importRatesToVendor = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const vendorId = state.currentVendor._id
		const { ratesData, prop } = payload
		const result = await Vue.http.post('/vendorsapi/import-rates', { ratesData, vendorId, prop })
		dispatch('storeCurrentVendor', result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const deleteVendorRate = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const { id, prop } = payload
		const vendorId = state.currentVendor._id
		const result = await Vue.http.post('/vendorsapi/remove-rate', { vendorId, rateId: id, prop })
		dispatch("storeCurrentVendor", result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const deleteVendorRates = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { checkedIds, prop } = payload
		const vendorId = state.currentVendor._id
		const result = await Vue.http.post('/vendorsapi/remove-rates', { vendorId, checkedIds, prop })
		dispatch("storeCurrentVendor", result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const deleteCurrentVendor = async ({ commit, state, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { id } = payload
		await Vue.http.delete(`/vendorsapi/deletevendor/${ id }`)
		const index = state.filteredVendors.findIndex(item => item._id === id)
		state.filteredVendors.splice(index, 1)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const saveNewVendor = async ({ commit, state, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/new-vendor", payload)
		const newVendor = result.body
		state.filteredVendors.push(newVendor)
		commit('setCurrentVendor', newVendor)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const updateCurrentVendor = async ({ commit, state, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/update-vendor", payload)
		let updatedVendor = result.body
		const index = state.filteredVendors.findIndex(item => item._id === updatedVendor._id)
		state.filteredVendors.splice(index, 1, updatedVendor)

		if (updatedVendor.pendingCompetencies.length) {
			const result = await Vue.http.post('/vendorsapi/vendor-pendingCompetencies-add-benchmark', { pendingCompetencies: updatedVendor.pendingCompetencies })
			updatedVendor.pendingCompetencies = result.data
		}

		commit('setCurrentVendor', updatedVendor)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const updateVendorStatus = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/update-vendor-status", payload)
		let updatedVendor = result.body

		if (updatedVendor.pendingCompetencies.length) {
			const result = await Vue.http.post('/vendorsapi/vendor-pendingCompetencies-add-benchmark', { pendingCompetencies: updatedVendor.pendingCompetencies })
			updatedVendor.pendingCompetencies = result.data
		}

		const index = state.filteredVendors.findIndex(item => item._id === updatedVendor._id)
		state.filteredVendors.splice(index, 1, updatedVendor)
		commit('setCurrentVendor', updatedVendor)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const setVendorsMatrixData = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const { _id, matrix } = state.currentVendor
		payload.value = payload.value > 100 ? 100 : payload.value < 0 ? 0 : payload.value
		matrix[payload.key].rate = payload.value
		const updatedVendor = await Vue.http.post('/vendorsapi/update-matrix', { _id, key: payload.key, value: payload.value })
		state.filteredVendors.forEach(item => {
			if (item._id === _id) item.matrix = matrix
		})
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const setDefaultValuesMatrixData = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const { _id } = state.currentVendor
		const updatedVendor = await Vue.http.post('/vendorsapi/default-matrix', { _id, key: payload.key })
		// state.filteredVendors.forEach(item => {
		//     if (item._id === _id) item.matrix = matrix
		// });
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}


export const updateVendorRate = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { step, rate } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/combination", { step, rate })
		dispatch("storeVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const storeCurrentVendorEducation = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const updatedVendor = await Vue.http.post("/vendorsapi/vendor-education", payload)
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const deleteCurrentVendorEducation = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { vendorId, index, doc } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-education", { vendorId, index, doc })
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const storeCurrentVendorProfessionalExperience = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { vendorId, index, ...experience } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/vendor-profExperience", { vendorId, index, experience })
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const deleteCurrentVendorProfessionalExperience = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { vendorId, index } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-experience", { vendorId, index })
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const storeCurrentVendorQualification = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { vendor, index, qualification, testPath, message, isSendMessage } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/vendor-qualification", { vendorId: vendor._id, index, qualification })
		dispatch("storeCurrentVendor", updatedVendor.body)
		const statuses = [ "Test Sent", "Not Passed", "Passed" ]

		if (statuses.indexOf(qualification.status) !== -1 && isSendMessage) {
			await Vue.http.post("/vendorsapi/test-emails", { vendor: updatedVendor.data, qualification, testPath, message })
		}
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const deleteCurrentVendorQualification = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { index, vendorId } = payload
		const updatedVendor = await Vue.http.post("/vendorsapi/remove-vendor-qualification", { index, vendorId })
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const storeCurrentVendorAssessment = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const updatedVendor = await Vue.http.post("/vendorsapi/vendor-assessment", payload)
		dispatch("storeCurrentVendor", updatedVendor.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const storeCurrentVendorDocuments = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/vendor-document", payload)
		dispatch('storeCurrentVendor', result.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}
export const storeCurrentVendorDocumentsDefault = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/vendor-document-default", payload)
		dispatch('storeCurrentVendor', result.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}
export const deleteCurrentVendorDocument = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/vendorsapi/remove-vendor-doc", payload)
		dispatch('storeCurrentVendor', result.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const saveLangTest = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	const { testData, file } = payload
	let langTest = new FormData()
	for (let key in testData) {
		langTest.append(key, JSON.stringify(testData[key]))
	}
	if (file) {
		langTest.append("testFile", file)
	}
	try {
		await Vue.http.post("/vendorsapi/lang-test", langTest)
		dispatch('alertToggle', { message: "Test is saved", isShow: true })
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const removeLangTest = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	const { _id, path } = payload
	try {
		await Vue.http.post("/vendorsapi/remove-lang-test", { _id, path })
		dispatch('alertToggle', { message: "Test is removed", isShow: true })
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const initCurrentVendorGeneralData = async ({ commit, state }, payload) => {
	commit('setCurrentVendorGeneralData', payload)
}

export const updateCurrentVendorGeneralData = async ({ commit, state }, payload) => {
	commit("updateCurrentVendorGeneralData", payload)
}

export const updateCurrentVendorGeneralDataBillingInfo = async ({ commit, state }, payload) => {
	commit("updateCurrentVendorGeneralDataBillingInfo", payload)
}

export const clearVendorGeneralData = async ({ commit, dispatch }, payload) => {
	commit("setCurrentVendorGeneralData", payload)
}

export const updateVendorRatesFromServer = async ({ commit, state }, payload) => {
	const { key } = payload
	const rate = await Vue.http.post('/vendorsapi/vendor-rate-by-key', { key, id: state.currentVendor._id })
	commit('updateVendorRates', { key, data: rate.body })
}

