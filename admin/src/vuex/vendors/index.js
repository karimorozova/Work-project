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

    currentVendorAssessment: [
        {
            "_id": 0,
            "industry": "TEST",
            "tqi": { "grade": "56", "file": "fileName", "filePath": "filePath" },
            "lqa1": { "grade": "75", "file": "fileName", "filePath": "filePath" },
            "lqa2": { "grade": "30", "file": "fileName", "filePath": "filePath" },
            "lqa3": ''
        }
    ],

}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
