const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  typeOfRequest: {
    type: String,
    default: '',
    trim: true
  },
  projectName: {
    type: String,
    default: '',
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  contactName: {
    type: String,
    default: '',
    trim: true
  },
  industry: {
    type: String,
    default: '',
    trim: true
  },
  contactEmail: {
    type: String,
    default: '',
    trim: true
  },
  web: {
    type: String,
    default: '',
    trim: true
  },
  skype: {
    type: String,
    default: '',
    trim: true
  },
  phone: {
    type: String,
    default: '',
    trim: true
  },
  service: {
    type: Object,
    default: null,
    trim: true
  },
  status: {
    type: String,
    default: '',
    trim: true
  },
  accountManager: {
    type: String,
    default: 'Non selected',
    trim: true
  },
  companyName: {
    type: String,
    default: '',
    trim: true
  },
  sourceLanguage: {
    type: Object,
    default: null,
    trim: true
  },
  targetLanguages: {
    type: Array,
    default: [],
    trim: true
  },
  brief: {
    type: String,
    default: ''
  },
  detailFiles: {
    type: Array,
    default: [],
    trim: true
  },
  refFiles: {
    type: Array,
    default: [],
    trim: true
  },
  jsession: {
    type: String,
    default: ""
  },
  genBrief: {
    type: String,
    default: ""
  }
});

RequestSchema.methods.targetLangName = function targetLangName() {
  var res = [];
  for (var i = 0; i < this.targetLanguages.length; i++) {
    res.push({
      "name": this.targetLanguages[i].lang
    });
  }
  return res;
}

RequestSchema.methods.targetArray = function targetArray() {
  var res = [];
  for(var i = 0; i < this.targetLanguages.length; i++ )
  {
      res.push(this.targetLanguages[i].xtrf);
  }
  return res;
}

RequestSchema.methods.sourceLangName = function sourceLangName() {
  return {
    name: `${this.sourceLanguage.lang}`
  };
}

RequestSchema.methods.deadline = function deadline() {
  return this.date.getTime();
}

const Requests = mongoose.model('Requests', RequestSchema);

module.exports = Requests;
