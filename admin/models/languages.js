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
    default: false,
  },
  xtm: {
    type: String,
    default: '',
    trim: true
  },
  smartling: {
    type: String,
    default: '',
    trim: true
  },
  iso1: {
    type: String,
    default: '',
    trim: true
  },
  iso2: {
    type: String,
    default: '',
    trim: true
  },
  children: {
    type: Boolean,
    default: false
  },
  parent: {
    type: String,
    default: "",
    trim: true
  },
  china: {
    type: String,
    default: "",
    trim: true
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
    trim: true
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
