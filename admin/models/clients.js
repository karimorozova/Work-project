const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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
    contacts: [{
        country: "",
        timezone: "",
        firstName: "",
        surname: "",
        email: "",
        password: "",
        gender: "",
        phone: "",
        photo: "",
        skype: "",
        position: "",
        notes: "",
        leadContact: false
    }],
    matrix: {
        type: Object,
        default: {
            xTranslated: {text: "X translated", rate: 0.25},
            repeat: {text: "Repetitions", rate: 0.3},
            repeat100: {text: "100%", rate: 0.3},
            repeat50: {text: "50-74%", rate: 1},
            repeat75: {text: "75-84%", rate: 0.9},
            repeat85: {text: "85-94%", rate: 0.7},
            repeat95: {text: "95-99%", rate: 0.4},
            noMatch: {text: "No match", rate: 1}
        }
    }
}, { minimize: false });

ClientSchema.statics.authenticate = function (email, password, callback) {
  Clients.findOne({ "contacts.email": email })
    .exec((err, client) => {
      if (err) {
        return callback(err)
      } else if (!client) {
        const err = new Error('Client not found.');
        err.status = 401;
        return callback(err);
      }

      const contact = client.contacts.find((contact)=>contact.email === email);
      bcrypt.compare(password, contact.password, function (err, result) {
        if (result === true || !contact.password) {
          return callback(null, {client,contact});
        } else {
          return callback();
        }
      })
    });
};

const Clients = mongoose.model('Clients', ClientSchema);

module.exports = Clients;
