const mongoose = require('mongoose');

const LanguageSchema = new mongoose.Schema({
  lang: {
    type: String,
    default: '',
    trim: true
  },
  group: {
    type: String,
    default: '',
    trim: true
  },
  icon: {
    type: String,
    default: ''
  },
  symbol: {
    type: String,
    default: '',
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  xtm: {
    type: String,
    default: ''
  },
  iso1: {
    type: String,
    default: ''
  },
  iso2: {
    type: String,
    default: ''
  },
  children: {
    type: Boolean,
    default: false
  },
  parent: {
    type: String,
    default: ""
  },
  china: {
    type: String,
    default: ""
  },
  crud: {
    type: Boolean,
    default: false
  },
  memoq: {
    type: String,
    default: '',
    trim: true
  },
  direction: {
    type: String,
    default: 'both',
  },
  check: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },

});

const Languages = mongoose.model('Language', LanguageSchema);

module.exports = Languages;
