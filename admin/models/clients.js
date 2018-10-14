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
        type: String,
        default: '',
        trim : true 
    },
    salesManager: {
        type: String,
        default: '',
        trim : true 
    },
    projectManager: { 
        type : String, 
        default : '', 
        trim : true 
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
    }
});

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;