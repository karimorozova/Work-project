import Vue from "vue"

export const logout = ({ commit }) => {
	commit("SET_TOKEN", "")
	Vue.cookie.delete("vendor")
	Vue.cookie.delete("previousPath")
}

export const login = ({ commit }, payload) => {
	Vue.cookie.set("vendor", payload, { expires: '12h' })
	commit("SET_TOKEN", payload)
}

export const alertToggle = ({ commit }, payload) => {
	commit('ALERTING_MESSAGE', payload)
	setTimeout(() => {
		commit('ALERTING_MESSAGE', { message: "", isShow: false, type: "success" })
	}, 5000)
}


export const addRequest = ({ commit }) => {
	commit('INCREASE_REQUEST')
}

export const delRequest = ({ commit }) => {
	commit('DECREASE_REQUEST')
}

export const noRequest = ({ commit }) => {
	commit("SET_REQUEST_ZERO")
}
