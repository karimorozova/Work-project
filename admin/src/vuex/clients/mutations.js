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
            'accountManager',
            'salesManager',
            'projectManager',
            'otherInfo',
            'leadGeneration',
            'leadSource',
            'contacts'
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
        state.currentClientOverallData.contacts.push(payload)
    },
    updateContact(state, payload) {
        const { index, contact } = payload;
        console.log(index, contact)
        state.currentClientOverallData.contacts[index] = contact;
        // const lead = state.currentClientOverallData.contacts.find(item => item.leadContact);
        // if(contact.leadContact) {
        //     state.currentClientOverallData.contacts = state.currentClientOverallData.contacts.map((item, ind) => {
        //         item.leadContact = ind === index;
        //         return item;
        //     });
        // } else if(!contact.leadContact && !lead) {
        //     state.currentClientOverallData.contacts[0].leadContact = true;
        // }

    },
    setLeadContact(state, payload) {
        if(state.currentClientOverallData.contacts[payload].leadContact) {
            return
        }
        for(let index in state.currentClientOverallData.contacts) {
            state.currentClientOverallData.contacts[index].leadContact = false;
        }
        state.currentClientOverallData.contacts[payload].leadContact = true;
    },
    updateClientRatesProp(state, payload) {
      state.currentClient.rates[payload.key] = payload.data
    }
}
