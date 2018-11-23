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
    },
    rates: {
      type: Object,
      default: {}
    }
  }]
  // industry: {
  //   type: Schema.Types.ObjectId, ref: 'Industries',
  // },
  // rate: {
  //   type: Number,
  //   default: 0
  // },
  // services: {
  //   type: Schema.Types.ObjectId, ref: 'Services',
  // },
  // active: {
  //   type: Boolean,
  //   default: true
  // }
},{ minimize: false });

const Duorate = mongoose.model('Duorate', DuorateSchema);

module.exports = Duorate;