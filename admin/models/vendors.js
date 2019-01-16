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
        type : Schema.Types.ObjectId, ref: 'Language',
        default: null
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
        package: {
            type: String,
            trim: true
        },
        industries: [{
            industry: {
                type: Schema.Types.ObjectId, ref: 'Industries',
            },
            rates: {
                type: Object
            }            
        }]
    }],
    industries: [
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
    },
    matrix: {
        type: Object,
        default: {
            iceMatch: {text: "ICE Match", rate: 0.1},
            fuzzyMatch75: {text: "75-84%", rate: 0.8},
            fuzzyMatch85: {text: "85-94%", rate: 0.6},
            fuzzyMatch95: {text: "95-99%", rate:0.25},
            repeat: {text: "Repetitions", rate: 0.2},
            leveragedMatch: {text: "Leveraged Match", rate: 0.2},
            fuzzyRepeats75: {text: "Internal 75-84%", rate: 0.8},
            fuzzyRepeats85: {text: "Internal 85-94%", rate: 0.6},
            fuzzyRepeats95: {text: "Internal 95-99%", rate: 0.25}
        }
    }
}, { minimize: false });

const Vendors = mongoose.model('Vendors', VendorSchema);

module.exports = Vendors;