const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClientSchema = new mongoose.Schema({
    name: { 
        type : String, 
        default : '', 
        trim : true 
    },
    website: {
        type: String,
        default: '',
        trim : true 
    },
    status: { 
        type : String, 
        default : '', 
        trim : true 
    },
    contract: {
        type: String,
        default: '',
        trim : true 
    },
    nda: { 
        type : String, 
        default : '', 
        trim : true 
    },
    accountManager: {
        type: Object,
        default: {}
    },
    salesManager: {
        type: Object,
        default: {}
    },
    projectManager: { 
        type : Object, 
        default : {} 
    },
    leadSource: {
        type: String,
        default: '',
        trim : true 
    },
    salesComission: { 
        type : String, 
        default : '', 
        trim : true 
    },
    officialName: {
        type: String,
        default: '',
        trim : true 
    },
    contactName: { 
        type : String, 
        default : '', 
        trim : true 
    },
    email: {
        type: String,
        default: '',
        trim : true 
    },
    vat: { 
        type : String, 
        default : '', 
        trim : true 
    },
    address: {
        type: String,
        default: '',
        trim : true 
    },
    languageCombinations: [{
        source: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        service: {
            type: Schema.Types.ObjectId, ref: 'Services'
        },
        industry: [{
            industry: {
                type: Schema.Types.ObjectId, ref: 'Industries',
            },
            rate: {
                type: Number,
                default: 0
            },
            active: {
                type: Boolean,
                default: true
            },
            package: {
                type: Number
            }
        }]
    }],
    industry: [
        {type: Schema.Types.ObjectId, ref: 'Industries'}
    ],
    contacts: {
        type: Array,
        default: []
    },
    matrix: {
        type: Object,
        default: {
            iceMatch: {text: "ICE Match", rate: 0.25},
            fuzzyMatch75: {text: "75-84%", rate: 0.9},
            fuzzyMatch85: {text: "85-94%", rate: 0.7},
            fuzzyMatch95: {text: "95-99%", rate: 0.4},
            repeat: {text: "Repetitions", rate: 0.25},
            leveragedMatch: {text: "Leveraged Match", rate: 0.25},
            fuzzyRepeats75: {text: "Internal 75-84%", rate: 0.9},
            fuzzyRepeats85: {text: "Internal 85-94%", rate: 0.7},
            fuzzyRepeats95: {text: "Internal 95-99%", rate: 0.4}
        }
    }
}, { minimize: false });

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;