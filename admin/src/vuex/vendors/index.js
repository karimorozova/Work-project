import * as actions from './actions'
import * as getters from './getters'
import {
	mutations
} from './mutations'

const state = {
	currentVendor: {},
	filteredVendors: [],
	currentVendorEducations: [],
	currentVendorProfessionalExperience: [],
	currentVendorQualifications: [],
	currentVendorDocuments: [],
	currentVendorAssessment: [],

	currentVendorGeneralData: {
		firstName: null,
		surname: null,
		email: null,
		phone: null,
		timezone: null,
		native: null,
		companyName: null,
		website: null,
		skype: null,
		linkedin: null,
    currency: null,
		gender: null,
		matrix: null,
    facebook: null,
		professionalLevel: null,
    experienceYears: null,
    availability: null,
    catExperience: null,
    twitter: null,
    softwares: null,
    instagram: null,
    telegram: null,
    socialMedia: null,
    whatsapp: null,
    secondaryEmail: null,
    proz: null,
    smartcat: null,
		notes: null,
		vendorId: null,
		billingInfo: {
			officialName: '',
			paymentTerm: '',
			address: '',
			email: ''
		}
	}
}

export const vendors = {
	state,
	actions,
	mutations,
	getters
}
