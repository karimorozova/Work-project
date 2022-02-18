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
	}, 4000)
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

export const setCurrentVendor = ({ commit }, payload) => {
	commit("SET_VENDOR", payload)
}

export const setLanguages = ({ commit }, payload) => {
	commit("SET_LANGUAGES", payload)
}
export const setIndustries = ({ commit }, payload) => {
	commit("SET_INDUSTRIES", payload)
}
export const setSteps = ({ commit }, payload) => {
	commit("SET_STEPS", payload)
}
export const setUnits = ({ commit }, payload) => {
	commit("SET_UNITS", payload)
}
export const setServices = ({ commit }, payload) => {
	commit("SET_SERVICES", payload)
}



