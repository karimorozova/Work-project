import Vue from "vue"

export const mutations = {
	SET_CLIENTS_REQUESTS(state, payload) {
		state.clientsRequests = payload
	},
	SET_CUR_CLIENTS_REQUEST(state, payload) {
		state.currentClientsRequest = payload
	},
	SET_CUR_CLIENTS_CONTACTS(state, payload) {
		state.currentClientsRequest.clientContacts = [ ...payload ]
		// Vue.set(state.currentClientsRequest, 'clientContacts', payload)
	},
	SET_TASKS_DATA_VALUE_REQUEST(state, payload) {
		const { prop, value } = payload
		console.log(prop, value)
		state.tasksData = { ...state.tasksData, [prop]: value }
	},
	CLEAR_DATA_REQUEST(state, payload) {
		state.tasksData = {}
	}
}
