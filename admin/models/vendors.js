const mongoose = require('mongoose');
const Schema = mongoose.Schema;

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
        type : Schema.Types.ObjectId, ref: 'Language' 
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
    languagePairs: [{
        source: {
            type: Schema.Types.ObjectId, ref: 'Language'
        } ,
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        }
    }],
    position: {
        type: Array,
        default: []
    },
    test: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        default: '',
    }
});

const Vendors = mongoose.model('Vendors', VendorSchema);

module.exports = Vendors;