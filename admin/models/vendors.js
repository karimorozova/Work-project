const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
    photo: {
        type: String,
        default: "",
        trim: true
    },
    firstName: { 
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
    surname: {
        type: String,
        default: '',
        trim : true 
    },
    email: { 
        type : String, 
        default : '', 
        trim : true 
    },
    phone: {
        type: String,
        default: '',
        trim : true 
    },
    timezone: {
        type: String,
        default: '',
        trim : true 
    },
    native: { 
        type : String, 
        default : '', 
        trim : true 
    },
    gender: {
        type: String,
        default: '',
        trim : true 
    },
    skype: { 
        type : String, 
        default : '', 
        trim : true 
    },
    companyName: {
        type: String,
        default: '',
        trim : true 
    },
    linkedin: { 
        type : String, 
        default : '', 
        trim : true 
    },
    whatsapp: {
        type: String,
        default: '',
        trim : true 
    },
    basicRate: { 
        type : String, 
        default : '', 
        trim : true 
    },
    tqi: {
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
    }
});

const Vendors = mongoose.model('Vendors', VendorSchema);

module.exports = Vendors;