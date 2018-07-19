const mongoose = require('mongoose');

const RatesduoSchema = new mongoose.Schema({
  sourceLanguage: {
    type: Object,
    default: {}
  },
  targetLanguage: {
    type: Object,
    default: {}
  },
  industry: {
    type: Array,
    default: []
  },
  service: {
    type: Object,
    default: {}
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Ratesduo = mongoose.model('Ratesduo', RatesduoSchema);

module.exports = Ratesduo;