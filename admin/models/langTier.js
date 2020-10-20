const mongoose = require('mongoose');

const LangTierSchema = new mongoose.Schema({
  languages: {
    type : Object,
    default: {}
  },
  industry: {
    type : String,
    default : 'All',
    trim : true
  },
  updatedAt: {
    type : Date,
    default : new Date()
  },
});

const LangTier = mongoose.model('LangTier', LangTierSchema);

module.exports = LangTier;
