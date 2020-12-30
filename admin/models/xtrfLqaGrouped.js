const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vendorsArr = [{
  vendor: {
    type: Schema.Types.ObjectId, ref: 'Vendors',
    default: null
  },
  name: {
    type: 'String',
    default: ''
  },
  email: {
    type: 'String',
    default: ''
  },
  wordCount: {
    type: Number,
    default: 0
  }
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
  tier: {
    type: Number,
    default: 0
  },
  industries: [
    {
      industry: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        default: null
      },
      industryGroup: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        default: null
      },
      vendors: vendorsArr,
    }
  ],
});

const XtrfLqaGrouped = mongoose.model('XtrfLqaGrouped', XtrfLqaSchema);

module.exports = XtrfLqaGrouped;
