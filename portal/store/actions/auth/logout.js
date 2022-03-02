import Vue from "vue"

export const logout = ({ commit }) => {
	commit("SET_TOKEN", "")
	commit("SET_PREVIOUS_LINK", "")
	Vue.cookie.delete('client')
}
