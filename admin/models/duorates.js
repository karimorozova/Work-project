const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DuorateSchema = new mongoose.Schema({
  source: {
    type: Schema.Types.ObjectId, ref: 'Language',
  },
  target: {
    type: Schema.Types.ObjectId, ref: 'Language'
  },
  industries: [{
    industry: {
      type: Schema.Types.ObjectId, ref: 'Industries'
    }
  }],
  rates: {
    type: Object,
    default: {}
  }
},{ minimize: false });

const Duorate = mongoose.model('Duorate', DuorateSchema);

module.exports = Duorate;