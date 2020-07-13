const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const ClientSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
    trim: true
  },
  // nativeLanguage: {
  //   type: Schema.Types.ObjectId, ref: 'Language'
  // },
  // defaultPricelist: {
  //   type: Schema.Types.ObjectId, ref: 'Pricelist'
  // },
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
  timeZone: {
    type: String
    //   type: Schema.Types.ObjectId, ref: 'Timezones',
  },
  documents: {
    type: Array,
    default: []
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
    type: Object,
    default: {}
  },
  leadSource: {
    type: String,
    default: '',
    trim: true
  },
  leadGeneration: {
    type: String,
    default: '',
    trim: true
  },
  salesStage: {
    type: String,
    default: '',
    trim: true
  },
  salesComission: {
    type: String,
    default: '',
    trim: true
  },
  officialName: {
    type: String,
    default: '',
    trim: true
  },
  contactName: {
    type: String,
    default: '',
    trim: true
  },
  email: {
    type: String,
    default: '',
    trim: true
  },
  isTest: {
    type: Boolean,
    default: false
  },
  billingInfo: {
    officialCompanyName: {
      type: String,
      trim: true
    },
    contactName: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    vat: {
      type: Boolean,
      default: false
    },
    dueDate: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      default: '',
      trim: true
    },
    invoiceSending: {
      type: Boolean,
      default: false,
    },
    paymentType: {
      type: String,
      trim: true,
    },
    startingBalance: {
      type: Number,
      default: 0
    },
    balance: {
      type: Number,
      default: 0
    },
    minimumBalance: {
      type: Number,
      default: 0
    }
  },
  sourceLanguages: [{
    type: Schema.Types.ObjectId, ref: 'Language'
  }],
  targetLanguages: [{
    type: Schema.Types.ObjectId, ref: 'Language'
  }],
  industries: [
    { type: Schema.Types.ObjectId, ref: 'Industries' }
  ],
  services: [{
    sourceLanguage: {
      type: Schema.Types.ObjectId, ref: 'Language',
    },
    targetLanguage: {
      type: Schema.Types.ObjectId, ref: 'Language',
    },
    service: {
      type: Schema.Types.ObjectId, ref: 'Services',
    },
    industry: {
      type: Schema.Types.ObjectId, ref: 'Industries',
    }
  }],
  rates: {
    basicPricesTable: [{
      type: {
        type: String,
        trim: true
      },
      serviceId: {
        type: String,
        trim: true,
      },
      sourceLanguage: {
        type: Schema.Types.ObjectId, ref: 'Language',
      },
      targetLanguage: {
        type: Schema.Types.ObjectId, ref: 'Language',
      },
      euroBasicPrice: {
        type: Number,
        default: 1,
      },
      altered: {
        type: Boolean,
        default: false,
      }
    }],
    stepMultipliersTable: [{
      serviceId: {
        type: String,
        trim: true,
      },
      step: {
        type: Schema.Types.ObjectId, ref: 'Step',
      },
      unit: {
        type: Schema.Types.ObjectId, ref: 'Units',
      },
      size: {
        type: Number,
      },
      multiplier: {
        type: Number,
        default: 100,
      },
      euroMinPrice: {
        type: Number,
        default: 1,
      },
      defaultSize: {
        type: Boolean,
        default: false
      },
      altered: {
        type: Boolean,
        default: false,
      }
    }],
    industryMultipliersTable: [{
      serviceId: {
        type: String,
        trim: true,
      },
      industry: {
        type: Schema.Types.ObjectId, ref: 'Industries',
      },
      multiplier: {
        type: Number,
        default: 100,
      },
      altered: {
        type: Boolean,
        default: false,
      }
    }],
  },
  contacts: [{
    firstName: {
      type: String,
      trim: true
    },
    surname: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    password: {
      type: String,
    },
    gender: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    photo: {
      type: String,
    },
    whatsApp: {
      type: String,
      trim: true
    },
    skype: {
      type: String,
      trim: true
    },
    linkedIn: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    timeZone: {
      type: String
      // type: Schema.Types.ObjectId,
      // ref: 'Timezones'
    },
    notes: {
      type: String,
    },
    leadContact: {
      type: Boolean,
      default: false
    }
  }],
  matrix: {
    type: Object,
    default: {
      xTranslated: { text: "X translated", rate: 0.25 },
      repeat: { text: "Repetition", rate: 0.3 },
      contextMatch: { text: "Context match", value: 0.3 },
      repeat100: { text: "100%", rate: 0.3 },
      repeat50: { text: "50-74%", rate: 1 },
      repeat75: { text: "75-84%", rate: 0.9 },
      repeat85: { text: "85-94%", rate: 0.7 },
      repeat95: { text: "95-99%", rate: 0.4 },
      noMatch: { text: "No match", rate: 1 }
    }
  },
  otherInfo: {
    firstContactDate: {
      type: String,
      trim: true
    },
    firstQuoteDate: {
      type: String,
      trim: true
    },
    lastQuoteDate: {
      type: String,
      trim: true
    },
    firstProjectDate: {
      type: String,
      trim: true
    },
    lastProjectDate: {
      type: String,
      trim: true
    }
  }
}, { minimize: false });

ClientSchema.statics.authenticate = function (email, password, callback) {
  Clients.findOne({ "contacts.email": email })
    .exec((err, client) => {
      if (err) {
        return callback(err);
      } else if (!client) {
        const err = new Error('Client not found.');
        err.status = 401;
        return callback(err);
      }

      const contact = client.contacts.find((contact) => contact.email === email);
      bcrypt.compare(password, contact.password, function (err, result) {
        if (result === true || !contact.password) {
          return callback(null, { client, contact });
        } else {
          return callback();
        }
      });
    });
};

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;
