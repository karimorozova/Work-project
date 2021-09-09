import * as actions from './actions'
import * as getters from './getters'
import { mutations } from './mutations'

const state = {
	currentClient: {
		rates: {
			pricelistTable: null
		}
	},

	currentClientOverallData: {
		name: null,
		clientType: null,
		officialCompanyName: null,
		email: null,
		website: null,
		nativeLanguage: null,
		timeZone: null,
		status: null,
		accountManager: null,
		salesManager: null,
		projectManager: null,
		otherInfo: null,
		leadGeneration: null,
		leadSource: null,
		contacts: []
	}
}

export const clients = {
	state,
	actions,
	mutations,
	getters
}
