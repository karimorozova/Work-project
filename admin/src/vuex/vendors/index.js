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
        document: 'test.pdf'
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
            status: '',
        }

    ],
    currentVendorDocuments: [
        {
            _id: 0,
            fileName: 'test.pdf',
            category: 'Resume',
        },
        {
            _id:1,
            category:'NDA'
        },
        {
            _id:2,
            category:'Contact'
        }
    ],

    currentVendorAssessment: [
        {   
            _id: 0,
            industry: "IGaming",
            tqi: 33,
            lqa1: 23,
            lqa2: 65,
            lqa3: ''
          }
    ],

}

export const vendors = {
    state,
    actions,
    mutations,
    getters
}
