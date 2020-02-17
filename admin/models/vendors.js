const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    wordsRates: [{ 
        source: {
            type: Schema.Types.ObjectId, ref: 'Language',
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        industries: [{
            type: Schema.Types.ObjectId, ref: 'Industries'
        }],
        rates: {
            type: Object,
            default: {}
        }
    }],
    hoursRates: [{ 
        source: {
            type: Schema.Types.ObjectId, ref: 'Language',
        },
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        industries: [{
            type: Schema.Types.ObjectId, ref: 'Industries'
        }],
        rates: {
            type: Object,
            default: {}
        }
    }],
    monoRates: [{ 
        target: {
            type: Schema.Types.ObjectId, ref: 'Language'
        },
        packageSize: {
            type: String,
            trim: true
        },
        industries: [{    
            type: Schema.Types.ObjectId, ref: 'Industries'
        }],
        rates: {
            type: Object,
            default: {}
        }
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
            xTranslated: {text: "X translated", value: 0.1},
            repeat: {text: "Repetitions", value: 0.2},
            repeat100: {text: "100%", value: 0.2},
            repeat50: {text: "50-74%", value: 1},
            repeat75: {text: "75-84%", value: 0.8},
            repeat85: {text: "85-94%", value: 0.6},
            repeat95: {text: "95-99%", value: 0.25},
            noMatch: {text: "No match", value: 1}
        }
    },
    cvFiles: {
        type: Array,
        default: []
    },
    coverLetterFiles: {
        type: Array,
        default: []
    }
}, { minimize: false });

VendorSchema.statics.authenticate = function (email, password, callback) {
    Vendors.findOne({ email: email })
        .exec((err, vendor) => {
            if (err) {
                return callback(err)
            } else if (!vendor) {
                const err = new Error('Vendor not found.');
                err.status = 401;
                return callback(err);
            }
            bcrypt.compare(password, vendor.password, function (err, result) {
                if (result === true || !vendor.password) {
                    return callback(null, vendor);
                } else {
                    return callback();
                }
            })
        });
}

VendorSchema.pre('save', function (next) {
    const vendor = this;
    bcrypt.hash(vendor.password, 10, (err, hash) => {
        if (err) {
            return next(err);
        }
        vendor.password = hash;
        next();
    })
});
  

const Vendors = mongoose.model('Vendors', VendorSchema);

module.exports = Vendors;