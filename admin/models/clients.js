const mongoose = require('mongoose');

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
    languageCombinations: {
        type: Array,
        default: []
    },
    industry: {
        type: Object,
        default: {}
    },
    contacts: {
        type: Array,
        default: []
    }
});

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;