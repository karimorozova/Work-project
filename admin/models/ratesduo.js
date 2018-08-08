const mongoose = require('mongoose');

const RatesduoSchema = new mongoose.Schema({
  source: {
    type: Object,
    default: {}
  },
  target: {
    type: Object,
    default: {}
  },
  industry: {
    type: Object,
    default: {}
  },
  services: {
    type: Array,
    default: []
  },
  active: {
    type: Boolean,
    default: true
  }
});

const Ratesduo = mongoose.model('Ratesduo', RatesduoSchema);

module.exports = Ratesduo;