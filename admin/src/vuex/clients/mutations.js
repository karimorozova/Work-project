export const mutations = {
    setCurrentClient(state, payload) {
        state.currentClient = payload;
        state.clientDocuments = payload.documents
    },
    setClientProperty(state, payload) {
        console.log('all',payload);
        state.currentClient[payload.prop] = payload.value;
    },
    addContact(state, payload) {
        state.currentClient.contacts.push(payload);
    },
    updateContact(state, payload) {
        const { index, contact } = payload;
        state.currentClient.contacts[index] = contact;
        const lead = state.currentClient.contacts.find(item => item.leadContact);
        if(contact.leadContact) {
            const updatedContacts = state.currentClient.contacts.map((item,ind) => {
                item.leadContact = ind === index;
                return item;
            })
            state.currentClient.contacts = updatedContacts;    
        } else if(!contact.leadContact && !lead) {
            state.currentClient.contacts[0].leadContact = true;
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
    }
}