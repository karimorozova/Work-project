import * as actions from './actions';
import * as getters from './getters';
import {
    mutations
} from './mutations';

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
      whatsapp: null,
      industries: null,
      aliases: null,
      gender: null,
      status: null,
      matrix: null,
      professionalLevel: null,
      notes: null,
      vendorId: null,
      billingInfo: {
        isSameInfo: null,
        officialCompanyName: null,
        paymentTerm: null,
        address: null,

        // vatId: null,
        // address: null,
        // invoiceSending: null,
        // officialCompanyName: null,
        // dueDate: null,
        // paymentType: null,
      }
    },
}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
