export const mutations = {
    setCurrentClient(state, payload) {
        state.currentClient = payload;
    },
    setClientProperty(state, payload) {
        state.currentClient[payload.prop] = payload.value;
    },
    addContact(state, payload) {
        state.currentClient.contacts.push(payload);
    },
    updateContact(state, payload) {
        state.currentClient.contacts[payload.index] = payload.contact;
        if(payload.contact.leadContact) {
            for(let index in state.currentClient.contacts) {
                state.currentClient.contacts[index].leadContact = false;
            }
            state.currentClient.contacts[payload.index].leadContact = true;    
        }
    },
    setLeadContact(state, payload) {
        if(state.currentClient.contacts[payload].leadContact) {
            return
        };
        for(let index in state.currentClient.contacts) {
            state.currentClient.contacts[index].leadContact = false;
        }
        state.currentClient.contacts[payload].leadContact = true;
    },
    setClientDuoRates(state, payload) {
        state.clientDuoRates = payload;
    },
    setClientMonoRates(state, payload) {
        state.clientMonoRates = payload;
    }
}