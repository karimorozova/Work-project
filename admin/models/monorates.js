const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MonorateSchema = new mongoose.Schema({
  target: {
    type: Schema.Types.ObjectId, ref: 'Language'
  },
  package: {
    type: String
  },
  industries: [{
    industry: {
      type: Schema.Types.ObjectId, ref: 'Industries'
    },
    rates: {
      type: Object,
      default: {}
    }
  }]
},{ minimize: false });

const Monorate = mongoose.model('Monorate', MonorateSchema);

module.exports = Monorate;