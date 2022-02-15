export const ALERTING_MESSAGE = (state, payload) => {
	state.alertMessage = payload.message
	state.isAlert = payload.isShow
	state.alertType = payload.type
}

export const SET_TOKEN = (state, payload) => {
	state.token = payload
}

export const SET_INDUSTRIES = (state, payload) => {
	state.industries = payload
}

export const SET_LANGUAGES = (state, payload) => {
	state.languages = payload
}

export const INCREASE_REQUEST = (state) => {
	state.currentRequests++
}

export const DECREASE_REQUEST = (state) => {
	state.currentRequests--
}

export const SET_REQUEST_ZERO = (state) => {
	state.currentRequests = 0
}

export const SET_STEPS = (state, payload) => {
	state.allSteps = payload
}

export const SET_ALL_TIMEZONES = (state, payload) => {
	state.timezones = payload
}

