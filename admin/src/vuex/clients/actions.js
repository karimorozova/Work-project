import Vue from "vue"

export const setUpClientProp = ({ commit }, payload) => {
	commit('setUpClientProp', payload)
}
export const setUpClientRatesProp = ({ commit }, payload) => {
	commit('setUpClientRatesProp', payload)
}

export const updateClientNotes = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post('/clientsapi/update-notes', payload)
		commit('setUpClientProp', { key: 'notes', value: result.data.notes })
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const deleteClientNotes = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post('/clientsapi/delete-notes', payload)
		commit('setUpClientProp', { key: 'notes', value: result.data.notes })
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}
export const addNewClient = ({ commit, rootState }, payload) => {
	rootState.a.customers.push(payload)
}
export const storeClient = ({ commit, rootState }, payload) => {
	let customers = rootState.a.customers.map(item => item)
	const index = customers.findIndex(item => item._id === payload._id)
	customers.splice(index, 1, payload)
	rootState.a.customers = [ ...customers ]
}
export const removeClient = ({ commit, rootState }, payload) => {
	const index = rootState.a.customers.findIndex(item => item._id === payload)
	rootState.a.customers.splice(index, 1)
}
export const storeCurrentClient = ({ commit }, payload) => commit('setCurrentClient', payload)
export const storeCurrentClientOverallData = ({ commit }, payload) => commit('setCurrentClientOverallData', payload)

export const storeClientProperty = ({ commit }, payload) => commit('setClientProperty', payload)
export const storeClientPropertyOverallData = ({ commit }, payload) => commit('setClientPropertyOverallData', payload)
export const storeClientPropertyOverallDataBilling = ({ commit }, payload) => commit('setClientPropertyOverallDataBilling', payload)
export const storeClientContact = ({ commit }, payload) => commit('addContact', payload)
export const storeClientContactOverAll = ({ commit }, payload) => commit('addContactOverAll', payload)
export const updateClientContact = ({ commit }, payload) => commit('updateContact', payload)
export const updateLeadContact = ({ commit }, payload) => commit('setLeadContact', payload)
export const storeClientBillingInfoProperty = ({ commit }, payload) => commit('storeClientBillingInfoProperty', payload)

export const saveClientRates = async ({ commit, dispatch, state }, payload) => {
	commit("startRequest")
	try {
		const clientId = state.currentClient._id
		const result = await Vue.http.post('/clientsapi/rates', { clientId, ...payload })
		dispatch('storeCurrentClient', result.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}
export const deleteClientRate = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { id, prop } = payload
		const clientId = state.currentClient._id
		const result = await Vue.http.post('/clientsapi/remove-rate', { clientId, rateId: id, prop })
		dispatch("storeCurrentClient", result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const deleteClientRates = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const { checkedIds, prop } = payload
		const clientId = state.currentClient._id
		const result = await Vue.http.post('/clientsapi/remove-rates', { clientId, checkedIds, prop })
		dispatch("storeCurrentClient", result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const importRatesToClient = async ({ commit, dispatch, state }, payload) => {
	commit('startRequest')
	try {
		const clientId = state.currentClient._id
		const { ratesData, prop } = payload
		const result = await Vue.http.post('/clientsapi/import-rates', { ratesData, clientId, prop })
		dispatch('storeCurrentClient', result.body)
	} catch (err) {
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit('endRequest')
	}
}

export const updateClientRate = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const { step, rate } = payload
		const updatedClient = await Vue.http.post("/clientsapi/combination", { step, rate })
		dispatch('storeCurrentClient', updatedClient.body)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const updateClientStatus = async ({ commit, dispatch }, payload) => {
	commit("startRequest")
	try {
		const result = await Vue.http.post("/clientsapi/update-client-status", payload)
		const client = result.body
		commit('setCurrentVendor', client)
	} catch (err) {
		dispatch('alertToggle', { message: err.response.data, isShow: true, type: "error" })
	} finally {
		commit("endRequest")
	}
}

export const updateClientRatesProp = async ({commit, dispatch, state}, payload) => {
   const rates = await Vue.http.get("/clientsapi/rates/" + state.currentClient._id)
  commit('updateClientRatesProp', {data: rates.body[payload.key], key: payload.key})
}
