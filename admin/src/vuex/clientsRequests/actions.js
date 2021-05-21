import Vue from "vue";

export const setRequests = ({ commit }, payload) => commit('SET_REQUESTS', payload);


export const setClientsRequests = async ({ dispatch, commit }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		const updatedRequest = await Vue.http.post("/clients-requests/all", payload);
		await commit('SET_CLIENTS_REQUESTS', updatedRequest.data);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}

export const setCurrentClientRequest = async ({ dispatch, commit }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		await commit('SET_CUR_CLIENTS_REQUESTS', payload);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}
