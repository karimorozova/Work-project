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
export const updateClientsRequestsProps = async ({ dispatch, commit }, payload) => {
  dispatch('incrementRequestCounter')
  try {
    const { projectId, value } = payload
    const updatedRequest = await Vue.http.post(`/clients-requests/${projectId}/update-prop`, { value });
    await commit('SET_CUR_CLIENTS_REQUEST', updatedRequest.data);
  } catch (err) {
    dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
  } finally {
    dispatch('decrementRequestCounter')
  }
}
export const updateClientContacts = async ({ dispatch, commit }, payload) => {
  dispatch('incrementRequestCounter')
  try {
    const { projectId, contact, oldContact } = payload
    const updatedRequest = await Vue.http.post(`/clients-requests/${projectId}/update-client-contact`, { contact, oldContact });
    await commit('SET_CUR_CLIENTS_CONTACTS', updatedRequest.data.clientContacts);
  } catch (err) {
    dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
  } finally {
    dispatch('decrementRequestCounter')
  }
}

export const setCurrentClientRequest = async ({ dispatch, commit }, payload) => {
	dispatch('incrementRequestCounter')
	try {
		await commit('SET_CUR_CLIENTS_REQUEST', payload);
	} catch (err) {
		dispatch('alertToggle', { message: err.data, isShow: true, type: "error" });
	} finally {
		dispatch('decrementRequestCounter')
	}
}
