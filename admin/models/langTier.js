const mongoose = require('mongoose');

const LangTierSchema = new mongoose.Schema({
  // industry: [{
    industry: {
      type: String,
      trim: true
    },
    source: [{
      lang: {
        type: String,
        trim: true
      },
      clients: {
        type: Number,
        default: 0,
      },
      targets: [{
        lang: {
          type: String,
          trim: true,
        },
        wordcount: {
          type: Number,
          default: 0
        }
      }]
    }]
  // }],
});

const LangTier = mongoose.model('LangTier', LangTierSchema);

module.exports = LangTier;
