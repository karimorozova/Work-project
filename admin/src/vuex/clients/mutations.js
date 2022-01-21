export const mutations = {
    setUpClientProp(state, payload) {
        state.currentClient[payload.key] = payload.value;
    },
    setUpClientRatesProp(state, payload) {
        state.currentClient.rates[payload.key] = payload.value;
    },
    setCurrentClient(state, payload) {
        state.currentClient = payload;
        state.clientDocuments = payload.documents
    },
    setCurrentClientOverallData(state, payload) {
        let keys = [
            'name',
            'clientType',
            'officialCompanyName',
            'email',
            'website',
            'nativeLanguage',
            'timeZone',
            'status',
            // 'paymentType',
            'accountManager',
            'salesManager',
            'projectManager',
            'otherInfo',
            'leadGeneration',
            'leadSource',
            // 'contacts'
        ]

        for(let key of keys) state.currentClientOverallData[key] = payload[key]
    },
    setClientPropertyOverallData(state, payload) {
        state.currentClientOverallData[payload.prop] = payload.value;
    },

    setClientPropertyOverallDataBilling(state, payload) {
        state.currentClientOverallData.billingInfo[payload.prop] = payload.value;
    },
    setClientProperty(state, payload) {
        state.currentClient[payload.prop] = payload.value;
    },
    storeClientBillingInfoProperty(state,payload){
        state.currentClient.billingInfo[payload.prop] = payload.value;
    },
    addContact(state, payload) {
        state.currentClient.contacts.push(payload)
    },
    addContactOverAll(state, payload) {
        const previousState = [ ...state.currentClientOverallData.contacts ]
        previousState.push(payload)
        state.currentClientOverallData.contacts = previousState
    },
    updateContact(state, payload) {
        const { index, contact } = payload;
        const previousState = [ ...state.currentClientOverallData.contacts ]
        previousState[index] = contact
        state.currentClientOverallData.contacts = previousState
    },
    updateContacts(state, payload) {
        state.currentClient.contacts = payload
        state.currentClientOverallData.contacts = payload
    },
    setLeadContact(state, payload) {
        const previousState = [ ...state.currentClientOverallData.contacts ]
        for(let index in previousState) {
            previousState[index].leadContact = false;
        }
        previousState[payload].leadContact = true
        state.currentClientOverallData.contacts = previousState
    },
    updateClientRatesProp(state, payload) {
      state.currentClient.rates[payload.key] = payload.data
    }
}
