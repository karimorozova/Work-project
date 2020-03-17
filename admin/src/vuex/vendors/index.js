import * as actions from './actions';
import * as getters from './getters';
import {
    mutations
} from './mutations';

const state = {
    currentVendor: {},
    filteredVendors: [],

    currentVendorEducation: [{
        _id: 0,
        duration: "12-02-2020 / 20-02-2020",
        education: "Test school",
        department: "Test321",
        degree: "Test123",
        grade: "344",
        document:''
    }],

    currentVendorProfessionalExperience: [{
        _id: 0,
        duration: "12-02-2020 / 20-02-2020",
        occupation: "Test1",
        company: "Foo1",
        summary: "Bar1"

    }],
    currentVendorQualifications: [
        {
            _id: 0,
            source: '',
            target: '',
            industry: '',
            task: '',
            status: 'NA',
        }

    ],
    currentVendorDocuments: [
        {
            _id: 0,
            category: 'Resume',
        },
        {
            _id:1,
            category:'NDA'
        },
        {
            _id:2,
            category:'Contract'
        }
    ],

    currentVendorAssessment: [],

}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
