const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const VendorSchema = new mongoose.Schema({
  photo: {
    type: String,
    default: "",
    trim: true
  },
  currency: {
    type: String,
    default: 'EUR',
    trim: true,
  },
  firstName: {
    type: String,
    default: '',
    trim: true
  },
  website: {
    type: String,
    default: '',
    trim: true
  },
  status: {
    type: String,
    default: '',
    trim: true
  },
  surname: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  timezone: {
    type: String,
    default: '',
    trim: true
  },
  native: {
    type: Schema.Types.ObjectId, ref: 'Language',
    default: null
  },
  gender: {
    type: String,
    default: '',
    trim: true
  },
  skype: {
    type: String,
    default: '',
    trim: true
  },
  companyName: {
    type: String,
    default: '',
    trim: true
  },
  linkedin: {
    type: String,
    default: '',
    trim: true
  },
  whatsapp: {
    type: String,
    default: '',
    trim: true
  },
  basicRate: {
    type: String,
    default: '',
    trim: true
  },
  tqi: {
    type: String,
    default: '',
    trim: true
  },
  experienceYears: {
    type: String,
    default: '',
    trim: true
  },
  availability: {
    type: String,
    default: '',
    trim: true
  },
  catExperience: {
    type: String,
    default: '',
    trim: true
  },
  internetAccess: {
    type: String,
    default: 'Yes',
    trim: true
  },
  softwares: {
    type: Array,
    default: []
  },
  isTest: {
    type: Boolean,
    default: false
  },
  professionalLevel: {
    type: String,
    default: '',
    trim: true
  },
  notes: {
    type: String
  },
  competencies: [{
    sourceLanguage: {
      type: Schema.Types.ObjectId, ref: 'Language',
    },
    targetLanguage: { 
      type: Schema.Types.ObjectId, ref: 'Language', 
    },
    step: { 
      type: Schema.Types.ObjectId, ref: 'Step', 
    },
    industry: { 
      type: Schema.Types.ObjectId, ref: 'Industries', 
    }

  }],
  qualifications: [{
    source: {
      type: Schema.Types.ObjectId, ref: 'Language',
    },
    target: {
      type: Schema.Types.ObjectId, ref: 'Language'
    },
    industry: {
      type: Schema.Types.ObjectId, ref: 'Industries'
    },
    step: {
      type: Schema.Types.ObjectId, ref: 'Step'
    },
    status: {
      type: String,
      default: 'Yes',
      trim: true
    }
  }],
  documents: {
    type: Array,
    default: []
  },
  profExperiences: {
    type: Array,
    default: []
  },
  educations: {
    type: Array,
    default: []
  },
  assessments: [{
    TQI: [],
    LQA1: {},
    LQA2: {},
    LQA3: {},
  }],

  wordCountInfo: [{
    industry: {
      id: {
        type: Schema.Types.ObjectId, ref: 'Industries'
      },
      name: {
        type: String,
        default: '',
        trim: true,
      }
    },
    targetLanguage: {
      id: {
        type: Schema.Types.ObjectId, ref: 'Language',
      },
      group: {
        type: String,
        default: '',
        trim: true,
      }
    },
    wordCount: {
      type: Number,
      default: 0,
    }
  }],

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
    { type: Schema.Types.ObjectId, ref: 'Industries' }
  ],
  languagePairs: [{
    source: {
      type: Schema.Types.ObjectId, ref: 'Language'
    },
    target: {
      type: Schema.Types.ObjectId, ref: 'Language'
    }
  }],
  positions: {
    type: Array,
    default: []
  },
  isTest: {
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
      xTranslated: { text: "X translated", rate: 0.1 },
      repeat: { text: "Repetition", rate: 0.2 },
      contextMatch: { text: "Context match", value: 0.2 },
      repeat100: { text: "100%", rate: 0.2 },
      repeat50: { text: "50-74%", rate: 1 },
      repeat75: { text: "75-84%", rate: 0.8 },
      repeat85: { text: "85-94%", rate: 0.6 },
      repeat95: { text: "95-99%", rate: 0.25 },
      noMatch: { text: "No match", rate: 1 }
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
        return callback(err);
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
      });
    });
};

VendorSchema.pre('save', function (next) {
  const vendor = this;
  bcrypt.hash(vendor.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    vendor.password = hash;
    next();
  });
});


const Vendors = mongoose.model('Vendors', VendorSchema);

module.exports = Vendors;
