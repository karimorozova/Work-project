const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
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
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

RequestSchema.methods.targetArray = function targetLangName() {
  var res = [];
  for (var i = 0; i < this.targetLanguages.length; i += 1) {
    res.push({
      "name": this.targetLanguages[i].lang
    });
  }
  return res;
}

RequestSchema.methods.targetArray = function targetArray() {
  var res = [];
  for(var i=0; i < this.targetLanguages.length; i+=1 )
  {
      res.push(this.targetLanguages[i].xtrf);
  }
  console.log("length is " + res.length);
  return res;
}

RequestSchema.methods.sourceLangName = function sourceLangName() {
  return {
    name: `${this.sourceLanguage.lang}`
  };
}


const Requests = mongoose.model('Requests', RequestSchema);

module.exports = Requests;
