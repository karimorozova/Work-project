import * as actions from './actions';
import * as getters from './getters';
import { mutations } from './mutations';

const state = {
    currentClient: {
      rates: {
        pricelistTable: null,
      }
    },

    currentClientOverallData: {
        name: null,
        clientType: null,
        officialCompanyName: null,
        email: null,
        website: null,
        industries: null,
        nativeLanguage: null,
        timeZone: null,
        aliases: null,
        targetLanguages: [],
        sourceLanguages: [],
        status: null,
        accountManager: null,
        salesManager: null,
        projectManager: null,
        otherInfo: null,
        leadGeneration: null,
        leadSource: null,
        billingInfo: {
            vat: null,
            vatId: null,
            address: null,
            invoiceSending: null,
            officialCompanyName: null,
            dueDate: null,
            paymentType: null,
        },
        contacts: []
    }
}

export const clients = {
    state,
    actions,
    mutations,
    getters
}
