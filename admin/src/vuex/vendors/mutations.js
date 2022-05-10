export const mutations = {
	setCurrentVendor(state, payload) {
		state.currentVendor = { ...payload }
	},
	SET_FILTERED_VENDORS(state, payload) {
		state.filteredVendors = [ ...payload ]
	},
	setVendorProp(state, payload) {
		state.currentVendor[payload.prop] = payload.value
	},
	updateVendorIndustry(state, payload) {
		const position = state.currentVendor.industries.findIndex(item => item._id === payload._id)
		if (position !== -1) {
			state.currentVendor.industries.splice(position, 1)
		} else {
			state.currentVendor.industries.push(payload)
		}
	},

	setCurrentVendorGeneralData(state, payload) {
		let keys = [ 'firstName', 'surname', 'facebook', 'website', 'experienceYears', 'availability', 'catExperience', 'twitter', 'proz', 'smartcat', 'secondaryEmail', 'whatsapp', 'softwares', 'instagram', 'telegram', 'socialMedia', 'email', 'phone', 'timezone', 'native', 'companyName', 'website', 'skype', 'linkedin', 'currency', 'gender', 'status', 'matrix', 'professionalLevel', 'notes', 'vendorId' ]
		const billingKeys = [	'officialName', 'email', 'paymentTerm', 'address']

		for (const key of keys) state.currentVendorGeneralData[key] = payload[key]
		for(let key of billingKeys) state.currentVendorGeneralData.billingInfo[key] = payload.billingInfo[key]
	},

	updateCurrentVendorGeneralData(state, payload) {
		state.currentVendorGeneralData[payload.key] = payload.value
	},

	updateCurrentVendorGeneralDataBillingInfo(state, payload) {
		state.currentVendorGeneralData.billingInfo[payload.key] = payload.value
	},

	SET_CURRENT_VENDOR_EDUCATION(state, payload) {
		state.currentVendorEducations[payload._id] = payload
	},
	SET_CURRENT_VENDOR_PROFESSIONAL_EXPERIENCE(state, payload) {
		state.currentVendorProfessionalExperience[payload._id] = payload
	},
	SET_CURRENT_VENDOR_QUALIFICATIONS(state, payload) {
		state.currentVendorQualifications[payload._id] = payload
	},
	SET_CURRENT_VENDOR_DOCUMENTS(state, payload) {
		state.currentVendorDocuments[payload._id] = payload
	},

	SET_CURRENT_VENDOR_ASSESSMENT(state, payload) {
		state.currentVendorAssessment.push({
			_id: payload._id,
			industry: payload.industry
		})
	},
	updateVendorRates(state, payload) {
		const { key, data } = payload
		state.currentVendor.rates[key] = data
	}
}
