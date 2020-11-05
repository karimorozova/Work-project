const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorsArr = [{
  vendorId: {
    type: Schema.Types.ObjectId, ref: 'Vendor',
    default: null
  },
  name: {
    type: 'String',
    default: ''
  },
  tier: {
    type: Number,
    default: 0
  },
  email: {
    type: 'String',
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  },
  otherInfo: [{
    clientId: {
      type: Schema.Types.ObjectId, ref: 'Client',
      default: null
    },
    clientName: {
      type: 'String',
      default: ''
    },
    startDate: {
      type: Date,
      default: new Date()
    },
    deadline: {
      type: Date,
      default: new Date()
    },
    projectId: {
      type: 'String',
      default: ''
    },
    wordcountPayables: {
      type: Number,
      default: 0,
    },
    wordcountReceivables: {
      type: Number,
      default: 0
    }
  }]
}];

const XtrfLqaSchema = new mongoose.Schema({
  languagePair: {
    type: String,
    trim: true,
  },
  sourceLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
    default: null
  },
  targetLanguage: {
    type: Schema.Types.ObjectId, ref: 'Language',
    default: null
  },
  industries: {
    Finance: {
      industryId: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        default: null
      },
      vendors: vendorsArr,
    },
    iGaming: {
      industryId: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        default: null
      },
      vendors: vendorsArr,
    }
  },
});

const XtrfLqa = mongoose.model('XtrfLqa', XtrfLqaSchema);

module.exports = XtrfLqa;
