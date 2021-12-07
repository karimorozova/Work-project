export const files = ({ commit }, payload) => {
	commit('DETFILES_TO_DETAILS', payload)
}

export const getServices = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/api/services?filter=active`)
		commit('SERVICES_FILL', result.data)
	} catch (err) {
		const redirectErrors = [ "jwt malformed", "jwt expired" ]
		console.log(err)
		if (redirectErrors.includes(err.response.data)) {
			this.dispatch('logout')
			this.$router.replace({ path: '/login' })
		}
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

// export const setOpenProjects = async function ({ commit, dispatch, state }) {
// 	try {
// 		const result = await this.$axios.get(`/portal/open-projects?token=${ state.token }`)
// 		let { projects } = result.data
// 		commit('SET_OPEN_PROJECTS', projects)
// 	} catch (err) {
// 		const redirectErrors = [ "jwt malformed", "jwt expired" ]
// 		console.log(err)
// 		if (redirectErrors.includes(err.response.data)) {
// 			this.dispatch('logout')
// 			this.$router.replace({ path: '/login' })
// 		}
// 		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
// 	}
// }

// export const setOpenRequests = async function ({ commit, dispatch, state }) {
// 	try {
// 		const result = await this.$axios.get(`/portal/open-requests?token=${ state.token }`)
// 		let { requests } = result.data
// 		commit('SET_OPEN_REQUESTS', requests)
// 	} catch (err) {
// 		const redirectErrors = [ "jwt malformed", "jwt expired" ]
// 		console.log(err)
// 		if (redirectErrors.includes(err.response.data)) {
// 			this.dispatch('logout')
// 			this.$router.replace({ path: '/login' })
// 		}
// 		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
// 	}
// }

// export const setOpenQuotes = async function ({ commit, dispatch, state }) {
// 	try {
// 		const result = await this.$axios.get(`/portal/open-quotes?token=${ state.token }`)
// 		let { quotes } = result.data
// 		commit('SET_OPEN_QUOTES', quotes)
// 	} catch (err) {
// 		const redirectErrors = [ "jwt malformed", "jwt expired" ]
// 		console.log(err)
// 		if (redirectErrors.includes(err.response.data)) {
// 			this.dispatch('logout')
// 			this.$router.replace({ path: '/login' })
// 		}
// 		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
// 	}
// }

export const getClient = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/portal/client?token=${ state.token }`)
		let { client } = result.data
		commit('SET_CLIENT', client)
	} catch (err) {
		const redirectErrors = [ "Token malformed", "Token expired" ]
		console.log(err)
		if (redirectErrors.includes(err.response.data)) {
			this.dispatch('logout')
			this.$router.replace({ path: '/login' })
		}
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const getLanguages = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/portal/all-languages?token=${ state.token }`)
		let { languages } = result.data

		commit('SET_LANGUAGES', languages)
	} catch (err) {
		const redirectErrors = [ "jwt malformed", "jwt expired" ]
		console.log(err)
		if (redirectErrors.includes(err.response.data)) {
			this.dispatch('logout')
			this.$router.replace({ path: '/login' })
		}
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const getIndustries = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/portal/all-industries?token=${ state.token }`)
		commit('SET_INDUSTRIES', result.data)
	} catch (err) {
		const redirectErrors = [ "jwt malformed", "jwt expired" ]
		console.log(err)
		if (redirectErrors.includes(err.response.data)) {
			this.dispatch('logout')
			this.$router.replace({ path: '/login' })
		}
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const getUser = async function ({ commit, dispatch, state }) {
	try {
		const result = await this.$axios.get(`/portal/user?token=${ state.token }`)
		let { user } = result.data
		commit('SET_USER', user)
	} catch (err) {
		const redirectErrors = [ "jwt malformed", "jwt expired" ]
		console.log(err)
		if (redirectErrors.includes(err.response.data)) {
			this.dispatch('logout')
			this.$router.replace({ path: '/login' })
		}
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}

export const setProjects = ({ commit }, payload) => {
	commit('SET_PROJECTS', payload)
}

export const saveAccountDetails = async function ({ commit, dispatch, state }, payload) {
	let formData = new FormData()
	for (let key in payload) {
		formData.append(key, payload[key])
	}
	formData.append('token', state.token)
	try {
		const result = await this.$axios.post('/portal/account-details', formData)
		const { user } = result.data
		commit('SET_USER', user)
	} catch (err) {
		console.log(err)
		dispatch("alertToggle", { message: err.response.data, isShow: true, type: "error" })
	}
}
